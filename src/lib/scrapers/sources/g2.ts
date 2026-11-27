import { runApifyActor, type ApifyItem } from '../apify-client'
import type { Scraper, RawSignalInput } from '../types'

const DEFAULT_ACTOR_ID = 'focused_vanguard/g2-reviews-scraper'

const DEFAULT_PARAMS = {
  maxResults: 10,
  urls: [
    'https://www.g2.com/products/postman/reviews', // Exemple fallback
  ],
}

interface G2Review {
  id?: string
  product_name?: string
  product_url?: string
  author?: string
  rating?: number
  content?: string
  pros?: string
  cons?: string
  date_posted?: string
  review_url?: string
}

function mapToSignal(review: ApifyItem): RawSignalInput | null {
  const r = review as G2Review

  const externalId = r.id ?? r.review_url
  const title = `[G2] Review ${r.rating}/5 for ${r.product_name || 'Software'}`
  
  const pros = r.pros ? `Pros: ${r.pros}\n` : ''
  const cons = r.cons ? `Cons: ${r.cons}\n` : ''
  const content = r.content ? `Details: ${r.content}` : ''
  
  const fullContent = `${pros}${cons}${content}`.trim()
  if (!fullContent) return null

  return {
    source: 'g2',
    sourceType: 'review',
    externalId: externalId ?? String(Date.now()),
    title,
    content: fullContent.slice(0, 3000),
    url: r.review_url ?? r.product_url ?? '',
    publishedAt: r.date_posted ? new Date(r.date_posted).toISOString() : undefined,
    metadata: {
      product: r.product_name,
      rating: r.rating,
      author: r.author,
    },
  }
}

export const G2Scraper: Scraper = {
  name: 'G2 Reviews (Apify)',
  source: 'g2',
  sourceType: 'review',
  async collect(params) {
    console.log('[G2] Lancement de la collecte...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const urls = (params.urls as string[]) ?? DEFAULT_PARAMS.urls
    const actorId = (params.actorId as string) ?? DEFAULT_ACTOR_ID

    // Quota par URL pour garantir que toutes les URLs s'exécutent
    const perUrl = Math.ceil(maxResults / urls.length)

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    for (const url of urls) {
      let urlCount = 0
      try {
        const items = await runApifyActor({
          actorId,
          input: {
            url,
            maxReviews: perUrl,
            maxPages: 1,
          },
          memoryMbytes: 512,
          timeoutSecs: 60,
          maxWaitMs: 120_000,
        })

        for (const item of items) {
          if (urlCount >= perUrl) break

          const signal = mapToSignal(item)
          if (!signal) continue
          if (seenIds.has(signal.externalId)) continue

          seenIds.add(signal.externalId)
          signals.push(signal)
          urlCount++
        }
      } catch (err) {
        console.error(`[G2] Erreur Apify pour ${url} —`, (err as Error).message)
      }
    }

    console.log(`[G2] ${signals.length} signaux collectés sur ${urls.length} produits`)
    return signals
  },
}
