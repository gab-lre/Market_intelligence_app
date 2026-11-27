// POST /api/reports/full
// Génère un rapport d'intelligence marché complet (6 sections, 3 appels OpenAI groupés)
// Body : { userId?: string }

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOpenAIClient } from '@/lib/ai/openai-client'
import { MODELS, REASONING_EFFORT, estimateCost } from '@/lib/ai/models'
import {
  FULL_REPORT_SYSTEM_PROMPT,
  buildFullReportGroupPrompt,
} from '@/lib/ai/prompts'
import { safeParseAIResponse } from '@/lib/ai/utils'

const SECTION_TITLES: Record<number, string> = {
  1: 'Executive Summary',
  2: 'État du Marché & Cartographie Sectorielle',
  3: 'Analyse Emploi & Voix des Utilisateurs',
  4: 'Analyse Concurrentielle',
  5: 'Top Opportunités Personnalisées',
  6: "Ce qu'il Faudrait Construire en Premier",
}

// Sections générées par groupe : [sectionA_order, sectionB_order]
const SECTION_GROUPS: Array<[number, number]> = [[1, 2], [3, 4], [5, 6]]


function normalizeContent(raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) {
    return (raw as Array<Record<string, unknown>>)
      .map((item, idx) => {
        if (typeof item === 'string') return item
        const parts: string[] = []
        if (item.title) parts.push(`### ${idx + 1}. ${item.title}`)
        Object.entries(item).forEach(([k, v]) => {
          if (k !== 'title' && v != null) parts.push(`**${k}** : ${v}`)
        })
        return parts.join('\n')
      })
      .join('\n\n')
  }
  return String(raw ?? '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body as { userId?: string }

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

    // 2. Opportunités actives
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('title, score_global, department, opportunity_type, target_market, complexity')
      .eq('status', 'active')
      .order('score_global', { ascending: false })
      .limit(50)

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json(
        { error: "Aucune opportunité disponible. Lancez d'abord une collecte et une analyse." },
        { status: 422 }
      )
    }

    // 3. Statistiques signaux par catégorie
    const { data: signalStats } = await supabase
      .from('raw_signals')
      .select('source_type')

    const signalsByCategory: Record<string, number> = {}
    for (const s of signalStats ?? []) {
      const cat = s.source_type === 'community' || s.source_type === 'review' ? 'community'
        : s.source_type === 'job' || s.source_type === 'freelance' ? 'job'
        : 'startup'
      signalsByCategory[cat] = (signalsByCategory[cat] ?? 0) + 1
    }
    const totalSignals = signalStats?.length ?? 0

    // 4. Distribution par département
    const departmentDistribution: Record<string, number> = {}
    for (const opp of opportunities) {
      const dept = opp.department ?? 'autre'
      departmentDistribution[dept] = (departmentDistribution[dept] ?? 0) + 1
    }

    // 5. Créer le rapport en statut "generating"
    const { data: reportRow, error: createError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: userId ?? null,
        type: 'full',
        title: 'Global Intelligence Report',
        sections: [],
        sources_used: ['community', 'job', 'startup'],
        status: 'generating',
        sections_total: 6,
        sections_done: 0,
        generation_params: {
          total_signals: totalSignals,
          total_opportunities: opportunities.length,
        },
      })
      .select('id')
      .single()

    if (createError || !reportRow) {
      return NextResponse.json({ error: 'Erreur création rapport' }, { status: 500 })
    }

    const reportId = reportRow.id
    const client = getOpenAIClient()

    const params = {
      totalSignals,
      totalOpportunities: opportunities.length,
      opportunities: opportunities as Array<{
        title: string; score_global: number; department: string | null;
        opportunity_type: string; target_market: string | null; complexity: string | null
      }>,
      signalsByCategory,
      departmentDistribution,
      profileSummary,
    }

    // 6. Générer les 6 sections en 3 appels groupés
    const sections: Array<{ order: number; title: string; content: string }> = []
    let totalInputTokens = 0
    let totalOutputTokens = 0

    for (let groupIdx = 0; groupIdx < SECTION_GROUPS.length; groupIdx++) {
      const [orderA, orderB] = SECTION_GROUPS[groupIdx]
      const groupIndex = (groupIdx + 1) as 1 | 2 | 3

      try {
        const prompt = buildFullReportGroupPrompt(groupIndex, params)

        const response = await client.responses.create({
          model: MODELS.REPORTER,
          reasoning: { effort: REASONING_EFFORT.REPORTER },
          instructions: FULL_REPORT_SYSTEM_PROMPT,
          input: prompt,
        })

        totalInputTokens += response.usage?.input_tokens ?? 0
        totalOutputTokens += response.usage?.output_tokens ?? 0

        const rawText = response.output_text ?? ''

        type GroupData = {
          section_A: { title: string; content: unknown }
          section_B: { title: string; content: unknown }
        }
        const groupData = safeParseAIResponse<GroupData>(rawText, `report:full:group${groupIndex}`)

        sections.push({
          order: orderA,
          title: (groupData.section_A?.title as string) || SECTION_TITLES[orderA],
          content: normalizeContent(groupData.section_A?.content),
        })
        sections.push({
          order: orderB,
          title: (groupData.section_B?.title as string) || SECTION_TITLES[orderB],
          content: normalizeContent(groupData.section_B?.content),
        })

        // Tri pour un affichage cohérent + mise à jour de la progression
        sections.sort((a, b) => a.order - b.order)
        await supabase
          .from('generated_reports')
          .update({ sections_done: orderB, sections })
          .eq('id', reportId)

      } catch (groupErr) {
        console.error(`[FullReport] Erreur groupe ${groupIndex}:`, groupErr)
        sections.push({
          order: orderA,
          title: SECTION_TITLES[orderA],
          content: `Cette section n'a pas pu être générée : ${(groupErr as Error).message}`,
        })
        sections.push({
          order: orderB,
          title: SECTION_TITLES[orderB],
          content: `Cette section n'a pas pu être générée : ${(groupErr as Error).message}`,
        })
      }
    }

    // 7. Finaliser le rapport avec suivi de consommation
    sections.sort((a, b) => a.order - b.order)
    await supabase
      .from('generated_reports')
      .update({
        sections,
        status: 'completed',
        sections_done: 6,
        generation_params: {
          total_signals: totalSignals,
          total_opportunities: opportunities.length,
          ai_usage: {
            model: MODELS.REPORTER,
            input_tokens: totalInputTokens,
            output_tokens: totalOutputTokens,
            estimated_cost_usd: estimateCost(MODELS.REPORTER, totalInputTokens, totalOutputTokens),
          },
        },
      })
      .eq('id', reportId)

    return NextResponse.json({ reportId })
  } catch (err) {
    console.error('[POST /api/reports/full]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
