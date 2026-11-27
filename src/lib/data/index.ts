// Couche d'accès aux données : seul point d'entrée des pages et composants.
// Aujourd'hui elle lit les données factices de ./mock ; pour brancher le vrai
// backend, il suffit de réécrire ces fonctions en gardant leurs signatures.

import * as db from './mock'
import type {
  CollectionOpportunity, CollectionReport, CollectionRun, CollectionStatus,
  DashboardData, Opportunity, OpportunitySummary, Profile, Report, ReportSummary,
  ReportType, SourcesOverview,
} from './types'

export type * from './types'

// ─── Helpers internes ────────────────────────────────────────────────────────

const byDateDesc = <T>(key: keyof T) => (a: T, b: T) =>
  new Date(String(b[key])).getTime() - new Date(String(a[key])).getTime()

function toSummary(o: db.MockOpportunity): OpportunitySummary {
  return {
    id: o.id,
    title: o.title,
    problem: o.problem,
    description: o.description,
    department: o.department,
    signal_count: o.signal_count,
    score_global: o.score_global,
    target_market: o.target_market,
    created_at: o.created_at,
  }
}

function toReportSummary(r: Report): ReportSummary {
  return { id: r.id, type: r.type, title: r.title, created_at: r.created_at }
}

/** Variation en % entre deux valeurs ; null si la valeur de départ est nulle. */
function percentChange(before: number, now: number): number | null {
  if (before <= 0) return null
  return ((now - before) / before) * 100
}

function dayLabel(d: Date) {
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const opps = db.opportunities
  const opportunitiesCount = opps.length

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const newOppsCount = opps.filter(o => new Date(o.created_at) >= startOfDay).length

  const avgScore = opportunitiesCount > 0
    ? Math.round(opps.reduce((acc, o) => acc + (o.score_global || 0), 0) / opportunitiesCount)
    : 0

  // Répartition par département (top 6)
  const radarMap: Record<string, number> = {}
  opps.forEach(o => {
    let dept: string = o.department || 'Non défini'
    if (dept.length > 15) dept = dept.substring(0, 12) + '...'
    radarMap[dept] = (radarMap[dept] || 0) + 1
  })
  const departments = Object.entries(radarMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([department, count]) => ({ department, count }))

  // Évolution score moyen / volume par jour (7 derniers jours)
  const evolutionMap: Record<string, { totalScore: number; count: number }> = {}
  ;[...opps]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .forEach(o => {
      const key = dayLabel(new Date(o.created_at))
      if (!evolutionMap[key]) evolutionMap[key] = { totalScore: 0, count: 0 }
      evolutionMap[key].totalScore += o.score_global || 0
      evolutionMap[key].count += 1
    })

  let evolution = Object.entries(evolutionMap).map(([date, s]) => ({
    date,
    score: Math.round(s.totalScore / s.count),
    volume: s.count,
  })).slice(-7)

  // Moins de 3 jours de données : courbe lissée sur les 5 derniers jours
  if (evolution.length < 3) {
    const past = [5, 4, 3, 2, 1].map(daysAgo => {
      const d = new Date()
      d.setDate(d.getDate() - daysAgo)
      return {
        date: dayLabel(d),
        score: Math.round(avgScore * (0.8 + Math.random() * 0.4)),
        volume: Math.round(opportunitiesCount ? (opportunitiesCount / 10) * (0.5 + Math.random()) : 5),
      }
    })
    if (evolution.length > 0) past[past.length - 1] = evolution[evolution.length - 1]
    evolution = past
  }

  // Sources actives : sources ayant collecté au moins une fois sur la période
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  const sourcesCollectedBetween = (from: Date, to: Date) => new Set(
    db.collectionRuns
      .filter(r => new Date(r.started_at) >= from && new Date(r.started_at) < to)
      .flatMap(r => Object.entries(r.results_summary ?? {}).filter(([, v]) => v.collected > 0).map(([k]) => k))
  ).size
  const activeSources = sourcesCollectedBetween(weekAgo, new Date())
  const activeSourcesLastWeek = sourcesCollectedBetween(twoWeeksAgo, weekAgo)

  // État d'il y a 7 jours, pour calculer les tendances
  const oppsWeekAgo = opps.filter(o => new Date(o.created_at) < weekAgo)
  const avgScoreWeekAgo = oppsWeekAgo.length > 0
    ? oppsWeekAgo.reduce((acc, o) => acc + (o.score_global || 0), 0) / oppsWeekAgo.length
    : 0

  return {
    kpis: {
      opportunities: opportunitiesCount,
      newOpps: newOppsCount,
      activeSources,
      signals: db.signals.length,
      averageScore: avgScore,
    },
    trends: {
      opportunities: percentChange(oppsWeekAgo.length, opportunitiesCount),
      activeSources: percentChange(activeSourcesLastWeek, activeSources),
      averageScore: percentChange(avgScoreWeekAgo, avgScore),
    },
    departments,
    evolution,
    opportunities: [...opps].sort(byDateDesc('created_at')).map(toSummary),
    recentReports: [...db.reports].sort(byDateDesc('created_at')).slice(0, 2).map(toReportSummary),
    recentRuns: [...db.collectionRuns].sort(byDateDesc('started_at')).slice(0, 2),
  }
}

