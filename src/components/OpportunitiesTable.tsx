'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { OpportunityDepartment, TargetMarket } from '@/types/database'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface OppRow {
  id: string
  title: string
  problem: string | null
  department: OpportunityDepartment | null
  signal_count: number
  score_global: number
  target_market: TargetMarket | null
  created_at: string
}

type SortKey = 'score' | 'volume' | 'date'

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

const DEPT_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  technique:  { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400',    label: 'Technique'  },
  commercial: { bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-400',  label: 'Commercial' },
  marketing:  { bg: 'bg-pink-50',     text: 'text-pink-700',    dot: 'bg-pink-400',    label: 'Marketing'  },
  operations: { bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-400',  label: 'Opérations' },
  finance:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Finance'    },
  rh:         { bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-400',  label: 'RH'         },
  support:    { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',   label: 'Support'    },
  autre:      { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400',    label: 'Autre'      },
}

const MARKET_CONFIG: Record<string, { label: string }> = {
  fr:            { label: 'France'    },
  qc:            { label: 'Québec'    },
  fr_qc:         { label: 'FR & QC'   },
  international: { label: 'INTL'      },
}

const SCORE_PRESETS = [
  { label: 'Tous', min: 0 },
  { label: '50+',  min: 50 },
  { label: '60+',  min: 60 },
  { label: '70+',  min: 70 },
  { label: '80+',  min: 80 },
]

const ALL_DEPTS = ['technique', 'commercial', 'marketing', 'operations', 'finance', 'rh', 'support', 'autre']
const ALL_MARKETS = ['fr', 'qc', 'fr_qc', 'international']

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getScoreClasses(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (score >= 65) return 'bg-green-50 text-green-700 border-green-200'
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-600 border-rose-200'
}

function getDept(key: string | null) {
  return DEPT_CONFIG[key ?? 'autre'] ?? DEPT_CONFIG.autre
}

function formatMarketShort(m: TargetMarket | null): string {
  if (!m) return '—'
  return MARKET_CONFIG[m]?.label ?? m.toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

interface Props {
  opportunities: OppRow[]
}

export default function OpportunitiesTable({ opportunities }: Props) {
  const [sort, setSort] = useState<SortKey>('score')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterDepts, setFilterDepts] = useState<string[]>([])
  const [filterMarkets, setFilterMarkets] = useState<string[]>([])
  const [filterScoreMin, setFilterScoreMin] = useState(0)

  // Active filter count for badge
  const activeFilterCount =
    filterDepts.length + filterMarkets.length + (filterScoreMin > 0 ? 1 : 0)

  // Toggle helpers
  const toggleDept = (d: string) =>
    setFilterDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  const toggleMarket = (m: string) =>
    setFilterMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  const clearFilters = () => {
    setFilterDepts([])
    setFilterMarkets([])
    setFilterScoreMin(0)
  }

  // Filtered + sorted list
  const visible = useMemo(() => {
    return [...opportunities]
      .filter(o => filterDepts.length === 0 || filterDepts.includes(o.department ?? 'autre'))
      .filter(o => filterMarkets.length === 0 || filterMarkets.includes(o.target_market ?? ''))
      .filter(o => o.score_global >= filterScoreMin)
      .sort((a, b) => {
        if (sort === 'volume') return b.signal_count - a.signal_count
        if (sort === 'date')   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return b.score_global - a.score_global // score
      })
      .slice(0, 15)
  }, [opportunities, sort, filterDepts, filterMarkets, filterScoreMin])

  return (
    <div>
      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#00b4d8] pb-2 inline-block">
          Top Opportunités Actuelles
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort buttons */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5">
            {([
              { key: 'score',  label: 'Score'   },
              { key: 'volume', label: 'Volume'  },
              { key: 'date',   label: 'Date'    },
            ] as { key: SortKey; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                  sort === s.key
                    ? 'bg-[#2b3652] text-white'
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-[#2b3652]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 border text-[10px] font-black uppercase tracking-widest transition ${
              filtersOpen || activeFilterCount > 0
                ? 'border-[#00b4d8] text-[#00b4d8] bg-[#e0f7fa]/40'
                : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-[#00b4d8] text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {filtersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition"
            >
              <X className="w-3.5 h-3.5" /> Effacer
            </button>
          )}
        </div>
      </div>

      {/* ─── Filter panel ─── */}
      {filtersOpen && (
        <div className="bg-slate-50 border border-slate-200 p-5 mb-4 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">

          {/* Département */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Département</p>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPTS.map(d => {
                const cfg = getDept(d)
                const active = filterDepts.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => toggleDept(d)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border transition ${
                      active
                        ? `${cfg.bg} ${cfg.text} border-current`
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 shrink-0 ${active ? cfg.dot : 'bg-slate-300'}`} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Marché */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Marché cible</p>
            <div className="flex flex-wrap gap-2">
              {ALL_MARKETS.map(m => {
                const active = filterMarkets.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMarket(m)}
                    className={`px-3 py-1 text-[10px] font-bold border transition ${
                      active
                        ? 'bg-[#2b3652] text-white border-[#2b3652]'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {MARKET_CONFIG[m]?.label ?? m}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Score minimum */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Score minimum</p>
            <div className="flex flex-wrap gap-2">
              {SCORE_PRESETS.map(p => (
                <button
                  key={p.min}
                  onClick={() => setFilterScoreMin(p.min)}
                  className={`px-3 py-1 text-[10px] font-bold border transition ${
                    filterScoreMin === p.min
                      ? 'bg-[#2b3652] text-white border-[#2b3652]'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Active filter chips (summary) ─── */}
      {activeFilterCount > 0 && !filtersOpen && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {filterDepts.map(d => {
            const cfg = getDept(d)
            return (
              <span key={d} className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border ${cfg.bg} ${cfg.text} border-current`}>
                <span className={`w-1.5 h-1.5 ${cfg.dot}`} />
                {cfg.label}
                <button onClick={() => toggleDept(d)} className="ml-0.5 hover:opacity-70"><X className="w-2.5 h-2.5" /></button>
              </span>
            )
          })}
          {filterMarkets.map(m => (
            <span key={m} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border bg-[#2b3652]/10 text-[#2b3652] border-[#2b3652]/20">
              {MARKET_CONFIG[m]?.label ?? m}
              <button onClick={() => toggleMarket(m)} className="ml-0.5 hover:opacity-70"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {filterScoreMin > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
              Score ≥ {filterScoreMin}
              <button onClick={() => setFilterScoreMin(0)} className="ml-0.5 hover:opacity-70"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* ─── Result count ─── */}
      {activeFilterCount > 0 && (
        <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
          {visible.length} résultat{visible.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ─── Table ─── */}
      <div className="bg-[#2b3652] p-1 shadow-xl">
        <div className="bg-white relative z-10 border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 w-2/5">Opportunité & Résumé</th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Département</th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Marché</th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Volume</th>
                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Score IQ</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">
                    Aucune opportunité ne correspond à vos filtres.
                  </td>
                </tr>
              ) : visible.map((opp) => {
                const dept = getDept(opp.department)
                return (
                  <tr key={opp.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition cursor-pointer group bg-white">

                    {/* Title + problem */}
                    <td className="py-5 px-8 align-middle">
                      <Link href={`/opportunities/${opp.id}`}>
                        <p className="font-bold text-sm mb-1 text-slate-800 group-hover:text-[#00b4d8] transition leading-snug">
                          {opp.title}
                        </p>
                        {opp.problem && (
                          <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-1">{opp.problem}</p>
                        )}
                      </Link>
                    </td>

                    {/* Department — colored chip with dot */}
                    <td className="py-5 px-8 align-middle">
                      {opp.department ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${dept.bg} ${dept.text}`}>
                          <span className={`w-1.5 h-1.5 shrink-0 ${dept.dot}`} />
                          {dept.label}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Market */}
                    <td className="py-5 px-8 align-middle text-slate-500 text-xs font-bold uppercase tracking-widest">
                      {formatMarketShort(opp.target_market)}
                    </td>

                    {/* Volume */}
                    <td className="py-5 px-8 align-middle text-right">
                      <span className="text-slate-700 text-sm font-black">{opp.signal_count}</span>
                    </td>

                    {/* Score — colored, perfectly centered */}
                    <td className="py-5 px-8 align-middle">
                      <div className="flex justify-end items-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 border text-[12px] font-black ${getScoreClasses(opp.score_global)}`}>
                          {opp.score_global}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Added (sort-aware) label */}
      {sort === 'date' && visible.length > 0 && (
        <p className="text-[10px] font-bold text-slate-400 mt-3 text-right uppercase tracking-widest">
          Trié par date d'ajout — {formatDate(visible[0].created_at)} au {formatDate(visible[visible.length - 1].created_at)}
        </p>
      )}
    </div>
  )
}
