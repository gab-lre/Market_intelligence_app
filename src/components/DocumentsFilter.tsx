'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database, BarChart2, Layers, Globe, ArrowUpRight, FileText, Search } from 'lucide-react'

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

const TAB_CONFIG: { key: 'all' | DocType; label: string; emoji: string }[] = [
  { key: 'all',        label: 'Tous',              emoji: '📂' },
  { key: 'collection', label: 'Collections',       emoji: '🗄️' },
  { key: 'category',   label: 'Par catégorie',     emoji: '📊' },
  { key: 'cross',      label: 'Croisé',            emoji: '🔀' },
  { key: 'full',       label: 'Rapport complet',   emoji: '🌐' },
]

const DOC_CONFIG: Record<DocType, {
  Icon: React.ElementType; iconBg: string; iconColor: string;
  badgeBg: string; badgeText: string; badgeLabel: string;
}> = {
  collection: {
    Icon: Database,
    iconBg: 'bg-[#F4F6F8]', iconColor: 'text-[#707478]',
    badgeBg: 'bg-[#F4F6F8]', badgeText: 'text-[#707478]', badgeLabel: 'Collection',
  },
  category: {
    Icon: BarChart2,
    iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-50', badgeText: 'text-blue-600', badgeLabel: 'Catégorie',
  },
  cross: {
    Icon: Layers,
    iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-50', badgeText: 'text-purple-600', badgeLabel: 'Croisé',
  },
  full: {
    Icon: Globe,
    iconBg: 'bg-[#E6F4EA]', iconColor: 'text-[#257b57]',
    badgeBg: 'bg-[#E6F4EA]', badgeText: 'text-[#257b57]', badgeLabel: 'Complet',
  },
}

interface Props { documents: DocumentItem[] }

export default function DocumentsFilter({ documents }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | DocType>('all')
  const [sort, setSort] = useState<'date' | 'type'>('date')
  const [search, setSearch] = useState('')

  const filtered = documents
    .filter(d => activeTab === 'all' || d.docType === activeTab)
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'type') return a.docType.localeCompare(b.docType)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        {/* Tab pills */}
        <div className="flex items-center bg-white rounded-2xl p-1 gap-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F0F2F4]">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#1A1C1E] text-white shadow-sm'
                  : 'text-[#707478] hover:text-[#1A1C1E]'
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-[#F0F2F4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-[#E0E0E0] transition-all">
          <Search className="w-4 h-4 text-[#A0A4A8] shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-[13px] font-medium text-[#1A1C1E] focus:outline-none w-full placeholder:text-[#A0A4A8]"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0 bg-white rounded-2xl px-4 py-2.5 border border-[#F0F2F4] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Tri</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as 'date' | 'type')}
            className="text-[12px] font-bold text-[#1A1C1E] bg-transparent border-none focus:outline-none appearance-none cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="type">Type</option>
          </select>
        </div>

        {/* Count */}
        <p className="text-[11px] font-bold text-[#707478] ml-auto shrink-0">
          <span className="text-[#1A1C1E] font-black">{sorted.length}</span> document{sorted.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto plugin-noscrollbar min-h-0">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#A0A4A8] py-16">
            <FileText className="w-10 h-10 mb-3 opacity-20" strokeWidth={1.5} />
            <p className="text-[13px] font-medium">Aucun document trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sorted.map(doc => {
              const cfg = DOC_CONFIG[doc.docType]
              return (
                <Link
                  key={`${doc.docType}-${doc.id}`}
                  href={doc.href}
                  className="group bg-white rounded-[24px] border border-[#F0F2F4] hover:border-[#E0E0E0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3.5 p-5 pb-4">
                    <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                      <cfg.Icon className={`w-5 h-5 ${cfg.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5 ${cfg.badgeBg} ${cfg.badgeText}`}>
                        {cfg.badgeLabel}
                      </span>
                      <p className="font-bold text-[13px] text-[#1A1C1E] leading-snug truncate group-hover:text-[#257b57] transition-colors">
                        {doc.title}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[#F4F6F8] mt-auto">
                    <div>
                      {doc.subtitle && (
                        <p className="text-[10px] text-[#707478] font-medium truncate max-w-[160px]">{doc.subtitle}</p>
                      )}
                      <p className="text-[10px] text-[#A0A4A8] font-bold mt-0.5">
                        {new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#D0D4D8] group-hover:text-[#257b57] transition-colors shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
