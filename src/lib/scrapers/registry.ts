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
import { CapterraScraper } from './sources/capterra'
import { TrustpilotScraper } from './sources/trustpilot'
import { WellfoundScraper } from './sources/wellfound'
import { LinkedInScraper } from './sources/linkedin'
import { IndeedScraper } from './sources/indeed'

// Dictionnaire indexé par nom de source
const scraperRegistry: Record<string, Scraper> = {
  hackernews: new HackerNewsScraper(),
  reddit: new RedditScraper(),
  francetravail: new FranceTravailScraper(),
  producthunt: ProductHuntScraper,
  indiehackers: new IndieHackersScraper(),
  devto: DevToScraper,
  upwork: UpworkScraper,
  malt: MaltScraper,
  g2: G2Scraper,
  capterra: CapterraScraper,
  trustpilot: TrustpilotScraper,
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
    params: {
      maxResults: 100,
      minPoints: 3,
      keywords: ['ask hn', 'I built', 'scratch our own itch', 'every week', 'nobody has built', 'wish someone would', 'frustrated with', 'replace excel', 'no good tool', 'manual process'],
    },
  },
  reddit: {
    source: 'reddit',
    sourceType: 'community',
    enabled: true,
    params: {
      maxPostsPerSub: 25,
      minScore: 5,
      subreddits: ['smallbusiness', 'accounting', 'humanresources', 'projectmanagement', 'legaladvice', 'logistics', 'realestate', 'startups', 'Entrepreneur', 'indiehackers', 'SaaS', 'microsaas'],
      keywords: ['we use spreadsheet', 'manually track', 'wish there was', 'is there a tool', 'every week I', 'we have to email', 'no software for', 'spent hours'],
    },
  },
  francetravail: {
    source: 'francetravail',
    sourceType: 'job',
    enabled: true,
    params: {
      maxResults: 150,
      keywords: ['saisie de données', 'assistant de gestion', 'coordinateur logistique', 'responsable planning', 'chargé de facturation', 'assistante commerciale', 'gestionnaire des stocks', 'chargé de reporting', 'coordinateur RH', 'office manager', 'assistant comptable', 'chargé de relation client', 'agent de recouvrement', 'responsable administratif', 'opérateur de saisie'],
    },
  },
  producthunt: {
    source: 'producthunt',
    sourceType: 'community',
    enabled: true, // RSS public — pas de Cloudflare, pas d'Apify
    params: { maxResults: 50, daysBack: 30 },
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
    params: {
      maxResults: 80,
      tags: ['saas', 'startup', 'productivity', 'devops', 'nocode', 'automation', 'tools', 'buildinpublic'],
    },
  },
  upwork: {
    source: 'upwork',
    sourceType: 'job',
    enabled: true,
    params: {
      maxResults: 60,
      keywords: ['excel to app', 'automate spreadsheet', 'internal tool', 'business automation', 'client portal', 'custom dashboard', 'paperwork automation'],
    },
  },
  malt: {
    source: 'malt',
    sourceType: 'job',
    enabled: false, // Apify actor trop coûteux (proxies résidentiels FR) — désactivé
    params: { maxResults: 10, keywords: ['supabase', 'make.com', 'n8n expert'] },
  },
  trustpilot: {
    source: 'trustpilot',
    sourceType: 'review',
    enabled: true,
    // Actor community gratuit (compute only ~$0.00006/run)
    // URLs : services B2B utilisés par PME non-tech — industries absentes de G2+Capterra
    params: {
      maxResults: 100, // ~10 reviews × 10 entreprises
      urls: [
        // Logistique / Transport
        'https://www.trustpilot.com/review/www.shipbob.com',
        'https://www.trustpilot.com/review/www.shipstation.com',
        // Comptabilité / Finance PME
        'https://www.trustpilot.com/review/www.quickbooks.com',
        'https://www.trustpilot.com/review/www.xero.com',
        // RH / Paie
        'https://www.trustpilot.com/review/www.gusto.com',
        // E-commerce / Retail
        'https://www.trustpilot.com/review/www.shopify.com',
        'https://www.trustpilot.com/review/www.bigcommerce.com',
        // Immobilier
        'https://www.trustpilot.com/review/www.buildium.com',
        // Marketing / Email
        'https://www.trustpilot.com/review/www.mailchimp.com',
        // Signature / Documents
        'https://www.trustpilot.com/review/www.docusign.com',
      ],
    },
  },
  capterra: {
    source: 'capterra',
    sourceType: 'review',
    enabled: false, // 90 signaux déjà collectés — réactiver pour le prochain run complet
    // PPE actor : $0.01/review → 5 produits × 10 reviews = $0.50/batch (budget Apify $5/mois)
    // Produits choisis pour couvrir des industries absentes de G2
    params: {
      maxResults: 50, // 10 reviews × 5 produits
      urls: [
        // Field Service / Artisans (absent de G2)
        'https://www.capterra.com/p/150053/ServiceTitan/',
        'https://www.capterra.com/p/127994/Jobber/',
        // Restaurant / Planning (absent de G2)
        'https://www.capterra.com/p/123038/7shifts-Restaurant-Scheduling/',
        // Manufacturing / Inventaire (absent de G2)
        'https://www.capterra.com/p/123794/Fishbowl/',
        // Retail / POS (absent de G2)
        'https://www.capterra.com/p/120491/Lightspeed-Retail/',
      ],
    },
  },
  g2: {
    source: 'g2',
    sourceType: 'review',
    enabled: true,
    params: {
      maxResults: 150, // 10 reviews × 15 produits (fix per-URL dans g2.ts)
      urls: [
        // CRM / Sales
        'https://www.g2.com/products/hubspot-crm/reviews',
        'https://www.g2.com/products/pipedrive/reviews',
        // Customer Support
        'https://www.g2.com/products/freshdesk/reviews',
        'https://www.g2.com/products/help-scout/reviews',
        // HR / Payroll
        'https://www.g2.com/products/bamboohr/reviews',
        'https://www.g2.com/products/gusto/reviews',
        // Accounting
        'https://www.g2.com/products/quickbooks-online/reviews',
        'https://www.g2.com/products/freshbooks/reviews',
        // Project Management
        'https://www.g2.com/products/asana/reviews',
        'https://www.g2.com/products/clickup/reviews',
        // Legal
        'https://www.g2.com/products/clio/reviews',
        // Real Estate
        'https://www.g2.com/products/appfolio/reviews',
        // Healthcare
        'https://www.g2.com/products/simplepractice/reviews',
        // Construction
        'https://www.g2.com/products/procore/reviews',
        // Marketing Automation
        'https://www.g2.com/products/activecampaign/reviews',
      ],
    },
  },
  wellfound: {
    source: 'wellfound',
    sourceType: 'job',
    enabled: true,
    params: { maxResults: 30, keywords: ['SaaS', 'B2B', 'Engineer', 'Product', 'Automation'], locations: ['Remote', 'New York', 'San Francisco'] },
  },
  linkedin: {
    source: 'linkedin',
    sourceType: 'job',
    enabled: true,
    params: {
      maxResults: 40,
      keywords: ['revenue operations', 'process automation', 'data coordinator', 'operations analyst'],
      locations: ['France', 'Canada'],
    },
  },
  indeed: {
    source: 'indeed',
    sourceType: 'job',
    enabled: true,
    params: {
      maxResults: 15, // par search (10 searches × 15 = 150 max)
      searches: [
        // Rôles manuels EN — USA/UK/CA
        { keyword: 'data entry specialist',      location: 'United States',  country: 'us' },
        { keyword: 'operations coordinator',     location: 'United Kingdom', country: 'gb' },
        { keyword: 'reporting analyst',          location: 'Canada',         country: 'ca' },
        { keyword: 'billing specialist',         location: 'United States',  country: 'us' },
        { keyword: 'administrative coordinator', location: 'United Kingdom', country: 'gb' },
        // Rôles manuels FR — France/Canada
        { keyword: 'saisie de données',          location: 'France',         country: 'fr' },
        { keyword: 'coordinateur logistique',    location: 'France',         country: 'fr' },
        { keyword: 'chargé de reporting',        location: 'Canada',         country: 'ca' },
        { keyword: 'assistant de gestion',       location: 'France',         country: 'fr' },
        { keyword: 'office manager',             location: 'France',         country: 'fr' },
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
