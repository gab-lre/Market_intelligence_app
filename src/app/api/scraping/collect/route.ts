// POST /api/scraping/collect
// Déclenche une session de collecte sur les sources demandées.
// Body (optionnel) : { sources: [{ source: "hackernews", params: { ... } }, ...] }
// Si body vide → toutes les sources actives avec paramètres par défaut.

import { NextResponse } from 'next/server'
import { runScrapingEngine } from '@/lib/scrapers/engine'
import type { SourceRequest } from '@/lib/scrapers/engine'
import { fetchUserProfile } from '@/lib/userProfile'

export async function POST(request: Request) {
  try {
    let sources: SourceRequest[] | undefined

    // Lecture optionnelle du body
    const text = await request.text()
    if (text.trim()) {
      const body = JSON.parse(text)
      if (Array.isArray(body.sources)) {
        // Accepte les deux formats : ["source"] ou [{source: "...", params: {...}}]
        sources = body.sources.map((s: string | SourceRequest) =>
          typeof s === 'string' ? { source: s } : s
        )
      }
    }

    const profile = await fetchUserProfile()
    const result = await runScrapingEngine(sources, profile)

    return NextResponse.json(result, {
      status: result.status === 'failed' ? 500 : 200,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
