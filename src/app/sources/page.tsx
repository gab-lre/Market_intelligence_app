import { Briefcase, Users, Rocket, Star, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { getSources } from '@/lib/data'
import Link from 'next/link'
import LaunchRunButton from '@/components/LaunchRunButton'
import SourceStartButton from '@/components/SourceStartButton'
import AnalyzePendingButton from '@/components/AnalyzePendingButton'

// ──────────────────────────────────────────────
// Présentation des catégories (icône et couleur par identifiant)
// ──────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { icon: typeof Briefcase; color: string }> = {
  emploi:     { icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
  communaute: { icon: Users,     color: 'bg-purple-50 text-purple-600' },
  reviews:    { icon: Star,      color: 'bg-amber-50 text-amber-600' },
  startup:    { icon: Rocket,    color: 'bg-[#E6F4EA] text-[#257b57]' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default async function SourcesPage() {
  const { categories, history, lastRunBySource: lastRunMap } = await getSources()

  // KPIs
  const totalSources = categories.flatMap(c => c.sources).length
  const activeSources = Object.values(lastRunMap).filter(v => v !== null).length
  const lastRun = history?.[0]

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 pb-4 w-full">

      {/* ─── Header & Actions Rapides ─── */}
      <div className="flex items-start justify-between shrink-0 mb-4">
        <div>
          <h1 className="text-[22px] font-black text-[#1A1C1E] tracking-tight">Sources de données</h1>
          <p className="text-[13px] text-[#707478] font-medium mt-0.5">Gérez et lancez la collecte de signaux marché.</p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-[250px]">
            <AnalyzePendingButton />
          </div>
          <div className="w-[250px]">
            <LaunchRunButton />
          </div>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#257b57]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-black text-[#1A1C1E] leading-none">{activeSources}<span className="text-sm font-bold text-[#707478]">/{totalSources}</span></p>
            <p className="text-[10px] font-bold text-[#707478] mt-1">Sources collectées</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-black text-[#1A1C1E] leading-none">
              {lastRun ? formatDateShort(lastRun.started_at) : '—'}
            </p>
            <p className="text-[10px] font-bold text-[#707478] mt-1">Dernière collecte</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-black text-[#1A1C1E] leading-none">{history?.length ?? 0}</p>
            <p className="text-[10px] font-bold text-[#707478] mt-1">Exécutions totales</p>
          </div>
        </div>
      </div>

      {/* ─── Source Categories ─── */}
      <div className="flex-1 overflow-y-auto plugin-noscrollbar space-y-3 min-h-0">
        {categories.map((cat) => {
          const { icon: CatIcon, color } = CATEGORY_STYLE[cat.id] ?? CATEGORY_STYLE.startup
          const sourceKeys = cat.sources.map(s => s.key)
          return (
            <div key={cat.id} className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {/* Category Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <CatIcon strokeWidth={2} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#1A1C1E] text-[15px]">{cat.name}</h3>
                    <p className="text-[11px] text-[#707478] font-medium mt-0.5">{cat.desc}</p>
                  </div>
                </div>
                <SourceStartButton sourceNames={sourceKeys} label="Lancer" />
              </div>

              {/* Sources grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {cat.sources.map((source) => {
                  const runInfo = lastRunMap[source.key]
                  return (
                    <div key={source.key} className="bg-[#FAFBFC] border border-[#F0F2F4] rounded-2xl p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xl leading-none">{source.emoji}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                          source.type === 'Crédits'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-[#E6F4EA] text-[#257b57] border-[#257b57]/20'
                        }`}>
                          {source.type}
                        </span>
                      </div>
                      <p className="font-black text-[12px] text-[#1A1C1E] leading-tight">{source.name}</p>
                      <p className="text-[10px] text-[#A0A4A8] font-medium leading-tight line-clamp-2">{source.desc}</p>
                      <div className="mt-auto pt-1 flex items-center gap-1.5">
                        {runInfo ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#257b57] shrink-0" />
                            <span className="text-[9px] font-bold text-[#257b57]">{runInfo.collected} signaux</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D0D4D8] shrink-0" />
                            <span className="text-[9px] font-bold text-[#A0A4A8]">Jamais lancé</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* ─── Historique ─── */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-[#1A1C1E] text-[15px]">Historique des exécutions</h3>
              <p className="text-[11px] text-[#707478] font-medium mt-0.5">Les {history?.length ?? 0} dernières collectes réalisées</p>
            </div>
          </div>

          {(!history || history.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#A0A4A8]">
              <Calendar className="w-8 h-8 mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-sm font-medium">Aucune collecte effectuée</p>
              <p className="text-xs mt-1 opacity-70">Lancez votre première collecte pour commencer.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#F0F2F4]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAFBFC] border-b border-[#F0F2F4]">
                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Date</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Statut</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Sources</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] text-right">Signaux</th>
                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] text-right">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => {
                    const summaries = row.results_summary
                    const sourceNames = summaries
                      ? Object.keys(summaries).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
                      : '—'
                    return (
                      <tr key={row.id} className="border-b border-[#F4F6F8] hover:bg-[#FAFBFC] transition-colors group">
                        <td className="py-3.5 px-4 text-[12px] font-medium text-[#1A1C1E] whitespace-nowrap">
                          {formatDate(row.started_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                            row.status === 'completed' ? 'bg-[#E6F4EA] text-[#257b57] border-[#257b57]/20' :
                            row.status === 'partial'   ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            row.status === 'failed'    ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                          'bg-[#F4F6F8] text-[#707478] border-[#E0E0E0]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'completed' ? 'bg-[#257b57]' :
                              row.status === 'partial'   ? 'bg-amber-500' :
                              row.status === 'failed'    ? 'bg-rose-500' : 'bg-[#A0A4A8]'
                            }`} />
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#707478] font-medium max-w-[200px] truncate">
                          {sourceNames}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[13px] text-[#1A1C1E]">
                          {row.signals_collected}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/reports/source/${row.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#707478] hover:text-[#257b57] transition-colors group-hover:text-[#257b57]"
                          >
                            Voir
                            <Calendar className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
