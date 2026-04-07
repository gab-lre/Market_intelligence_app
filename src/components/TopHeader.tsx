'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Info, TrendingUp, FileText, Loader2 } from 'lucide-react'

const REPORT_TYPE_LABELS: Record<string, string> = {
  category: 'Rapport catégorie',
  cross: 'Rapport croisé',
  full: 'Rapport complet',
}

const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  saas: 'SaaS',
  ai_agent_service: 'Agent IA (service)',
  ai_agent_product: 'Agent IA (produit)',
  template: 'Template',
  micro_product: 'Micro-produit',
}

interface SearchResults {
  opportunities: { id: string; title: string; score_global: number; opportunity_type: string | null }[]
  reports: { id: string; type: string; title: string; created_at: string }[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function TopHeader() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch search results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then((data: SearchResults) => {
        setResults(data)
        setIsOpen(true)
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close on outside click
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [handleOutsideClick])

  const handleSelect = (href: string) => {
    setQuery('')
    setIsOpen(false)
    setResults(null)
    router.push(href)
  }

  const totalResults = (results?.opportunities.length ?? 0) + (results?.reports.length ?? 0)
  const hasResults = totalResults > 0

  return (
    <header className="flex justify-between items-center py-6 px-10 border-b border-slate-200 bg-white shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4 relative" ref={containerRef}>
        <div className={`flex items-center gap-3 bg-slate-50 px-5 py-3.5 border w-[400px] transition rounded-none ${isOpen ? 'border-[#00b4d8]' : 'border-slate-200 focus-within:border-[#00b4d8]/50'}`}>
          {loading
            ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0" />
            : <Search className="w-5 h-5 text-slate-400 shrink-0" />
          }
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (results && totalResults > 0) setIsOpen(true) }}
            placeholder="Rechercher une opportunité, un rapport..."
            className="bg-transparent border-none text-base text-slate-700 focus:outline-none w-full placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setIsOpen(false); setResults(null) }}
              className="text-slate-300 hover:text-slate-500 transition text-lg leading-none shrink-0"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white border border-slate-200 shadow-xl z-50 mt-1 max-h-[420px] overflow-y-auto">

            {!hasResults && !loading && (
              <div className="px-5 py-8 text-center">
                <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">
                  Aucun résultat pour <span className="font-bold text-slate-600">&quot;{query}&quot;</span>
                </p>
              </div>
            )}

            {/* Opportunities section */}
            {(results?.opportunities.length ?? 0) > 0 && (
              <div>
                <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Opportunités
                  </p>
                </div>
                {results!.opportunities.map(opp => (
                  <button
                    key={opp.id}
                    onClick={() => handleSelect(`/opportunities/${opp.id}`)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#f4f7fb] transition text-left border-b border-slate-50 last:border-0 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 bg-[#00b4d8] shrink-0" />
                      <span className="text-sm font-bold text-[#2b3652] truncate group-hover:text-[#00b4d8] transition">
                        {opp.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {opp.opportunity_type && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                          {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type] ?? opp.opportunity_type}
                        </span>
                      )}
                      <span className="text-[10px] font-black text-[#00b4d8] border border-[#00b4d8]/30 bg-[#e0f7fa] px-1.5 py-0.5">
                        {opp.score_global}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Reports section */}
            {(results?.reports.length ?? 0) > 0 && (
              <div>
                <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Rapports
                  </p>
                </div>
                {results!.reports.map(r => {
                  const href =
                    r.type === 'category' ? `/reports/category/${r.id}`
                    : r.type === 'cross' ? `/reports/cross/${r.id}`
                    : `/reports/full/${r.id}`
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(href)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#f4f7fb] transition text-left border-b border-slate-50 last:border-0 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-1.5 bg-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-[#2b3652] truncate group-hover:text-[#00b4d8] transition">
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 ml-3">
                        {REPORT_TYPE_LABELS[r.type] ?? r.type}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Footer hint */}
            {hasResults && (
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                  {totalResults} résultat{totalResults > 1 ? 's' : ''} — ↵ pour ouvrir
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition rounded-none"><Bell className="w-5 h-5" /></button>
        <button className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition rounded-none"><Info className="w-5 h-5" /></button>
        <div className="flex items-center gap-2 pl-2 cursor-pointer">
          <div className="w-10 h-10 bg-[#2b3652] text-white flex items-center justify-center font-bold text-sm rounded-none">AD</div>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </header>
  )
}
