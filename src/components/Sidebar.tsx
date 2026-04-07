'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, Activity, Map } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sources API', href: '/sources', icon: Database },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 h-screen sticky top-0 flex flex-col shrink-0">
      <div className="flex items-center gap-3 mb-10 mt-2 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight leading-tight block">Market</span>
          <span className="text-sm font-semibold text-emerald-400 leading-tight block">Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-3 bg-gray-950/50 rounded-2xl border border-gray-800 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-gray-500 shadow-sm"></div>
          <div className="text-sm">
            <p className="text-white font-semibold">Workspace</p>
            <p className="text-emerald-500 text-[11px] font-bold tracking-wide uppercase">Mode Local</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
