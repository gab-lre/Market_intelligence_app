// Pipeline d'analyse IA — OpenAI Multi-couches
// Layer 0 : filtre TypeScript (prefilter.ts) — gratuit
// Layer 1 : gpt-4.1-nano classification (classifier.ts)
// Layer 2 : gpt-5-mini analyse fusionnée + merge check (ce fichier)

import { supabase } from '@/lib/supabase'
import { getOpenAIClient } from './openai-client'
import { MODELS, REASONING_EFFORT, estimateCost } from './models'
import { buildAnalysisSystemPrompt, buildFusedAnalysisPrompt } from './prompts'
import { safeParseAIResponse } from './utils'
import { prefilterSignals } from './prefilter'
import { classifySignals } from './classifier'
import type {
  RawSignal,
  UserProfile,
  OpportunityInsert,
  OpportunityType,
  TargetMarket,
  RevenueModel,
  TimeToMvp,
  Complexity,
  MarketSizeHint,
} from '@/types/database'
import type OpenAI from 'openai'

// ============================================
// Types internes
// ============================================

interface OpenAIAnalysis {
  is_opportunity: boolean
  confidence: number
  merge_match: string | null
  analysis?: {
    opportunity_type: OpportunityType
    opportunity_title: string
    opportunity_description: string
    problem: string
    repetitive_tasks: string[]
    existing_tools: string[]
    tool_gaps: string | null
    department: string
    company_size: string[]
    target_market: TargetMarket
    revenue_model: RevenueModel
    urgency_score: number
    tool_gap_score: number
    saturation_score: number
    effort: {
      time_to_mvp: TimeToMvp
      complexity: Complexity
      estimated_cost: string
      solo_dev_feasible: boolean
      key_challenges: string[]
    }
    monetization_potential: {
      price_range: string
      market_size_hint: MarketSizeHint
      recurring_potential: boolean
    }
    alternative_types: string[]
  }
  discard_reason?: string
}

export interface AnalysisResult {
  analyzed: number
  created: number
  updated: number
  discarded: number
  errors: number
  opportunityIds: string[]
  errorDetails: string[]
  quotaReached?: boolean // conservé pour rétrocompatibilité — toujours false désormais
}

// ============================================
// Helpers
// ============================================

// ============================================
// Appel Layer 2 — analyse fusionnée (gpt-5-mini)
// ============================================

async function callAnalyzer(
  client: OpenAI,
  signal: RawSignal,
  systemPrompt: string,
  existingOpportunities: Array<{ id: string; title: string }>
): Promise<{ result: OpenAIAnalysis; usage: { input_tokens: number; output_tokens: number } }> {
  const userContent = buildFusedAnalysisPrompt(signal, existingOpportunities)

  const response = await client.responses.create({
    model: MODELS.ANALYZER,
    reasoning: { effort: REASONING_EFFORT.ANALYZER },
    instructions: systemPrompt,
    input: userContent,
  })

  const raw: string = response.output_text ?? ''
  const result = safeParseAIResponse<OpenAIAnalysis>(raw, signal.id)

  return {
    result,
    usage: {
      input_tokens: response.usage?.input_tokens ?? 0,
      output_tokens: response.usage?.output_tokens ?? 0,
    },
  }
}

// ============================================
// Créer ou mettre à jour une opportunité
// ============================================

