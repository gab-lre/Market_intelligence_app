import type { Scraper, RawSignalInput } from '../types'
import { runApifyActor } from '../apify-client'

const UPWORK_ACTOR_ID = 'flash_mage/upwork'

const DEFAULT_PARAMS = {
  maxResults: 15,
  keywords: ['saas mvp', 'workflow automation', 'dashboard reporting', 'crm integration', 'api development'],
}

// Interface de retour de l'acteur flash_mage/upwork
interface UpworkJobItem {
  id: number
  title: string
  link: string
  data: {
    opening: {
      description: string
      postedOn: string
      budget?: {
        amount: number
        currencyCode: string
      }
      contractorTier?: string
      engagementDuration?: {
        label: string
      }
    }
    buyer?: {
      location?: {
        country?: string
      }
      stats?: {
        score?: number
        totalAssignments?: number
      }
    }
  }
}

function mapToSignal(job: UpworkJobItem): RawSignalInput {
  const op = job.data?.opening
  const buyer = job.data?.buyer

  return {
    source: 'upwork',
    sourceType: 'job', // Fallback de freelance vers job
    externalId: String(job.id),
    title: `[Upwork] ${job.title}`,
    content: op?.description || '',
    url: job.link,
    // On n'a pas toujours le nom de l'entreprise sur Upwork publiquement
    author: buyer?.location?.country ? `Client from ${buyer.location.country}` : 'Upwork Client',
    publishedAt: op?.postedOn || new Date().toISOString(),
    metadata: {
      budget: op?.budget?.amount,
      tier: op?.contractorTier,
      duration: op?.engagementDuration?.label,
      clientScore: buyer?.stats?.score,
      clientTotalJobs: buyer?.stats?.totalAssignments,
    },
  }
}

export const UpworkScraper: Scraper = {
  name: 'Upwork Jobs',
  source: 'upwork',
  sourceType: 'job',
  async collect(params) {
    console.log('[Upwork] Lancement de la collecte via Apify...')
    const maxResults = (params.maxResults as number) ?? DEFAULT_PARAMS.maxResults
    const keywords = (params.keywords as string[]) ?? DEFAULT_PARAMS.keywords

const signals: RawSignalInput[] = []
    const seenIds = new Set<string>()
    const perKeyword = Math.max(5, Math.ceil(maxResults / keywords.length))

    for (const keyword of keywords) {
      if (signals.length >= maxResults) break
      try {
        const items = await runApifyActor({
          actorId: UPWORK_ACTOR_ID,
          input: {
            limit: perKeyword,
            query: [keyword],
            sort: 'newest',
          },
          memoryMbytes: 512,
        }) as unknown as UpworkJobItem[]

        for (const item of items) {
          if (signals.length >= maxResults) break
          const signal = mapToSignal(item)
          if (seenIds.has(String(item.id))) continue
          seenIds.add(String(item.id))
          signals.push(signal)
        }
      } catch (err) {
        console.error(`[Upwork] Erreur keyword "${keyword}" —`, err instanceof Error ? err.message : String(err))
      }
    }

    console.log(`[Upwork] ${signals.length} signaux collectés`)
    return signals
  },
}
