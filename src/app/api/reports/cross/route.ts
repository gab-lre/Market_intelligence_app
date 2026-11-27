// POST /api/reports/cross
// Génère un rapport croisé entre 2 ou 3 catégories de sources
// Body : { categories: ('community' | 'job' | 'startup')[], userId?: string }

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOpenAIClient } from '@/lib/ai/openai-client'
import { MODELS, REASONING_EFFORT, estimateCost } from '@/lib/ai/models'
import {
  CROSS_REPORT_SYSTEM_PROMPT,
  buildCrossReportPrompt,
} from '@/lib/ai/prompts'
import { safeParseAIResponse } from '@/lib/ai/utils'

const CATEGORY_CONFIG: Record<string, { label: string; sourceTypes: string[] }> = {
  community: { label: 'Communautés & Insights', sourceTypes: ['community', 'review'] },
  job: { label: 'Emplois & Missions Freelance', sourceTypes: ['job', 'freelance'] },
  startup: { label: 'Écosystème Startups', sourceTypes: ['community'] },
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

    // 2. Données par catégorie (opportunités uniquement — pas de signaux bruts)
    const categoriesData = await Promise.all(
      validCategories.map(async (cat) => {
        const config = CATEGORY_CONFIG[cat]

        const { data: signals } = await supabase
          .from('raw_signals')
          .select('id')
          .in('source_type', config.sourceTypes)
          .order('collected_at', { ascending: false })
          .limit(100)

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

    const totalOpps = categoriesData.reduce((sum, c) => sum + c.opportunities.length, 0)
    if (totalOpps === 0) {
      return NextResponse.json(
        { error: "Aucune opportunité disponible. Lancez d'abord une collecte et une analyse." },
        { status: 422 }
      )
    }

    // 3. Générer le rapport via OpenAI gpt-5
    const client = getOpenAIClient()
    const prompt = buildCrossReportPrompt({ categories: categoriesData, profileSummary })

    const response = await client.responses.create({
      model: MODELS.REPORTER,
      reasoning: { effort: REASONING_EFFORT.REPORTER },
      instructions: CROSS_REPORT_SYSTEM_PROMPT,
      input: prompt,
    })

    const rawText = response.output_text ?? ''
    const inputTokens = response.usage?.input_tokens ?? 0
    const outputTokens = response.usage?.output_tokens ?? 0

    type CrossReportData = {
      convergence_matrix: Array<{ opportunity_title: string; confirmed_by: string[]; strength: string; insight: string }>
      tensions: Array<{ topic: string; source_a: string; source_b: string; interpretation: string }>
      emerging_opportunities: Array<{ title: string; sources: string[]; why_interesting: string }>
      top5_recommendations: Array<{ rank: number; opportunity: string; justification: string; confirmed_sources_count: number }>
      for_you: string
    }

    const reportData = safeParseAIResponse<CrossReportData>(rawText, `report:cross:${categories.join(',')}`)

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
          total_opportunities: totalOpps,
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
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ reportId: savedReport.id })
  } catch (err) {
    console.error('[POST /api/reports/cross]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
