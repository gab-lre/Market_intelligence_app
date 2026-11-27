'use client';

// Panneau de droite du dashboard : aperçu de l'opportunité sélectionnée.

import { Search, ArrowRight } from 'lucide-react';
import type { OpportunitySummary } from '@/lib/data';
import { DEPARTMENTS, deptClasses, getScoreColor } from '@/components/opportunities/display';

export function OpportunityDetailPane({ opportunity }: { opportunity: OpportunitySummary | undefined }) {
  return (
    <div className="flex flex-col h-full overflow-hidden p-6">
      {!opportunity ? (
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
              <h2 className="text-[17px] font-bold text-[#1A1C1E] leading-snug">{opportunity.title}</h2>
              <p className="text-[#B0B4B8] text-[11px] mt-1.5 font-medium flex items-center gap-2 flex-wrap">
                Généré le {opportunity.created_at
                  ? new Date(opportunity.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Date inconnue'}
                {opportunity.target_market && (
                  <span className="uppercase tracking-widest px-2 py-0.5 bg-[#F4F6F8] text-[#707478] rounded font-bold text-[9px]">
                    {opportunity.target_market}
                  </span>
                )}
                {opportunity.department && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${deptClasses(opportunity.department.toLowerCase()) || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {DEPARTMENTS[opportunity.department.toLowerCase()]?.label || opportunity.department}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] text-[#A0A4A8] uppercase tracking-widest font-bold">Score IA</span>
              <p className={`text-2xl font-black leading-none mt-1 ${getScoreColor(opportunity.score_global || 0).text}`}>
                {opportunity.score_global || '-'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto plugin-noscrollbar space-y-5 pr-1">
            {opportunity.problem && (
              <div>
                <span className="text-[10px] text-[#A0A4A8] font-black uppercase tracking-widest mb-2 block">Problème Identifié</span>
                <p className="text-[13px] font-medium text-[#404448] leading-relaxed">
                  {opportunity.problem}
                </p>
              </div>
            )}
            {opportunity.description && (
              <div>
                <span className="text-[10px] text-[#A0A4A8] font-black uppercase tracking-widest mb-2 block">Solution Proposée</span>
                <p className="text-[13px] font-medium text-[#404448] leading-relaxed">
                  {opportunity.description}
                </p>
              </div>
            )}
            {!opportunity.problem && !opportunity.description && (
              <p className="text-[13px] font-medium text-[#A0A4A8] leading-relaxed">
                Aucune synthèse disponible pour cette opportunité.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 shrink-0 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-[#A0A4A8] font-medium">{opportunity.signal_count || 0} signaux détectés</span>
            <a
              href={`/opportunities/${opportunity.id}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1C1E] hover:bg-black text-white rounded-full text-xs font-bold transition-all shadow-sm"
            >
              Voir l&apos;analyse <ArrowRight strokeWidth={2} className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
