// POST /api/reports/cross
// Génère un rapport croisé entre 2 ou 3 catégories de sources
// Body : { categories: ('community' | 'job' | 'startup')[], userId?: string }

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import {
  CROSS_REPORT_SYSTEM_PROMPT,
  buildCrossReportPrompt,
} from '@/lib/ai/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const CATEGORY_CONFIG: Record<string, { label: string; sourceTypes: string[] }> = {
  community: { label: 'Communautés & Insights', sourceTypes: ['community', 'review'] },
  job: { label: 'Emplois & Missions Freelance', sourceTypes: ['job', 'freelance'] },
  startup: { label: 'Écosystème Startups', sourceTypes: ['community'] },
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
    const { categories, userId } = body as { categories: string[]; userId?: string }

    if (!categories || categories.length < 2) {
      return NextResponse.json({ error: 'Au moins 2 catégories requises' }, { status: 400 })
    }

    const validCategories = categories.filter(c => CATEGORY_CONFIG[c])
    if (validCategories.length < 2) {
      return NextResponse.json({ error: 'Catégories invalides' }, { status: 400 })
    }

    // 1. Profil utilisateur
    let profileSummary: string | null = null
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_summary')
        .eq('id', userId)
        .maybeSingle()
      profileSummary = profile?.profile_summary ?? null
    }

    // 2. Données par catégorie
    const categoriesData = await Promise.all(
      validCategories.map(async (cat) => {
        const config = CATEGORY_CONFIG[cat]

        const { data: signals } = await supabase
          .from('raw_signals')
          .select('id, title, content, source')
          .in('source_type', config.sourceTypes)
          .order('collected_at', { ascending: false })
          .limit(50)

        const signalIds = (signals ?? []).map(s => s.id)
        let opportunities: Array<{ title: string; score_global: number; department: string | null }> = []

        if (signalIds.length > 0) {
          const { data: linkedOpps } = await supabase
            .from('opportunity_signals')
            .select('opportunity_id')
            .in('signal_id', signalIds)

          const oppIds = [...new Set((linkedOpps ?? []).map(l => l.opportunity_id))]
          if (oppIds.length > 0) {
            const { data: opps } = await supabase
              .from('opportunities')
              .select('title, score_global, department')
              .in('id', oppIds)
              .eq('status', 'active')
              .order('score_global', { ascending: false })
              .limit(10)
            opportunities = opps ?? []
          }
        }

        // Extraire les thèmes dominants depuis les titres des opportunités
        const topThemes = opportunities.slice(0, 5).map(o => o.title)

        return {
          name: cat,
          label: config.label,
          signalCount: signals?.length ?? 0,
          opportunities,
          topThemes,
        }
      })
    )

    // Vérifier qu'on a des données
    const totalSignals = categoriesData.reduce((sum, c) => sum + c.signalCount, 0)
    if (totalSignals === 0) {
      return NextResponse.json(
        { error: 'Aucun signal disponible pour les catégories sélectionnées. Lancez d\'abord une collecte.' },
        { status: 422 }
      )
    }

    // 3. Générer le rapport
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: CROSS_REPORT_SYSTEM_PROMPT,
    })

    const prompt = buildCrossReportPrompt({ categories: categoriesData, profileSummary })
    const result = await model.generateContent(prompt)
    const rawText = result.response.text()

    type CrossReportData = {
      convergence_matrix: Array<{ opportunity_title: string; confirmed_by: string[]; strength: string; insight: string }>
      tensions: Array<{ topic: string; source_a: string; source_b: string; interpretation: string }>
      emerging_opportunities: Array<{ title: string; sources: string[]; why_interesting: string }>
      top5_recommendations: Array<{ rank: number; opportunity: string; justification: string; confirmed_sources_count: number }>
      for_you: string
    }

    const reportData = parseJsonResponse<CrossReportData>(rawText)

    // 4. Construire les sections
    const sections = [
      {
        order: 1,
        title: 'Matrice de convergence',
        content: reportData.convergence_matrix
          .map(c => `**${c.opportunity_title}** _(${c.strength})_\nConfirmé par : ${c.confirmed_by.join(', ')}\n${c.insight}`)
          .join('\n\n'),
      },
      {
        order: 2,
        title: 'Analyse des tensions',
        content: reportData.tensions
          .map(t => `**${t.topic}**\n_Sources A_ : ${t.source_a}\n_Sources B_ : ${t.source_b}\n**Interprétation** : ${t.interpretation}`)
          .join('\n\n'),
      },
      {
        order: 3,
        title: 'Opportunités émergentes',
        content: reportData.emerging_opportunities
          .map(o => `**${o.title}**\n_Sources_ : ${o.sources.join(', ')}\n${o.why_interesting}`)
          .join('\n\n'),
      },
      {
        order: 4,
        title: 'Top 5 recommandations',
        content: reportData.top5_recommendations
          .map(r => `**${r.rank}. ${r.opportunity}** (confirmé par ${r.confirmed_sources_count} sources)\n${r.justification}`)
          .join('\n\n'),
      },
      {
        order: 5,
        title: 'Pour toi',
        content: reportData.for_you,
      },
    ]

    const { data: savedReport, error: saveError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: userId ?? null,
        type: 'cross',
        title: `Rapport croisé : ${validCategories.map(c => CATEGORY_CONFIG[c].label).join(' × ')}`,
        sections,
        sources_used: validCategories,
        status: 'completed',
        sections_total: sections.length,
        sections_done: sections.length,
        generation_params: {
          categories: validCategories,
          total_signals: totalSignals,
        },
      })
      .select('id')
      .single()

    if (saveError) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ reportId: savedReport.id })
  } catch (err) {
    console.error('[POST /api/reports/cross]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
