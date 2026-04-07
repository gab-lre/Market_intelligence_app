'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database, BarChart2, Layers, Globe, ArrowRight, FileText } from 'lucide-react'

export type DocType = 'collection' | 'category' | 'cross' | 'full'

export interface DocumentItem {
  id: string
  docType: DocType
  title: string
  date: string
  subtitle?: string
  href: string
  meta?: string
}

const TAB_CONFIG: { key: 'all' | DocType; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'collection', label: 'Collections' },
  { key: 'category', label: 'Rapport catégorie' },
  { key: 'cross', label: 'Rapport croisé' },
  { key: 'full', label: 'Rapport complet' },
]

const DOC_CONFIG: Record<DocType, { icon: React.ReactNode; badgeClass: string; badgeLabel: string }> = {
  collection: {
    icon: <Database className="w-5 h-5 text-slate-500" />,
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeLabel: 'Collection',
  },
  category: {
    icon: <BarChart2 className="w-5 h-5 text-[#00b4d8]" />,
    badgeClass: 'bg-[#e0f7fa] text-[#00b4d8] border-[#00b4d8]/20',
    badgeLabel: 'Catégorie',
  },
  cross: {
    icon: <Layers className="w-5 h-5 text-indigo-500" />,
    badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    badgeLabel: 'Croisé',
  },
  full: {
    icon: <Globe className="w-5 h-5 text-[#2b3652]" />,
    badgeClass: 'bg-[#2b3652]/10 text-[#2b3652] border-[#2b3652]/20',
    badgeLabel: 'Rapport complet',
  },
}

interface Props {
  documents: DocumentItem[]
}

export default function DocumentsFilter({ documents }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | DocType>('all')
  const [sort, setSort] = useState<'date' | 'type'>('date')

  const filtered = documents.filter(d => activeTab === 'all' || d.docType === activeTab)
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'type') return a.docType.localeCompare(b.docType)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition ${
                activeTab === tab.key
                  ? 'bg-[#2b3652] text-white'
                  : 'text-slate-500 hover:text-[#2b3652] hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trier par</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as 'date' | 'type')}
            className="text-[11px] font-bold text-[#2b3652] border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:border-[#00b4d8] transition appearance-none pr-6"
          >
            <option value="date">Date</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
        {sorted.length} document{sorted.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 bg-white">
          <FileText className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-slate-400 text-sm font-medium">Aucun document dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(doc => {
            const cfg = DOC_CONFIG[doc.docType]
            return (
              <Link
                key={`${doc.docType}-${doc.id}`}
                href={doc.href}
                className="group bg-white border border-slate-200 hover:border-[#00b4d8]/50 hover:shadow-md transition flex flex-col"
              >
                {/* Card header */}
                <div className="flex items-start gap-4 p-5 border-b border-slate-100">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${cfg.badgeClass}`}>
                        {cfg.badgeLabel}
                      </span>
                    </div>
                    <p className="font-black text-[#2b3652] text-sm leading-tight truncate group-hover:text-[#00b4d8] transition">
                      {doc.title}
                    </p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between px-5 py-3 mt-auto">
                  <div>
                    {doc.subtitle && (
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">{doc.subtitle}</p>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00b4d8] transition shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
