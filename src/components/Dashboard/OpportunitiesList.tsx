'use client';

import { useState, useEffect } from 'react';
import { Target, X, Loader2, ArrowRight } from 'lucide-react';
import type { OpportunityDepartment, TargetMarket } from '@/types/database';

interface OppRow {
  id: string;
  title: string;
  problem: string | null;
  department: OpportunityDepartment | null;
  signal_count: number;
  score_global: number;
  target_market: TargetMarket | null;
  created_at: string;
}

interface OpportunitiesListProps {
  opportunities: OppRow[];
}

function formatDateToTimeOrDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function OpportunitiesList({ opportunities }: OpportunitiesListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setDetailData(null);
      return;
    }
    setLoadingModal(true);
    fetch(`/api/opportunities/${selectedId}`)
      .then(res => res.json())
      .then(data => setDetailData(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingModal(false));
  }, [selectedId]);

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#2b3652] font-black text-lg">Top Opportunités Actuelles</h3>
          <span className="text-[#94a3b8] cursor-pointer hover:text-[#257b57] transition-colors font-bold text-sm">Voir tout</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {opportunities.length === 0 ? (
            <p className="text-sm text-[#94a3b8] py-4 text-center">Aucune opportunité pour le moment.</p>
          ) : (
            opportunities.slice(0, 10).map((opp) => (
              <div 
                key={opp.id} 
                onClick={() => setSelectedId(opp.id)}
                className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-[#d2eddf] transition-all group"
              >
                {/* Avatar / Icon */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#f4f7fb] text-[#2b3652] flex items-center justify-center group-hover:bg-[#d2eddf] group-hover:text-[#257b57] transition-colors">
                  <Target strokeWidth={1.5} className="w-5 h-5" />
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#2b3652] font-black text-sm truncate">{opp.title}</p>
                  <p className="text-[#94a3b8] text-xs font-medium truncate mt-0.5">
                    {opp.problem ? opp.problem : 'Analyse de signaux multiples...'}
                  </p>
                </div>
                
                {/* Right Area: Time tag and Score */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="bg-[#f8fafc] text-[#64748b] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f1f5f9]">
                    {formatDateToTimeOrDay(opp.created_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#257b57]">{opp.score_global}/100</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#e2e8f0]/40 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setSelectedId(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <h2 className="text-xl font-black text-[#2b3652]">Détail de l'opportunité</h2>
              <button 
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-full bg-[#f4f7fb] text-[#94a3b8] flex items-center justify-center hover:bg-[#ffe4e6] hover:text-[#e11d48] transition-colors"
              >
                <X strokeWidth={2} className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {loadingModal || !detailData ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <Loader2 className="w-8 h-8 text-[#257b57] animate-spin" />
                  <p className="text-[#94a3b8] text-sm font-bold animate-pulse">Chargement des données détaillées...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#d2eddf] text-[#257b57] font-black text-xl px-4 py-2 rounded-xl">
                        {detailData.score_global}/100
                      </span>
                      <h1 className="text-2xl font-black text-[#2b3652] leading-tight">
                        {detailData.title}
                      </h1>
                    </div>
                    {detailData.target_market && (
                      <span className="inline-block bg-[#f4f7fb] text-[#64748b] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                        Marché: {detailData.target_market}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] p-6 rounded-2xl">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-3">Problème identifié</h3>
                    <p className="text-[#2b3652] text-sm leading-relaxed">{detailData.problem}</p>
                  </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-3">Solution proposée</h3>
                        <p className="text-[#2b3652] text-sm leading-relaxed">{detailData.solution}</p>
                      </div>
                      <div className="bg-[#E6F4EA] border border-[#257b57]/20 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#257b57] mb-3">Business Model (Abo)</h3>
                        <p className="text-[#257b57] font-bold">{detailData.subscription_model}</p>
                        {detailData.estimated_mrr && (
                          <p className="text-xl font-black text-[#1A1C1E] mt-2">{detailData.estimated_mrr}</p>
                        )}
                      </div>
                    </div>

                  {detailData.target_audience && (
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-3">Audience Cible</h3>
                      <p className="text-[#2b3652] font-bold">{detailData.target_audience}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-[#f1f5f9]">
                    <h3 className="text-[#2b3652] font-black mb-4">Signaux (Sources)</h3>
                    {detailData.opportunity_signals?.length > 0 ? (
                      <div className="space-y-3">
                        {detailData.opportunity_signals.map((s: any) => (
                           <div key={s.signal.id} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                             <p className="text-xs font-bold text-[#64748b] mb-1">{s.signal.source}</p>
                             <p className="text-sm text-[#2b3652] line-clamp-2">{s.signal.title || s.signal.content || 'Pas de titre'}</p>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#94a3b8]">Aucun signal détaillé.</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-4">
                     <a href={`/opportunities/${selectedId}`} className="text-[#257b57] font-bold text-sm flex items-center gap-2 hover:bg-[#d2eddf] px-4 py-2 rounded-xl transition-colors">
                       Voir la fiche complète <ArrowRight className="w-4 h-4" />
                     </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
