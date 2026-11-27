// Choix proposés par la fenêtre « Lancer une collecte » (types, catégories, étapes de chargement).

import { Briefcase, Users, Rocket, Star, Globe, Database } from 'lucide-react'

export type ScrapeType = 'category' | 'full'
export type CategoryKey = 'job' | 'community' | 'reviews' | 'startup'

export const CATEGORIES: { key: CategoryKey; label: string; desc: string; icon: React.ReactNode; sources: string[] }[] = [
  {
    key: 'job',
    label: 'Emplois & Missions Freelance',
    desc: 'LinkedIn, Indeed, Upwork, France Travail',
    icon: <Briefcase className="w-5 h-5 text-[#257b57]" />,
    sources: ['linkedin', 'indeed', 'upwork', 'francetravail']
  },
  {
    key: 'community',
    label: 'Communautés & Insights',
    desc: 'Dev.to, Reddit, Hacker News, Product Hunt',
    icon: <Users className="w-5 h-5 text-[#257b57]" />,
    sources: ['hackernews', 'reddit', 'devto', 'producthunt']
  },
  {
    key: 'reviews',
    label: 'Avis & Reviews Logiciels',
    desc: 'G2, Trustpilot, Capterra',
    icon: <Star className="w-5 h-5 text-[#257b57]" />,
    sources: ['g2', 'trustpilot', 'capterra']
  },
  {
    key: 'startup',
    label: 'Écosystème Startups',
    desc: 'Wellfound',
    icon: <Rocket className="w-5 h-5 text-[#257b57]" />,
    sources: ['wellfound']
  },
]

export const SCRAPE_TYPES: {
  key: ScrapeType
  label: string
  desc: string
  icon: React.ReactNode
  tag?: string
}[] = [
  {
    key: 'category',
    label: 'Collecte par catégorie',
    desc: 'Cible une catégorie spécifique pour un scraping rapide et précis. Économise vos crédits.',
    icon: <Database className="w-6 h-6 text-[#257b57]" />,
  },
  {
    key: 'full',
    label: 'Collecte globale',
    desc: 'Lance tous les collecteurs disponibles. Idéal pour une couverture exhaustive.',
    icon: <Globe className="w-6 h-6 text-[#257b57]" />,
    tag: 'Recommandé',
  },
]

export const SCRAPING_STEPS = [
  'Initialisation des collecteurs...',
  'Collecte des données sur les différentes sources...',
  'Filtrage et nettoyage des données brutes...',
  'Analyse IA des signaux par batch avec Gemini...',
  'Fusion et déduplication des opportunités...',
  'Calcul des scores de pertinence...',
  'Enregistrement dans la base de données...',
]
