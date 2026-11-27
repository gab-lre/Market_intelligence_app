'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, SlidersHorizontal, X, ArrowRight, RotateCcw,
  TrendingUp, Lightbulb, Star, ArrowUpRight,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types & Config
// ──────────────────────────────────────────────

interface OppRow {
  id: string;
  title: string;
  problem: string | null;
  department: string | null;
  signal_count: number;
  score_global: number;
  target_market: string | null;
  created_at: string;
}

interface KPIs { total: number; avgScore: number; highScore: number; }

type SortKey = 'score' | 'volume' | 'date';

const DEPT_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  technique:  { label: 'Technique',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  commercial: { label: 'Commercial', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  marketing:  { label: 'Marketing',  bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200' },
  operations: { label: 'Opérations', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  finance:    { label: 'Finance',    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rh:         { label: 'RH',         bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  support:    { label: 'Support',    bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200' },
  autre:      { label: 'Autre',      bg: 'bg-gray-100',   text: 'text-gray-500',    border: 'border-gray-200' },
};

const MARKET_LABELS: Record<string, string> = {
  fr: 'France', qc: 'Québec', fr_qc: 'FR & QC', international: 'International',
};

const ALL_DEPTS = ['technique', 'commercial', 'marketing', 'operations', 'finance', 'rh', 'support', 'autre'];
const SCORE_PRESETS = [
  { label: 'Tous', min: 0 },
  { label: '50+',  min: 50 },
  { label: '60+',  min: 60 },
  { label: '70+',  min: 70 },
  { label: '80+',  min: 80 },
];

function getScoreColor(score: number) {
  if (score >= 60) return { bg: 'bg-[#E6F4EA]', text: 'text-[#257b57]', ring: 'ring-[#257b57]/20' };
  if (score >= 40) return { bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]',  ring: 'ring-amber-200' };
  return                  { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]',  ring: 'ring-rose-200' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function OpportunitiesPageClient({
  opportunities, kpis
}: { opportunities: OppRow[]; kpis: KPIs }) {
  const router = useRouter();
  const [search, setSearch]                 = useState('');
  const [sort, setSort]                     = useState<SortKey>('score');
  const [filterDepts, setFilterDepts]       = useState<string[]>([]);
  const [filterScoreMin, setFilterScoreMin] = useState(0);
  const [filtersOpen, setFiltersOpen]       = useState(false);

  const activeFilterCount = filterDepts.length + (filterScoreMin > 0 ? 1 : 0);

  const toggleDept = (d: string) =>
    setFilterDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const clearFilters = () => {
    setFilterDepts([]); setFilterScoreMin(0); setSort('score');
  };

  const filtered = useMemo(() => {
    return [...opportunities]
      .filter(o => o.title.toLowerCase().includes(search.toLowerCase()) ||
                   (o.problem ?? '').toLowerCase().includes(search.toLowerCase()))
      .filter(o => filterDepts.length === 0 || filterDepts.includes(o.department ?? 'autre'))
      .filter(o => (o.score_global ?? 0) >= filterScoreMin)
      .sort((a, b) => {
        if (sort === 'volume') return b.signal_count - a.signal_count;
        if (sort === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return b.score_global - a.score_global;
      });
  }, [opportunities, search, filterDepts, filterScoreMin, sort]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">

      {/* ─── KPI Strip ─── */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {[
          { label: 'Total Opportunités', value: kpis.total,      sub: 'identifiées au total', icon: Lightbulb,  color: 'text-[#257b57]', bg: 'bg-[#E6F4EA]' },
          { label: 'Score Moyen',        value: kpis.avgScore,   sub: 'sur 100 par l\'IA',    icon: Star,        color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Score ≥ 70',         value: kpis.highScore,  sub: 'opportunités prioritaires', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1A1C1E] leading-none">{kpi.value}</p>
              <p className="text-[10px] font-bold text-[#707478] mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Main Card ─── */}
      <div className="flex-1 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col min-h-0 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-5 border-b border-[#F4F6F8] shrink-0 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#F4F6F8] rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E0E0E0] transition-all">
            <Search className="w-4 h-4 text-[#707478] shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Rechercher une opportunité..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-[13px] font-medium text-[#1A1C1E] focus:outline-none w-full placeholder:text-[#A0A4A8]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#A0A4A8] hover:text-[#1A1C1E]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort pills */}
          <div className="flex items-center bg-[#F4F6F8] rounded-xl p-1 gap-0.5 shrink-0">
            {(['score', 'volume', 'date'] as SortKey[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all capitalize ${
                  sort === s ? 'bg-[#1A1C1E] text-white shadow-sm' : 'text-[#707478] hover:text-[#1A1C1E]'
                }`}
              >
                {s === 'score' ? 'Score' : s === 'volume' ? 'Volume' : 'Date'}
              </button>
            ))}
          </div>

          {/* Filters button */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-[#1A1C1E] text-white border-[#1A1C1E]'
                : 'bg-white text-[#707478] border-[#E0E0E0] hover:border-[#1A1C1E] hover:text-[#1A1C1E]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtres
            {activeFilterCount > 0 && (
              <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-black rounded-full ${
                filtersOpen ? 'bg-white text-[#1A1C1E]' : 'bg-[#257b57] text-white'
              }`}>{activeFilterCount}</span>
            )}
          </button>

          {/* Result count */}
          <p className="text-[11px] font-bold text-[#707478] shrink-0 ml-auto">
            <span className="text-[#1A1C1E] font-black">{filtered.length}</span> résultat{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="px-5 py-4 border-b border-[#F4F6F8] bg-[#FAFBFC] shrink-0 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-2.5">Département</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DEPTS.map(d => {
                    const cfg = DEPT_CONFIG[d];
                    const active = filterDepts.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDept(d)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          active ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white text-[#707478] border-[#E0E0E0] hover:border-[#1A1C1E]'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-2.5">Score IA Minimum</p>
                <div className="flex gap-1.5">
                  {SCORE_PRESETS.map(p => (
                    <button
                      key={p.min}
                      onClick={() => setFilterScoreMin(p.min)}
                      className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                        filterScoreMin === p.min ? 'bg-[#1A1C1E] text-white border-[#1A1C1E]' : 'bg-white text-[#707478] border-[#E0E0E0] hover:border-[#1A1C1E]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-[11px] font-bold text-[#707478] hover:text-rose-500 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto plugin-noscrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#A0A4A8] py-16">
              <Lightbulb className="w-10 h-10 mb-3 opacity-20" strokeWidth={1.5} />
              <p className="font-medium text-sm">Aucune opportunité trouvée</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-2 text-[11px] text-[#257b57] font-bold hover:underline">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white z-10 border-b border-[#F4F6F8]">
                <tr>
                  <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] w-[40%]">Opportunité</th>
                  <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Département</th>
                  <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Marché</th>
                  <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] text-right">Signaux</th>
                  <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] text-center">Score</th>
                  <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Date</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(opp => {
                  const dept = DEPT_CONFIG[opp.department ?? 'autre'] ?? DEPT_CONFIG.autre;
                  const score = getScoreColor(opp.score_global ?? 0);
                  return (
                    <tr key={opp.id} onClick={() => router.push(`/opportunities/${opp.id}`)} className="border-b border-[#F4F6F8] hover:bg-[#FAFBFC] transition-colors group cursor-pointer">
                      <td className="py-4 px-5">
                        <p className="font-bold text-[13px] text-[#1A1C1E] leading-snug group-hover:text-[#257b57] transition-colors line-clamp-1">
                          {opp.title}
                        </p>
                        {opp.problem && (
                          <p className="text-[11px] text-[#A0A4A8] font-medium mt-0.5 line-clamp-1">{opp.problem}</p>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {opp.department ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${dept.bg} ${dept.text} ${dept.border}`}>
                            {dept.label}
                          </span>
                        ) : <span className="text-[#D0D4D8]">—</span>}
                      </td>
                      <td className="py-4 px-5 text-[11px] font-bold text-[#707478]">
                        {MARKET_LABELS[opp.target_market ?? ''] ?? '—'}
                      </td>
                      <td className="py-4 px-5 text-right font-black text-[13px] text-[#1A1C1E]">
                        {opp.signal_count ?? 0}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex justify-center">
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black ring-1 ${score.bg} ${score.text} ${score.ring}`}>
                            {opp.score_global ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-[11px] text-[#A0A4A8] font-medium whitespace-nowrap">
                        {formatDate(opp.created_at)}
                      </td>
                      <td className="py-4 px-3">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-[#707478] hover:text-[#1A1C1E] hover:bg-[#F4F6F8] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F4F6F8] flex items-center justify-between shrink-0">
            <p className="text-[11px] text-[#A0A4A8] font-medium">
              Affichage de {filtered.length} / {kpis.total} opportunités
            </p>
            <Link href="/reports" className="flex items-center gap-1.5 text-[11px] font-bold text-[#257b57] hover:underline">
              Générer un rapport IA <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
