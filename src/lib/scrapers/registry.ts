// Registre des collecteurs disponibles
// Pour ajouter une source : importer le collecteur et l'enregistrer ici.

import type { Scraper, ScraperConfig } from './types'
import { HackerNewsScraper } from './sources/hackernews'
import { RedditScraper } from './sources/reddit'
import { FranceTravailScraper } from './sources/francetravail'
import { ProductHuntScraper } from './sources/producthunt'
import { IndieHackersScraper } from './sources/indiehackers'
import { DevToScraper } from './sources/devto'
import { UpworkScraper } from './sources/upwork'
import { MaltScraper } from './sources/malt'
import { G2Scraper } from './sources/g2'
import { WellfoundScraper } from './sources/wellfound'
import { LinkedInScraper } from './sources/linkedin'
import { IndeedScraper } from './sources/indeed'

// Dictionnaire indexé par nom de source
const scraperRegistry: Record<string, Scraper> = {
  hackernews: new HackerNewsScraper(),
  reddit: new RedditScraper(),
  francetravail: new FranceTravailScraper(),
  producthunt: new ProductHuntScraper(),
  indiehackers: new IndieHackersScraper(),
  devto: DevToScraper,
  upwork: UpworkScraper,
  malt: MaltScraper,
  g2: G2Scraper,
  wellfound: WellfoundScraper,
  linkedin: new LinkedInScraper(),
  indeed: new IndeedScraper(),
}

// Configurations par défaut (paramètres utilisés si aucun override fourni)
const defaultConfigs: Record<string, ScraperConfig> = {
  hackernews: {
    source: 'hackernews',
    sourceType: 'community',
    enabled: true,
    params: { maxResults: 50, minPoints: 5 },
  },
  reddit: {
    source: 'reddit',
    sourceType: 'community',
    enabled: true,
    params: { maxPostsPerSub: 25, minScore: 3 },
  },
  francetravail: {
    source: 'francetravail',
    sourceType: 'job',
    enabled: true,
    params: { maxResults: 50 },
  },
  producthunt: {
    source: 'producthunt',
    sourceType: 'community',
    enabled: true,
    params: { maxResults: 50, minUpvotes: 10, daysBack: 30 },
  },
  indiehackers: {
    source: 'indiehackers',
    sourceType: 'community',
    enabled: false,
    params: { maxResults: 30, daysBack: 30 },
  },
  devto: {
    source: 'devto',
    sourceType: 'community',
    enabled: true,
    params: { maxResults: 15, tags: ['saas', 'startup'] },
  },
  upwork: {
    source: 'upwork',
    sourceType: 'job',
    enabled: true,
    params: { maxResults: 10, keywords: ['saas mvp', 'automation tool', 'ai internal tool'] },
  },
  malt: {
    source: 'malt',
    sourceType: 'job',
    enabled: true,
    params: { maxResults: 10, keywords: ['supabase', 'make.com', 'n8n expert'] },
  },
  g2: {
    source: 'g2',
    sourceType: 'review',
    enabled: true,
    params: { maxResults: 10, urls: ['https://www.g2.com/products/postman/reviews'] },
  },
  wellfound: {
    source: 'wellfound',
    sourceType: 'job',
    enabled: true,
    params: { maxResults: 10, keywords: ['SaaS', 'B2B', 'Engineer'], locations: ['Remote', 'New York'] },
  },
  linkedin: {
    source: 'linkedin',
    sourceType: 'job',
    enabled: true,
    params: {
      maxResults: 10,
      keywords: ['CRM manager', 'reporting analyst', 'operations coordinator'],
      locations: ['France'],
    },
  },
  indeed: {
    source: 'indeed',
    sourceType: 'job',
    enabled: true,
    params: {
      maxResults: 10,
      searches: [
        { keyword: 'process automation', location: 'France', country: 'fr' },
        { keyword: 'marketing manager', location: 'Canada', country: 'ca' },
      ],
    },
  },
}

export function getScraper(sourceName: string): Scraper | null {
  return scraperRegistry[sourceName] ?? null
}

export function getAvailableScrapers(): Array<{
  source: string
  name: string
  sourceType: string
  enabled: boolean
  defaultParams: Record<string, unknown>
}> {
  return Object.entries(scraperRegistry).map(([source, scraper]) => ({
    source,
    name: scraper.name,
    sourceType: scraper.sourceType,
    enabled: defaultConfigs[source]?.enabled ?? true,
    defaultParams: defaultConfigs[source]?.params ?? {},
  }))
}

export function getDefaultConfig(sourceName: string): ScraperConfig | null {
  return defaultConfigs[sourceName] ?? null
}

export function registerScraper(scraper: Scraper, config: ScraperConfig): void {
  scraperRegistry[scraper.source] = scraper
  defaultConfigs[scraper.source] = config
}