async function upsertOpportunity(
  analysis: NonNullable<OpenAIAnalysis['analysis']>,
  signalId: string,
  sourceType: string,
  matchId: string | null
): Promise<{ id: string; isNew: boolean }> {
  if (matchId) {
    const { data: existing } = await supabase
      .from('opportunities')
      .select('signal_count, score_urgency, score_tool_gap, score_saturation, source_types')
      .eq('id', matchId)
      .single()

    if (!existing) {
      console.warn(`[Analyzer] merge_match ${matchId} introuvable — création d'une nouvelle opportunité`)
      return upsertOpportunity(analysis, signalId, sourceType, null)
    }

    const n = existing.signal_count + 1
    const newUrgency = Math.round(
      (existing.score_urgency * existing.signal_count + analysis.urgency_score) / n
    )
    const newToolGap = Math.round(
      (existing.score_tool_gap * existing.signal_count + analysis.tool_gap_score) / n
    )
    const newSaturation = Math.round(
      (existing.score_saturation * existing.signal_count + analysis.saturation_score) / n
    )

    const sourceTypes: string[] = existing.source_types ?? []
    if (!sourceTypes.includes(sourceType)) sourceTypes.push(sourceType)

    await supabase
      .from('opportunities')
      .update({
        signal_count: n,
        score_urgency: newUrgency,
        score_tool_gap: newToolGap,
        score_saturation: newSaturation,
        source_types: sourceTypes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)

    await supabase.from('opportunity_signals').insert({
      opportunity_id: matchId,
      signal_id: signalId,
      relevance_note: `Signal fusionné — ${analysis.opportunity_title}`,
    })

    return { id: matchId, isNew: false }
  } else {
    const insert: OpportunityInsert = {
      title: analysis.opportunity_title,
      description: analysis.opportunity_description,
      problem: analysis.problem,
      repetitive_tasks: analysis.repetitive_tasks ?? [],
      existing_tools: analysis.existing_tools ?? [],
      tool_gaps: analysis.tool_gaps ?? null,
      department: (analysis.department as OpportunityInsert['department']) ?? null,
      company_size: (analysis.company_size ?? []) as OpportunityInsert['company_size'],
      score_volume: 10,
      score_urgency: analysis.urgency_score,
      score_tool_gap: analysis.tool_gap_score,
      score_saturation: analysis.saturation_score,
      score_global: 0,
      signal_count: 1,
      source_types: [sourceType],
      status: 'active',
      opportunity_type: analysis.opportunity_type,
      target_market: analysis.target_market ?? null,
      revenue_model: analysis.revenue_model ?? null,
      time_to_mvp: analysis.effort?.time_to_mvp ?? null,
      complexity: analysis.effort?.complexity ?? null,
      estimated_cost: analysis.effort?.estimated_cost ?? null,
      solo_dev_feasible: analysis.effort?.solo_dev_feasible ?? true,
      key_challenges: analysis.effort?.key_challenges ?? [],
      price_range: analysis.monetization_potential?.price_range ?? null,
      market_size_hint: analysis.monetization_potential?.market_size_hint ?? null,
      recurring_potential: analysis.monetization_potential?.recurring_potential ?? null,
      alternative_types: analysis.alternative_types ?? [],
    }

    const { data, error } = await supabase
      .from('opportunities')
      .insert(insert)
      .select('id')
      .single()

    if (error || !data) throw new Error(`Erreur insertion opportunité : ${error?.message}`)

    await supabase.from('opportunity_signals').insert({
      opportunity_id: data.id,
      signal_id: signalId,
      relevance_note: null,
    })

    return { id: data.id, isNew: true }
  }
}

// ============================================
// Fonction principale d'analyse
// ============================================

export async function analyzeSignals(
  batchId?: string,
  limit = 50,
  profile?: UserProfile | null
): Promise<AnalysisResult> {
  const client = getOpenAIClient()
  const systemPrompt = buildAnalysisSystemPrompt(profile ?? null)

  // Récupère les signaux en attente
  let query = supabase
    .from('raw_signals')
    .select('*')
    .eq('status', 'pending')
    .limit(limit)

  if (batchId) {
    query = query.eq('batch_id', batchId)
  }

  const { data: signals, error } = await query
  if (error) throw new Error(`Erreur lecture signaux : ${error.message}`)
  if (!signals || signals.length === 0) {
    return { analyzed: 0, created: 0, updated: 0, discarded: 0, errors: 0, opportunityIds: [], errorDetails: [] }
  }

  const allSignals = signals as RawSignal[]

  // ── Layer 0 : filtre TypeScript (gratuit) ──────────────────────────────
  const { passed: afterPrefilter, discarded: prefilterDiscarded } = await prefilterSignals(allSignals)

  // ── Layer 1 : classification gpt-4.1-nano ─────────────────────────────
  const { passed: toAnalyze, discarded: classifierDiscarded, usage: classifierUsage } =
    await classifySignals(client, afterPrefilter)

  const totalDiscardedByFilters = prefilterDiscarded.length + classifierDiscarded.length

  // Récupère le top 50 des opportunités existantes UNE SEULE FOIS avant la boucle
  const { data: existingOpps } = await supabase
    .from('opportunities')
    .select('id, title')
    .eq('status', 'active')
    .order('score_global', { ascending: false })
    .limit(50)

  const existingOpportunities = (existingOpps ?? []) as Array<{ id: string; title: string }>

  const result: AnalysisResult = {
    analyzed: toAnalyze.length,
    created: 0,
    updated: 0,
    discarded: totalDiscardedByFilters,
    errors: 0,
    opportunityIds: [],
    errorDetails: [],
    quotaReached: false,
  }

  let analyzerInputTokens = 0
  let analyzerOutputTokens = 0

  // ── Layer 2 : analyse fusionnée gpt-5-mini ────────────────────────────
  for (const signal of toAnalyze) {
    try {
      const { result: parsed, usage } = await callAnalyzer(
        client,
        signal,
        systemPrompt,
        existingOpportunities
      )
      analyzerInputTokens += usage.input_tokens
      analyzerOutputTokens += usage.output_tokens

      if (!parsed.is_opportunity || !parsed.analysis) {
        await supabase.from('raw_signals').update({ status: 'discarded' }).eq('id', signal.id)
        result.discarded++
        continue
      }

      const matchId = parsed.merge_match ?? null
      const { id: opportunityId, isNew } = await upsertOpportunity(
        parsed.analysis,
        signal.id,
        signal.source_type,
        matchId
      )

      await supabase.from('raw_signals').update({ status: 'analyzed' }).eq('id', signal.id)

      if (isNew) result.created++
      else result.updated++

      if (!result.opportunityIds.includes(opportunityId)) {
        result.opportunityIds.push(opportunityId)
      }
    } catch (err) {
      const msg = (err as Error).message
      console.error(`[Analyzer] Erreur sur signal ${signal.id} :`, msg)
      await supabase.from('raw_signals').update({ status: 'error' }).eq('id', signal.id)
      result.errors++
      result.errorDetails.push(msg)
    }
  }

  // ── Suivi consommation → collections_history ──────────────────────────
  if (batchId && (classifierUsage.input_tokens > 0 || analyzerInputTokens > 0)) {
    const analyzerCost = estimateCost(MODELS.ANALYZER, analyzerInputTokens, analyzerOutputTokens)
    const totalCost = classifierUsage.estimated_cost_usd + analyzerCost

    const { data: batch } = await supabase
      .from('collections_history')
      .select('results_summary')
      .eq('id', batchId)
      .single()

    const existingSummary = (batch?.results_summary ?? {}) as Record<string, unknown>

    await supabase
      .from('collections_history')
      .update({
        results_summary: {
          ...existingSummary,
          ai_usage: {
            classifier: {
              model: MODELS.CLASSIFIER,
              input_tokens: classifierUsage.input_tokens,
              output_tokens: classifierUsage.output_tokens,
              estimated_cost_usd: classifierUsage.estimated_cost_usd,
            },
            analyzer: {
              model: MODELS.ANALYZER,
              input_tokens: analyzerInputTokens,
              output_tokens: analyzerOutputTokens,
              estimated_cost_usd: analyzerCost,
            },
            total_cost_usd: totalCost,
          },
        },
      })
      .eq('id', batchId)

    console.log(
      `[Analyzer] Coût total batch : $${totalCost.toFixed(5)} ` +
      `(classifier: $${classifierUsage.estimated_cost_usd.toFixed(5)}, analyzer: $${analyzerCost.toFixed(5)})`
    )
  }

  return result
}
