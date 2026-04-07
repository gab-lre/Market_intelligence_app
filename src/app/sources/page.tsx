import { Database, DownloadCloud, RefreshCw, FileText, Briefcase, Users, Rocket, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import LaunchRunButton from '@/components/LaunchRunButton'
import SourceStartButton from '@/components/SourceStartButton'

const CATEGORIES = [
  {
    id: 'emploi',
    name: 'Emplois & Missions Freelance',
    desc: 'Besoins directs d\'entreprises et requêtes de freelances',
    icon: <Briefcase className="w-6 h-6" />,
    sources: [
      { name: 'Upwork', sourceKey: 'upwork', type: 'Crédits', desc: 'Plateforme freelance mondiale' },
      { name: 'Malt', sourceKey: 'malt', type: 'Crédits', desc: 'Plateforme freelance FR' },
      { name: 'France Travail', sourceKey: 'francetravail', type: 'Gratuit', desc: 'Offres d\'emploi traditionnelles' },
      { name: 'LinkedIn', sourceKey: 'linkedin', type: 'Crédits', desc: 'Réseau pro (offres B2B)' },
      { name: 'Indeed', sourceKey: 'indeed', type: 'Crédits', desc: 'Offres d\'emploi internationales' },
    ]
  },
  {
    id: 'communaute',
    name: 'Communautés & Insights',
    desc: 'Discussions ouvertes, problèmes techniques partagés et avis',
    icon: <Users className="w-6 h-6" />,
    sources: [
      { name: 'Dev.to', sourceKey: 'devto', type: 'Gratuit', desc: 'Communauté de développeurs' },
      { name: 'Reddit', sourceKey: 'reddit', type: 'Gratuit', desc: 'Forums spécialisés (SaaS, startups..)' },
      { name: 'Hacker News', sourceKey: 'hackernews', type: 'Gratuit', desc: 'Tech & Startups discussions' },
      { name: 'G2', sourceKey: 'g2', type: 'Crédits', desc: 'Avis sur des logiciels B2B existants' },
    ]
  },
  {
    id: 'startup',
    name: 'Écosystème Startups',
    desc: 'Offres spécialisées dans le domaine des startups et de l\'innovation',
    icon: <Rocket className="w-6 h-6" />,
    sources: [
      { name: 'Wellfound', sourceKey: 'wellfound', type: 'Crédits', desc: 'Jobs en Startups et SaaS' },
    ]
  }
]

type SourceSummaryEntry = { collected: number; errors: number; durationMs: number }

function buildLastRunMap(
  history: Array<{ started_at: string; results_summary: Record<string, unknown> | null }>
): Record<string, { date: string; collected: number } | null> {
  const map: Record<string, { date: string; collected: number } | null> = {}
  const allSourceKeys = CATEGORIES.flatMap(c => c.sources.map(s => s.sourceKey))
  
  for (const key of allSourceKeys) {
    map[key] = null
    for (const row of history) {
      const summary = row.results_summary as Record<string, SourceSummaryEntry> | null
      if (summary && summary[key]) {
        map[key] = { date: row.started_at, collected: summary[key].collected }
        break
      }
    }
  }
  return map
}

function getCategoryList(summary: Record<string, unknown> | null): React.ReactNode {
  if (!summary) return <span className="text-slate-400 font-medium">-</span>
  const keys = Object.keys(summary)
  if (keys.length === 0) return <span className="text-slate-400">-</span>
  
  const affectedCategories = new Set<string>()
  for (const key of keys) {
    for (const cat of CATEGORIES) {
      if (cat.sources.find(s => s.sourceKey === key)) {
        affectedCategories.add(cat.name)
      }
    }
  }

  const catArray = Array.from(affectedCategories)
  if (catArray.length === 0) return <span className="text-slate-400 font-medium text-xs">Sources Inconnues</span>

  return (
    <div className="flex flex-wrap gap-1.5">
      {catArray.map(cat => (
        <span key={cat} className="inline-block px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-slate-100 text-[#2b3652] border border-slate-200">
          {cat}
        </span>
      ))}
    </div>
  )
}

export default async function SourcesPage() {
  const { data: history } = await supabase
    .from('collections_history')
    .select('id, started_at, finished_at, status, results_summary, signals_collected')
    .order('started_at', { ascending: false })
    .limit(10)

  const lastRunMap = buildLastRunMap(history ?? [])

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">

      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-[#2b3652] tracking-tight mb-2">Sources</h1>
          <p className="text-slate-500 text-sm font-medium">Gérez et lancez massivement la collecte par typologie de marché.</p>
        </div>
        <LaunchRunButton label="Analyse Globale IA" icon={<RefreshCw className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-8 mb-16">
        {CATEGORIES.map((category) => {
          const sourceKeys = category.sources.map(s => s.sourceKey);
          
          return (
            <div key={category.id} className="bg-white border border-slate-200 p-8 shadow-sm rounded-none">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center text-[#2b3652] rounded-none shrink-0">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#2b3652] mb-1">{category.name}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl">{category.desc}</p>
                  </div>
                </div>
                
                <div className="shrink-0 w-full md:w-auto">
                   <SourceStartButton 
                      sourceNames={sourceKeys} 
                      label="Lancer l'analyse" 
                   />
                </div>
              </div>

              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#00b4d8] select-none list-none [&::-webkit-details-marker]:hidden border-t border-slate-100 pt-6">
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  Voir le détail des {category.sources.length} sources
                </summary>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.sources.map((source) => {
                    const runInfo = lastRunMap[source.sourceKey]
                    return (
                      <div key={source.sourceKey} className="bg-slate-50 border border-slate-200 p-5 rounded-none">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-sm text-[#2b3652]">{source.name}</span>
                           <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded-sm border ${source.type === 'Crédits' ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                             {source.type}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{source.desc}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          {runInfo ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-[#00b4d8] rounded-full"></span>
                              {new Date(runInfo.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              <span className="text-slate-300 mx-0.5">·</span>
                              {runInfo.collected} signaux
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Jamais lancé
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </details>

            </div>
          )
        })}
      </div>

      <div className="bg-[#2b3652] p-1 shadow-xl">
        <div className="bg-white p-8 border border-slate-200 min-h-[300px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#00b4d8] pb-2 inline-block">Historique des exécutions</h3>
            <span className="text-slate-400 font-bold tracking-widest text-lg leading-none">..</span>
          </div>

          {(!history || history.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <DownloadCloud className="w-10 h-10 text-slate-300 mb-4" />
              <p className="text-[#2b3652] font-bold text-sm">Aucun historique disponible</p>
              <p className="text-slate-500 text-xs mt-1">Lancez une collecte manuellement pour commencer l'ingestion.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Sources Impactées</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Signaux Collectés</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-4 px-6 text-sm font-medium text-slate-700 w-[150px]">
                      {new Date(row.started_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 w-[100px]">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border ${
                        row.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        row.status === 'partial'   ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        row.status === 'failed'    ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                      'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>{row.status}</span>
                    </td>
                    <td className="py-4 px-6 text-left">
                      {getCategoryList(row.results_summary as Record<string, unknown> | null)}
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-slate-700 text-right w-[150px]">{row.signals_collected}</td>
                    <td className="py-4 px-6 text-right w-[150px]">
                      <Link 
                        href={`/reports/source/${row.id}`}
                        className="inline-flex items-center justify-center text-[#00b4d8] hover:text-[#0096b4] font-black text-[10px] uppercase tracking-widest transition-colors group"
                      >
                        Générer <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
