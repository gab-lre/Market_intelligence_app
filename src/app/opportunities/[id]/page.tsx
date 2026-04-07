import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'
import type {
  Opportunity, RawSignal,
  OpportunityDepartment, TargetMarket, OpportunityType,
  TimeToMvp, Complexity, MarketSizeHint, RevenueModel,
} from '@/types/database'

// ─── Helpers de formatage ───────────────────────────────────────────────────

function fmt(map: Record<string, string>, val: string | null): string {
  return val ? (map[val] ?? val) : '—'
}

const DEPT_LABELS: Record<OpportunityDepartment, string> = {
  commercial: 'Commercial', marketing: 'Marketing', operations: 'Opérations',
  finance: 'Finance', rh: 'RH', technique: 'Technique', support: 'Support', autre: 'Autre',
}
const MARKET_LABELS: Record<TargetMarket, string> = {
  fr: 'France', qc: 'Québec', fr_qc: 'FR & QC', international: 'International',
}
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

// ─── Types pour le join signaux ──────────────────────────────────────────────

type SignalLink = {
  relevance_note: string | null
  raw_signals: Pick<RawSignal, 'id' | 'title' | 'source' | 'url' | 'collected_at'>
}

// ─── Page ───────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params

  const { data: rawOpportunity, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!rawOpportunity || error) notFound()
  const opportunity = rawOpportunity as unknown as Opportunity

  const { data: signalLinks } = await supabase
    .from('opportunity_signals')
    .select('relevance_note, raw_signals(id, title, source, url, collected_at)')
    .eq('opportunity_id', id)

  const signals = (signalLinks ?? []) as unknown as SignalLink[]

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
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pt-2 pb-20">

      {/* Back */}
      <div className="flex items-center gap-4 mb-2">
        <BackButton />
      </div>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 bg-white border border-[#00b4d8]/30 text-[#00b4d8] text-[11px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
                Score : {opportunity.score_global}
              </span>
              {opportunity.department && (
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
                  {fmt(DEPT_LABELS, opportunity.department)}
                </span>
              )}
              <span className="px-2.5 py-1 bg-[#e0f7fa] border border-[#00b4d8]/20 text-[#2b3652] text-[11px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
                {fmt(TYPE_LABELS, opportunity.opportunity_type)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#2b3652] tracking-tight">{opportunity.title}</h1>
          </div>
          <button className="px-4 py-2.5 bg-[#2b3652] text-white font-bold text-[10px] uppercase tracking-widest rounded-none shadow-sm hover:bg-[#1f283d] transition">
            Générer le Rapport IA
          </button>
        </div>
      </header>

      {/* Grille 4 scores */}
      <div className="grid grid-cols-4 gap-6">
        {scores.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{s.label}</p>
            <p className="text-3xl font-black text-[#2b3652] mb-3">{s.value}</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-none">
              <div
                className="h-1.5 bg-[#00b4d8] rounded-none"
                style={{ width: `${Math.min(100, s.value)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">{s.help}</p>
          </div>
        ))}
      </div>

      {/* Problème + Description */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-5">Problème Identifié</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{opportunity.problem ?? '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-5">Description</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{opportunity.description ?? '—'}</p>
        </div>
      </div>

      {/* Champs IA */}
      <div className="bg-[#2b3652] p-1 shadow-xl">
        <div className="bg-white border border-slate-200 p-8">
          <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-8">Analyse IA</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            {iaFields.map((f) => (
              <div key={f.label}>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{f.label}</p>
                <p className="text-sm font-bold text-[#2b3652]">{f.value}</p>
              </div>
            ))}
          </div>

          {opportunity.key_challenges?.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Défis Clés</p>
              <ul className="space-y-1">
                {opportunity.key_challenges.map((c, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[#00b4d8] mt-1.5 shrink-0"></span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Outils existants */}
      {(opportunity.existing_tools?.length > 0 || opportunity.tool_gaps) && (
        <div className="grid grid-cols-2 gap-8">
          {opportunity.existing_tools?.length > 0 && (
            <div className="bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-5">Outils Existants</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.existing_tools.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-none">{t}</span>
                ))}
              </div>
            </div>
          )}
          {opportunity.tool_gaps && (
            <div className="bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[11px] uppercase font-black tracking-widest text-slate-500 border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-5">Lacunes Identifiées</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{opportunity.tool_gaps}</p>
            </div>
          )}
        </div>
      )}

      {/* Signaux liés */}
      <div>
        <h3 className="text-slate-600 text-[11px] uppercase font-black tracking-widest border-b-[3px] border-[#00b4d8] pb-2 inline-block mb-6">
          Signaux Liés ({signals.length})
        </h3>
        <div className="bg-[#2b3652] p-1 shadow-xl">
          <div className="bg-white border border-slate-200">
            {signals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-[#2b3652] font-bold text-sm">Aucun signal lié</p>
                <p className="text-slate-500 text-xs mt-1">Les signaux apparaîtront après une analyse IA.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 w-2/5">Titre du Signal</th>
                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Source</th>
                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Note de Pertinence</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((link, i) => (
                    <tr key={link.raw_signals.id ?? i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-4 px-8 text-sm font-medium text-slate-700">
                        {link.raw_signals.url ? (
                          <a
                            href={link.raw_signals.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00b4d8] hover:underline"
                          >
                            {link.raw_signals.title ?? 'Sans titre'}
                          </a>
                        ) : (
                          link.raw_signals.title ?? 'Sans titre'
                        )}
                      </td>
                      <td className="py-4 px-8">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-none">
                          {link.raw_signals.source}
                        </span>
                      </td>
                      <td className="py-4 px-8 text-slate-400 text-xs font-medium">
                        {new Date(link.raw_signals.collected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-8 text-slate-500 text-xs font-medium">{link.relevance_note ?? '—'}</td>
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
