// Collecteur France Travail (ex Pôle Emploi)
// Source : API officielle France Travail (gratuite, nécessite inscription sur francetravail.io)
// Auth : OAuth2 client_credentials
// Doc : https://francetravail.io/data/api/offres-emploi

import type { Scraper, RawSignalInput } from '../types'

const AUTH_URL =
  'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire'
const SEARCH_URL =
  'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search'

const DEFAULT_KEYWORDS = [
  'CRM',
  'reporting',
  'automatisation',
  'gestion de projet',
  'data entry',
  'saisie',
  'tableaux de bord',
  'suivi client',
  'facturation',
  'relance',
  'prospection',
]

const DEFAULT_MAX_RESULTS = 50
const REQUEST_DELAY_MS = 1000

interface FTOffer {
  id: string
  intitule: string
  description: string
  dateCreation: string
  lieuTravail?: { libelle?: string; codePostal?: string }
  entreprise?: { nom?: string }
  typeContrat?: string
  salaire?: { libelle?: string }
  competences?: Array<{ libelle: string }>
  experienceLibelle?: string
  origineOffre?: { urlOrigine?: string }
}

interface FTSearchResponse {
  resultats: FTOffer[]
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'api_offresdemploiv2 o2dsoffre',
  })

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`France Travail auth failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.access_token as string
}

async function searchOffers(
  token: string,
  keyword: string,
  maxResults: number
): Promise<FTOffer[]> {
  const params = new URLSearchParams({
    motsCles: keyword,
    range: `0-${Math.min(maxResults - 1, 149)}`,
  })

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (res.status === 204) return [] // Aucun résultat
  if (!res.ok) throw new Error(`France Travail search failed (${res.status}) pour "${keyword}"`)

  const data: FTSearchResponse = await res.json()
  return data?.resultats ?? []
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class FranceTravailScraper implements Scraper {
  name = 'France Travail'
  source = 'francetravail' as const
  sourceType = 'job' as const

  async collect(params: Record<string, unknown>): Promise<RawSignalInput[]> {
    const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID
    const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.log('[FranceTravail] Collecteur désactivé — variables FRANCE_TRAVAIL_CLIENT_ID / FRANCE_TRAVAIL_CLIENT_SECRET manquantes.')
      return []
    }

    const keywords = (params.keywords as string[]) ?? DEFAULT_KEYWORDS
    const maxResults = (params.maxResults as number) ?? DEFAULT_MAX_RESULTS

    // Authentification OAuth2
    let token: string
    try {
      token = await getAccessToken(clientId, clientSecret)
    } catch (err) {
      console.error('[FranceTravail] Échec auth OAuth2 :', err)
      return []
    }

    const seen = new Set<string>()
    const signals: RawSignalInput[] = []

    for (const keyword of keywords) {
      try {
        const offers = await searchOffers(token, keyword, maxResults)

        for (const offer of offers) {
          if (seen.has(offer.id)) continue
          seen.add(offer.id)

          const content = offer.description?.trim() || offer.intitule
          const skills = offer.competences?.map((c) => c.libelle) ?? []

          signals.push({
            source: 'francetravail',
            sourceType: 'job',
            externalId: offer.id,
            title: offer.intitule,
            content,
            url: offer.origineOffre?.urlOrigine ?? `https://www.francetravail.fr/offres/recherche/detail/${offer.id}`,
            publishedAt: offer.dateCreation,
            metadata: {
              company_name: offer.entreprise?.nom ?? null,
              location: offer.lieuTravail?.libelle ?? null,
              contract_type: offer.typeContrat ?? null,
              salary_range: offer.salaire?.libelle ?? null,
              required_skills: skills,
              experience_level: offer.experienceLibelle ?? null,
            },
          })
        }
      } catch {
        // Continue avec le keyword suivant
      }

      await sleep(REQUEST_DELAY_MS)
    }

    return signals
  }
}
