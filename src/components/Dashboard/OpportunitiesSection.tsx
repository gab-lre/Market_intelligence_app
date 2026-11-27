'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, SlidersHorizontal, X, LayoutGrid } from 'lucide-react';
import type { OpportunitySummary } from '@/lib/data';
import { DEPARTMENTS, deptClasses, getScoreColor } from '@/components/opportunities/display';
import { OpportunityFiltersPane, type SortKey } from './OpportunityFiltersPane';
import { OpportunityDetailPane } from './OpportunityDetailPane';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OpportunitiesSectionProps {
  opportunities: OpportunitySummary[];
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

// ──────────────────────────────────────────────
// Filter Config
// ──────────────────────────────────────────────

type RightPane = 'detail' | 'filters';

const LIST_PAGE_SIZE = 9;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function OpportunitiesSection({ opportunities }: OpportunitiesSectionProps) {
  const safeOpps = opportunities;

  // La première opportunité est sélectionnée par défaut
  const [selectedId, setSelectedId] = useState<string | null>(safeOpps[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [rightPane, setRightPane] = useState<RightPane>('detail');

  // Filter state
  const [sort, setSort] = useState<SortKey>('date');
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterScoreMin, setFilterScoreMin] = useState(0);

  const activeFilterCount = filterDepts.length + (filterScoreMin > 0 ? 1 : 0);

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
              <span key={d} className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${deptClasses(d) || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {DEPARTMENTS[d]?.label || d}
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
                <Link
                  href="/opportunities"
                  className="flex items-center justify-center gap-2 mt-2 w-full py-2.5 rounded-[18px] border border-dashed border-slate-200 text-[11px] font-bold text-[#707478] hover:border-[#1A1C1E] hover:text-[#1A1C1E] hover:bg-[#F4F6F8] transition-all group"
                >
                  <span>+{hiddenCount} opportunité{hiddenCount > 1 ? 's' : ''} supplémentaire{hiddenCount > 1 ? 's' : ''}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Detail OR Filters ─── */}
      <div className="col-span-3 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col min-h-0 h-full overflow-hidden shrink-0">

        {/* === FILTERS PANE === */}
        {rightPane === 'filters' && (
          <OpportunityFiltersPane
            sort={sort}
            onSortChange={setSort}
            filterDepts={filterDepts}
            onToggleDept={toggleDept}
            filterScoreMin={filterScoreMin}
            onScoreMinChange={setFilterScoreMin}
            resultCount={filteredOpps.length}
            activeFilterCount={activeFilterCount}
            onClear={clearFilters}
            onClose={() => setRightPane('detail')}
          />
        )}

        {/* === DETAIL PANE === */}
        {rightPane === 'detail' && (
          <OpportunityDetailPane opportunity={detailData} />
        )}
      </div>
    </div>
  );
}