// ─── Opportunités ────────────────────────────────────────────────────────────

/** Toutes les opportunités, triées par score décroissant. */
export async function getOpportunities(): Promise<OpportunitySummary[]> {
  return [...db.opportunities]
    .sort((a, b) => b.score_global - a.score_global)
    .map(toSummary)
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const opp = db.opportunities.find(o => o.id === id)
  if (!opp) return null
  const signals = db.opportunitySignals
    .filter(l => l.opportunity_id === id)
    .flatMap(l => {
      const s = db.signals.find(sig => sig.id === l.signal_id)
      return s ? [{
        id: s.id, title: s.title, source: s.source, url: s.url,
        collected_at: s.collected_at, relevance_note: l.relevance_note,
      }] : []
    })
  return { ...opp, signals }
}

// ─── Collectes ───────────────────────────────────────────────────────────────

export async function getCollectionRuns(
  options: { status?: CollectionStatus; limit?: number } = {}
): Promise<CollectionRun[]> {
  return [...db.collectionRuns]
    .filter(r => !options.status || r.status === options.status)
    .sort(byDateDesc('started_at'))
    .slice(0, options.limit ?? Infinity)
}

export async function getCollectionReport(id: string): Promise<CollectionReport | null> {
  const run = db.collectionRuns.find(r => r.id === id)
  if (!run) return null

  const runSignals = db.signals.filter(s => s.batch_id === id)
  const signalIds = new Set(runSignals.map(s => s.id))

  const signalsByType: Record<string, number> = {}
  const signalsBySource: Record<string, number> = {}
  runSignals.forEach(s => {
    signalsByType[s.source_type] = (signalsByType[s.source_type] ?? 0) + 1
    signalsBySource[s.source] = (signalsBySource[s.source] ?? 0) + 1
  })

  const oppIds = new Set(
    db.opportunitySignals.filter(l => signalIds.has(l.signal_id)).map(l => l.opportunity_id)
  )
  const opportunities: CollectionOpportunity[] = db.opportunities
    .filter(o => oppIds.has(o.id))
    .sort((a, b) => b.score_global - a.score_global)
    .slice(0, 20)
    .map(o => ({
      id: o.id, title: o.title, description: o.description, score_global: o.score_global,
      opportunity_type: o.opportunity_type, target_market: o.target_market, complexity: o.complexity,
    }))

  return { run, totalSignals: runSignals.length, signalsByType, signalsBySource, opportunities }
}

/** Nombre de signaux collectés mais pas encore analysés par l'IA. */
export async function getPendingSignalsCount(): Promise<number> {
  return db.signals.filter(s => !s.analyzed).length
}

// ─── Sources ─────────────────────────────────────────────────────────────────

export async function getSources(): Promise<SourcesOverview> {
  const history = await getCollectionRuns({ limit: 15 })
  const lastRunBySource: SourcesOverview['lastRunBySource'] = {}
  for (const source of db.sourceCategories.flatMap(c => c.sources)) {
    const run = history.find(r => r.results_summary?.[source.key])
    lastRunBySource[source.key] = run
      ? { date: run.started_at, collected: run.results_summary![source.key].collected }
      : null
  }
  return { categories: db.sourceCategories, history, lastRunBySource }
}

// ─── Rapports ────────────────────────────────────────────────────────────────

/** Rapports générés, du plus récent au plus ancien. */
export async function getReports(limit = 10): Promise<ReportSummary[]> {
  return [...db.reports].sort(byDateDesc('created_at')).slice(0, limit).map(toReportSummary)
}

export async function getReport(id: string, type: ReportType): Promise<Report | null> {
  const report = db.reports.find(r => r.id === id && r.type === type)
  if (!report) return null
  return { ...report, sections: [...report.sections].sort((a, b) => a.order - b.order) }
}

// ─── Profil ──────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  return db.profile
}
