import { Folder } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import DocumentsFilter from '@/components/DocumentsFilter'
import type { DocumentItem } from '@/components/DocumentsFilter'

export default async function DocumentsPage() {
  const [{ data: reports }, { data: collections }] = await Promise.all([
    supabase
      .from('generated_reports')
      .select('id, type, title, created_at, sources_used, status')
      .eq('status', 'completed')
      .order('created_at', { ascending: false }),
    supabase
      .from('collections_history')
      .select('id, started_at, status, results_summary, signals_collected')
      .eq('status', 'completed')
      .order('started_at', { ascending: false }),
  ])

  const documents: DocumentItem[] = []

  // AI reports
  for (const r of reports ?? []) {
    const href =
      r.type === 'category'
        ? `/reports/category/${r.id}`
        : r.type === 'cross'
        ? `/reports/cross/${r.id}`
        : `/reports/full/${r.id}`
    documents.push({
      id: r.id,
      docType: r.type as 'category' | 'cross' | 'full',
      title: r.title,
      date: r.created_at,
      subtitle: r.sources_used?.join(', ') || undefined,
      href,
    })
  }

  // Collection reports
  for (const c of collections ?? []) {
    const summaries = c.results_summary as Record<string, unknown> | null
    const sourceNames = summaries
      ? Object.keys(summaries)
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join(', ')
      : 'Sources mixtes'
    documents.push({
      id: c.id,
      docType: 'collection',
      title: `Collecte — ${sourceNames}`,
      date: c.started_at,
      subtitle: `${c.signals_collected ?? 0} signaux collectés`,
      href: `/reports/source/${c.id}`,
    })
  }

  const totalReports = (reports?.length ?? 0)
  const totalCollections = collections?.length ?? 0

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#e0f7fa] flex items-center justify-center">
              <Folder className="w-5 h-5 text-[#00b4d8]" />
            </div>
            <h1 className="text-3xl font-black text-[#2b3652] tracking-tight">Documents</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium ml-13">
            Accédez à l'ensemble de vos rapports et collectes. Base de données centralisée.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-2xl font-black text-[#2b3652]">{totalReports + totalCollections}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-right">
            <p className="text-2xl font-black text-[#00b4d8]">{totalReports}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rapports IA</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-right">
            <p className="text-2xl font-black text-slate-500">{totalCollections}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collections</p>
          </div>
        </div>
      </div>

      <DocumentsFilter documents={documents} />
    </div>
  )
}
