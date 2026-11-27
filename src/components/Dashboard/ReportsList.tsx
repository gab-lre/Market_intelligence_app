'use client';

import { useState } from 'react';
import { Database, X, FileText } from 'lucide-react';
import type { CollectionHistory } from '@/types/database';

interface ReportsListProps {
  reports: CollectionHistory[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ReportsList({ reports }: ReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<CollectionHistory | null>(null);

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#2b3652] font-black text-lg">Rapports par Collecte</h3>
          <span className="text-[#94a3b8] cursor-pointer hover:text-[#4477be] transition-colors font-bold text-sm">Historique</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-[#94a3b8] py-4 text-center">Aucune collecte récente.</p>
          ) : (
            reports.slice(0, 10).map((report) => (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)}
                className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-[#7ba9dc] transition-all group"
              >
                {/* Avatar / Icon */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#f4f7fb] text-[#2b3652] flex items-center justify-center group-hover:bg-[#ebf8ff] group-hover:text-[#4477be] transition-colors">
                  <Database strokeWidth={1.5} className="w-5 h-5" />
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#2b3652] font-black text-sm truncate">
                    Collecte & Analyse
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {/* Source badges */}
                    {report.sources_config && typeof report.sources_config === 'object' && Object.entries(report.sources_config).filter(([_, v]) => v).map(([sourceKey]) => (
                       <span key={sourceKey} className="text-[9px] uppercase tracking-widest font-black text-[#4477be] bg-[#ebf8ff] py-0.5 px-2 rounded-full">
                         {sourceKey.substring(0, 8)}
                       </span>
                    ))}
                  </div>
                </div>
                
                {/* Right Area: Time tag and Score */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="bg-[#f8fafc] text-[#64748b] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f1f5f9]">
                    {formatDate(report.started_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    {report.status === 'completed' ? (
                      <span className="text-xs font-black text-[#4477be]">{report.signals_collected} signaux</span>
                    ) : (
                       <span className="text-xs font-bold text-rose-500">Erreur</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#e2e8f0]/40 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setSelectedReport(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#ebf8ff] text-[#4477be] flex items-center justify-center">
                   <FileText strokeWidth={2} className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-black text-[#2b3652]">Rapport de Collecte</h2>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-[#f4f7fb] text-[#94a3b8] flex items-center justify-center hover:bg-[#ffe4e6] hover:text-[#e11d48] transition-colors"
              >
                <X strokeWidth={2} className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-6 rounded-2xl">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Date</p>
                  <p className="text-lg font-black text-[#2b3652]">{formatDate(selectedReport.started_at)}</p>
                </div>
                <div className="bg-[#ebf8ff] border border-[#bee3f8] p-6 rounded-2xl">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4477be] mb-1">Signaux Collectés</p>
                  <p className="text-xl font-black text-[#2a4365]">{selectedReport.signals_collected}</p>
                </div>
              </div>
              
              <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-4">Statut</h3>
                {selectedReport.status === 'completed' ? (
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-[#257b57]"></span>
                     <span className="text-[#2b3652] font-bold">Terminé avec succès</span>
                   </div>
                ) : (
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                     <span className="text-rose-600 font-bold">Erreur (voir les logs)</span>
                   </div>
                )}
              </div>

              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-4">Sources Analysées</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.sources_config && typeof selectedReport.sources_config === 'object' && Object.entries(selectedReport.sources_config).map(([sourceKey, isEnabled]) => (
                    <span 
                       key={sourceKey} 
                       className={`px-4 py-2 rounded-xl text-sm font-bold border ${isEnabled ? 'bg-[#f4f7fb] text-[#2b3652] border-[#e2e8f0]' : 'bg-white text-[#94a3b8] border-[#f1f5f9]'}`}
                    >
                      {sourceKey}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
