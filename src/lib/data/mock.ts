// Données factices. Elles imitent les tables du futur backend :
// la couche src/lib/data/index.ts les lit et les met en forme pour l'UI.

import type {
  CollectionRun, Opportunity, Profile, Report, SignalSourceType, SourceCategory,
} from './types'

/** Signal brut collecté par un run. */
export interface MockSignal {
  id: string
  source: string
  source_type: SignalSourceType
  title: string | null
  url: string | null
  collected_at: string
  /** Identifiant du run qui l'a collecté. */
  batch_id: string
  /** false = en attente d'analyse IA. */
  analyzed: boolean
}

/** Lien opportunité ↔ signal. */
export interface MockOpportunitySignal {
  opportunity_id: string
  signal_id: string
  relevance_note: string | null
}

/** Opportunité sans ses signaux liés (ils sont dans opportunitySignals). */
export type MockOpportunity = Omit<Opportunity, 'signals'>

// ─── Catalogue des sources ───────────────────────────────────────────────────

export const sourceCategories: SourceCategory[] = [
  {
    id: 'emploi',
    name: 'Emplois & Missions Freelance',
    desc: 'Offres d\'emploi et missions freelance — signaux de besoins non automatisés.',
    sources: [
      { name: 'Upwork',         key: 'upwork',        type: 'Crédits', desc: 'Missions freelance mondiales',      emoji: '🌍' },
      { name: 'France Travail', key: 'francetravail', type: 'Gratuit', desc: 'Offres d\'emploi officielles FR',   emoji: '🏛️' },
      { name: 'LinkedIn',       key: 'linkedin',      type: 'Crédits', desc: 'Réseau pro — offres B2B',           emoji: '💼' },
      { name: 'Indeed',         key: 'indeed',        type: 'Crédits', desc: 'Moteur d\'offres mondial',          emoji: '📋' },
    ],
  },
  {
    id: 'communaute',
    name: 'Communautés & Insights',
    desc: 'Discussions ouvertes, pain points et lancements produits.',
    sources: [
      { name: 'Dev.to',       key: 'devto',       type: 'Gratuit', desc: 'Communauté de développeurs',             emoji: '👨‍💻' },
      { name: 'Reddit',       key: 'reddit',      type: 'Gratuit', desc: 'Forums SaaS, startups & secteurs pro',   emoji: '🔴' },
      { name: 'Hacker News',  key: 'hackernews',  type: 'Gratuit', desc: 'Tech & Startups discussions',            emoji: '🟠' },
      { name: 'Product Hunt', key: 'producthunt', type: 'Gratuit', desc: 'Lancements produits — pain points résolus', emoji: '🐱' },
    ],
  },
  {
    id: 'reviews',
    name: 'Avis & Reviews Logiciels',
    desc: 'Frustrations réelles d\'utilisateurs — signaux de gaps fonctionnels.',
    sources: [
      { name: 'G2',         key: 'g2',         type: 'Crédits', desc: 'Avis B2B — 15 produits, 11 secteurs',        emoji: '⭐' },
      { name: 'Trustpilot', key: 'trustpilot', type: 'Crédits', desc: 'Avis services B2B — PME & non-tech',         emoji: '🌟' },
      { name: 'Capterra',   key: 'capterra',   type: 'Crédits', desc: 'Avis logiciels — Field service, retail, F&B', emoji: '📊' },
    ],
  },
  {
    id: 'startup',
    name: 'Écosystème Startups',
    desc: 'Offres dans les startups et SaaS en croissance.',
    sources: [
      { name: 'Wellfound', key: 'wellfound', type: 'Crédits', desc: 'Jobs en Startups et SaaS', emoji: '🚀' },
    ],
  },
]

// ─── Tables (vides : reproduit l'état actuel de l'app) ───────────────────────

export const opportunities: MockOpportunity[] = []

export const signals: MockSignal[] = []

export const opportunitySignals: MockOpportunitySignal[] = []

export const collectionRuns: CollectionRun[] = []

export const reports: Report[] = []

export const profile: Profile | null = null
