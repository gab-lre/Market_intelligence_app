// Collecteur Trustpilot via Apify
// Actor : automation-lab/trustpilot (happitap/trustpilot-scraper était cassé/déprécié)
// Input : { companyUrls: ["domain.com"], maxReviewsPerCompany: N, sort: "recency" }
// Signal : reviews de services B2B révélant des frustrations opérationnelles cross-industries
// Stratégie : viser des outils/services utilisés par des PME non-tech
// pour capter des pain points dans des secteurs absents de G2/Capterra

import { runApifyActor, type ApifyItem } from '../apify-client'
import type { Scraper, RawSignalInput } from '../types'

const DEFAULT_ACTOR_ID = 'automation-lab/trustpilot'

// Les URLs sont des domaines seuls (pas des URLs Trustpilot complètes)
const DEFAULT_PARAMS = {
  maxResults: 10,
  urls: ['paypal.com'],
}

// Format de sortie validé de happitap/trustpilot-scraper
interface TrustpilotReview {
  id?: string
  reviewId?: string
  title?: string
  text?: string
  reviewText?: string
  body?: string
  rating?: number
  stars?: number
  publishedDate?: string
  datePublished?: string
  date?: string
  createdAt?: string
  authorName?: string
  author?: string
  consumer?: { displayName?: string }
  companyName?: string
  businessUnit?: { displayName?: string }
  isVerified?: boolean
  verificationLevel?: string
  reviewUrl?: string
  url?: string
  language?: string
  country?: string
}

function extractProductName(url: string): string {
  // Accepte "paypal.com" ou "https://www.trustpilot.com/review/www.paypal.com"
  const domain = url.replace(/^https?:\/\/(?:www\.)?trustpilot\.com\/review\//, '')
  const base = domain.replace(/^www\./, '').split('/')[0].split('.')[0]
  return base.charAt(0).toUpperCase() + base.slice(1)
}

function mapToSignal(review: ApifyItem, productUrl: string): RawSignalInput | null {
  const r = review as TrustpilotReview

  const externalId = r.id ?? r.reviewId ?? r.reviewUrl
  if (!externalId) return null

  const text = r.text ?? r.reviewText ?? r.body ?? ''
  if (!text || text.length < 50) return null

  const rating = r.rating ?? r.stars
  const author = r.authorName ?? r.author ?? r.consumer?.displayName ?? 'anonymous'
  const productName = r.companyName ?? r.businessUnit?.displayName ?? extractProductName(productUrl)
  const publishedAt = r.publishedDate ?? r.datePublished ?? r.date ?? r.createdAt
  const reviewUrl = r.reviewUrl ?? r.url ?? productUrl

  const titleLine = r.title ? `"${r.title}"\n` : ''
  const fullContent = `${titleLine}${text}`.trim()

  return {
    source: 'trustpilot',
    sourceType: 'review',
    externalId: String(externalId),
    title: `[Trustpilot] Review ${rating ?? '?'}/5 — ${productName}`,
    content: fullContent.slice(0, 3000),
    url: reviewUrl,
    author,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    metadata: {
      product: productName,
      rating,
      verified: r.isVerified ?? (r.verificationLevel === 'verified') ?? null,
      language: r.language ?? null,
      country: r.country ?? null,
    },
  }
}

export const TrustpilotScraper: Scraper = {
  name: 'Trustpilot Reviews (Apify)',
  source: 'trustpilot',
  sourceType: 'review',

  async collect(params) {
    console.log('[Trustpilot] Lancement de la collecte...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const urls = (params.urls as string[]) ?? DEFAULT_PARAMS.urls
    const actorId = (params.actorId as string) ?? DEFAULT_ACTOR_ID

    // Quota par domaine pour garantir la couverture de toutes les entreprises
    const perUrl = Math.ceil(maxResults / urls.length)

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    for (const url of urls) {
      let urlCount = 0
      try {
        const items = await runApifyActor({
          actorId,
          input: {
            companyUrls: [url],
            maxReviewsPerCompany: perUrl,
            sort: 'recency',
            includeCompanyInfo: false,
          },
          memoryMbytes: 512,
          timeoutSecs: 90,
          maxWaitMs: 180_000,
        })

        if (items.length === 0) {
          console.warn(`[Trustpilot] Aucun résultat pour ${url}`)
        }

        for (const item of items) {
          if (urlCount >= perUrl) break
          const signal = mapToSignal(item, url)
          if (!signal || seenIds.has(signal.externalId)) continue
          seenIds.add(signal.externalId)
          signals.push(signal)
          urlCount++
        }
      } catch (err) {
        console.error(`[Trustpilot] Erreur Apify pour ${url}:`, (err as Error).message)
      }
    }

    console.log(`[Trustpilot] ${signals.length} signaux collectés sur ${urls.length} entreprises`)
    return signals
  },
}
