'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Lightbulb,
  FolderOpen,
  BarChart2,
  Database,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  Sprout,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'Menu',
    links: [
      { href: '/',              label: 'Dashboard',     icon: LayoutDashboard, match: (p: string) => p === '/' },
      { href: '/opportunities', label: 'Opportunités',  icon: Lightbulb,       match: (p: string) => p.startsWith('/opportunities') },
      { href: '/documents',     label: 'Mes Documents', icon: FolderOpen,      match: (p: string) => p.startsWith('/documents') },
      { href: '/reports',       label: 'Rapports',      icon: BarChart2,       match: (p: string) => p.startsWith('/reports') },
      { href: '/sources',       label: 'Sources',       icon: Database,        match: (p: string) => p.startsWith('/sources') },
    ],
  },
  {
    section: 'Compte',
    links: [
      { href: '/settings',      label: 'Mon Profil',    icon: UserCircle,      match: (p: string) => p.startsWith('/settings') },
      { href: '/help',          label: 'Aide',          icon: HelpCircle,      match: (p: string) => p.startsWith('/help') },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] h-full bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col py-7 px-5 shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#257b57] text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Sprout strokeWidth={2} className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[13px] font-black text-[#1A1C1E] leading-none">Market</p>
            <p className="text-[10px] font-bold text-[#707478] leading-none mt-0.5">Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <div className="flex flex-col gap-6 flex-1 overflow-y-auto plugin-noscrollbar">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <h4 className="text-[9px] font-black tracking-widest uppercase text-[#B0B4B8] mb-2 pl-2">
              {section.section}
            </h4>
            <nav className="flex flex-col gap-0.5">
              {section.links.map(({ href, label, icon: Icon, match }) => {
                const active = match(pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                      active
                        ? 'bg-[#1A1C1E] text-white font-bold shadow-sm'
                        : 'text-[#707478] hover:text-[#1A1C1E] hover:bg-[#F4F6F8]'
                    }`}
                  >
                    <Icon
                      strokeWidth={active ? 2.5 : 1.8}
                      className="w-[18px] h-[18px] shrink-0"
                    />
                    <span>{label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#257b57] shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer — Logout */}
      <div className="mt-4 pt-4 border-t border-[#F4F6F8]">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[#707478] hover:text-rose-500 hover:bg-rose-50 transition-all text-sm">
          <LogOut strokeWidth={1.8} className="w-[18px] h-[18px] shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
