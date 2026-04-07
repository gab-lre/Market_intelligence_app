// Personnalisation des paramètres de scraping selon le profil utilisateur
// Chaque scraper qui supporte des keywords/tags/locations reçoit des overrides
// dérivés du profil. Les scrapers sans params de ciblage (HN, Reddit, G2) ne sont pas affectés.

import type { UserProfile } from '@/types/database'

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function getJobLocations(market: string | null): string[] {
  const map: Record<string, string[]> = {
    fr: ['France'],
    fr_qc: ['France', 'Canada'],
    europe: ['France', 'Belgique', 'Suisse', 'Remote'],
    international: ['Remote', 'United States', 'United Kingdom'],
  }
  return map[market ?? 'fr'] ?? ['France']
}

/** Keywords orientés offres d'emploi / recrutement (LinkedIn, Indeed, Wellfound) */
function deriveJobKeywords(profile: UserProfile): string[] {
  const kw: string[] = []

  const solutionToJob: Record<string, string> = {
    automation: 'process automation specialist',
    platform: 'saas product manager',
    api: 'api engineer',
    template: 'no-code developer',
    productivity: 'operations manager',
    widget: 'frontend developer',
  }
  for (const pref of profile.preferred_solution_types ?? []) {
    if (solutionToJob[pref]) kw.push(solutionToJob[pref])
  }

  const techToJob: Record<string, string[]> = {
    non_tech: ['product manager', 'operations manager', 'business analyst'],
    low_code: ['no-code developer', 'automation specialist', 'make.com expert'],
    junior_dev: ['web developer', 'fullstack developer'],
    senior_dev: ['software engineer', 'tech lead', 'fullstack senior'],
  }
  kw.push(...(techToJob[profile.tech_level ?? ''] ?? []).slice(0, 2))

  if (profile.preferred_business_models?.includes('b2b')) kw.push('b2b saas')

  return [...new Set(kw)].slice(0, 4)
}

/** Keywords orientés missions freelance (Upwork, Malt) */
function deriveFreelanceKeywords(profile: UserProfile): string[] {
  const kw: string[] = []

  const techToFreelance: Record<string, string[]> = {
    non_tech: ['consultant digital', 'chef de projet', 'no-code expert'],
    low_code: ['make.com', 'n8n', 'automatisation', 'airtable expert'],
    junior_dev: ['développeur react', 'nextjs', 'supabase'],
    senior_dev: ['fullstack senior', 'typescript', 'next.js', 'api rest'],
  }
  kw.push(...(techToFreelance[profile.tech_level ?? ''] ?? []))

  const solutionToFreelance: Record<string, string[]> = {
    automation: ['automatisation', 'workflow', 'n8n', 'zapier'],
    platform: ['saas', 'plateforme', 'dashboard'],
    api: ['api', 'intégration', 'webhook'],
    template: ['template', 'notion', 'airtable'],
    productivity: ['productivité', 'crm', 'gestion de projet'],
  }
  for (const pref of profile.preferred_solution_types ?? []) {
    kw.push(...(solutionToFreelance[pref] ?? []).slice(0, 2))
  }

  return [...new Set(kw)].slice(0, 4)
}

/** Tags pour Dev.to (doivent correspondre à de vrais tags de la plateforme) */
function deriveDevToTags(profile: UserProfile): string[] {
  const tags: Set<string> = new Set(['saas', 'startup', 'entrepreneur'])

  const techTags: Record<string, string[]> = {
    non_tech: ['productivity', 'tools', 'nocode'],
    low_code: ['nocode', 'automation', 'webdev'],
    junior_dev: ['javascript', 'webdev', 'programming'],
    senior_dev: ['typescript', 'programming', 'api', 'architecture'],
  }
  for (const t of techTags[profile.tech_level ?? ''] ?? []) tags.add(t)

  if (profile.preferred_solution_types?.includes('automation')) {
    tags.add('automation')
    tags.add('devops')
  }
  if (profile.preferred_solution_types?.includes('api')) tags.add('api')

  return [...tags].slice(0, 5)
}

/** Recherches Indeed dérivées du profil (keyword + localisation) */
function deriveIndeedSearches(
  profile: UserProfile
): Array<{ keyword: string; location: string; country: string }> {
  const keywords = deriveJobKeywords(profile)

  const marketToGeo: Record<string, { location: string; country: string }[]> = {
    fr: [{ location: 'France', country: 'fr' }],
    fr_qc: [
      { location: 'France', country: 'fr' },
      { location: 'Montréal', country: 'ca' },
    ],
    europe: [
      { location: 'France', country: 'fr' },
      { location: 'Belgium', country: 'be' },
    ],
    international: [
      { location: 'United States', country: 'us' },
      { location: 'United Kingdom', country: 'gb' },
    ],
  }
  const geos =
    marketToGeo[profile.priority_market ?? 'fr'] ?? [{ location: 'France', country: 'fr' }]

  const searches: Array<{ keyword: string; location: string; country: string }> = []
  for (const kw of keywords.slice(0, 2)) {
    for (const geo of geos.slice(0, 1)) {
      searches.push({ keyword: kw, ...geo })
    }
  }

  if (searches.length === 0) {
    searches.push({ keyword: 'process automation', location: 'France', country: 'fr' })
  }

  return searches.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Fonction principale exportée
// ---------------------------------------------------------------------------

/**
 * Retourne un dictionnaire de params overrides par source, dérivés du profil.
 * Seuls les scrapers qui supportent des paramètres de ciblage (keywords, tags, locations)
 * sont affectés. Si un dérivé est vide, on n'override pas pour éviter de passer un tableau vide.
 */
export function buildScraperParamsFromProfile(
  profile: UserProfile
): Record<string, Record<string, unknown>> {
  const overrides: Record<string, Record<string, unknown>> = {}

  const jobLocations = getJobLocations(profile.priority_market)
  const jobKeywords = deriveJobKeywords(profile)
  const freelanceKeywords = deriveFreelanceKeywords(profile)
  const devToTags = deriveDevToTags(profile)
  const indeedSearches = deriveIndeedSearches(profile)

  // Dev.to — tags
  if (devToTags.length > 0) {
    overrides.devto = { maxResults: 15, tags: devToTags }
  }

  // Upwork — keywords (sans points pour éviter les problèmes de parsing)
  if (freelanceKeywords.length > 0) {
    overrides.upwork = {
      maxResults: 10,
      keywords: freelanceKeywords.slice(0, 3).map(k => k.replace(/\./g, ' ')),
    }
  }

  // Malt — keywords
  if (freelanceKeywords.length > 0) {
    overrides.malt = {
      maxResults: 10,
      keywords: freelanceKeywords.slice(0, 3),
    }
  }

  // Wellfound — keywords + locations
  const wellfoundKws = jobKeywords.length > 0 ? ['SaaS', ...jobKeywords.slice(0, 2)] : undefined
  if (wellfoundKws || jobLocations.length > 0) {
    overrides.wellfound = {
      maxResults: 10,
      ...(wellfoundKws ? { keywords: wellfoundKws } : {}),
      locations: [...jobLocations, 'Remote'],
    }
  }

  // LinkedIn — keywords + locations
  if (jobKeywords.length > 0 || jobLocations.length > 0) {
    overrides.linkedin = {
      maxResults: 10,
      ...(jobKeywords.length > 0 ? { keywords: jobKeywords.slice(0, 3) } : {}),
      locations: jobLocations,
    }
  }

  // Indeed — recherches dérivées
  if (indeedSearches.length > 0) {
    overrides.indeed = { maxResults: 10, searches: indeedSearches }
  }

  return overrides
}
