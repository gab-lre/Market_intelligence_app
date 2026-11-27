// Collecteur Capterra via Apify
// Actor : dionysus_way/capterra-reviews
// Input  : { startUrls: [string], maxReviews }
//   → startUrls doit contenir des strings plain (pas des objets {url})
//   → URL format : https://www.capterra.com/p/{ID}/{Product}/
// Signal : reviews cross-industries révélant des pain points sectoriels

import { runApifyActor, type ApifyItem } from '../apify-client'
import type { Scraper, RawSignalInput } from '../types'

const DEFAULT_ACTOR_ID = 'dionysus_way/capterra-reviews'

const DEFAULT_PARAMS = {
  maxResults: 10,
  urls: ['https://www.capterra.com/p/172127/Rippling/'],
}

// Format réel retourné par dionysus_way/capterra-reviews (validé le 2026-04-08)
interface CapterraReview {
  id?: string
  title?: string           // titre de la review
  rating?: number
  date?: string            // ex: "March 19, 2026"
  author?: string
  jobTitle?: string
  industry?: string
  companySize?: string
  comments?: string        // corps principal de la review (pas "content")
  pros?: string
  cons?: string
  switchingReasons?: string
  reviewUrl?: string       // pas "review_url"
  productUrl?: string      // ex: "https://www.capterra.com/p/172127/Rippling/"
  incentivized?: string
}

function extractProductName(productUrl?: string): string {
  if (!productUrl) return 'Software'
  // "https://www.capterra.com/p/172127/Rippling/" → "Rippling"
  const parts = productUrl.replace(/\/$/, '').split('/')
  return parts[parts.length - 1].replace(/-/g, ' ') || 'Software'
}

function mapToSignal(review: ApifyItem): RawSignalInput | null {
  const r = review as CapterraReview

  const externalId = r.id ?? r.reviewUrl
  if (!externalId) return null

  const productName = extractProductName(r.productUrl)
  const pros = r.pros ? `Pros: ${r.pros}\n` : ''
  const cons = r.cons ? `Cons: ${r.cons}\n` : ''
  const switching = r.switchingReasons ? `Why they switched: ${r.switchingReasons}\n` : ''
  const body = r.comments ?? ''

  const fullContent = `${switching}${pros}${cons}${body}`.trim()
  if (!fullContent) return null

  // Contexte enrichi pour l'IA
  const contextHeader = [
    r.industry ? `Industry: ${r.industry}` : '',
    r.companySize ? `Company size: ${r.companySize}` : '',
    r.jobTitle ? `Reviewer: ${r.jobTitle}` : '',
  ].filter(Boolean).join(' | ')

  const finalContent = contextHeader
    ? `${contextHeader}\n\n${fullContent}`
    : fullContent

  return {
    source: 'capterra',
    sourceType: 'review',
    externalId: String(externalId),
    title: `[Capterra] ${r.title ?? `Review ${r.rating ?? '?'}/5`} — ${productName}`,
    content: finalContent.slice(0, 3000),
    url: r.reviewUrl ?? r.productUrl ?? '',
    author: r.author ?? 'anonymous',
    publishedAt: r.date ? new Date(r.date).toISOString() : undefined,
    metadata: {
      product: productName,
      rating: r.rating,
      industry: r.industry ?? null,
      company_size: r.companySize ?? null,
      job_title: r.jobTitle ?? null,
      incentivized: r.incentivized ?? null,
    },
  }
}

export const CapterraScraper: Scraper = {
  name: 'Capterra Reviews (Apify)',
  source: 'capterra',
  sourceType: 'review',

  async collect(params) {
    console.log('[Capterra] Lancement de la collecte...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const urls = (params.urls as string[]) ?? DEFAULT_PARAMS.urls
    const actorId = (params.actorId as string) ?? DEFAULT_ACTOR_ID

    // Quota par URL pour garantir la couverture de tous les produits
    const perUrl = Math.ceil(maxResults / urls.length)

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    for (const url of urls) {
      let urlCount = 0
      try {
        const items = await runApifyActor({
          actorId,
          input: {
            startUrls: [url],  // string plain, pas objet {url}
            maxReviews: perUrl,
          },
          memoryMbytes: 512,
          timeoutSecs: 120,
          maxWaitMs: 180_000,
        })

        if (items.length === 0) {
          console.warn(`[Capterra] Aucun résultat pour ${url}`)
        }

        for (const item of items) {
          if (urlCount >= perUrl) break
          const signal = mapToSignal(item)
          if (!signal || seenIds.has(signal.externalId)) continue
          seenIds.add(signal.externalId)
          signals.push(signal)
          urlCount++
        }
      } catch (err) {
        console.error(`[Capterra] Erreur Apify pour ${url}:`, (err as Error).message)
      }
    }

    console.log(`[Capterra] ${signals.length} signaux collectés sur ${urls.length} produits`)
    return signals
  },
}
