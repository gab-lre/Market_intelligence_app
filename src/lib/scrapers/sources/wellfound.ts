import { runApifyActor, type ApifyItem } from '../apify-client'
import type { Scraper, RawSignalInput } from '../types'

const DEFAULT_ACTOR_ID = 'clearpath/wellfound-api-ppe'

const DEFAULT_PARAMS = {
  maxResults: 10,
  keywords: ['software engineer'],
  locations: ['new york'],
}

// Fonction pour parser dynamiquement l'URL wellfound
// Ex: "software engineer", "new york" -> "https://wellfound.com/role/l/software-engineer/new-york"
function buildWellfoundUrl(role: string, location: string): string {
  const safeRole = role.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const safeLoc = location.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `https://wellfound.com/role/l/${safeRole}/${safeLoc}`
}

function mapToSignal(job: ApifyItem, keyword: string): RawSignalInput | null {
  // le format de l'acteur wellfound PPE renvoie typiquement data: { id, title, company_name... } ou flat.
  // On fallback souple sur de multiples clés probables
  const jobId = job.id ?? job.jobId ?? job.externalId
  const jobUrl = job.url ?? job.jobUrl ?? ''
  const title = job.title ?? job.positionName ?? job.job_title ?? ''
  const company = job.companyName ?? job.company_name ?? job.company ?? ''
  const location = job.location ?? job.jobLocation ?? ''
  const description = job.description ?? job.job_description ?? job.description_snippet ?? 'Description non fournie.'
  const publishedAt = job.datePosted ?? job.postedAt ?? job.time_posted ?? job.live_start_at_readable

  if (!title) return null

  const externalId = jobId ? String(jobId) : String(jobUrl)
  if (!externalId || externalId === 'undefined') return null

  const content = `Entreprise : ${company}\nLocalisation : ${location}\n\n${description}`.slice(0, 3000)

  return {
    source: 'wellfound',
    sourceType: 'job',
    externalId,
    title: `[Wellfound] ${title} — ${company}`,
    content,
    url: String(jobUrl) || `https://wellfound.com/jobs/${externalId}`,
    publishedAt: publishedAt ? String(publishedAt) : new Date().toISOString(),
    metadata: {
      company,
      location,
      search_keyword: keyword,
    },
  }
}

export const WellfoundScraper: Scraper = {
  name: 'Wellfound Jobs (Apify)',
  source: 'wellfound',
  sourceType: 'job',
  async collect(params) {
    console.log('[Wellfound] Lancement de la collecte...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const actorId = (params.actorId as string) ?? DEFAULT_ACTOR_ID
    
    // Soit on donne des urls directes, soit on les construit depuis keyword/location
    const providedUrls = params.urls as string[] | undefined
    const keywords = (params.keywords as string[]) ?? DEFAULT_PARAMS.keywords
    const locations = (params.locations as string[]) ?? DEFAULT_PARAMS.locations

    let urlsToScrape: { url: string; keyword: string }[] = []

    if (providedUrls && providedUrls.length > 0) {
      urlsToScrape = providedUrls.map(u => ({ url: u, keyword: 'generic' }))
    } else {
      for (const k of Math.min(keywords.length, 3) ? keywords : keywords.slice(0, 3)) {
        for (const l of Math.min(locations.length, 2) ? locations : locations.slice(0, 2)) {
          urlsToScrape.push({ url: buildWellfoundUrl(k, l), keyword: k })
        }
      }
    }

    const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()

    try {
      // Acteur: array of strings pour `urls`
      const apifyUrls = urlsToScrape.map(u => u.url)

      const items = await runApifyActor({
        actorId,
        input: {
          urls: apifyUrls,
          pageLimit: 1, // On limite à mort pour maxResults
          sortBy: "LAST_POSTED"
        },
        memoryMbytes: 512,
        timeoutSecs: 60,
        maxWaitMs: 180_000,
      })

      for (const item of items) {
        if (signals.length >= maxResults) break

        const signal = mapToSignal(item, urlsToScrape[0].keyword)
        if (!signal) continue
        if (seenIds.has(signal.externalId)) continue

        seenIds.add(signal.externalId)
        signals.push(signal)
      }
    } catch (err) {
      console.error('[Wellfound] Erreur Apify —', (err as Error).message)
      return signals
    }

    console.log(`[Wellfound] ${signals.length} signaux collectés`)
    return signals
  },
}
