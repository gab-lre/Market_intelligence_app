import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import TopHeader from "@/components/TopHeader";
import OnboardingGate from "@/components/OnboardingGate";
import { supabase } from '@/lib/supabase';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaaS Market Intelligence",
  description: "Dénichez des opportunités B2B réelles",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- Données pour le composant Navigation (Sidebar) ---
  const { count: opportunityCount } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: scoreData } = await supabase
    .from('opportunities')
    .select('score_global')
    .eq('status', 'active');
    
  const avgScore = scoreData?.length
    ? Math.round(scoreData.reduce((s, o) => s + o.score_global, 0) / scoreData.length)
    : 0;

  const { count: signalCount } = await supabase
    .from('raw_signals')
    .select('*', { count: 'exact', head: true });

  const { data: topOpportunities } = await supabase
    .from('opportunities')
    .select('id, title, department, signal_count, score_global')
    .eq('status', 'active')
    .order('score_global', { ascending: false })
    .limit(3);

  const stats = {
    opportunities: opportunityCount ?? 0,
    newOpps: 0, // Placeholder
    signals: signalCount ?? 0,
    averageScore: avgScore
  };

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-white text-slate-800 h-screen w-screen flex overflow-hidden antialiased selection:bg-[#00b4d8]/30`}>
        <OnboardingGate />
        <Navigation stats={stats} recentOpps={topOpportunities || []} />
        <main className="flex-1 flex flex-col h-full bg-[#f4f7fb] relative">
          <TopHeader />
          <div className="flex-1 overflow-y-auto p-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
