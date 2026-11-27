// Collecteur Product Hunt via feed Atom public
// Feed : https://www.producthunt.com/feed (Atom, pas RSS 2.0)
// Signal : nouveaux produits lancés → le tagline/description révèle le problème résolu
// Filtre : produits des 30 derniers jours uniquement pour garantir la fraîcheur

import type { Scraper, RawSignalInput } from '../types'

const PH_FEED_URL = 'https://www.producthunt.com/feed'
const DEFAULT_MAX_RESULTS = 50
const FETCH_HEADERS = { 'User-Agent': 'SaaS-Intelligence/1.0 (RSS Reader)' }

interface FeedItem {
  id: string
  title: string
  link: string
  description: string
  pubDate: string
}

// Parse le feed Atom de ProductHunt
// Format Atom : <entry>, <published>, <link href="..." rel="alternate"/>, <content>
function parseAtomFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)

  for (const match of entryMatches) {
    const block = match[1]

    const title = decodeEntities(extractTag(block, 'title'))

    // Atom : <link rel="alternate" type="text/html" href="..."/>
    const linkMatch = block.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/i)
      ?? block.match(/<link[^>]+href="([^"]+)"[^>]*rel="alternate"/i)
      ?? block.match(/<link[^>]+href="([^"]+)"/i)
    const link = linkMatch?.[1] ?? ''

    // Contenu dans <content type="html">
    const rawContent = extractTag(block, 'content')
    const description = decodeEntities(stripHtml(rawContent))

    // Date dans <published> (déjà au format ISO — new Date() fonctionne directement)
    const pubDate = extractTag(block, 'published')

    // ID depuis <id>tag:www.producthunt.com,2005:Post/1124837</id>
    const idTag = extractTag(block, 'id')
    const postIdMatch = idTag.match(/Post\/(\d+)/)
    const id = postIdMatch ? postIdMatch[1] : (link || idTag)

    if (title && id) {
      items.push({ id, title, link, description, pubDate })
    }
  }

  return items
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
  return match ? match[1].trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

export const ProductHuntScraper: Scraper = {
  name: 'Product Hunt (Atom)',
  source: 'producthunt',
  sourceType: 'community',

  async collect(params) {
    console.log('[ProductHunt] Lancement de la collecte via Atom feed...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_MAX_RESULTS
    const daysBack = (params.daysBack as number) ?? 30
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

    let xml: string
    try {
      const res = await fetch(PH_FEED_URL, {
        headers: FETCH_HEADERS,
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Feed HTTP ${res.status}`)
      xml = await res.text()
    } catch (err) {
      console.warn('[ProductHunt] Feed inaccessible —', (err as Error).message)
      return []
    }

    const items = parseAtomFeed(xml)
    console.log(`[ProductHunt] ${items.length} entrées parsées dans le feed`)

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    for (const item of items) {
      if (signals.length >= maxResults) break

      if (item.pubDate) {
        const pubDate = new Date(item.pubDate)
        if (isNaN(pubDate.getTime()) || pubDate < cutoffDate) continue
      }

      if (seenIds.has(item.id)) continue
      seenIds.add(item.id)

      const fullContent = item.description
        ? `${item.title}\n\n${item.description}`
        : item.title

      signals.push({
        source: 'producthunt',
        sourceType: 'community',
        externalId: item.id,
        title: `[ProductHunt] ${item.title}`,
        content: fullContent.slice(0, 3000),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
        metadata: {},
      })
    }

    console.log(`[ProductHunt] ${signals.length} produits collectés (${daysBack} derniers jours)`)
    return signals
  },
}
