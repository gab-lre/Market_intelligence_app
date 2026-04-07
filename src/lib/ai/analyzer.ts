// Pipeline d'analyse IA — Gemini 2.5 Flash
// Prend les signaux raw_signals en status 'pending' et produit des opportunités structurées

import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import {
  buildAnalysisSystemPrompt,
  MERGE_CHECK_SYSTEM_PROMPT,
  buildMergeCheckPrompt,
} from './prompts'
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

const MODEL_ANALYSIS = 'gemini-2.5-flash'
const MODEL_MERGE = 'gemini-2.5-flash'

// ============================================
// Types internes
// ============================================

interface GeminiAnalysis {
  is_opportunity: boolean
  confidence: number
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
  quotaReached?: boolean
}

function isQuotaError(err: unknown): boolean {
  const msg = (err as Error)?.message ?? ''
  return msg.includes('429') || msg.includes('Too Many Requests') || msg.toLowerCase().includes('quota')
}

// ============================================
// Initialisation Gemini
// ============================================

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY manquante dans .env.local')
  return new GoogleGenerativeAI(apiKey)
}

// ============================================
// Appel Gemini + parse JSON
// ============================================

async function callGemini(
  genAI: GoogleGenerativeAI,
  modelName: string,
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  })
  const result = await model.generateContent(userContent)
  return result.response.text()
}

function parseJsonResponse<T>(raw: string): T {
  // Retire les balises markdown si présentes (```json ... ```)
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned) as T
}

// ============================================
// Vérification de fusion avec opportunités existantes
// ============================================

async function findMatchingOpportunity(
  genAI: GoogleGenerativeAI,
  newTitle: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('opportunities')
    .select('id, title')
    .eq('status', 'active')
    .limit(50)

  if (!existing || existing.length === 0) return null

  try {
    const prompt = buildMergeCheckPrompt(newTitle, existing)
    const raw = await callGemini(genAI, MODEL_MERGE, MERGE_CHECK_SYSTEM_PROMPT, prompt)
    const result = parseJsonResponse<{ match: string }>(raw)
    return result.match === 'new' ? null : result.match
  } catch {
    // En cas d'erreur de fusion, on crée une nouvelle opportunité
    return null
  }
}

// ============================================
// Créer ou mettre à jour une opportunité
// ============================================

async function upsertOpportunity(
  analysis: NonNullable<GeminiAnalysis['analysis']>,
  signalId: string,
  sourceType: string,
  matchId: string | null
): Promise<{ id: string; isNew: boolean }> {
  if (matchId) {
    // Mise à jour d'une opportunité existante
    const { data: existing } = await supabase
      .from('opportunities')
      .select('signal_count, score_urgency, score_tool_gap, score_saturation, source_types')
      .eq('id', matchId)
      .single()

    if (!existing) throw new Error(`Opportunité ${matchId} introuvable`)

    const n = existing.signal_count + 1
    // Moyenne pondérée glissante des scores
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

    // Liaison N-N
    await supabase.from('opportunity_signals').insert({
      opportunity_id: matchId,
      signal_id: signalId,
      relevance_note: `Signal fusionné — confiance ${analysis.opportunity_title}`,
    })

    return { id: matchId, isNew: false }
  } else {
    // Création d'une nouvelle opportunité
    const insert: OpportunityInsert = {
      title: analysis.opportunity_title,
      description: analysis.opportunity_description,
      problem: analysis.problem,
      repetitive_tasks: analysis.repetitive_tasks ?? [],
      existing_tools: analysis.existing_tools ?? [],
      tool_gaps: analysis.tool_gaps ?? null,
      department: (analysis.department as OpportunityInsert['department']) ?? null,
      company_size: (analysis.company_size ?? []) as OpportunityInsert['company_size'],
      score_volume: 10, // Calculé par scoring.ts après insertion
      score_urgency: analysis.urgency_score,
      score_tool_gap: analysis.tool_gap_score,
      score_saturation: analysis.saturation_score,
      score_global: 0, // Calculé par scoring.ts
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

    // Liaison N-N
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
  const genAI = getGeminiClient()
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

  const result: AnalysisResult = {
    analyzed: 0,
    created: 0,
    updated: 0,
    discarded: 0,
    errors: 0,
    opportunityIds: [],
    errorDetails: [],
    quotaReached: false,
  }

  for (const signal of signals as RawSignal[]) {
    try {
      const userContent = [
        signal.title ?? '(sans titre)',
        '',
        signal.content ?? '',
        signal.url ? `URL: ${signal.url}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const raw = await callGemini(genAI, MODEL_ANALYSIS, systemPrompt, userContent)

      let parsed: GeminiAnalysis
      try {
        parsed = parseJsonResponse<GeminiAnalysis>(raw)
      } catch {
        await supabase.from('raw_signals').update({ status: 'error' }).eq('id', signal.id)
        result.errors++
        continue
      }

      if (!parsed.is_opportunity || !parsed.analysis) {
        await supabase.from('raw_signals').update({ status: 'discarded' }).eq('id', signal.id)
        result.discarded++
        result.analyzed++
        continue
      }

      // Cherche une opportunité existante à fusionner
      const matchId = await findMatchingOpportunity(genAI, parsed.analysis.opportunity_title)

      const { id: opportunityId, isNew } = await upsertOpportunity(
        parsed.analysis,
        signal.id,
        signal.source_type,
        matchId
      )

      await supabase.from('raw_signals').update({ status: 'analyzed' }).eq('id', signal.id)

      if (isNew) result.created++
      else result.updated++
      result.analyzed++

      if (!result.opportunityIds.includes(opportunityId)) {
        result.opportunityIds.push(opportunityId)
      }
    } catch (err) {
      const msg = (err as Error).message
      if (isQuotaError(err)) {
        console.warn(`[Analyzer] Quota Gemini journalier atteint — arrêt propre. Signaux restants conservés en 'pending'.`)
        result.quotaReached = true
        break
      }
      console.error(`[Analyzer] Erreur sur signal ${signal.id} :`, msg)
      await supabase.from('raw_signals').update({ status: 'error' }).eq('id', signal.id)
      result.errors++
      result.errorDetails.push(msg)
    }
  }

  return result
}
