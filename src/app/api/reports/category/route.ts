// POST /api/reports/category
// Génère un rapport d'analyse pour une catégorie de sources
// Body : { category: 'community' | 'job' | 'startup', userId?: string }

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import {
  CATEGORY_REPORT_SYSTEM_PROMPT,
  buildCategoryReportPrompt,
} from '@/lib/ai/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const CATEGORY_CONFIG: Record<string, { label: string; sourceTypes: string[]; sources: string[] }> = {
  community: {
    label: 'Communautés & Insights',
    sourceTypes: ['community', 'review'],
    sources: ['hackernews', 'reddit', 'devto', 'g2'],
  },
  job: {
    label: 'Emplois & Missions Freelance',
    sourceTypes: ['job', 'freelance'],
    sources: ['francetravail', 'linkedin', 'indeed', 'upwork', 'malt'],
  },
  startup: {
    label: 'Écosystème Startups',
    sourceTypes: ['community'],
    sources: ['wellfound', 'producthunt', 'indiehackers'],
  },
}

function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(cleaned) as T
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, userId } = body as { category: string; userId?: string }

    const config = CATEGORY_CONFIG[category]
    if (!config) {
      return NextResponse.json({ error: 'Catégorie invalide. Valeurs acceptées : community, job, startup' }, { status: 400 })
    }

    // 1. Récupérer le profil utilisateur si fourni
    let profileSummary: string | null = null
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_summary')
        .eq('id', userId)
        .maybeSingle()
      profileSummary = profile?.profile_summary ?? null
    }

    // 2. Récupérer les signaux de la catégorie (max 100 récents)
    const { data: signals } = await supabase
      .from('raw_signals')
      .select('id, title, content, source, source_type')
      .in('source_type', config.sourceTypes)
      .order('collected_at', { ascending: false })
      .limit(100)

    if (!signals || signals.length === 0) {
      return NextResponse.json(
        { error: `Aucun signal disponible pour la catégorie "${config.label}". Lancez d'abord une collecte.` },
        { status: 422 }
      )
    }

    // 3. Récupérer les opportunités liées via opportunity_signals
    const signalIds = signals.map(s => s.id)
    const { data: linkedOpps } = await supabase
      .from('opportunity_signals')
      .select('opportunity_id')
      .in('signal_id', signalIds)

    const oppIds = [...new Set((linkedOpps ?? []).map(l => l.opportunity_id))]

    let opportunities: Array<{ title: string; problem: string | null; score_global: number; department: string | null; opportunity_type: string }> = []
    if (oppIds.length > 0) {
      const { data: opps } = await supabase
        .from('opportunities')
        .select('title, problem, score_global, department, opportunity_type')
        .in('id', oppIds)
        .eq('status', 'active')
        .order('score_global', { ascending: false })
        .limit(30)
      opportunities = opps ?? []
    }

    // 4. Générer le rapport via Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: CATEGORY_REPORT_SYSTEM_PROMPT,
    })

    const prompt = buildCategoryReportPrompt({
      category,
      categoryLabel: config.label,
      signals: signals as Array<{ title: string | null; content: string; source: string; source_type: string }>,
      opportunities,
      profileSummary,
    })

    const result = await model.generateContent(prompt)
    const rawText = result.response.text()

    type ReportData = {
      synthesis: string
      dominant_signals: Array<{ theme: string; description: string; frequency: string }>
      top_opportunities: Array<{ title: string; why_relevant: string; score: number }>
      angles_to_explore: Array<{ angle: string; description: string }>
      source_limits: string
      for_you: string
    }

    const reportData = parseJsonResponse<ReportData>(rawText)

    // 5. Convertir en sections et sauvegarder
    const sections = [
      { order: 1, title: 'Synthèse', content: reportData.synthesis },
      {
        order: 2,
        title: 'Signaux dominants',
        content: reportData.dominant_signals
          .map(s => `**${s.theme}** _(${s.frequency})_\n${s.description}`)
          .join('\n\n'),
      },
      {
        order: 3,
        title: 'Top opportunités de la catégorie',
        content: reportData.top_opportunities
          .map((o, i) => `**${i + 1}. ${o.title}** (score estimé : ${o.score}/100)\n${o.why_relevant}`)
          .join('\n\n'),
      },
      {
        order: 4,
        title: 'Angles à explorer',
        content: reportData.angles_to_explore
          .map(a => `**${a.angle}**\n${a.description}`)
          .join('\n\n'),
      },
      { order: 5, title: 'Limites de cette source', content: reportData.source_limits },
      { order: 6, title: 'Pour toi', content: reportData.for_you },
    ]

    const { data: savedReport, error: saveError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: userId ?? null,
        type: 'category',
        title: `Rapport ${config.label}`,
        sections,
        sources_used: [category],
        status: 'completed',
        sections_total: sections.length,
        sections_done: sections.length,
        generation_params: {
          category,
          signals_analyzed: signals.length,
          opportunities_included: opportunities.length,
        },
      })
      .select('id')
      .single()

    if (saveError) {
      console.error('[POST /api/reports/category] Save error:', saveError.message)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde du rapport' }, { status: 500 })
    }

    return NextResponse.json({ reportId: savedReport.id })
  } catch (err) {
    console.error('[POST /api/reports/category]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
