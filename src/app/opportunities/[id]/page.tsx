import { notFound } from 'next/navigation'
import { getOpportunity } from '@/lib/data'
import BackButton from '@/components/BackButton'
import type {
  OpportunityType, TimeToMvp, Complexity, MarketSizeHint, RevenueModel,
} from '@/lib/data'
import { DEPARTMENTS, MARKET_LABELS } from '@/components/opportunities/display'

// ─── Helpers de formatage ───────────────────────────────────────────────────

function fmt(map: Record<string, string>, val: string | null): string {
  return val ? (map[val] ?? val) : '—'
}

const DEPT_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(DEPARTMENTS).map(([key, d]) => [key, d.label])
)
const TYPE_LABELS: Record<OpportunityType, string> = {
  saas: 'SaaS', ai_agent_service: 'Agent IA (service)',
  ai_agent_product: 'Agent IA (produit)', template: 'Template', micro_product: 'Micro-produit',
}
const MVP_LABELS: Record<TimeToMvp, string> = { days: 'Jours', weeks: 'Semaines', months: 'Mois' }
const COMPLEXITY_LABELS: Record<Complexity, string> = { low: 'Faible', medium: 'Moyenne', high: 'Élevée' }
const MARKET_SIZE_LABELS: Record<MarketSizeHint, string> = { niche: 'Niche', medium: 'Moyenne', large: 'Large' }
const REVENUE_LABELS: Record<RevenueModel, string> = {
  subscription: 'Abonnement', one_time: 'Achat unique', per_project: 'Par projet',
  usage_based: "À l'usage", freemium: 'Freemium',
}

