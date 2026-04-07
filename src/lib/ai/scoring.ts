// Module de scoring — Calcul du score global des opportunités
// score_global = (score_volume × 0.30) + (score_urgency × 0.35) + (score_tool_gap × 0.25) - (score_saturation × 0.10)
// score_volume = min(100, (signal_count / max_signal_count_global) × 100)

import { supabase } from '@/lib/supabase'
import type { Opportunity, UserProfile } from '@/types/database'

export async function recalculateOpportunityScore(opportunityId: string): Promise<void> {
  // Récupère l'opportunité
  const { data: opportunity, error } = await supabase
    .from('opportunities')
    .select('signal_count, score_urgency, score_tool_gap, score_saturation')
    .eq('id', opportunityId)
    .single()

  if (error || !opportunity) {
    console.error(`[Scoring] Opportunité ${opportunityId} introuvable :`, error?.message)
    return
  }

  // Récupère le max global de signal_count pour normaliser le score_volume
  const { data: maxData } = await supabase
    .from('opportunities')
    .select('signal_count')
    .order('signal_count', { ascending: false })
    .limit(1)
    .single()

  const maxSignalCount = maxData?.signal_count ?? 1

  const scoreVolume = Math.min(100, Math.round((opportunity.signal_count / maxSignalCount) * 100))

  const scoreGlobal = Math.round(
    scoreVolume * 0.3 +
    opportunity.score_urgency * 0.35 +
    opportunity.score_tool_gap * 0.25 -
    opportunity.score_saturation * 0.1
  )

  await supabase
    .from('opportunities')
    .update({
      score_volume: scoreVolume,
      score_global: Math.max(0, Math.min(100, scoreGlobal)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', opportunityId)
}

export async function recalculateAllScores(): Promise<void> {
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id')
    .eq('status', 'active')

  if (!opportunities) return

  for (const opp of opportunities) {
    await recalculateOpportunityScore(opp.id)
  }
}

// ============================================
// Scoring personnalisé selon le profil utilisateur
// Calculé à la volée, non stocké en base.
// Retourne un score entre 0 et 100.
// ============================================

const SECTOR_TO_DEPT: Record<string, string[]> = {
  health: ['rh', 'support'],
  finance: ['finance'],
  legal: ['operations', 'finance'],
  insurance: ['finance'],
  hr_sensitive: ['rh'],
  real_estate: ['operations'],
}

export function computePersonalizedScore(
  opp: Pick<Opportunity, 'score_global' | 'department' | 'complexity' | 'estimated_cost' | 'target_market' | 'opportunity_type'>,
  profile: Pick<UserProfile, 'excluded_sectors' | 'tech_level' | 'budget_range' | 'priority_market' | 'preferred_business_models' | 'preferred_solution_types'>
): number {
  let score = opp.score_global
  let penalty = 0

  // 1. Secteurs exclus → forte pénalité
  if (profile.excluded_sectors?.length && opp.department) {
    for (const sector of profile.excluded_sectors) {
      const relatedDepts = SECTOR_TO_DEPT[sector] ?? []
      if (relatedDepts.includes(opp.department)) {
        penalty += 30
        break
      }
    }
  }

  // 2. Niveau technique vs complexité
  if (profile.tech_level === 'non_tech' && opp.complexity === 'high') penalty += 20
  if (profile.tech_level === 'non_tech' && opp.complexity === 'medium') penalty += 10
  if (profile.tech_level === 'low_code' && opp.complexity === 'high') penalty += 10

  // 3. Budget vs coût estimé
  if (profile.budget_range === 'bootstrapped' && opp.estimated_cost === '5000$+') penalty += 20
  if (profile.budget_range === 'bootstrapped' && opp.estimated_cost === '2000-5000$') penalty += 10
  if (profile.budget_range === 'few_thousands' && opp.estimated_cost === '5000$+') penalty += 10

  // 4. Marché prioritaire
  if (profile.priority_market && opp.target_market) {
    const compatible: Record<string, string[]> = {
      fr: ['fr', 'fr_qc', 'international'],
      fr_qc: ['fr', 'qc', 'fr_qc', 'international'],
      europe: ['fr', 'fr_qc', 'international'],
      international: ['international', 'fr_qc'],
    }
    const allowed = compatible[profile.priority_market] ?? []
    if (!allowed.includes(opp.target_market)) penalty += 15
  }

  // 5. Types de solution préférés → bonus si aligné
  if (profile.preferred_solution_types?.length && opp.opportunity_type) {
    const typeMap: Record<string, string[]> = {
      automation: ['ai_agent_service', 'ai_agent_product'],
      platform: ['saas'],
      template: ['template', 'micro_product'],
      api: ['saas', 'ai_agent_product'],
      productivity: ['saas', 'template'],
      widget: ['micro_product'],
    }
    const aligned = profile.preferred_solution_types.some(pref =>
      (typeMap[pref] ?? []).includes(opp.opportunity_type)
    )
    if (aligned) score = Math.min(100, score + 10)
  }

  return Math.max(0, Math.min(100, score - penalty))
}

// Trie une liste d'opportunités selon le score personnalisé
export function sortOpportunitiesByProfile<T extends Pick<Opportunity, 'score_global' | 'department' | 'complexity' | 'estimated_cost' | 'target_market' | 'opportunity_type'>>(
  opportunities: T[],
  profile: Pick<UserProfile, 'excluded_sectors' | 'tech_level' | 'budget_range' | 'priority_market' | 'preferred_business_models' | 'preferred_solution_types'>
): Array<T & { personalized_score: number }> {
  return opportunities
    .map(opp => ({ ...opp, personalized_score: computePersonalizedScore(opp, profile) }))
    .sort((a, b) => b.personalized_score - a.personalized_score)
}
