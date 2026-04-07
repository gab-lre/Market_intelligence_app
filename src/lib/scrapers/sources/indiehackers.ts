// Collecteur Indie Hackers
// Source : indiehackers.com
// Statut : DÉSACTIVÉ — site SPA (rendu côté client), scraping HTML non fonctionnel.
// À réactiver en Phase 6 via Apify (actor dédié IH ou navigateur headless).

import type { Scraper, RawSignalInput } from '../types'

export class IndieHackersScraper implements Scraper {
  name = 'Indie Hackers'
  source = 'indiehackers' as const
  sourceType = 'community' as const

  async collect(_params: Record<string, unknown>): Promise<RawSignalInput[]> {
    console.log('[IndieHackers] Collecteur désactivé — site SPA, données non accessibles sans navigateur headless. À réactiver en Phase 6 via Apify.')
    return []
  }
}