// ─── Page ───────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params

  const opportunity = await getOpportunity(id)
  if (!opportunity) notFound()

  const signals = opportunity.signals

  const scores = [
    { label: 'Volume',    value: opportunity.score_volume,    help: 'Signaux collectés' },
    { label: 'Urgence',   value: opportunity.score_urgency,   help: 'Besoin urgent exprimé' },
    { label: 'Gap Outil', value: opportunity.score_tool_gap,  help: 'Manque outil existant' },
    { label: 'Saturation', value: opportunity.score_saturation, help: 'Concurrence actuelle' },
  ]

  const iaFields: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Type',          value: fmt(TYPE_LABELS, opportunity.opportunity_type) },
    { label: 'Marché Cible',  value: fmt(MARKET_LABELS, opportunity.target_market) },
    { label: 'Temps MVP',     value: fmt(MVP_LABELS, opportunity.time_to_mvp) },
    { label: 'Complexité',    value: fmt(COMPLEXITY_LABELS, opportunity.complexity) },
    { label: 'Fourchette Prix', value: opportunity.price_range ?? '—' },
    { label: 'Coût Estimé',   value: opportunity.estimated_cost ?? '—' },
    { label: 'Modèle Revenu', value: fmt(REVENUE_LABELS, opportunity.revenue_model) },
    { label: 'Taille Marché', value: fmt(MARKET_SIZE_LABELS, opportunity.market_size_hint) },
    { label: 'Solo Dev',      value: opportunity.solo_dev_feasible ? 'Oui' : 'Non' },
    { label: 'Récurrent',     value: opportunity.recurring_potential === null ? '—' : opportunity.recurring_potential ? 'Oui' : 'Non' },
  ]

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500 pt-2 pb-20">

      {/* Back */}
      <div className="flex items-center gap-4 mb-2 shrink-0">
        <BackButton />
      </div>

      {/* Main Content Wrapper (matches dashboard vertical flow) */}
      <div className="space-y-8 flex-1">

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 bg-white border border-[#257b57]/30 text-[#257b57] text-[11px] font-bold tracking-wider uppercase rounded-[8px] shadow-sm">
                Score : {opportunity.score_global}
              </span>
              {opportunity.department && (
                <span className="px-2.5 py-1 bg-[#FAFBFC] border border-[#F0F2F4] text-[#707478] text-[11px] font-bold tracking-wider uppercase rounded-[8px] shadow-sm">
                  {fmt(DEPT_LABELS, opportunity.department)}
                </span>
              )}
              <span className="px-2.5 py-1 bg-[#E6F4EA] border border-[#257b57]/20 text-[#257b57] text-[11px] font-bold tracking-wider uppercase rounded-[8px] shadow-sm">
                {fmt(TYPE_LABELS, opportunity.opportunity_type)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">{opportunity.title}</h1>
          </div>
          <button className="px-5 py-3 bg-[#2b3652] text-white font-black text-[11px] uppercase tracking-widest rounded-[16px] shadow-[0_4px_12px_rgba(43,54,82,0.15)] hover:bg-[#1f283d] hover:shadow-[0_6px_16px_rgba(43,54,82,0.25)] transition-all hover:-translate-y-0.5">
            Générer le Rapport IA
          </button>
        </div>
      </header>

      {/* Grille 4 scores */}
      <div className="grid grid-cols-4 gap-6">
        {scores.map((s) => (
          <div key={s.label} className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{s.label}</p>
            <p className="text-3xl font-black text-[#2b3652] mb-3">{s.value}</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#257b57] rounded-full"
                style={{ width: `${Math.min(100, s.value)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">{s.help}</p>
          </div>
        ))}
      </div>

      {/* Problème + Description */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#257b57] pb-2 inline-block mb-5">Problème Identifié</h3>
          <p className="text-[#1A1C1E] text-sm leading-relaxed">{opportunity.problem ?? '—'}</p>
        </div>
        <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#257b57] pb-2 inline-block mb-5">Description</h3>
          <p className="text-[#1A1C1E] text-sm leading-relaxed">{opportunity.description ?? '—'}</p>
        </div>
      </div>

      {/* Champs IA */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#257b57] pb-2 inline-block mb-8">Analyse IA</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          {iaFields.map((f) => (
            <div key={f.label}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{f.label}</p>
              <p className="text-sm font-bold text-[#1A1C1E]">{f.value}</p>
            </div>
          ))}
        </div>

        {opportunity.key_challenges?.length > 0 && (
          <div className="border-t border-slate-100 pt-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Défis Clés</p>
            <ul className="space-y-1">
              {opportunity.key_challenges.map((c, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#257b57] mt-1.5 shrink-0"></span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Outils existants */}
      {(opportunity.existing_tools?.length > 0 || opportunity.tool_gaps) && (
        <div className="grid grid-cols-2 gap-8">
          {opportunity.existing_tools?.length > 0 && (
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#257b57] pb-2 inline-block mb-5">Outils Existants</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.existing_tools.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#FAFBFC] border border-[#F0F2F4] text-[#1A1C1E] text-xs font-bold rounded-[8px]">{t}</span>
                ))}
              </div>
            </div>
          )}
          {opportunity.tool_gaps && (
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#257b57] pb-2 inline-block mb-5">Lacunes Identifiées</h3>
              <p className="text-[#1A1C1E] text-sm leading-relaxed">{opportunity.tool_gaps}</p>
            </div>
          )}
        </div>
      )}

      {/* Signaux liés */}
      <div>
        <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#257b57] pb-2 inline-block mb-6">
          Signaux Liés ({signals.length})
        </h3>
        <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          {signals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center bg-[#FAFBFC]">
              <p className="text-[#1A1C1E] font-bold text-sm">Aucun signal lié</p>
              <p className="text-slate-500 text-xs mt-1">Les signaux apparaîtront après une analyse IA.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFBFC] border-b border-[#F0F2F4]">
                  <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] w-2/5">Titre du Signal</th>
                  <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Source</th>
                  <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Date</th>
                  <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-[#A0A4A8]">Note de Pertinence</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((link, i) => (
                  <tr key={link.id ?? i} className="border-b border-[#F0F2F4] hover:bg-[#FAFBFC] transition-colors">
                    <td className="py-4 px-8 text-[13px] font-medium text-[#1A1C1E]">
                      {link.url ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#257b57] hover:underline font-bold"
                        >
                          {link.title ?? 'Sans titre'}
                        </a>
                      ) : (
                        link.title ?? 'Sans titre'
                      )}
                    </td>
                    <td className="py-4 px-8">
                      <span className="px-2.5 py-1 bg-[#FAFBFC] border border-[#F0F2F4] text-[#707478] text-[9px] font-black uppercase tracking-widest rounded-[8px]">
                        {link.source}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-[#A0A4A8] text-[12px] font-medium">
                      {new Date(link.collected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-8 text-[#707478] text-[12px] font-medium">{link.relevance_note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
