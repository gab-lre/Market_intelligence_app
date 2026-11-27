// Choix proposés par la fenêtre « Générer un rapport » (types, catégories, étapes de chargement).

import { Briefcase, Users, Rocket, Globe, Layers, BarChart2 } from 'lucide-react'

export type ReportType = 'category' | 'cross' | 'full'
export type CategoryKey = 'job' | 'community' | 'startup'

export const CATEGORIES: { key: CategoryKey; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: 'job',
    label: 'Emplois & Missions Freelance',
    desc: 'LinkedIn, Indeed, Upwork, Malt, France Travail',
    icon: <Briefcase className="w-5 h-5 text-[#257b57]" />,
  },
  {
    key: 'community',
    label: 'Communautés & Insights',
    desc: 'Dev.to, Reddit, Hacker News, G2',
    icon: <Users className="w-5 h-5 text-[#257b57]" />,
  },
  {
    key: 'startup',
    label: 'Écosystème Startups',
    desc: 'Wellfound, Product Hunt, Indie Hackers',
    icon: <Rocket className="w-5 h-5 text-[#257b57]" />,
  },
]

export const REPORT_TYPES: {
  key: ReportType
  label: string
  desc: string
  icon: React.ReactNode
  tag?: string
}[] = [
  {
    key: 'category',
    label: 'Rapport par catégorie',
    desc: 'Analyse approfondie d\'une seule catégorie de sources. 1 appel Gemini.',
    icon: <BarChart2 className="w-6 h-6 text-[#257b57]" />,
  },
  {
    key: 'cross',
    label: 'Rapport croisé',
    desc: 'Convergences et divergences entre 2 ou 3 catégories de sources.',
    icon: <Layers className="w-6 h-6 text-[#257b57]" />,
  },
  {
    key: 'full',
    label: 'Rapport complet',
    desc: 'Rapport exhaustif sur toutes les sources. 6 sections structurées.',
    icon: <Globe className="w-6 h-6 text-[#257b57]" />,
    tag: 'Premium',
  },
]

export const FULL_STEPS = [
  'Analyse de toutes les sources...',
  'Génération de l\'executive summary...',
  'Cartographie du marché...',
  'Analyse emploi & communautés...',
  'Analyse concurrentielle...',
  'Personnalisation selon votre profil...',
]

export const CATEGORY_STEPS = [
  'Chargement des signaux de la catégorie...',
  'Sélection des signaux les plus pertinents...',
  'Analyse IA Gemini en cours...',
  'Structuration du rapport...',
  'Finalisation et mise en page...',
]

export const CROSS_STEPS = [
  'Chargement des signaux multi-sources...',
  'Analyse croisée par catégorie...',
  'Détection des convergences et divergences...',
  'Rédaction du rapport IA...',
  'Finalisation...',
]
