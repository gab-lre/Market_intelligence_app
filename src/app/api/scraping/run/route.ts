// POST /api/scraping/run
// Pipeline complet : collecte → analyse IA → recalcul des scores
// Body optionnel : { sources?: [{ source: string, params?: {...} }] }
// C'est cette route qui sera appelée par le bouton "Lancer" du dashboard

import { NextResponse } from 'next/server'
import { runScrapingEngine } from '@/lib/scrapers/engine'
import { analyzeSignals } from '@/lib/ai/analyzer'
import { recalculateOpportunityScore } from '@/lib/ai/scoring'
import { fetchUserProfile } from '@/lib/userProfile'

export async function POST(request: Request) {
  try {
    let sources: Array<{ source: string; params?: Record<string, unknown> }> | undefined

    try {
      const body = await request.json()
      sources = body?.sources
    } catch {
      // Body vide — on utilise toutes les sources actives
    }

    // Récupération du profil utilisateur pour personnaliser scraping + analyse
    const profile = await fetchUserProfile()

    // Étape 1 — Collecte (keywords/locations/tags personnalisés selon profil)
    const collectResult = await runScrapingEngine(sources, profile)

    // Étape 2 — Analyse IA — limité à 100 signaux par run pour éviter les timeouts
    const analysisResult = await analyzeSignals(collectResult.batchId, 100, profile)

    // Étape 3 — Recalcul des scores
    for (const opportunityId of analysisResult.opportunityIds) {
      await recalculateOpportunityScore(opportunityId)
    }

    return NextResponse.json({
      batchId: collectResult.batchId,
      collection: {
        status: collectResult.status,
        signalsCollected: collectResult.totalSignalsCollected,
        sources: collectResult.results,
      },
      analysis: {
        analyzed: analysisResult.analyzed,
        created: analysisResult.created,
        updated: analysisResult.updated,
        discarded: analysisResult.discarded,
        errors: analysisResult.errors,
      },
      durationMs: collectResult.durationMs,
      ...(analysisResult.quotaReached && {
        quotaWarning: 'Quota Gemini journalier atteint (20 req/jour free tier). Les signaux non analysés restent en "pending" et seront traités lors du prochain run.',
      }),
    })
  } catch (err) {
    console.error('[POST /api/scraping/run]', err)
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}
