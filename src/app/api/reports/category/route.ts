// POST /api/reports/category
// Génère un rapport d'analyse pour une catégorie de sources
// Body : { category: 'community' | 'job' | 'startup', userId?: string }

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOpenAIClient } from '@/lib/ai/openai-client'
import { MODELS, REASONING_EFFORT, estimateCost } from '@/lib/ai/models'
import {
  CATEGORY_REPORT_SYSTEM_PROMPT,
  buildCategoryReportPrompt,
} from '@/lib/ai/prompts'
import { safeParseAIResponse } from '@/lib/ai/utils'

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

    // 2. Récupérer les opportunités liées à cette catégorie via les signaux
    const { data: recentSignals } = await supabase
      .from('raw_signals')
      .select('id')
      .in('source_type', config.sourceTypes)
      .order('collected_at', { ascending: false })
      .limit(200)

    const signalIds = (recentSignals ?? []).map(s => s.id)

    let opportunities: Array<{ title: string; problem: string | null; score_global: number; department: string | null; opportunity_type: string }> = []
    if (signalIds.length > 0) {
      const { data: linkedOpps } = await supabase
        .from('opportunity_signals')
        .select('opportunity_id')
        .in('signal_id', signalIds)

      const oppIds = [...new Set((linkedOpps ?? []).map(l => l.opportunity_id))]
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
    }

    if (opportunities.length === 0) {
      return NextResponse.json(
        { error: `Aucune opportunité disponible pour la catégorie "${config.label}". Lancez d'abord une collecte et une analyse.` },
        { status: 422 }
      )
    }

    // 3. Générer le rapport via OpenAI gpt-5
    const client = getOpenAIClient()
    const prompt = buildCategoryReportPrompt({
      category,
      categoryLabel: config.label,
      opportunities,
      profileSummary,
    })

    const response = await client.responses.create({
      model: MODELS.REPORTER,
      reasoning: { effort: REASONING_EFFORT.REPORTER },
      instructions: CATEGORY_REPORT_SYSTEM_PROMPT,
      input: prompt,
    })

    const rawText = response.output_text ?? ''
    const inputTokens = response.usage?.input_tokens ?? 0
    const outputTokens = response.usage?.output_tokens ?? 0

    type ReportData = {
      synthesis: string
      dominant_signals: Array<{ theme: string; description: string; frequency: string }>
      top_opportunities: Array<{ title: string; why_relevant: string; score: number }>
      angles_to_explore: Array<{ angle: string; description: string }>
      source_limits: string
      for_you: string
    }

    const reportData = safeParseAIResponse<ReportData>(rawText, `report:category:${category}`)

    // 4. Convertir en sections et sauvegarder
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
          opportunities_included: opportunities.length,
          ai_usage: {
            model: MODELS.REPORTER,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated_cost_usd: estimateCost(MODELS.REPORTER, inputTokens, outputTokens),
          },
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
