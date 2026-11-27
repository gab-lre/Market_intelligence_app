// Collecteur Hacker News
// Source : API Algolia HN (gratuite, sans clé) + API Firebase HN (détail des items)
// Doc Algolia : https://hn.algolia.com/api
// Doc Firebase : https://hacker-news.firebaseio.com/v0/

import type { Scraper, RawSignalInput } from '../types'

const ALGOLIA_BASE = 'https://hn.algolia.com/api/v1'
const FIREBASE_BASE = 'https://hacker-news.firebaseio.com/v0'

const DEFAULT_KEYWORDS = [
  'ask hn',
  'I built',
  'scratch our own itch',
  'every week',
  'nobody has built',
  'wish someone would',
  'frustrated with',
  'replace excel',
  'no good tool',
  'manual process',
]

const DEFAULT_MAX_RESULTS = 100
const DEFAULT_MIN_POINTS = 3
const COMMENTS_THRESHOLD = 10  // Récupère les commentaires si > X comments
const MAX_TOP_COMMENTS = 5     // Nombre max de commentaires de 1er niveau à inclure

interface AlgoliaHit {
  objectID: string
  title: string
  story_text: string | null
  url: string | null
  author: string
  points: number | null
  num_comments: number | null
  created_at: string
  _tags: string[]
}

interface AlgoliaResponse {
  hits: AlgoliaHit[]
}

interface HNItem {
  id: number
  type: string
  title?: string
  text?: string
  url?: string
  by?: string
  score?: number
  descendants?: number
  time?: number
  kids?: number[]
}

const FETCH_HEADERS = {
  'User-Agent': 'SaaS-Intelligence/1.0',
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal, headers: FETCH_HEADERS, cache: 'no-store' })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function searchAlgolia(
  query: string,
  tags: string,
  hitsPerPage: number
): Promise<AlgoliaHit[]> {
  // Filtre : uniquement les 30 derniers jours
  const thirtyDaysAgoTs = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
  const url = `${ALGOLIA_BASE}/search?query=${encodeURIComponent(query)}&tags=${tags}&hitsPerPage=${hitsPerPage}&numericFilters=created_at_i>${thirtyDaysAgoTs}`
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error(`Algolia ${res.status} pour "${query}"`)
  const data: AlgoliaResponse = await res.json()
  return data.hits ?? []
}

async function fetchTopComments(itemId: string, maxComments: number): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_BASE}/item/${itemId}.json`)
    if (!res.ok) return []
    const item: HNItem = await res.json()
    if (!item.kids || item.kids.length === 0) return []

    const commentIds = item.kids.slice(0, maxComments)
    const commentTexts: string[] = []

    for (const kid of commentIds) {
      try {
        const cRes = await fetchWithTimeout(`${FIREBASE_BASE}/item/${kid}.json`)
        if (!cRes.ok) continue
        const comment: HNItem = await cRes.json()
        if (comment.text) {
          // Nettoyer le HTML basique des commentaires HN
          const clean = comment.text
            .replace(/<p>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&')
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .trim()
          if (clean) commentTexts.push(`[${comment.by ?? 'anon'}] ${clean}`)
        }
      } catch {
        // Skip le commentaire en erreur
      }
    }

    return commentTexts
  } catch {
    return []
  }
}

function buildContent(hit: AlgoliaHit, comments: string[]): string {
  const parts: string[] = []

  if (hit.story_text) {
    parts.push(hit.story_text.replace(/<[^>]+>/g, '').trim())
  }

  if (comments.length > 0) {
    parts.push(`--- Commentaires (${comments.length}) ---`)
    parts.push(...comments)
  }

  return parts.join('\n\n') || hit.title
}

export class HackerNewsScraper implements Scraper {
  name = 'Hacker News'
  source = 'hackernews' as const
  sourceType = 'community' as const

  async collect(params: Record<string, unknown>): Promise<RawSignalInput[]> {
    const maxResults = (params.maxResults as number) ?? DEFAULT_MAX_RESULTS
    const minPoints = (params.minPoints as number) ?? DEFAULT_MIN_POINTS
    const keywords = (params.keywords as string[]) ?? DEFAULT_KEYWORDS
    const hitsPerPage = Math.min(25, Math.ceil(maxResults / keywords.length))

    // Collecte tous les hits, dédupliqués par objectID
    const seen = new Set<string>()
    const allHits: AlgoliaHit[] = []

    for (const keyword of keywords) {
      // Recherche dans les stories
      try {
        const hits = await searchAlgolia(keyword, 'story', hitsPerPage)
        for (const hit of hits) {
          if (!seen.has(hit.objectID)) {
            seen.add(hit.objectID)
            allHits.push(hit)
          }
        }
      } catch {
        // Continue avec le keyword suivant
      }

      // Recherche spécifique dans les Ask HN
      if (keyword.toLowerCase().includes('ask')) {
        try {
          const askHits = await searchAlgolia(keyword, 'ask_hn', hitsPerPage)
          for (const hit of askHits) {
            if (!seen.has(hit.objectID)) {
              seen.add(hit.objectID)
              allHits.push(hit)
            }
          }
        } catch {
          // Continue
        }
      }
    }

    // Filtrer par score minimum et limiter
    const filtered = allHits
      .filter((h) => (h.points ?? 0) >= minPoints)
      .slice(0, maxResults)

    const signals: RawSignalInput[] = []

    for (const hit of filtered) {
      // Récupérer les commentaires si le post en a beaucoup
      let comments: string[] = []
      if ((hit.num_comments ?? 0) > COMMENTS_THRESHOLD) {
        comments = await fetchTopComments(hit.objectID, MAX_TOP_COMMENTS)
      }

      const content = buildContent(hit, comments)

      // Déterminer le type HN
      const hnType = hit._tags.includes('ask_hn')
        ? 'ask_hn'
        : hit._tags.includes('show_hn')
          ? 'show_hn'
          : 'story'

      signals.push({
        source: 'hackernews',
        sourceType: 'community',
        externalId: hit.objectID,
        title: hit.title ?? '(sans titre)',
        content,
        url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        publishedAt: hit.created_at,
        metadata: {
          points: hit.points ?? 0,
          num_comments: hit.num_comments ?? 0,
          hn_type: hnType,
          tags: hit._tags,
        },
      })
    }

    return signals
  }
}
