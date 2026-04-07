// Collecteur Reddit
// Source : API JSON publique Reddit (sans authentification)
// Endpoint : https://www.reddit.com/r/{subreddit}/search.json?q=...&sort=relevance&t=month&limit=25

import type { Scraper, RawSignalInput } from '../types'

const REDDIT_BASE = 'https://www.reddit.com'

const DEFAULT_SUBREDDITS = [
  'SaaS',
  'startups',
  'Entrepreneur',
  'smallbusiness',
  'indiehackers',
  'microsaas',
  'webdev',
  'sideproject',
]

const DEFAULT_KEYWORDS = [
  'need a tool',
  'looking for',
  'wish there was',
  'built a',
  'pain point',
  'manual process',
  'anyone know',
  'alternative to',
]

const DEFAULT_MAX_POSTS_PER_SUB = 25
const DEFAULT_MIN_SCORE = 3
const REQUEST_DELAY_MS = 2000

const FETCH_HEADERS = {
  'User-Agent': 'SaaS-Opportunity-Finder/1.0',
}

interface RedditPost {
  data: {
    id: string
    title: string
    selftext: string
    score: number
    num_comments: number
    permalink: string
    author: string
    created_utc: number
    link_flair_text: string | null
    upvote_ratio: number
    subreddit: string
    url: string
  }
}

interface RedditListingResponse {
  data: {
    children: RedditPost[]
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: FETCH_HEADERS,
      cache: 'no-store',
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function searchSubreddit(
  subreddit: string,
  keyword: string,
  limit: number
): Promise<RedditPost[]> {
  const url = `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&sort=relevance&t=month&limit=${limit}&restrict_sr=true`
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error(`Reddit API ${res.status} pour r/${subreddit} "${keyword}"`)
  const data: RedditListingResponse = await res.json()
  return data?.data?.children ?? []
}

export class RedditScraper implements Scraper {
  name = 'Reddit'
  source = 'reddit' as const
  sourceType = 'community' as const

  async collect(params: Record<string, unknown>): Promise<RawSignalInput[]> {
    const subreddits = (params.subreddits as string[]) ?? DEFAULT_SUBREDDITS
    const maxPostsPerSub = (params.maxPostsPerSub as number) ?? DEFAULT_MAX_POSTS_PER_SUB
    const minScore = (params.minScore as number) ?? DEFAULT_MIN_SCORE
    const keywords = (params.keywords as string[]) ?? DEFAULT_KEYWORDS

    const seen = new Set<string>()
    const signals: RawSignalInput[] = []

    for (const subreddit of subreddits) {
      for (const keyword of keywords) {
        try {
          const posts = await searchSubreddit(subreddit, keyword, maxPostsPerSub)

          for (const post of posts) {
            const d = post.data

            // Dédupliquer en mémoire
            if (seen.has(d.id)) continue
            seen.add(d.id)

            // Filtrer par score minimum
            if (d.score < minScore) continue

            const content = d.selftext?.trim() || d.title

            signals.push({
              source: 'reddit',
              sourceType: 'community',
              externalId: d.id,
              title: d.title,
              content,
              url: `${REDDIT_BASE}${d.permalink}`,
              author: d.author,
              publishedAt: new Date(d.created_utc * 1000).toISOString(),
              metadata: {
                subreddit: d.subreddit,
                score: d.score,
                num_comments: d.num_comments,
                flair: d.link_flair_text ?? null,
                upvote_ratio: d.upvote_ratio,
              },
            })
          }
        } catch {
          // Continue avec le prochain keyword/subreddit
        }

        // Délai obligatoire entre chaque requête
        await sleep(REQUEST_DELAY_MS)
      }
    }

    return signals
  }
}
