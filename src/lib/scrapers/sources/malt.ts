import type { Scraper, RawSignalInput } from '../types'
import { runApifyActor } from '../apify-client'

const MALT_ACTOR_ID = 'shoya/malt-profile-scraper'

const DEFAULT_PARAMS = {
  maxResults: 15,
  keywords: ['saas', 'make.com', 'n8n'],
}

// Interface de retour de l'acteur shoya/malt-profile-scraper
interface MaltProfileItem {
  name: string
  bio?: string
  url: string
  slug: string
  tjm?: number
  skills?: string[]
  skills_count?: number
  reviews_count?: number
  scraped_at?: string
  query?: string
}

function mapToSignal(profile: MaltProfileItem): RawSignalInput {
  return {
    source: 'malt',
    sourceType: 'job', // Fallback sur 'job' (freelance non supporté par l'enum DB actuelle)
    externalId: profile.slug,
    title: `[Malt] Profil Freelance: ${profile.name} (Recherche: ${profile.query || 'N/A'})`,
    content: profile.bio || 'Aucune biographie fournie.',
    url: profile.url,
    author: profile.name,
    publishedAt: profile.scraped_at ? new Date(profile.scraped_at).toISOString() : new Date().toISOString(),
    metadata: {
      budget: profile.tjm, // On stocke ici le Taux Journalier Moyen (TJM)
      keywords: profile.skills, // Les compétences affichées sur Malt
      skills_count: profile.skills_count,
      reviews_count: profile.reviews_count,
    },
  }
}

export const MaltScraper: Scraper = {
  name: 'Malt Profiles',
  source: 'malt',
  sourceType: 'job',
  async collect(params) {
    console.log('[Malt] Lancement de la collecte via Apify...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const keywords = (params.keywords as string[]) ?? DEFAULT_PARAMS.keywords

    try {
      // Configuration optimale pour Malt
      const items = await runApifyActor({
        actorId: MALT_ACTOR_ID,
        input: {
          queries: keywords,
          maxPages: 1,
          includeFullBio: true,
          includeMetaTags: false,
          proxyConfiguration: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
            apifyProxyCountry: 'FR',
          },
        },
        memoryMbytes: 512,
        maxWaitMs: 150_000,
      }) as unknown as MaltProfileItem[]

      const limitedItems = items.slice(0, maxResults)
      const signals = limitedItems.map(mapToSignal)
      
      console.log(`[Malt] ${signals.length} signaux (profils freelances) collectés`)
      return signals
    } catch (err) {
      console.error('[Malt] Erreur lors de l\'exécution Apify —', err instanceof Error ? err.message : String(err))
      return []
    }
  },
}
