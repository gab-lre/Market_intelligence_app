import { supabase } from '@/lib/supabase';
import OpportunitiesPageClient from './OpportunitiesPageClient';

export default async function OpportunitiesPage() {
  // Fetch all opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, problem, department, signal_count, score_global, target_market, created_at')
    .order('score_global', { ascending: false });

  // KPIs
  const total = opportunities?.length ?? 0;
  const avgScore = total > 0
    ? Math.round((opportunities ?? []).reduce((s, o) => s + (o.score_global ?? 0), 0) / total)
    : 0;
  const highScore = (opportunities ?? []).filter(o => (o.score_global ?? 0) >= 70).length;

  return (
    <OpportunitiesPageClient
      opportunities={opportunities ?? []}
      kpis={{ total, avgScore, highScore }}
    />
  );
}
