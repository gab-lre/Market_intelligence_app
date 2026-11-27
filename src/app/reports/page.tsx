import { BarChart2, ArrowUpRight, Briefcase, Users, Rocket, Globe, Layers, FileText } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CategoryReportButton from '@/components/CategoryReportButton'
import CrossReportBuilder from '@/components/CrossReportBuilder'
import FullReportButton from '@/components/FullReportButton'
import type { GeneratedReport } from '@/types/database'

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<string, string> = {
  category: 'Rapport catégorie',
  cross:    'Rapport croisé',
  full:     'Rapport complet',
}

const CATEGORY_CONFIG = [
  {
    key: 'job' as const,
    label: 'Emplois & Missions Freelance',
    desc: 'Offres d\'emploi, missions Upwork, Malt, France Travail, LinkedIn, Indeed',
    emoji: '💼',
    icon: Briefcase,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'community' as const,
    label: 'Communautés & Insights',
    desc: 'Dev.to, Reddit, Hacker News, avis G2 sur logiciels B2B',
    emoji: '👥',
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    key: 'startup' as const,
    label: 'Écosystème Startups',
    desc: 'Wellfound, Product Hunt, écosystème startup',
    emoji: '🚀',
    icon: Rocket,
    color: 'bg-[#E6F4EA] text-[#257b57]',
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

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
    .limit(10)

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 pb-4 pl-4">

      {/* ─── Header ─── */}
      <div className="shrink-0">
        <h1 className="text-[22px] font-black text-[#1A1C1E] tracking-tight">Rapports IA</h1>
        <p className="text-[13px] text-[#707478] font-medium mt-0.5">Générez des analyses de marché profondes selon vos critères.</p>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 overflow-y-auto plugin-noscrollbar min-h-0">
        <div className="grid grid-cols-12 gap-4">

          {/* ─── Left Column — Generators ─── */}
          <div className="col-span-12 xl:col-span-7 flex flex-col gap-4">

            {/* Rapports par catégorie */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#F4F6F8] flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-[#1A1C1E]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-black text-[#1A1C1E] text-[15px]">Rapports par catégorie</h2>
                  <p className="text-[11px] text-[#707478] font-medium">Analyse IA d'une catégorie de sources.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {CATEGORY_CONFIG.map(cat => (
                  <div key={cat.key} className="flex items-center justify-between gap-4 p-4 bg-[#FAFBFC] rounded-2xl border border-[#F0F2F4] hover:border-[#E0E0E0] transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
                        <cat.icon strokeWidth={2} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[13px] text-[#1A1C1E] truncate">{cat.label}</p>
                        <p className="text-[10px] text-[#A0A4A8] font-medium truncate">{cat.desc}</p>
                      </div>
                    </div>
                    <div className="shrink-0 w-44">
                      <CategoryReportButton category={cat.key} label={cat.label} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapport croisé */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-purple-600" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-black text-[#1A1C1E] text-[15px]">Analyse croisée multi-sources</h2>
                  <p className="text-[11px] text-[#707478] font-medium">Sélectionnez 2+ catégories pour identifier les convergences.</p>
                </div>
              </div>
              <CrossReportBuilder />
            </div>

            {/* Rapport complet */}
            <div className="bg-[#1A1C1E] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative overflow-hidden">
              {/* Decorative orb */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#257b57] opacity-10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500 opacity-5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#257b57]" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#257b57] bg-[#257b57]/15 px-2 py-0.5 rounded-full">Premium</span>
                      <h2 className="font-black text-white text-[16px] mt-1">Global Intelligence Report</h2>
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-[12px] font-medium mb-5 leading-relaxed max-w-md">
                  Fusionne toutes les sources pour générer un rapport exhaustif du marché B2B SaaS. 6 sections structurées, analyse concurrentielle, top opportunités personnalisées.
                </p>
                <FullReportButton />
              </div>
            </div>

          </div>

          {/* ─── Right Column — History ─── */}
          <div className="col-span-12 xl:col-span-5 flex flex-col gap-4">

            {/* Rapports récents */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#257b57]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-black text-[#1A1C1E] text-[14px]">Rapports générés</h3>
                  <p className="text-[10px] text-[#707478] font-medium">Vos analyses IA récentes</p>
                </div>
              </div>

              {(!recentReports || recentReports.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#A0A4A8]">
                  <FileText className="w-8 h-8 mb-2 opacity-20" strokeWidth={1.5} />
                  <p className="text-[12px] font-medium">Aucun rapport généré</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(recentReports as GeneratedReport[]).map(r => {
                    const href = r.type === 'category'
                      ? `/reports/category/${r.id}`
                      : r.type === 'cross'
                      ? `/reports/cross/${r.id}`
                      : `/reports/full/${r.id}`
                    const typeColor = r.type === 'full'
                      ? 'text-[#257b57] bg-[#E6F4EA]'
                      : r.type === 'cross'
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-blue-600 bg-blue-50'
                    return (
                      <Link key={r.id} href={href} className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#F0F2F4] hover:border-[#E0E0E0] hover:bg-[#FAFBFC] transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${typeColor}`}>
                              {REPORT_TYPE_LABELS[r.type] ?? r.type}
                            </span>
                            <span className="text-[10px] text-[#A0A4A8] font-medium">{formatDate(r.created_at)}</span>
                          </div>
                          <p className="text-[13px] font-bold text-[#1A1C1E] truncate group-hover:text-[#257b57] transition-colors">{r.title}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#D0D4D8] group-hover:text-[#257b57] transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Rapports par collecte */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-amber-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-black text-[#1A1C1E] text-[14px]">Rapports par collecte</h3>
                  <p className="text-[10px] text-[#707478] font-medium">Analyses issues des collectes récentes</p>
                </div>
              </div>

              {(!history || history.length === 0) ? (
                <p className="text-[12px] text-[#A0A4A8] font-medium text-center py-6">
                  Aucune collecte terminée.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map(run => {
                    const summaries = run.results_summary as Record<string, unknown>
                    const sourcesNames = summaries
                      ? Object.keys(summaries).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
                      : 'Multi-source'
                    return (
                      <Link
                        key={run.id}
                        href={`/reports/source/${run.id}`}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#F0F2F4] hover:border-[#E0E0E0] hover:bg-[#FAFBFC] transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] text-[#A0A4A8] font-medium">{formatDate(run.started_at)}</span>
                            <span className="text-[9px] font-bold text-[#257b57] bg-[#E6F4EA] px-2 py-0.5 rounded-full">{run.signals_collected} signaux</span>
                          </div>
                          <p className="text-[12px] font-bold text-[#1A1C1E] truncate group-hover:text-[#257b57] transition-colors">
                            {sourcesNames}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#D0D4D8] group-hover:text-[#257b57] transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#F4F6F8]">
                <Link href="/sources" className="text-[11px] font-bold text-[#707478] hover:text-[#257b57] transition-colors">
                  Gérer les sources →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
