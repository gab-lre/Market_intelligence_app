'use client';

// Panneau « Filtres & Tri » de la liste des opportunités du dashboard.

import { X, ArrowRight, RotateCcw } from 'lucide-react';
import { ALL_DEPTS, DEPARTMENTS, SCORE_PRESETS, deptClasses } from '@/components/opportunities/display';

export type SortKey = 'score' | 'volume' | 'date';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date', label: 'Plus récents' },
  { key: 'score', label: 'Meilleur score' },
  { key: 'volume', label: 'Volume signaux' },
];

interface Props {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  filterDepts: string[];
  onToggleDept: (dept: string) => void;
  filterScoreMin: number;
  onScoreMinChange: (min: number) => void;
  resultCount: number;
  activeFilterCount: number;
  onClear: () => void;
  onClose: () => void;
}

export function OpportunityFiltersPane({
  sort, onSortChange, filterDepts, onToggleDept, filterScoreMin, onScoreMinChange,
  resultCount, activeFilterCount, onClear, onClose,
}: Props) {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
      {/* Filters header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#257b57] mb-0.5">Filtres & Tri</p>
          <h2 className="text-[16px] font-black text-[#1A1C1E]">Affiner les opportunités</h2>
        </div>
        <button
          onClick={onClose}
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
                onClick={() => onSortChange(s.key)}
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
              const cfg = DEPARTMENTS[d];
              return (
                <button
                  key={d}
                  onClick={() => onToggleDept(d)}
                  className={`px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border text-center ${
                    active
                      ? deptClasses(d) + ' shadow-sm'
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
                onClick={() => onScoreMinChange(p.min)}
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
          <span className="font-black text-[#1A1C1E]">{resultCount}</span> résultat{resultCount > 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#707478] hover:text-rose-500 border border-slate-200 hover:border-rose-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 bg-[#1A1C1E] hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
          >
            Appliquer <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
