import { getOpportunities } from '@/lib/data';
import OpportunitiesPageClient from './OpportunitiesPageClient';

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();

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
