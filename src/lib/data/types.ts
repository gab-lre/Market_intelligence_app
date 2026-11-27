// Types de données affichées par l'interface.
// Ils décrivent uniquement ce que l'UI lit ; le futur backend devra les produire.

// ─── Énumérations ────────────────────────────────────────────────────────────

export type Department =
  | 'commercial' | 'marketing' | 'operations' | 'finance'
  | 'rh' | 'technique' | 'support' | 'autre'

export type TargetMarket = 'fr' | 'qc' | 'fr_qc' | 'international'

export type OpportunityType = 'saas' | 'ai_agent_service' | 'ai_agent_product' | 'template' | 'micro_product'

export type RevenueModel = 'subscription' | 'one_time' | 'per_project' | 'usage_based' | 'freemium'

export type TimeToMvp = 'days' | 'weeks' | 'months'

export type Complexity = 'low' | 'medium' | 'high'

export type MarketSizeHint = 'niche' | 'medium' | 'large'

export type SignalSourceType = 'community' | 'review' | 'job' | 'freelance'

export type CollectionStatus = 'running' | 'completed' | 'partial' | 'failed'

export type ReportType = 'category' | 'cross' | 'full'

// ─── Opportunités ────────────────────────────────────────────────────────────

/** Ligne de liste (dashboard, page Opportunités). */
export interface OpportunitySummary {
  id: string
  title: string
  problem: string | null
  description: string | null
  department: Department | null
  signal_count: number
  score_global: number
  target_market: TargetMarket | null
  created_at: string
}

/** Signal source affiché sous une opportunité. */
export interface LinkedSignal {
  id: string
  title: string | null
  source: string
  url: string | null
  collected_at: string
  relevance_note: string | null
}

/** Fiche détaillée d'une opportunité. */
export interface Opportunity extends OpportunitySummary {
  score_volume: number
  score_urgency: number
  score_tool_gap: number
  score_saturation: number
  opportunity_type: OpportunityType
  revenue_model: RevenueModel | null
  time_to_mvp: TimeToMvp | null
  complexity: Complexity | null
  estimated_cost: string | null
  price_range: string | null
  market_size_hint: MarketSizeHint | null
  solo_dev_feasible: boolean
  recurring_potential: boolean | null
  key_challenges: string[]
  existing_tools: string[]
  tool_gaps: string | null
  signals: LinkedSignal[]
}

// ─── Collectes (runs) ────────────────────────────────────────────────────────

export interface CollectionRun {
  id: string
  started_at: string
  status: CollectionStatus
  /** Signaux collectés par source pour ce run (clé = identifiant de source). */
  results_summary: Record<string, { collected: number }> | null
  signals_collected: number
  signals_analyzed: number
  opportunities_created: number
  opportunities_updated: number
}

/** Opportunité telle qu'affichée dans le rapport d'une collecte. */
export interface CollectionOpportunity {
  id: string
  title: string
  description: string | null
  score_global: number
  opportunity_type: OpportunityType | null
  target_market: TargetMarket | null
  complexity: Complexity | null
}

export interface CollectionReport {
  run: CollectionRun
  totalSignals: number
  signalsByType: Record<string, number>
  signalsBySource: Record<string, number>
  opportunities: CollectionOpportunity[]
}

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface SourceDefinition {
  key: string
  name: string
  type: 'Gratuit' | 'Crédits'
  desc: string
  emoji: string
}

export interface SourceCategory {
  id: string
  name: string
  desc: string
  sources: SourceDefinition[]
}

export interface SourcesOverview {
  categories: SourceCategory[]
  /** 15 derniers runs, du plus récent au plus ancien. */
  history: CollectionRun[]
  /** Dernier run ayant collecté chaque source (null = jamais lancée). */
  lastRunBySource: Record<string, { date: string; collected: number } | null>
}

// ─── Rapports ────────────────────────────────────────────────────────────────

export interface ReportSection {
  order: number
  title: string
  content: string // Markdown
}

export interface ReportSummary {
  id: string
  type: ReportType
  title: string
  created_at: string
}

export interface Report extends ReportSummary {
  sections: ReportSection[]
  sources_used: string[]
  stats: {
    signals_analyzed?: number
    total_signals?: number
    total_opportunities?: number
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  kpis: {
    opportunities: number
    newOpps: number
    /** Sources ayant collecté au moins une fois sur les 7 derniers jours. */
    activeSources: number
    signals: number
    averageScore: number
  }
  /** Évolution en % sur 7 jours ; null quand il n'y a rien à comparer. */
  trends: {
    opportunities: number | null
    activeSources: number | null
    averageScore: number | null
  }
  departments: { department: string; count: number }[]
  evolution: { date: string; score: number; volume: number }[]
  opportunities: OpportunitySummary[]
  recentReports: ReportSummary[]
  recentRuns: CollectionRun[]
}

// ─── Profil ──────────────────────────────────────────────────────────────────

export interface Profile {
  /** Nom et rôle affichés dans le header. */
  display_name?: string
  role?: string
  entrepreneurial_stage?: string
  main_motivation?: string[]
  time_horizon?: string
  prior_experience?: boolean
  tech_level?: string
  secondary_skills?: string[]
  spoken_languages?: string[]
  weekly_availability?: string
  budget_range?: string
  preferred_business_models?: string[]
  excluded_sectors?: string[]
  preferred_sectors?: string[]
  preferred_solution_types?: string[]
  preferred_target?: string
  product_complexity?: string
  priority_market?: string
  existing_sector_knowledge?: string
  report_detail_level?: string
  report_tone?: string
  profile_summary?: string | null
}
