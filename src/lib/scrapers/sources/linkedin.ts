// Collecteur LinkedIn Jobs via Apify
// Acteur : bebity/linkedin-jobs-scraper (populaire sur Apify Store)
// Économie crédits : maxResults faible, memory 256 MB, timeout 60s

import { runApifyActor, type ApifyItem } from '../apify-client'
import type { Scraper, RawSignalInput } from '../types'

// Acteur Apify utilisé — modifiable dans les params si besoin
const DEFAULT_ACTOR_ID = 'worldunboxer/rapid-linkedin-scraper'

// Mots-clés ciblant des tâches automatisables / besoins SaaS
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

// Localisations FR + Québec
const DEFAULT_LOCATIONS = ['France', 'Quebec, Canada']

const DEFAULT_MAX_RESULTS = 10 // Faible par défaut pour économiser les crédits

interface LinkedInJob {
  job_id?: string
  job_url?: string
  job_title?: string
  company_name?: string
  location?: string
  time_posted?: string
  job_description?: string
  seniority_level?: string
  employment_type?: string
  job_function?: string
  industries?: string
  num_applicants?: string
}

function parseRelativeDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined
  const s = dateStr.toLowerCase()
  const match = s.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/)
  if (!match) return new Date().toISOString() // fallback "just now"
  
  const amount = parseInt(match[1], 10)
  const unit = match[2]
  const now = new Date()
  
  if (unit === 'minute') now.setMinutes(now.getMinutes() - amount)
  else if (unit === 'hour') now.setHours(now.getHours() - amount)
  else if (unit === 'day') now.setDate(now.getDate() - amount)
  else if (unit === 'week') now.setDate(now.getDate() - amount * 7)
  else if (unit === 'month') now.setMonth(now.getMonth() - amount)
  else if (unit === 'year') now.setFullYear(now.getFullYear() - amount)
    
  return now.toISOString()
}

function mapToSignal(job: ApifyItem, keyword: string): RawSignalInput | null {
  const j = job as LinkedInJob

  const jobId = j.job_id ? String(j.job_id) : null
  const jobUrl = j.job_url ?? ''
  const title = j.job_title ?? ''
  const company = j.company_name ?? ''
  const location = j.location ?? ''
  const description = j.job_description ?? ''
  const publishedAt = parseRelativeDate(j.time_posted)

  if (!title || !description) return null

  // Identifiant de déduplication basé sur l'URL ou l'ID
  const externalId = jobId ?? jobUrl

  const content = `Entreprise : ${company}\nLocalisation : ${location}\n\n${description}`.slice(0, 3000)

  return {
    source: 'linkedin',
    sourceType: 'job',
    externalId,
    title: `[LinkedIn] ${title} — ${company}`,
    content,
    url: jobUrl,
    publishedAt,
    metadata: {
      company,
      location,
      seniority: j.seniority_level ?? null,
      employment_type: j.employment_type ?? null,
      industry: j.industries ?? null,
      applicant_count: j.num_applicants ?? null,
      search_keyword: keyword,
    },
  }
}

export class LinkedInScraper implements Scraper {
  name = 'LinkedIn Jobs (Apify)'
  source = 'linkedin' as const
  sourceType = 'job' as const

  async collect(params: Record<string, unknown>): Promise<RawSignalInput[]> {
    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      console.warn('[LinkedIn] APIFY_API_TOKEN absent — collecteur désactivé')
      return []
    }

    const maxResults = (params.maxResults as number) ?? DEFAULT_MAX_RESULTS
    const actorId = (params.actorId as string) ?? DEFAULT_ACTOR_ID
    const keywords = (params.keywords as string[]) ?? DEFAULT_KEYWORDS
    const locations = (params.locations as string[]) ?? DEFAULT_LOCATIONS

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    const maxKeywords = Math.min(keywords.length, 3)
    const maxLocations = Math.min(locations.length, 2)

    try {
      // Pour cet acteur, on doit appeler par combinaison, ou passer plusieurs
      // Le proxy supportant mal les arrays de mots clés, on le fait itératif mais avec un faible `maxResults`
      for (let k = 0; k < maxKeywords; k++) {
        for (let l = 0; l < maxLocations; l++) {
          if (signals.length >= maxResults) break
          
          const keyword = keywords[k]
          const location = locations[l]

          const items = await runApifyActor({
            actorId,
            input: {
              job_title: keyword,
              location: location,
              jobs_entries: maxResults, // limit total
            },
            memoryMbytes: 512,
            timeoutSecs: 60,
            maxWaitMs: 90_000,
          })

          for (const item of items) {
            if (signals.length >= maxResults) break

            const signal = mapToSignal(item, keyword)
            if (!signal) continue
            if (seenIds.has(signal.externalId)) continue

            seenIds.add(signal.externalId)
            signals.push(signal)
          }
        }
      }
    } catch (err) {
      console.error('[LinkedIn] Erreur Apify —', (err as Error).message)
      return signals // on return ce qui a marché
    }

    console.log(`[LinkedIn] ${signals.length} signaux collectés`)
    return signals
  }
}
