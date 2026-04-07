// POST /api/scraping/analyze
// Analyse les signaux raw_signals en statut 'pending' via Gemini 2.5 Flash
// Body optionnel : { batchId?: string, limit?: number }

import { NextResponse } from 'next/server'
import { analyzeSignals } from '@/lib/ai/analyzer'
import { recalculateOpportunityScore } from '@/lib/ai/scoring'
import { fetchUserProfile } from '@/lib/userProfile'

export async function POST(request: Request) {
  try {
    let batchId: string | undefined
    let limit = 50

    try {
      const body = await request.json()
      batchId = body?.batchId
      if (body?.limit) limit = Number(body.limit)
    } catch {
      // Body vide ou invalide — on utilise les valeurs par défaut
    }

    const profile = await fetchUserProfile()
    const result = await analyzeSignals(batchId, limit, profile)

    // Recalcule les scores pour toutes les opportunités touchées
    for (const opportunityId of result.opportunityIds) {
      await recalculateOpportunityScore(opportunityId)
    }

    return NextResponse.json({
      ...result,
      ...(result.quotaReached && {
        quotaWarning: 'Quota Gemini journalier atteint (20 req/jour free tier). Les signaux non analysés restent en "pending" et seront traités lors du prochain run.',
      }),
    })
  } catch (err) {
    console.error('[POST /api/scraping/analyze]', err)
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}
