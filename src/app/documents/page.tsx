import { FolderOpen } from 'lucide-react'
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

  for (const r of reports ?? []) {
    const href =
      r.type === 'category' ? `/reports/category/${r.id}`
      : r.type === 'cross'  ? `/reports/cross/${r.id}`
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

  for (const c of collections ?? []) {
    const summaries = c.results_summary as Record<string, unknown> | null
    const sourceNames = summaries
      ? Object.keys(summaries).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
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

  const totalReports    = reports?.length ?? 0
  const totalCollections = collections?.length ?? 0

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 pl-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[22px] font-black text-[#1A1C1E] tracking-tight">Mes Documents</h1>
          <p className="text-[13px] text-[#707478] font-medium mt-0.5">
            Base documentaire centralisée — rapports IA et historiques de collecte.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-5 shrink-0 bg-white rounded-2xl px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F0F2F4]">
          <div className="text-center">
            <p className="text-xl font-black text-[#1A1C1E] leading-none">{totalReports + totalCollections}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#A0A4A8] mt-1">Total</p>
          </div>
          <div className="w-px h-8 bg-[#F0F2F4]" />
          <div className="text-center">
            <p className="text-xl font-black text-[#257b57] leading-none">{totalReports}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#A0A4A8] mt-1">Rapports</p>
          </div>
          <div className="w-px h-8 bg-[#F0F2F4]" />
          <div className="text-center">
            <p className="text-xl font-black text-[#707478] leading-none">{totalCollections}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#A0A4A8] mt-1">Collections</p>
          </div>
        </div>
      </div>

      {/* Documents grid */}
      <DocumentsFilter documents={documents} />
    </div>
  )
}
