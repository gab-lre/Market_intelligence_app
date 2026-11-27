// POST /api/analyze
// Analyse les signaux en statut "pending" (indépendamment de la collecte).
// Utile pour traiter les signaux collectés sans analyse, ou reprendre après timeout.
// Body optionnel : { batchId?: string, limit?: number }

import { NextResponse } from 'next/server'
import { analyzeSignals } from '@/lib/ai/analyzer'
import { recalculateOpportunityScore } from '@/lib/ai/scoring'
import { fetchUserProfile } from '@/lib/userProfile'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    let batchId: string | undefined
    let limit = 50

    try {
      const body = await request.json()
      batchId = body?.batchId
      if (typeof body?.limit === 'number') limit = Math.min(body.limit, 200)
    } catch {
      // Body vide — analyse les 50 prochains pending sans filtre de batch
    }

    // Compter les pending avant de lancer (pour informer l'utilisateur)
    const countQuery = supabase
      .from('raw_signals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (batchId) countQuery.eq('batch_id', batchId)
    const { count: pendingCount } = await countQuery

    const profile = await fetchUserProfile()
    const analysisResult = await analyzeSignals(batchId, limit, profile)

    for (const opportunityId of analysisResult.opportunityIds) {
      await recalculateOpportunityScore(opportunityId)
    }

    // Recompter les pending restants
    const { count: remainingCount } = await supabase
      .from('raw_signals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    return NextResponse.json({
      analyzed: analysisResult.analyzed,
      created: analysisResult.created,
      updated: analysisResult.updated,
      discarded: analysisResult.discarded,
      errors: analysisResult.errors,
      opportunityIds: analysisResult.opportunityIds,
      pendingBefore: pendingCount ?? 0,
      pendingRemaining: remainingCount ?? 0,
      ...(analysisResult.errorDetails.length > 0 && { errorDetails: analysisResult.errorDetails }),
    })
  } catch (err) {
    console.error('[POST /api/analyze]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET() {
  const { count } = await supabase
    .from('raw_signals')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  return NextResponse.json({ pendingSignals: count ?? 0 })
}
