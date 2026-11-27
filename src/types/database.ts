// Types TypeScript — Schéma Supabase
// Mis à jour : migration 003 (2026-04-01) — user_profiles + generated_reports

// ============================================
// Énumérations
// ============================================

export type CollectionStatus = 'running' | 'completed' | 'partial' | 'failed'

export type SignalSource =
  | 'hackernews'
  | 'reddit'
  | 'francetravail'
  | 'producthunt'
  | 'indiehackers'
  | 'g2'
  | 'capterra'
  | 'trustpilot'
  | 'linkedin'
  | 'indeed'
  | 'wellfound'
  | 'upwork'
  | 'devto'
  | 'malt'

export type SignalSourceType = 'community' | 'review' | 'job' | 'freelance'

export type SignalStatus = 'pending' | 'analyzed' | 'discarded' | 'error'

export type OpportunityDepartment =
  | 'commercial'
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'rh'
  | 'technique'
  | 'support'
  | 'autre'

export type CompanySize = 'startup' | 'pme' | 'grande_entreprise'

export type OpportunityStatus = 'active' | 'archived' | 'dismissed'

export type OpportunityType = 'saas' | 'ai_agent_service' | 'ai_agent_product' | 'template' | 'micro_product'

export type TargetMarket = 'fr' | 'qc' | 'fr_qc' | 'international'

export type RevenueModel = 'subscription' | 'one_time' | 'per_project' | 'usage_based' | 'freemium'

export type TimeToMvp = 'days' | 'weeks' | 'months'

export type Complexity = 'low' | 'medium' | 'high'

export type MarketSizeHint = 'niche' | 'medium' | 'large'

// ============================================
// Table : collections_history
// ============================================

export interface CollectionHistory {
  id: string
  started_at: string
  finished_at: string | null
  status: CollectionStatus
  sources_config: Record<string, unknown> | null
  results_summary: Record<string, unknown> | null
  signals_collected: number
  signals_analyzed: number
  opportunities_created: number
  opportunities_updated: number
}

export type CollectionHistoryInsert = Omit<CollectionHistory, 'id' | 'started_at'> & {
  id?: string
  started_at?: string
}

export type CollectionHistoryUpdate = Partial<
  Omit<CollectionHistory, 'id' | 'started_at'>
>

// ============================================
// Table : raw_signals
// ============================================

export interface RawSignal {
  id: string
  source: SignalSource
  source_type: SignalSourceType
  external_id: string | null
  title: string | null
  content: string
  url: string | null
  author: string | null
  metadata: Record<string, unknown> | null
  collected_at: string
  published_at: string | null
  status: SignalStatus
  batch_id: string | null
}

export type RawSignalInsert = Omit<RawSignal, 'id' | 'collected_at'> & {
  id?: string
  collected_at?: string
}

// ============================================
// Table : opportunities
// ============================================

export interface Opportunity {
  id: string
  title: string
  description: string | null
  problem: string | null
  repetitive_tasks: string[]
  existing_tools: string[]
  tool_gaps: string | null
  department: OpportunityDepartment | null
  company_size: CompanySize[]
  score_volume: number
  score_urgency: number
  score_tool_gap: number
  score_saturation: number
  score_global: number
  signal_count: number
  source_types: string[]
  status: OpportunityStatus
  // Champs ajoutés en migration 002 (Phase 4 — IA)
  opportunity_type: OpportunityType
  target_market: TargetMarket | null
  revenue_model: RevenueModel | null
  time_to_mvp: TimeToMvp | null
  complexity: Complexity | null
  estimated_cost: string | null
  solo_dev_feasible: boolean
  key_challenges: string[]
  price_range: string | null
  market_size_hint: MarketSizeHint | null
  recurring_potential: boolean | null
  alternative_types: string[]
  created_at: string
  updated_at: string
}

export type OpportunityInsert = Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type OpportunityUpdate = Partial<
  Omit<Opportunity, 'id' | 'created_at'>
> & { updated_at?: string }

// ============================================
// Table : opportunity_signals (liaison N-N)
// ============================================

export interface OpportunitySignal {
  opportunity_id: string
  signal_id: string
  relevance_note: string | null
}

// ============================================
// Table : user_profiles (migration 003)
// ============================================

export type EntrepreneurialStage = 'exploration' | 'validation' | 'building' | 'launched'
export type TechLevel = 'non_tech' | 'low_code' | 'junior_dev' | 'senior_dev'
export type BudgetRange = 'bootstrapped' | 'few_thousands' | 'comfortable'
export type WeeklyAvailability = 'few_hours' | 'half_time' | 'full_time'
export type PreferredTarget = 'sme' | 'enterprise' | 'freelancers' | 'consumers'
export type ProductComplexity = 'mvp' | 'elaborate' | 'indifferent'
export type PriorityMarket = 'fr' | 'fr_qc' | 'europe' | 'international'
export type ReportDetailLevel = 'executive' | 'full' | 'both'
export type ReportTone = 'analytical' | 'narrative' | 'actionable'

export interface UserProfile {
  id: string
  // Bloc 1 — Identité entrepreneuriale
  entrepreneurial_stage: EntrepreneurialStage | null
  main_motivation: string[]
  time_horizon: string | null
  prior_experience: boolean | null
  // Bloc 2 — Compétences
  tech_level: TechLevel | null
  secondary_skills: string[]
  spoken_languages: string[]
  weekly_availability: WeeklyAvailability | null
  // Bloc 3 — Contexte & contraintes
  budget_range: BudgetRange | null
  preferred_business_models: string[]
  excluded_sectors: string[]
  preferred_sectors: string[]
  // Bloc 4 — Vision produit
  preferred_solution_types: string[]
  preferred_target: PreferredTarget | null
  product_complexity: ProductComplexity | null
  vertical_vs_horizontal: string | null
  // Bloc 5 — Marché
  priority_market: PriorityMarket | null
  existing_sector_knowledge: string | null
  // Bloc 6 — Préférences rapport
  report_detail_level: ReportDetailLevel | null
  report_tone: ReportTone | null
  report_frequency: string | null
  // IA
  profile_summary: string | null
  // État onboarding
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
}

export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at'>> & {
  updated_at?: string
}

// ============================================
// Table : generated_reports (migration 003)
// ============================================

export type ReportType = 'category' | 'cross' | 'full'
export type ReportStatus = 'generating' | 'completed' | 'error'

export interface ReportSection {
  order: number
  title: string
  content: string // Markdown
}

export interface GeneratedReport {
  id: string
  user_id: string | null
  type: ReportType
  title: string
  sections: ReportSection[]
  sources_used: string[]
  collection_ids: string[]
  generation_params: Record<string, unknown> | null
  status: ReportStatus
  sections_total: number
  sections_done: number
  error_message: string | null
  created_at: string
}

export type GeneratedReportInsert = Omit<GeneratedReport, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type GeneratedReportUpdate = Partial<Omit<GeneratedReport, 'id' | 'created_at'>>
