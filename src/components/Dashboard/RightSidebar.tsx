'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuickReportModal from '@/components/QuickReportModal';
import QuickScrapeModal from '@/components/QuickScrapeModal';
import { ChevronDown, Database, FileText, Activity, Clock, Box, FileOutput, Server, Calendar, Bell, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  stats: {
    opportunities: number;
    newOpps: number;
    signals: number;
    averageScore: number;
  };
  recentReports: Array<{ id: string; title: string; type: string; created_at: string; status: string }>;
  recentScrapes: Array<{ id: string; started_at: string; signals_collected: number; status: string }>;
}

export default function DashboardRightSidebar({ stats, recentReports, recentScrapes }: Props) {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false);

  // Helper local function to replace date-fns
  const formatRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();

    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    
    if (isToday) return `Auj. ${hh}:${mm}`;
    if (isYesterday) return `Hier ${hh}:${mm}`;
    
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Aoû.', 'Sep.', 'Oct.', 'Nov.', 'Déc.'];
    const month = months[d.getMonth()];
    return `${day} ${month} ${hh}:${mm}`;
  };

  return (
    <>
       <QuickReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
       <QuickScrapeModal isOpen={isScrapeModalOpen} onClose={() => setIsScrapeModalOpen(false)} />
       
       <aside className="w-[320px] h-full bg-[#f4f6f8] flex flex-col overflow-y-auto shrink-0 z-10 plugin-noscrollbar relative">
         
         {/* L'arrière plan de tout le système est "#f4f6f8" dans la plupart des app ultra-modernes,
             ou bien sidebar blanche. On garde la rounded-[24px] blanche pour encapsuler */}
         <div className="w-full h-full bg-white rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col py-6 px-5 relative overflow-y-auto">
            
            {/* Action Buttons Top Area */}
            <div className="flex flex-col gap-3 mb-8 shrink-0 pt-2">
               {/* Header like reference calendar header */}
               <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-[#1A1C1E] font-bold text-[17px] leading-tight">Actions Rapides</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[#707478] text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-lg">
                    Menu <ChevronDown strokeWidth={3} className="w-3.5 h-3.5" />
                  </div>
               </div>

               {/* "Lancer un scraping" Button (Dark) */}
               <button 
                  onClick={() => setIsScrapeModalOpen(true)}
                  className="w-full bg-[#1A1C1E] text-white hover:bg-black transition-all rounded-[20px] p-4 flex items-center justify-between shadow-lg shadow-black/10 group cursor-pointer"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Database strokeWidth={2.5} className="w-5 h-5 text-white" />
                     </div>
                     <div className="text-left">
                        <p className="font-bold text-sm">Lancer une collecte</p>
                        <p className="text-[10px] text-white/50 font-medium">Scraper de nouveaux signaux</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                     <ChevronRight strokeWidth={2.5} className="w-4 h-4 ml-0.5" />
                  </div>
               </button>

               {/* "Générer un rapport" Button (Light Outline) */}
               <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full bg-white border-2 border-slate-100 hover:border-[#1A1C1E] transition-all rounded-[20px] p-4 flex items-center justify-between group cursor-pointer"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#1A1C1E] transition-colors">
                        <FileText strokeWidth={2.5} className="w-5 h-5 text-[#1A1C1E] group-hover:text-white transition-colors" />
                     </div>
                     <div className="text-left">
                        <p className="font-bold text-[#1A1C1E] text-sm">Générer un rapport</p>
                        <p className="text-[10px] text-[#707478] font-medium">Synthèse IA documentée</p>
                     </div>
                  </div>
               </button>
            </div>

            {/* Historique Rapports */}
            <div className="mb-6 shrink-0">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#1A1C1E] font-bold text-[15px]">Derniers Rapports</h3>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-[#1A1C1E]">{recentReports.length}</span>
                  </div>
               </div>

               {recentReports.length === 0 ? (
                  <p className="text-xs text-[#707478] text-center italic py-2">Aucun rapport récent.</p>
               ) : (
                 <div className="flex flex-col gap-2 relative">
                    {/* Tiny connecting line to mimic timeline subtly */}
                    <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-slate-100 z-0"></div>

                    {recentReports.map((report, idx) => (
                       <div 
                         key={report.id} 
                         onClick={() => router.push(`/reports/${report.type}/${report.id}`)}
                         className={`relative z-10 w-full bg-white border border-slate-100 rounded-[20px] p-3.5 flex items-start gap-3 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all ${idx === 0 ? 'border-l-4 border-l-[#257b57]' : ''}`}
                       >
                         {/* Circle indicator */}
                         <div className="absolute top-[18px] -left-[23px] w-2.5 h-2.5 rounded-full bg-slate-100 border-2 border-white hidden"></div>
                         
                         <div className="w-10 h-10 rounded-full bg-[#F4F6F8] flex items-center justify-center shrink-0">
                           <FileOutput strokeWidth={2.5} className="w-4 h-4 text-[#1A1C1E] relative -mr-0.5" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-0.5">
                              <h4 className="font-bold text-[#1A1C1E] text-[13px] truncate pr-2">{report.title}</h4>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold tracking-widest uppercase text-[#707478]">{report.type}</span>
                             <span className="text-[10px] text-[#707478] align-middle">•</span>
                             <span className="text-[10px] text-[#707478] flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(report.created_at)}</span>
                           </div>
                         </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Historique Scraping */}
            <div className="shrink-0">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#1A1C1E] font-bold text-[15px]">Dernières Collectes</h3>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-[#1A1C1E]">{recentScrapes.length}</span>
                  </div>
               </div>

               {recentScrapes.length === 0 ? (
                  <p className="text-xs text-[#707478] text-center italic py-2">Aucune collecte récente.</p>
               ) : (
                 <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-slate-100 z-0"></div>

                    {recentScrapes.map((scrape, idx) => (
                       <div 
                         key={scrape.id} 
                         onClick={() => router.push(`/reports/source/${scrape.id}`)}
                         className="relative z-10 w-full bg-white border border-slate-100 rounded-[20px] p-3.5 flex items-start gap-3 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                       >
                         <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center shrink-0">
                           {scrape.status === 'completed' ? (
                             <CheckCircle2 strokeWidth={2.5} className="w-5 h-5 text-[#257b57]" />
                           ) : scrape.status === 'running' ? (
                             <Activity strokeWidth={2.5} className="w-5 h-5 text-[#4477be] animate-pulse" />
                           ) : (
                             <Server strokeWidth={2.5} className="w-5 h-5 text-orange-500" />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-bold text-[#1A1C1E] text-[13px] truncate min-w-0 flex-1">Batch de Scraping</h4>
                              <span className="text-[10px] font-bold text-[#257b57] bg-[#E6F4EA] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">+{scrape.signals_collected} signaux</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] text-[#707478] flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(scrape.started_at)}</span>
                           </div>
                         </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>

         </div>
       </aside>
    </>
  );
}
