// Collecteur Indeed via Apify
// Acteur : misceres/indeed-scraper (populaire sur Apify Store)
// Économie crédits : maxResults faible, memory 256 MB, timeout 60s

import { runApifyActor, type ApifyItem } from '../apify-client'
import type { Scraper, RawSignalInput } from '../types'

const DEFAULT_ACTOR_ID = 'valig/indeed-jobs-scraper'

const DEFAULT_KEYWORDS = [
  'CRM manager',
  'data entry',
  'reporting analyst',
  'process automation',
  'operations coordinator',
  'marketing automation',
  'customer success',
  'sales ops',
]

// Indeed supporte des codes pays ou des localisations textuelles
const DEFAULT_SEARCHES: Array<{ keyword: string; location: string; country: string }> = [
  { keyword: 'process automation', location: 'France', country: 'fr' },
  { keyword: 'marketing automation', location: 'France', country: 'fr' },
  { keyword: 'operations coordinator', location: 'Canada', country: 'ca' },
]

const DEFAULT_MAX_RESULTS = 10

interface IndeedJob {
  key?: string
  url?: string
  title?: string
  jobUrl?: string
  datePublished?: string
  dateOnIndeed?: string
  location?: { city?: string; countryName?: string }
  employer?: { name?: string }
  description?: { text?: string }
  baseSalary?: { min?: string | null; max?: string | null; currencyCode?: string | null }
  jobTypes?: Record<string, string>
}

function mapToSignal(job: ApifyItem, searchKeyword: string): RawSignalInput | null {
  const j = job as IndeedJob

  const jobId = j.key
  const jobUrl = j.url ?? j.jobUrl ?? ''
  const title = j.title ?? ''
  const company = j.employer?.name ?? ''
  const location = j.location?.city ? `${j.location.city}, ${j.location.countryName}` : ''
  const description = j.description?.text ?? ''
  
  // Formatage simple du salaire
  let salary = null;
  if (j.baseSalary && (j.baseSalary.min || j.baseSalary.max)) {
     salary = `${j.baseSalary.min || ''} - ${j.baseSalary.max || ''} ${j.baseSalary.currencyCode || ''}`.trim();
  }
  
  const publishedAt = j.datePublished ?? j.dateOnIndeed

  if (!title || !description) return null

  const externalId = jobId ? String(jobId) : jobUrl
  if (!externalId) return null

  const content = `Entreprise : ${company}\nLocalisation : ${location}${salary ? `\nSalaire : ${salary}` : ''}\n\n${description}`.slice(0, 3000)

  return {
    source: 'indeed',
    sourceType: 'job',
    externalId,
    title: `[Indeed] ${title} — ${company}`,
    content,
    url: jobUrl,
    publishedAt,
    metadata: {
      company,
      location,
      salary,
      job_types: j.jobTypes ? Object.values(j.jobTypes).join(', ') : null,
      search_keyword: searchKeyword,
    },
  }
}

export class IndeedScraper implements Scraper {
  name = 'Indeed (Apify)'
  source = 'indeed' as const
  sourceType = 'job' as const

  async collect(params: Record<string, unknown>): Promise<RawSignalInput[]> {
    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      console.warn('[Indeed] APIFY_API_TOKEN absent — collecteur désactivé')
      return []
    }

    const maxResults = (params.maxResults as number) ?? DEFAULT_MAX_RESULTS
    const actorId = (params.actorId as string) ?? DEFAULT_ACTOR_ID

    // Construire les recherches — on limite à 3 combinaisons pour économiser les crédits
    const rawSearches = (params.searches as typeof DEFAULT_SEARCHES) ?? DEFAULT_SEARCHES
    const searches = rawSearches.slice(0, 3)

    // Si des keywords sont passés en override, on les intègre
    const keywords = (params.keywords as string[]) ?? DEFAULT_KEYWORDS

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    try {
      // valig/indeed-jobs-scraper prend en charge un pays, un keyword, une limite.
      // On boucle sur nos combos pour appeler l'acteur.
      for (const search of searches) {
         if (signals.length >= maxResults) break

         const items = await runApifyActor({
           actorId,
           input: {
             country: search.country.toLowerCase(),
             title: search.keyword,
             location: search.location,
             limit: maxResults,
           },
           memoryMbytes: 512,
           timeoutSecs: 60,
           maxWaitMs: 90_000,
         })

         for (const item of items) {
           if (signals.length >= maxResults) break

           const signal = mapToSignal(item, search.keyword)
           if (!signal) continue
           if (seenIds.has(signal.externalId)) continue

           seenIds.add(signal.externalId)
           signals.push(signal)
         }
      }
    } catch (err) {
      console.error('[Indeed] Erreur Apify —', (err as Error).message)
      return signals
    }

    console.log(`[Indeed] ${signals.length} signaux collectés`)
    return signals
  }
}
