import { ArrowLeft, Calendar, Database, BarChart3, Layers, Rocket, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SCORE_COLOR = (score: number) => {
  if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-slate-500 bg-slate-50 border-slate-200'
}

export default async function SourceReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: run } = await supabase
    .from('collections_history')
    .select('*')
    .eq('id', id)
    .single()

  if (!run) notFound()

  // Récupérer les signaux du batch
  const { data: signals } = await supabase
    .from('raw_signals')
    .select('id, source, source_type, title')
    .eq('batch_id', id)

  const signalIds = (signals ?? []).map(s => s.id)

  // Récupérer les opportunités liées à ces signaux
  let opportunities: {
    id: string
    title: string
    description: string | null
    score_global: number
    opportunity_type: string | null
    target_market: string | null
    complexity: string | null
    source_types: string[]
    status: string
  }[] = []

  if (signalIds.length > 0) {
    const { data: oppSignals } = await supabase
      .from('opportunity_signals')
      .select('opportunity_id')
      .in('signal_id', signalIds)

    const oppIds = [...new Set((oppSignals ?? []).map(o => o.opportunity_id))]

    if (oppIds.length > 0) {
      const { data: opps } = await supabase
        .from('opportunities')
        .select('id, title, description, score_global, opportunity_type, target_market, complexity, source_types, status')
        .in('id', oppIds)
        .eq('status', 'active')
        .order('score_global', { ascending: false })
        .limit(20)

      opportunities = opps ?? []
    }
  }

  const summaries = run.results_summary as Record<string, { collected?: number; analyzed?: number; errors?: number }> | null
  const sourcesNames = summaries
    ? Object.keys(summaries).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
    : 'Multi-source'

  // Répartition des signaux par source_type
  const signalsByType = (signals ?? []).reduce<Record<string, number>>((acc, s) => {
    const t = s.source_type ?? 'unknown'
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {})

  // Répartition par source
  const signalsBySource = (signals ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.source] = (acc[s.source] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="w-full flex-1 pb-20">

      {/* Retour */}
      <div className="mb-8">
        <Link href="/reports" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#2b3652] font-bold text-xs uppercase tracking-widest transition">
          <ArrowLeft className="w-4 h-4" /> Retour au Hub
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#257b57] block mb-2">
            Rapport de collecte
          </span>
          <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight mb-2">
            {sourcesNames}
          </h1>
        </div>
        <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-[12px] border ${
          run.status === 'completed'
            ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
            : run.status === 'failed'
            ? 'border-rose-200 text-rose-700 bg-rose-50'
            : 'border-amber-200 text-amber-700 bg-amber-50'
        }`}>
          {run.status === 'completed' ? 'Collecte terminée' : run.status === 'failed' ? 'Échec' : 'Partiel'}
        </span>
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">
              {new Date(run.started_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Signaux</p>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">{run.signals_collected ?? 0} collectés</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Analysés</p>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">{run.signals_analyzed ?? 0} analysés</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Opportunités</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">
              {(run.opportunities_created ?? 0) + (run.opportunities_updated ?? 0)} créées/mises à jour
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Colonne principale — Opportunités */}
        <div className="col-span-12 xl:col-span-8">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 border-b-[3px] border-[#257b57] pb-2 inline-block mb-6">
            Opportunités issues de cette collecte ({opportunities.length})
          </h2>

          {opportunities.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-dashed border-slate-300 p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <p className="text-slate-400 font-medium text-sm">Aucune opportunité liée à cette collecte.</p>
              <p className="text-slate-400 text-xs mt-2">Les signaux n'ont peut-être pas encore été analysés.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map(opp => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="block bg-white rounded-[24px] border border-transparent p-6 hover:border-[#2b3652]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all group hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#2b3652] group-hover:text-[#257b57] transition text-sm mb-2 truncate">
                        {opp.title}
                      </p>
                      {opp.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">{opp.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {opp.opportunity_type && (
                          <span className="px-2.5 py-1 rounded-[8px] bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {opp.opportunity_type.replace(/_/g, ' ')}
                          </span>
                        )}
                        {opp.target_market && (
                          <span className="px-2.5 py-1 rounded-[8px] bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {opp.target_market}
                          </span>
                        )}
                        {opp.complexity && (
                          <span className="px-2.5 py-1 rounded-[8px] bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {opp.complexity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`px-3 py-1.5 rounded-[10px] text-sm font-black border ${SCORE_COLOR(opp.score_global ?? 0)}`}>
                        {opp.score_global ?? 0}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#2b3652] transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — Stats + actions */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">

          {/* Répartition par type de source */}
          {Object.keys(signalsByType).length > 0 && (
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Signaux par type</h3>
              <div className="space-y-3">
                {Object.entries(signalsByType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-600 capitalize">{type}</span>
                      <span className="text-xs font-black text-[#2b3652]">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#257b57] rounded-full"
                        style={{ width: `${Math.round((count / (signals?.length ?? 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Répartition par source */}
          {Object.keys(signalsBySource).length > 0 && (
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Sources actives</h3>
              <div className="space-y-2">
                {Object.entries(signalsBySource).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                  <div key={src} className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-[16px] border border-[#F0F2F4]">
                    <span className="text-[11px] font-black text-[#1A1C1E] capitalize">{src}</span>
                    <span className="text-[10px] font-black text-[#257b57] bg-[#257b57]/10 px-2 py-0.5 rounded-[8px]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Générer un rapport IA */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-4 h-4 text-[#257b57]" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1A1C1E]">Générer un rapport IA</h3>
            </div>
            <p className="text-[#707478] text-xs font-medium mb-5">
              Analysez ces données plus en profondeur avec le moteur de rapports IA.
            </p>
            <div className="space-y-2">
              <Link
                href="/reports"
                className="flex items-center justify-between w-full px-4 py-3 border border-[#F0F2F4] text-[#707478] text-xs font-bold uppercase tracking-widest hover:border-[#E0E4E8] hover:text-[#1A1C1E] transition group"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Rapport par catégorie
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/reports"
                className="flex items-center justify-between w-full px-5 py-3.5 rounded-[16px] bg-[#FAFBFC] border border-[#F0F2F4] text-[#1A1C1E] text-[11px] font-black uppercase tracking-widest hover:border-[#E0E4E8] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  Rapport croisé
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
