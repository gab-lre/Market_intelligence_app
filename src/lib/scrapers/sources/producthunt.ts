// Collecteur Product Hunt
// Source : Endpoint GraphQL non-officiel de Product Hunt (sans authentification)
// Si Product Hunt bloque les requêtes, le collecteur se désactive proprement.
// On reviendra avec Apify en Phase 6 si nécessaire.

import type { Scraper, RawSignalInput } from '../types'

const PH_GRAPHQL_URL = 'https://www.producthunt.com/frontend/graphql'

const DEFAULT_MAX_RESULTS = 50
const DEFAULT_MIN_UPVOTES = 10
const DEFAULT_DAYS_BACK = 30

// Catégories SaaS pertinentes (filtre sur les topics)
const RELEVANT_TOPICS = [
  'productivity',
  'saas',
  'developer tools',
  'marketing',
  'sales',
  'analytics',
  'project management',
  'crm',
  'automation',
  'finance',
  'hr',
  'customer support',
  'design tools',
  'no-code',
  'artificial intelligence',
]

const GRAPHQL_QUERY = `
  query GetRecentPosts($first: Int!, $after: String) {
    posts(first: $first, after: $after, order: RANKING) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          votesCount
          commentsCount
          createdAt
          topics {
            edges {
              node {
                name
                slug
              }
            }
          }
          user {
            name
          }
        }
        cursor
      }
    }
  }
`

interface PHTopic {
  node: { name: string; slug: string }
}

interface PHPost {
  id: string
  name: string
  tagline: string
  description: string | null
  url: string
  votesCount: number
  commentsCount: number
  createdAt: string
  topics: { edges: PHTopic[] }
  user: { name: string } | null
}

interface PHEdge {
  node: PHPost
  cursor: string
}

interface PHGraphQLResponse {
  data?: {
    posts?: {
      edges: PHEdge[]
    }
  }
  errors?: Array<{ message: string }>
}

async function fetchProductHuntPosts(first: number): Promise<PHPost[]> {
  const res = await fetch(PH_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; SaaS-Intelligence/1.0)',
      Accept: 'application/json',
      Origin: 'https://www.producthunt.com',
      Referer: 'https://www.producthunt.com/',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { first },
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Product Hunt GraphQL HTTP ${res.status}`)
  }

  const data: PHGraphQLResponse = await res.json()

  if (data.errors?.length) {
    throw new Error(`Product Hunt GraphQL error: ${data.errors[0].message}`)
  }

  return data.data?.posts?.edges.map((e) => e.node) ?? []
}

function isRelevantPost(post: PHPost): boolean {
  const postTopics = post.topics.edges.map((e) => e.node.slug.toLowerCase())
  return postTopics.some((slug) =>
    RELEVANT_TOPICS.some((relevant) => slug.includes(relevant.replace(/ /g, '-')))
  )
}

export class ProductHuntScraper implements Scraper {
  name = 'Product Hunt'
  source = 'producthunt' as const
  sourceType = 'community' as const

  async collect(params: Record<string, unknown>): Promise<RawSignalInput[]> {
    const maxResults = (params.maxResults as number) ?? DEFAULT_MAX_RESULTS
    const minUpvotes = (params.minUpvotes as number) ?? DEFAULT_MIN_UPVOTES
    const daysBack = (params.daysBack as number) ?? DEFAULT_DAYS_BACK

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    let posts: PHPost[]
    try {
      posts = await fetchProductHuntPosts(Math.min(maxResults * 2, 100))
    } catch (err) {
      console.warn('[ProductHunt] Collecteur désactivé —', (err as Error).message)
      return []
    }

    const signals: RawSignalInput[] = []

    for (const post of posts) {
      // Filtrer par date
      if (new Date(post.createdAt) < cutoffDate) continue
      // Filtrer par upvotes
      if (post.votesCount < minUpvotes) continue
      // Filtrer par catégorie pertinente
      if (!isRelevantPost(post)) continue

      const topics = post.topics.edges.map((e) => e.node.name)
      const content = post.description?.trim() || post.tagline

      signals.push({
        source: 'producthunt',
        sourceType: 'community',
        externalId: post.id,
        title: `${post.name} — ${post.tagline}`,
        content,
        url: post.url,
        author: post.user?.name,
        publishedAt: post.createdAt,
        metadata: {
          upvotes: post.votesCount,
          num_comments: post.commentsCount,
          topics,
          maker_name: post.user?.name ?? null,
        },
      })

      if (signals.length >= maxResults) break
    }

    return signals
  }
}
