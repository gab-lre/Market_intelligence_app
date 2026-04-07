import { supabase } from '@/lib/supabase'
import LaunchRunButton from '@/components/LaunchRunButton'
import OpportunitiesTable from '@/components/OpportunitiesTable'
import type { CollectionHistory, OpportunityDepartment } from '@/types/database'
import { ScoreEvolutionChart } from '@/components/Charts/ScoreEvolutionChart'
import { DepartmentDistributionChart } from '@/components/Charts/DepartmentDistributionChart'

export const dynamic = 'force-dynamic'

function formatLastRun(row: Pick<CollectionHistory, 'started_at'> | null): string {
  if (!row) return 'Jamais'
  const d = new Date(row.started_at)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatDept(d: OpportunityDepartment | null): string {
  if (!d) return '—'
  const map: Record<OpportunityDepartment, string> = {
    commercial: 'Commercial', marketing: 'Marketing', operations: 'Opérations',
    finance: 'Finance', rh: 'RH', technique: 'Technique', support: 'Support', autre: 'Autre',
  }
  return map[d] ?? d
}

export default async function DashboardPage() {
  // KPI 1 — Nb opportunités actives
  const { count: opportunityCount } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // KPI 2 — Score moyen
  const { data: scoreData } = await supabase
    .from('opportunities')
    .select('score_global')
    .eq('status', 'active')
  const avgScore = scoreData?.length
    ? Math.round(scoreData.reduce((s, o) => s + o.score_global, 0) / scoreData.length)
    : 0

  // KPI 3 — Nb total de signaux
  const { count: signalCount } = await supabase
    .from('raw_signals')
    .select('*', { count: 'exact', head: true })

  // KPI 4 — Dernier batch
  const { data: lastRun } = await supabase
    .from('collections_history')
    .select('started_at')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Tableau — Toutes les opportunités actives (tri/filtre côté client)
  const { data: topOpportunities } = await supabase
    .from('opportunities')
    .select('id, title, problem, department, signal_count, score_global, target_market, created_at')
    .eq('status', 'active')
    .order('score_global', { ascending: false })
    .limit(100)

  // -- DONNÉES GRAPHIQUES --
  // 1. Distribution par département
  const { data: allOpps } = await supabase
    .from('opportunities')
    .select('department, created_at, score_global')
    .eq('status', 'active')

  const deptCounts: Record<string, number> = {}
  if (allOpps) {
    for (const opp of allOpps) {
      const d = opp.department || 'autre'
      deptCounts[d] = (deptCounts[d] || 0) + 1
    }
  }

  // Couleurs: Bleu (#00b4d8) pour le max, variantes pour le reste
  const deptData = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1]) // Du plus grand au plus petit
    .slice(0, 6) // Les 6 principaux
    .map(([dept, count], i) => ({
      department: formatDept(dept as OpportunityDepartment),
      count,
      color: i === 0 ? '#00b4d8' : `rgba(0, 180, 216, ${Math.max(0.2, 1 - i * 0.15)})`
    }))

  // 2. Évolution temporelle des scores (regroupement par jour)
  const dateScores: Record<string, number[]> = {}
  if (allOpps) {
    for (const opp of allOpps) {
      if (!opp.created_at) continue
      const date = new Date(opp.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      if (!dateScores[date]) dateScores[date] = []
      dateScores[date].push(opp.score_global)
    }
  }

  const evoData = Object.entries(dateScores)
    .map(([date, scores]) => ({
      date,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }))
    .slice(-7) // 7 derniers jours disponibles

  const maxEvoScore = evoData.length > 0 ? Math.max(...evoData.map(d => d.score)) : 0;

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">

      {/* KPI Row */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#00b4d8] pb-2 inline-block">Indicateurs de performance</h3>
          <LaunchRunButton />
        </div>
        <div className="grid grid-cols-4 gap-8">
          <div>
            <p className="text-4xl font-black text-[#2b3652] mb-2 tracking-tight">{opportunityCount ?? 0}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Opportunités Identifiées</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#2b3652] mb-2 tracking-tight">{avgScore}<span className="text-2xl text-slate-400 font-bold ml-1">/100</span></p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Score Moyen</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#2b3652] mb-2 tracking-tight">{(signalCount ?? 0).toLocaleString('fr-FR')}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Signaux Bruts</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#2b3652] mb-2 tracking-tight">{formatLastRun(lastRun)}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Dernière Mise à Jour</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 mb-16 border-t border-slate-200 pt-12">
        <div className="col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#00b4d8] pb-2 inline-block">Évolution des Scores</h3>
            <span className="text-slate-400 font-bold tracking-widest text-lg leading-none">..</span>
          </div>

          <div className="flex items-end gap-1 h-48 relative border-b border-slate-200 pb-2">
             <ScoreEvolutionChart data={evoData} />
             {evoData.length > 0 && (
               <div className="absolute top-[10%] right-[15%] bg-white border border-slate-200 shadow-lg px-4 py-2 flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Pic Période</span>
                  <span className="text-sm font-black text-[#2b3652]">{maxEvoScore} <span className="text-[#00b4d8] ml-1">↑</span></span>
               </div>
             )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 border-l border-slate-200 pl-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#00b4d8] pb-2 inline-block">Départements</h3>
            <span className="text-slate-400 font-bold tracking-widest text-lg leading-none">..</span>
          </div>
          <div className="flex items-end h-56 gap-3 border-b border-slate-200 pb-2">
            <DepartmentDistributionChart data={deptData} />
          </div>
        </div>
      </div>

      <OpportunitiesTable opportunities={topOpportunities ?? []} />
    </div>
  )
}
