import type { Scraper, RawSignalInput } from '../types'

const DEFAULT_PARAMS = {
  maxResults: 40,
  tags: ['saas', 'startup', 'webdev', 'indiehackers', 'productivity', 'devops', 'tools', 'automation', 'api', 'nocode'],
}

interface DevToArticle {
  id: number
  title: string
  description: string
  url: string
  user: {
    name: string
    username: string
  }
  published_at: string
  tag_list: string[]
  positive_reactions_count: number
}

function mapToSignal(article: DevToArticle): RawSignalInput {
  return {
    source: 'devto',
    sourceType: 'community',
    externalId: String(article.id),
    title: `[Dev.to] ${article.title}`,
    content: article.description,
    url: article.url,
    author: article.user.name || article.user.username,
    publishedAt: new Date(article.published_at).toISOString(),
    metadata: {
      tags: article.tag_list,
      reactions: article.positive_reactions_count,
    },
  }
}

export const DevToScraper: Scraper = {
  name: 'Dev.to (API Publique)',
  source: 'devto',
  sourceType: 'community',
  async collect(params) {
    console.log('[Dev.to] Lancement de la collecte...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const tags = (params.tags as string[]) ?? DEFAULT_PARAMS.tags

    // Quota par tag pour garantir que tous les tags s'exécutent
    const perTag = Math.ceil(maxResults / tags.length)

    // Filtre fraîcheur : articles des 30 derniers jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    try {
      for (const tag of tags) {
        let tagCount = 0

        const res = await fetch(
          `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=50&published_after=${thirtyDaysAgo}`
        )
        if (!res.ok) {
          console.error(`[Dev.to] Erreur API pour le tag "${tag}":`, res.statusText)
          continue
        }

        const articles = await res.json() as DevToArticle[]

        for (const article of articles) {
          if (tagCount >= perTag) break
          if (seenIds.has(String(article.id))) continue

          seenIds.add(String(article.id))
          signals.push(mapToSignal(article))
          tagCount++
        }
      }
    } catch (err) {
      console.error('[Dev.to] Erreur fetch —', (err as Error).message)
    }

    console.log(`[Dev.to] ${signals.length} signaux collectés sur ${tags.length} tags (30 derniers jours)`)
    return signals
  },
}
