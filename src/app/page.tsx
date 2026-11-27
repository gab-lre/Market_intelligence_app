import { getDashboardData } from '@/lib/data';
import DashboardRightSidebar from '@/components/Dashboard/RightSidebar';
import { DepartmentDistributionChart } from '@/components/Charts/DepartmentDistributionChart';
import { DoubleEvolutionChart } from '@/components/Charts/DoubleEvolutionChart';
import { OpportunitiesSection } from '@/components/Dashboard/OpportunitiesSection';
import { HelpCircle } from 'lucide-react';

/** Tendance sur 7 jours au format « +1,2% ». */
function formatTrend(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%`;
}

export default async function DashboardPage() {
  const { kpis, trends, departments, evolution, opportunities, recentReports, recentRuns } = await getDashboardData();

  return (
    <div className="flex flex-1 h-full gap-2 shrink-0 overflow-hidden">
      
      {/* LEFT AREA: MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
         
         {/* Top KPIs Grid */}
         <div className="grid grid-cols-5 gap-2 mb-2 shrink-0">
            {/* KPI 1 */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[105px]">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl font-black text-[#1A1C1E] leading-none">{kpis.opportunities}</span>
                  {trends.opportunities !== null && <span className="text-[10px] font-bold text-[#257b57] bg-[#E6F4EA] px-2 py-0.5 rounded-full">{formatTrend(trends.opportunities)}</span>}
               </div>
               <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E] leading-tight mb-0.5">Total Opportunités</h4>
                  <p className="text-[10px] text-[#707478] leading-tight">Identifiées au total</p>
               </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[105px]">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl font-black text-[#1A1C1E] leading-none">{kpis.newOpps}</span>
               </div>
               <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E] leading-tight mb-0.5">Nouvelles Vues</h4>
                  <p className="text-[10px] text-[#707478] leading-tight">Depuis ce matin</p>
               </div>
            </div>
            
            {/* KPI 3 (newly matched format) */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[105px]">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl font-black text-[#1A1C1E] leading-none">{kpis.activeSources}</span>
                  {trends.activeSources !== null && <span className="text-[10px] font-bold text-[#257b57] bg-[#E6F4EA] px-2 py-0.5 rounded-full">{formatTrend(trends.activeSources)}</span>}
               </div>
               <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E] leading-tight mb-0.5">Sources Actives</h4>
                  <p className="text-[10px] text-[#707478] leading-tight flex items-center gap-1">Connectées <HelpCircle className="w-2.5 h-2.5 inline" strokeWidth={2} /></p>
               </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[105px]">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl font-black text-[#1A1C1E] leading-none text-nowrap">{kpis.signals >= 1000 ? (kpis.signals/1000).toFixed(1)+'k' : kpis.signals}</span>
               </div>
               <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E] leading-tight mb-0.5">Données Brutes</h4>
                  <p className="text-[10px] text-[#707478] leading-tight flex items-center gap-1">Signaux analysés <HelpCircle className="w-2.5 h-2.5 inline" strokeWidth={2} /></p>
               </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[105px]">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl font-black text-[#1A1C1E] leading-none">{kpis.averageScore}</span>
                  {trends.averageScore !== null && <span className="text-[10px] font-bold text-[#257b57] bg-[#E6F4EA] px-2 py-0.5 rounded-full">{formatTrend(trends.averageScore)}</span>}
               </div>
               <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E] leading-tight mb-0.5">Score Global</h4>
                  <p className="text-[10px] text-[#707478] leading-tight flex items-center gap-1">/100 IA <HelpCircle className="w-2.5 h-2.5 inline" strokeWidth={2} /></p>
               </div>
            </div>
         </div>

         {/* Charts Layer */}
         <div className="grid grid-cols-2 gap-2 mb-2 shrink-0 min-h-[190px]">
            {/* Radar Chart */}
            <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full overflow-hidden">
               <h3 className="text-[#1A1C1E] font-bold text-[14px] mb-1 tracking-tight">Départements</h3>
               <div className="flex-1 min-h-0 pl-1">
                  <DepartmentDistributionChart data={departments} />
               </div>
            </div>
            {/* Spline Area Chart */}
            <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full overflow-hidden">
               <div className="flex justify-between items-center shrink-0 mb-1">
                  <h3 className="text-[#1A1C1E] font-bold text-[14px] tracking-tight">Évolution des scores & volume</h3>
                  <div className="flex gap-3">
                     <div className="flex items-center gap-1.5 object-contain"><span className="w-1.5 h-1.5 bg-[#A0A4A8] rounded-full"></span><span className="text-[11px] font-semibold text-[#707478]">Volume</span></div>
                     <div className="flex items-center gap-1.5 object-contain"><span className="w-1.5 h-1.5 bg-[#257b57] rounded-full"></span><span className="text-[11px] font-semibold text-[#707478]">Score</span></div>
                  </div>
               </div>
               <div className="flex-1 min-h-0 -mt-2">
                  <DoubleEvolutionChart data={evolution} />
               </div>
            </div>
         </div>

         {/* Opportunities List Area */}
         <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
             <OpportunitiesSection opportunities={opportunities} />
         </div>

      </div>

      {/* RIGHT SIDEBAR: Aperçu & Timeline */}
      <DashboardRightSidebar 
        recentReports={recentReports}
        recentScrapes={recentRuns}
      />

    </div>
  );
}
