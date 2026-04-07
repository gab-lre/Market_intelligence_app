'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, ShieldCheck, LogOut, FileText, UserCircle, Folder } from 'lucide-react';
import type { OpportunityDepartment } from '@/types/database';
import QuickReportModal from '@/components/QuickReportModal';

interface NavigationProps {
  stats?: {
    opportunities: number;
    newOpps: number;
    signals: number;
    averageScore: number;
  };
  recentOpps?: Array<{
    id: string;
    title: string;
    department: OpportunityDepartment;
    signal_count: number;
    score_global: number;
  }>;
}

function formatDept(d: OpportunityDepartment | null): string {
  if (!d) return '—'
  const map: Record<OpportunityDepartment, string> = {
    commercial: 'Comm', marketing: 'Mark.', operations: 'Ops',
    finance: 'Fin.', rh: 'RH', technique: 'Tech', support: 'Support', autre: 'Autre',
  }
  return map[d] ?? d
}

export default function Navigation({ stats, recentOpps = [] }: NavigationProps) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <QuickReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    <div className="flex h-screen shrink-0">
      {/* Far Left Sidebar (White) */}
      <aside className="w-[88px] bg-white border-r border-slate-200 flex flex-col items-center py-6 z-10">
        <div className="w-12 h-12 bg-[#e0f7fa] text-[#00b4d8] flex items-center justify-center mb-10 rounded-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <nav className="flex flex-col gap-6 flex-1 w-full items-center">
          <Link href="/" className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${pathname === '/' ? 'text-[#00b4d8] border-l-[3px] border-[#00b4d8] bg-[#e0f7fa]/50' : 'text-slate-400 hover:text-[#00b4d8]'}`}>
            <LayoutDashboard className="w-6 h-6" />
          </Link>
          <Link href="/sources" className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${pathname.startsWith('/sources') ? 'text-[#00b4d8] border-l-[3px] border-[#00b4d8] bg-[#e0f7fa]/50' : 'text-slate-400 hover:text-[#00b4d8]'}`}>
            <Database className="w-6 h-6" />
          </Link>
          <Link href="/reports" className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${pathname.startsWith('/reports') ? 'text-[#00b4d8] border-l-[3px] border-[#00b4d8] bg-[#e0f7fa]/50' : 'text-slate-400 hover:text-[#00b4d8]'}`}>
            <FileText className="w-6 h-6" />
          </Link>
          <Link href="/documents" className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${pathname.startsWith('/documents') ? 'text-[#00b4d8] border-l-[3px] border-[#00b4d8] bg-[#e0f7fa]/50' : 'text-slate-400 hover:text-[#00b4d8]'}`}>
            <Folder className="w-6 h-6" />
          </Link>

          <div className="h-px w-8 bg-slate-100 my-2"></div>
          <Link href="/settings" className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${pathname.startsWith('/settings') ? 'text-[#00b4d8] border-l-[3px] border-[#00b4d8] bg-[#e0f7fa]/50' : 'text-slate-400 hover:text-[#00b4d8]'}`}>
            <UserCircle className="w-6 h-6" />
          </Link>
        </nav>

        <button className="text-slate-400 hover:text-rose-500 transition-colors mt-auto mb-4">
          <LogOut className="w-6 h-6" />
        </button>
      </aside>

      {/* Secondary Sidebar (#2b3652) */}
      <aside className="w-[320px] bg-[#2b3652] flex flex-col pt-10 pb-6 px-8 relative shrink-0 z-20">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white text-[#2b3652] font-black py-4 mb-12 shadow-sm hover:shadow-md hover:bg-[#00b4d8] hover:text-white transition flex justify-center items-center gap-2 rounded-none text-[11px] uppercase tracking-widest"
        >
          Générer un nouveau rapport
        </button>

        <div className="mb-12 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white/80 text-[11px] uppercase font-bold tracking-widest leading-none">Aperçu Global</h3>
          </div>

          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-5 bg-white/10 flex items-center justify-center rounded-none">
                  <div className="w-2 h-2 bg-white rounded-none"></div>
                </div>
                <span className="text-white text-3xl font-black tracking-tight">{stats?.opportunities ?? 0}</span>
              </div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider ml-8 mt-1">Opportunités</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-5 bg-[#00b4d8]/20 flex items-center justify-center rounded-none">
                  <div className="w-2 h-2 bg-[#00b4d8] rounded-none"></div>
                </div>
                <span className="text-white text-3xl font-black tracking-tight">{stats?.newOpps ?? 0}</span>
              </div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider ml-8 mt-1">Nouvelles</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-5 bg-[#00b4d8]/20 flex items-center justify-center rounded-none">
                  <div className="w-2 h-2 bg-[#00b4d8] rounded-none"></div>
                </div>
                <span className="text-white text-3xl font-black tracking-tight">{(stats?.signals ?? 0) >= 1000 ? ((stats?.signals ?? 0) / 1000).toFixed(1) + 'k' : (stats?.signals ?? 0)}</span>
              </div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider ml-8 mt-1">Signaux</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-5 bg-white/10 flex items-center justify-center rounded-none">
                  <div className="w-2 h-2 bg-white rounded-none"></div>
                </div>
                <span className="text-white text-3xl font-black tracking-tight">{stats?.averageScore ?? 0}</span>
              </div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider ml-8 mt-1">Score Moyen</p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white/80 text-[11px] uppercase font-bold tracking-widest leading-none">Dernières Opp.</h3>
          </div>

          <div className="space-y-3">
             {recentOpps.length > 0 ? recentOpps.map((opp) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`} className="block p-3 border hover:bg-white/5 border-white/10 transition group rounded-none focus:outline-none focus:ring-1 focus:ring-white/50">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold truncate pr-2 text-white/90 group-hover:text-white transition">{opp.title}</p>
                    <span className="text-[#00b4d8] border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-1.5 py-0.5 text-[10px] font-black">{opp.score_global}</span>
                  </div>
                  <p className="text-xs font-medium text-white/50 group-hover:text-white/60 transition">
                    {formatDept(opp.department)} • {opp.signal_count} occ.
                  </p>
                </Link>
             )) : (
                <p className="text-white/40 text-xs text-center py-4">Aucune opportunité récente</p>
             )}
          </div>
        </div>

        <Link href="/" className="mt-6 py-4 w-full block text-center border border-white/20 text-white/90 hover:text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-widest transition rounded-none">
          Voir tout
        </Link>
      </aside>
    </div>
    </>
  );
}
