'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowRight, SlidersHorizontal, X, RotateCcw, LayoutGrid } from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OppRow {
  id: string;
  title: string;
  problem: string | null;
  description: string | null;
  revenue_model: string | null;
  department: string | null;
  signal_count: number;
  score_global: number;
  target_market: string | null;
  created_at: string;
  opportunity_signals?: any;
}

interface OpportunitiesSectionProps {
  opportunities: OppRow[] | any;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatDateToTimeOrDay(iso: string) {
  if (!iso || isNaN(new Date(iso).getTime())) return 'N/A';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 60) return { bg: 'bg-[#E6F4EA]', text: 'text-[#257b57]' };
  if (score >= 40) return { bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]' };
  return { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' };
}

// ──────────────────────────────────────────────
// Filter Config
// ──────────────────────────────────────────────

type SortKey = 'score' | 'volume' | 'date';
type RightPane = 'detail' | 'filters';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date', label: 'Plus récents' },
  { key: 'score', label: 'Meilleur score' },
  { key: 'volume', label: 'Volume signaux' },
];

const DEPT_CONFIG: Record<string, { label: string; color: string }> = {
  technique:  { label: 'Technique',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  commercial: { label: 'Commercial', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  marketing:  { label: 'Marketing',  color: 'bg-pink-50 text-pink-700 border-pink-200' },
  operations: { label: 'Opérations', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  finance:    { label: 'Finance',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rh:         { label: 'RH',         color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  support:    { label: 'Support',    color: 'bg-slate-100 text-slate-600 border-slate-200' },
  autre:      { label: 'Autre',      color: 'bg-gray-100 text-gray-500 border-gray-200' },
};
const ALL_DEPTS = ['technique', 'commercial', 'marketing', 'operations', 'finance', 'rh', 'support', 'autre'];

const SCORE_PRESETS = [
  { label: 'Tous',  min: 0  },
  { label: '50+',   min: 50 },
  { label: '60+',   min: 60 },
  { label: '70+',   min: 70 },
  { label: '80+',   min: 80 },
];

const LIST_PAGE_SIZE = 9;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function OpportunitiesSection({ opportunities }: OpportunitiesSectionProps) {
  const safeOpps: OppRow[] = opportunities || [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [rightPane, setRightPane] = useState<RightPane>('detail');

  // Filter state
  const [sort, setSort] = useState<SortKey>('date');
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterScoreMin, setFilterScoreMin] = useState(0);

  const activeFilterCount = filterDepts.length + (filterScoreMin > 0 ? 1 : 0);

  // Auto-select first on mount
  useEffect(() => {
    if (safeOpps.length > 0 && !selectedId) {
      setSelectedId(safeOpps[0].id);
    }
  }, [safeOpps, selectedId]);

  const toggleDept = (d: string) => {
    setFilterDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const clearFilters = () => {
    setFilterDepts([]);
    setFilterScoreMin(0);
    setSort('date');
  };

  const filteredOpps = useMemo(() => {
    return [...safeOpps]
      .filter(o => o.title.toLowerCase().includes(search.toLowerCase()))
      .filter(o => filterDepts.length === 0 || filterDepts.includes((o.department || 'autre').toLowerCase()))
      .filter(o => (o.score_global || 0) >= filterScoreMin)
      .sort((a, b) => {
        if (sort === 'volume') return (b.signal_count || 0) - (a.signal_count || 0);
        if (sort === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.score_global || 0) - (a.score_global || 0);
      });
  }, [safeOpps, search, filterDepts, filterScoreMin, sort]);

  // Only show first 9 in the list
  const visibleOpps = filteredOpps.slice(0, LIST_PAGE_SIZE);
  const hiddenCount = filteredOpps.length - LIST_PAGE_SIZE;

  const detailData = safeOpps.find(o => o.id === selectedId);

  const handleSelectOpp = (id: string) => {
    setSelectedId(id);
    setRightPane('detail');
  };

  const handleToggleFilters = () => {
    setRightPane(prev => prev === 'filters' ? 'detail' : 'filters');
  };

  return (
    <div className="grid grid-cols-5 gap-2 h-full min-h-0">

      {/* ─── LEFT: List ─── */}
      <div className="col-span-2 bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col min-h-0 h-full overflow-hidden shrink-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-[#1A1C1E] font-bold text-[15px] tracking-tight">Opportunities list</h3>
            <p className="text-[10px] text-[#A0A4A8] font-medium mt-0.5">
              {activeFilterCount > 0
                ? <span className="text-[#257b57] font-bold">{filteredOpps.length} résultat{filteredOpps.length > 1 ? 's' : ''}</span>
                : <span>{safeOpps.length} opportunité{safeOpps.length > 1 ? 's' : ''} au total</span>
              }
            </p>
          </div>

          <button
            onClick={handleToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              rightPane === 'filters'
                ? 'bg-[#1A1C1E] text-white shadow-sm'
                : activeFilterCount > 0
                  ? 'bg-[#E6F4EA] text-[#257b57]'
                  : 'bg-[#F4F6F8] text-[#707478] hover:bg-slate-200 hover:text-[#1A1C1E]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres
            {activeFilterCount > 0 && (
              <span className={`w-4 h-4 text-[9px] rounded-full flex items-center justify-center font-black ${rightPane === 'filters' ? 'bg-white text-[#1A1C1E]' : 'bg-[#257b57] text-white'}`}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="bg-[#F4F6F8] rounded-[16px] px-4 py-2.5 flex items-center gap-2 mb-4 shrink-0 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E0E0E0] transition-all">
          <Search strokeWidth={2} className="w-4 h-4 text-[#707478] shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-[13px] font-medium text-[#1A1C1E] focus:outline-none w-full placeholder:text-[#A0A4A8]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#A0A4A8] hover:text-[#1A1C1E] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
            {filterDepts.map(d => (
              <span key={d} className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${DEPT_CONFIG[d]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {DEPT_CONFIG[d]?.label || d}
                <button onClick={() => toggleDept(d)} className="hover:opacity-70 ml-0.5"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
            {filterScoreMin > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                Score ≥ {filterScoreMin}
                <button onClick={() => setFilterScoreMin(0)} className="hover:opacity-70 ml-0.5"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto plugin-noscrollbar space-y-1 pb-2">
          {filteredOpps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#A0A4A8] py-8">
              <LayoutGrid className="w-8 h-8 mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-sm font-medium">Aucune opportunité trouvée</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-2 text-[11px] font-bold text-[#257b57] hover:underline">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              {visibleOpps.map(opp => {
                const isActive = selectedId === opp.id && rightPane === 'detail';
                const scoreColors = getScoreColor(opp.score_global || 0);
                return (
                  <div
                    key={opp.id}
                    onClick={() => handleSelectOpp(opp.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-[18px] cursor-pointer transition-all ${
                      isActive ? 'bg-[#1A1C1E] shadow-md' : 'hover:bg-[#F4F6F8]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm transition-all ${scoreColors.bg} ${scoreColors.text} ${isActive ? 'ring-2 ring-white/20 ring-offset-1 ring-offset-[#1A1C1E]' : ''}`}>
                      {opp.score_global || '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs truncate ${isActive ? 'text-white' : 'text-[#1A1C1E]'}`}>
                        {opp.title}
                      </p>
                      <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/60' : 'text-[#A0A4A8]'}`}>
                        {opp.department ? opp.department.charAt(0).toUpperCase() + opp.department.slice(1) : 'SaaS'}
                        <span className="mx-1 opacity-40">·</span>
                        {opp.signal_count || 0} signaux
                      </p>
                    </div>
                    <div className={`text-[10px] font-medium shrink-0 ${isActive ? 'text-white/60' : 'text-[#A0A4A8]'}`}>
                      {formatDateToTimeOrDay(opp.created_at)}
                    </div>
                  </div>
                );
              })}

              {/* "See all" button */}
              {hiddenCount > 0 && (
                <a
                  href="/opportunities"
                  className="flex items-center justify-center gap-2 mt-2 w-full py-2.5 rounded-[18px] border border-dashed border-slate-200 text-[11px] font-bold text-[#707478] hover:border-[#1A1C1E] hover:text-[#1A1C1E] hover:bg-[#F4F6F8] transition-all group"
                >
                  <span>+{hiddenCount} opportunité{hiddenCount > 1 ? 's' : ''} supplémentaire{hiddenCount > 1 ? 's' : ''}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Detail OR Filters ─── */}
      <div className="col-span-3 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col min-h-0 h-full overflow-hidden shrink-0">

        {/* === FILTERS PANE === */}
        {rightPane === 'filters' && (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Filters header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#257b57] mb-0.5">Filtres & Tri</p>
                <h2 className="text-[16px] font-black text-[#1A1C1E]">Affiner les opportunités</h2>
              </div>
              <button
                onClick={() => setRightPane('detail')}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#707478] hover:text-[#1A1C1E] hover:bg-[#F4F6F8] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto plugin-noscrollbar px-6 py-5 space-y-6">

              {/* Sort */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-3">Trier par</p>
                <div className="flex gap-2 flex-wrap">
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSort(s.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        sort === s.key
                          ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-sm'
                          : 'bg-white text-[#707478] border-slate-200 hover:border-[#1A1C1E] hover:text-[#1A1C1E]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Department */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-3">Département</p>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_DEPTS.map(d => {
                    const active = filterDepts.includes(d);
                    const cfg = DEPT_CONFIG[d];
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDept(d)}
                        className={`px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border text-center ${
                          active
                            ? cfg.color + ' shadow-sm'
                            : 'bg-white text-[#707478] border-slate-200 hover:border-slate-300 hover:bg-[#F4F6F8]'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Score minimum */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-3">Score IA Minimum</p>
                <div className="flex gap-2 flex-wrap">
                  {SCORE_PRESETS.map(p => (
                    <button
                      key={p.min}
                      onClick={() => setFilterScoreMin(p.min)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        filterScoreMin === p.min
                          ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-sm'
                          : 'bg-white text-[#707478] border-slate-200 hover:border-[#1A1C1E] hover:text-[#1A1C1E]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {/* Score bar visual */}
                {filterScoreMin > 0 && (
                  <div className="mt-3 h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#257b57] to-[#4CAF50] rounded-full transition-all duration-300"
                      style={{ width: `${filterScoreMin}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Applied / Reset footer */}
            <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <p className="text-xs font-medium text-[#707478]">
                <span className="font-black text-[#1A1C1E]">{filteredOpps.length}</span> résultat{filteredOpps.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#707478] hover:text-rose-500 border border-slate-200 hover:border-rose-200 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réinitialiser
                  </button>
                )}
                <button
                  onClick={() => setRightPane('detail')}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1A1C1E] hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
                >
                  Appliquer <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === DETAIL PANE === */}
        {rightPane === 'detail' && (
          <div className="flex flex-col h-full overflow-hidden p-6">
            {!detailData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#A0A4A8]">
                <Search className="w-10 h-10 mb-3 opacity-15" strokeWidth={1.5} />
                <p className="text-sm font-medium">Sélectionnez une opportunité</p>
                <p className="text-xs mt-1 opacity-60">Les détails apparaîtront ici</p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">

                {/* Header */}
                <div className="flex items-start justify-between mb-5 shrink-0">
                  <div className="flex-1 pr-4 min-w-0">
                    <h2 className="text-[17px] font-bold text-[#1A1C1E] leading-snug">{detailData.title}</h2>
                    <p className="text-[#B0B4B8] text-[11px] mt-1.5 font-medium flex items-center gap-2 flex-wrap">
                      Généré le {detailData.created_at
                        ? new Date(detailData.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Date inconnue'}
                      {detailData.target_market && (
                        <span className="uppercase tracking-widest px-2 py-0.5 bg-[#F4F6F8] text-[#707478] rounded font-bold text-[9px]">
                          {detailData.target_market}
                        </span>
                      )}
                      {detailData.department && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${DEPT_CONFIG[detailData.department.toLowerCase()]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {DEPT_CONFIG[detailData.department.toLowerCase()]?.label || detailData.department}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-[#A0A4A8] uppercase tracking-widest font-bold">Score IA</span>
                    <p className={`text-2xl font-black leading-none mt-1 ${getScoreColor(detailData.score_global || 0).text}`}>
                      {detailData.score_global || '-'}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto plugin-noscrollbar space-y-5 pr-1">
                  {detailData.problem && (
                    <div>
                      <span className="text-[10px] text-[#A0A4A8] font-black uppercase tracking-widest mb-2 block">Problème Identifié</span>
                      <p className="text-[13px] font-medium text-[#404448] leading-relaxed">
                        {detailData.problem}
                      </p>
                    </div>
                  )}
                  {detailData.description && (
                    <div>
                      <span className="text-[10px] text-[#A0A4A8] font-black uppercase tracking-widest mb-2 block">Solution Proposée</span>
                      <p className="text-[13px] font-medium text-[#404448] leading-relaxed">
                        {detailData.description}
                      </p>
                    </div>
                  )}
                  {!detailData.problem && !detailData.description && (
                    <p className="text-[13px] font-medium text-[#A0A4A8] leading-relaxed">
                      Aucune synthèse disponible pour cette opportunité.
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 shrink-0 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-[#A0A4A8] font-medium">{detailData.signal_count || 0} signaux détectés</span>
                  <a
                    href={`/opportunities/${detailData.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1C1E] hover:bg-black text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    Voir l'analyse <ArrowRight strokeWidth={2} className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
