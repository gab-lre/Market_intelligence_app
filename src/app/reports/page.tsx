import { FileText, ArrowRight, Layers, Globe, Users, Briefcase, Rocket } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CategoryReportButton from '@/components/CategoryReportButton'
import CrossReportBuilder from '@/components/CrossReportBuilder'
import FullReportButton from '@/components/FullReportButton'
import type { GeneratedReport } from '@/types/database'

const REPORT_TYPE_LABELS: Record<string, string> = {
  category: 'Rapport catégorie',
  cross: 'Rapport croisé',
  full: 'Rapport complet',
}

const CATEGORY_CONFIG = [
  {
    key: 'job' as const,
    label: 'Emplois & Missions Freelance',
    desc: 'Offres d\'emploi, missions Upwork, Malt, France Travail, LinkedIn, Indeed',
    icon: <Briefcase className="w-6 h-6 text-[#00b4d8]" />,
  },
  {
    key: 'community' as const,
    label: 'Communautés & Insights',
    desc: 'Dev.to, Reddit, Hacker News, avis G2',
    icon: <Users className="w-6 h-6 text-[#00b4d8]" />,
  },
  {
    key: 'startup' as const,
    label: 'Écosystème Startups',
    desc: 'Wellfound, Product Hunt, Indie Hackers',
    icon: <Rocket className="w-6 h-6 text-[#00b4d8]" />,
  },
]

export default async function ReportsHubPage() {
  const { data: history } = await supabase
    .from('collections_history')
    .select('id, started_at, status, results_summary, signals_collected')
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(5)

  const { data: recentReports } = await supabase
    .from('generated_reports')
    .select('id, type, title, created_at, sources_used, status')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-[#2b3652] tracking-tight mb-2">Market Intelligence Hub</h1>
          <p className="text-slate-500 text-sm font-medium">Générez des rapports d'analyse IA profonds selon vos critères.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Colonne Principale */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">

          {/* Rapports par catégorie */}
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-6">
              Rapports par catégorie de sources
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {CATEGORY_CONFIG.map(cat => (
                <div key={cat.key} className="bg-white border border-slate-200 p-8 hover:border-[#00b4d8]/40 transition">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 bg-[#f4f7fb] flex items-center justify-center shrink-0">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-[#2b3652] mb-1">{cat.label}</h3>
                      <p className="text-xs text-slate-500 font-medium">{cat.desc}</p>
                    </div>
                  </div>
                  <CategoryReportButton category={cat.key} label={cat.label} />
                </div>
              ))}
            </div>
          </div>

          {/* Rapport croisé */}
          <div className="bg-white border border-slate-200 p-10 hover:border-[#00b4d8]/50 transition">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-6">
              Analyse croisée de sources
            </h2>
            <h3 className="text-2xl font-black text-[#2b3652] mb-2 flex items-center gap-3">
              <Layers className="w-6 h-6 text-[#00b4d8]" />
              Rapport croisé multi-sources
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Sélectionnez 2 ou 3 catégories pour identifier les convergences et divergences de marché.
            </p>
            <CrossReportBuilder />
          </div>

          {/* Rapport complet */}
          <div className="bg-[#2b3652] text-white p-10 relative overflow-hidden group shadow-xl hover:shadow-2xl transition duration-500">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00b4d8] opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-white/10 flex items-center justify-center border border-white/10">
                  <Globe className="w-8 h-8 text-[#00b4d8]" />
                </div>
                <span className="px-3 py-1 bg-[#00b4d8]/20 text-[#00b4d8] text-[9px] font-black tracking-widest uppercase border border-[#00b4d8]/30">
                  Premium Report
                </span>
              </div>
              <h2 className="text-3xl font-black mb-3 text-white">Global Intelligence Report</h2>
              <p className="text-white/60 font-medium mb-8 max-w-xl leading-relaxed">
                Fusionne toutes les sources pour générer un rapport exhaustif du marché B2B SaaS. 6 sections structurées, analyse concurrentielle, top opportunités personnalisées.
              </p>
              <FullReportButton />
            </div>
          </div>

        </div>

        {/* Colonne Latérale */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          {/* Spacer invisible — exactes mêmes classes CSS que le h2 de gauche pour un alignement garanti au pixel */}
          <div aria-hidden="true" className="hidden xl:inline-block text-[11px] font-black uppercase tracking-widest border-b-[3px] border-transparent pb-2 invisible pointer-events-none select-none">x</div>

          {/* Rapports générés récents */}
          {recentReports && recentReports.length > 0 && (
            <div className="bg-white border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <FileText className="w-5 h-5 text-[#00b4d8]" />
                <h3 className="font-black text-sm uppercase tracking-widest text-[#2b3652]">Rapports générés</h3>
              </div>
              <div className="space-y-3">
                {(recentReports as GeneratedReport[]).map(r => {
                  const href = r.type === 'category'
                    ? `/reports/category/${r.id}`
                    : r.type === 'cross'
                    ? `/reports/cross/${r.id}`
                    : `/reports/full/${r.id}`
                  return (
                    <Link key={r.id} href={href} className="block p-3 border border-slate-100 hover:border-[#00b4d8]/30 transition bg-slate-50/50 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#00b4d8]">
                          {REPORT_TYPE_LABELS[r.type] ?? r.type}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold">
                          {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#2b3652]">{r.title}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rapports par collecte */}
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-[#00b4d8]" />
              <h3 className="font-black text-sm uppercase tracking-widest text-[#2b3652]">Rapports par collecte</h3>
            </div>
            <p className="text-slate-500 text-xs font-medium mb-6">Rapports générés suite à chaque cycle d'ingestion.</p>
            <div className="space-y-4">
              {!history || history.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-10 border border-dashed border-slate-200">
                  Aucune collecte terminée.
                </p>
              ) : (
                history.map(run => {
                  const summaries = run.results_summary as Record<string, unknown>
                  const sourcesNames = summaries
                    ? Object.keys(summaries).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
                    : 'Source Mixte'
                  return (
                    <div key={run.id} className="group border border-slate-100 hover:border-[#00b4d8]/30 transition bg-slate-50/50">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#00b4d8]">
                            {sourcesNames || 'Inconnu'}
                          </span>
                          <span className="text-slate-400 text-[10px] font-bold">
                            {new Date(run.started_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Rapport d'analyse contextuelle</p>
                        <p className="text-xs text-slate-500 font-medium">{run.signals_collected} signaux collectés.</p>
                      </div>
                      <Link
                        href={`/reports/source/${run.id}`}
                        className="flex items-center justify-center gap-2 border-t border-slate-100 py-2.5 text-[10px] uppercase font-bold tracking-widest text-[#2b3652] hover:bg-[#2b3652] hover:text-white transition-colors"
                      >
                        Consulter <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
            <div className="mt-6 text-center">
              <Link href="/sources" className="text-xs font-bold text-[#00b4d8] hover:underline">
                Gérer les collecteurs &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
