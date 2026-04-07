'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react'

// ============================================
// Types locaux
// ============================================

type ProfileDraft = {
  // Bloc 1
  entrepreneurial_stage?: string
  main_motivation?: string[]
  time_horizon?: string
  prior_experience?: boolean
  // Bloc 2
  tech_level?: string
  secondary_skills?: string[]
  spoken_languages?: string[]
  weekly_availability?: string
  // Bloc 3
  budget_range?: string
  preferred_business_models?: string[]
  excluded_sectors?: string[]
  preferred_sectors?: string[]
  // Bloc 4
  preferred_solution_types?: string[]
  preferred_target?: string
  product_complexity?: string
  // Bloc 5
  priority_market?: string
  existing_sector_knowledge?: string
  // Bloc 6
  report_detail_level?: string
  report_tone?: string
}

const TOTAL_STEPS = 6

// ============================================
// Composants UI réutilisables
// ============================================

function OptionCard({
  label, description, selected, onClick, icon
}: {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
  icon?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 border-2 transition-all ${
        selected
          ? 'border-[#00b4d8] bg-[#00b4d8]/5'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {icon && <span className="text-xl mb-2 block">{icon}</span>}
          <p className={`font-bold text-sm ${selected ? 'text-[#2b3652]' : 'text-slate-700'}`}>{label}</p>
          {description && <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>}
        </div>
        {selected && (
          <div className="w-5 h-5 bg-[#00b4d8] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </button>
  )
}

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
        selected
          ? 'bg-[#2b3652] text-white border-[#2b3652]'
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-10">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#00b4d8] mb-2 block">
        Étape {step} / {TOTAL_STEPS}
      </span>
      <h2 className="text-3xl font-black text-[#2b3652] mb-3 tracking-tight">{title}</h2>
      <p className="text-slate-500 font-medium text-sm">{subtitle}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{children}</p>
  )
}

// ============================================
// Étapes du wizard
// ============================================

function Step1({ draft, onChange }: { draft: ProfileDraft; onChange: (d: Partial<ProfileDraft>) => void }) {
  const toggleMotivation = (val: string) => {
    const current = draft.main_motivation ?? []
    onChange({ main_motivation: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }

  return (
    <div>
      <StepHeader step={1} title="Votre profil entrepreneurial" subtitle="Quelques questions pour comprendre où vous en êtes et ce que vous cherchez vraiment." />

      <div className="space-y-8">
        <div>
          <SectionLabel>Où en êtes-vous dans votre démarche ?</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'exploration', label: "J'explore des idées", desc: "Pas encore de direction claire", icon: "🔍" },
              { val: 'validation', label: "Je valide une idée", desc: "J'ai une piste et je la teste", icon: "🧪" },
              { val: 'building', label: "Je construis", desc: "Je développe activement", icon: "🏗️" },
              { val: 'launched', label: "Déjà lancé", desc: "Mon produit est en vie", icon: "🚀" },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                selected={draft.entrepreneurial_stage === o.val}
                onClick={() => onChange({ entrepreneurial_stage: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Votre motivation principale (plusieurs choix possibles)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'financial_freedom', label: 'Liberté financière' },
              { val: 'passion', label: 'Passion technique' },
              { val: 'reconversion', label: 'Reconversion' },
              { val: 'impact', label: 'Impact positif' },
              { val: 'autonomy', label: 'Autonomie' },
              { val: 'revenue', label: 'Revenu complémentaire' },
            ].map(o => (
              <TagButton key={o.val} label={o.label}
                selected={(draft.main_motivation ?? []).includes(o.val)}
                onClick={() => toggleMotivation(o.val)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Horizon de temps pour rentabilité</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'short', label: '< 6 mois', desc: 'Je veux des revenus rapidement' },
              { val: 'medium', label: '6 à 24 mois', desc: 'Je peux investir du temps' },
              { val: 'long', label: '+ de 2 ans', desc: 'Je joue sur le long terme' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc}
                selected={draft.time_horizon === o.val}
                onClick={() => onChange({ time_horizon: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Expérience entrepreneuriale antérieure</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <OptionCard label="Première fois" description="Je n'ai jamais lancé de projet"
              selected={draft.prior_experience === false}
              onClick={() => onChange({ prior_experience: false })} />
            <OptionCard label="Déjà tenté" description="J'ai de l'expérience entrepreneuriale"
              selected={draft.prior_experience === true}
              onClick={() => onChange({ prior_experience: true })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2({ draft, onChange }: { draft: ProfileDraft; onChange: (d: Partial<ProfileDraft>) => void }) {
  const toggleSkill = (val: string) => {
    const current = draft.secondary_skills ?? []
    onChange({ secondary_skills: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }
  const toggleLang = (val: string) => {
    const current = draft.spoken_languages ?? []
    onChange({ spoken_languages: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }

  return (
    <div>
      <StepHeader step={2} title="Vos compétences" subtitle="Pour vous proposer des opportunités réalistes à construire seul ou en petite équipe." />

      <div className="space-y-8">
        <div>
          <SectionLabel>Votre niveau technique</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'non_tech', label: 'Non-technique', desc: 'Je ne code pas du tout', icon: '👤' },
              { val: 'low_code', label: 'Low-code / No-code', desc: 'Bubble, Webflow, Make...', icon: '🧩' },
              { val: 'junior_dev', label: 'Développeur junior', desc: "Je code mais j'apprends encore", icon: '💻' },
              { val: 'senior_dev', label: 'Développeur confirmé', desc: 'Je maîtrise plusieurs stacks', icon: '⚡' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                selected={draft.tech_level === o.val}
                onClick={() => onChange({ tech_level: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Compétences secondaires pertinentes</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'marketing', label: 'Marketing' },
              { val: 'design', label: 'Design' },
              { val: 'sales', label: 'Vente' },
              { val: 'finance', label: 'Finance' },
              { val: 'pm', label: 'Gestion de projet' },
              { val: 'writing', label: 'Rédaction' },
              { val: 'data', label: 'Data / Analyse' },
              { val: 'seo', label: 'SEO' },
            ].map(o => (
              <TagButton key={o.val} label={o.label}
                selected={(draft.secondary_skills ?? []).includes(o.val)}
                onClick={() => toggleSkill(o.val)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Langues pratiquées</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'fr', label: '🇫🇷 Français' },
              { val: 'en', label: '🇬🇧 Anglais' },
              { val: 'es', label: '🇪🇸 Espagnol' },
              { val: 'de', label: '🇩🇪 Allemand' },
              { val: 'pt', label: '🇵🇹 Portugais' },
            ].map(o => (
              <TagButton key={o.val} label={o.label}
                selected={(draft.spoken_languages ?? []).includes(o.val)}
                onClick={() => toggleLang(o.val)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Disponibilité approximative</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'few_hours', label: 'Quelques heures', desc: 'Projet secondaire' },
              { val: 'half_time', label: 'Mi-temps', desc: '~20h / semaine' },
              { val: 'full_time', label: 'Plein temps', desc: 'Je me consacre à ça' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc}
                selected={draft.weekly_availability === o.val}
                onClick={() => onChange({ weekly_availability: o.val })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3({ draft, onChange }: { draft: ProfileDraft; onChange: (d: Partial<ProfileDraft>) => void }) {
  const toggleModel = (val: string) => {
    const current = draft.preferred_business_models ?? []
    onChange({ preferred_business_models: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }
  const toggleExcluded = (val: string) => {
    const current = draft.excluded_sectors ?? []
    onChange({ excluded_sectors: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }

  return (
    <div>
      <StepHeader step={3} title="Contexte & contraintes" subtitle="Ces informations permettent d'éliminer les opportunités qui ne correspondent pas à votre situation." />

      <div className="space-y-8">
        <div>
          <SectionLabel>Budget disponible pour lancer</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'bootstrapped', label: 'Bootstrapped serré', desc: '< 1 000 €', icon: '🌱' },
              { val: 'few_thousands', label: 'Quelques milliers', desc: '1 000 – 10 000 €', icon: '💰' },
              { val: 'comfortable', label: 'Budget confortable', desc: '> 10 000 €', icon: '💎' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                selected={draft.budget_range === o.val}
                onClick={() => onChange({ budget_range: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Modèle business préféré (plusieurs choix)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'b2b', label: 'B2B' },
              { val: 'b2c', label: 'B2C' },
              { val: 'b2b2c', label: 'B2B2C' },
              { val: 'marketplace', label: 'Marketplace' },
              { val: 'indifferent', label: 'Indifférent' },
            ].map(o => (
              <TagButton key={o.val} label={o.label}
                selected={(draft.preferred_business_models ?? []).includes(o.val)}
                onClick={() => toggleModel(o.val)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Secteurs à éviter absolument</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'health', label: 'Santé / Pharma' },
              { val: 'finance', label: 'Finance / Banque' },
              { val: 'legal', label: 'Légal / Juridique' },
              { val: 'insurance', label: 'Assurance' },
              { val: 'defense', label: 'Défense' },
              { val: 'hr_sensitive', label: 'RH sensible' },
              { val: 'real_estate', label: 'Immobilier' },
            ].map(o => (
              <TagButton key={o.val} label={o.label}
                selected={(draft.excluded_sectors ?? []).includes(o.val)}
                onClick={() => toggleExcluded(o.val)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Secteurs d'affinité ou de connaissance</SectionLabel>
          <input
            type="text"
            placeholder="Ex : e-commerce, logistique, education, agriculture..."
            value={(draft.preferred_sectors ?? []).join(', ')}
            onChange={e => onChange({ preferred_sectors: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [] })}
            className="w-full border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 focus:outline-none focus:border-[#00b4d8] transition"
          />
        </div>
      </div>
    </div>
  )
}

function Step4({ draft, onChange }: { draft: ProfileDraft; onChange: (d: Partial<ProfileDraft>) => void }) {
  const toggleSolution = (val: string) => {
    const current = draft.preferred_solution_types ?? []
    onChange({ preferred_solution_types: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }

  return (
    <div>
      <StepHeader step={4} title="Vision produit" subtitle="Quel type de produit vous correspond le mieux ?" />

      <div className="space-y-8">
        <div>
          <SectionLabel>Type de solution préférée (plusieurs choix)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'productivity', label: 'Outil productivité' },
              { val: 'automation', label: 'Automatisation' },
              { val: 'platform', label: 'Plateforme' },
              { val: 'api', label: 'API / Service' },
              { val: 'widget', label: 'Widget / Extension' },
              { val: 'template', label: 'Template / Workflow' },
            ].map(o => (
              <TagButton key={o.val} label={o.label}
                selected={(draft.preferred_solution_types ?? []).includes(o.val)}
                onClick={() => toggleSolution(o.val)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Cible préférée</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'sme', label: 'TPE / PME', desc: 'Petites et moyennes entreprises', icon: '🏢' },
              { val: 'enterprise', label: 'Grandes entreprises', desc: 'Corporate et grands comptes', icon: '🏦' },
              { val: 'freelancers', label: 'Indépendants', desc: 'Freelances et solopreneurs', icon: '💼' },
              { val: 'consumers', label: 'Consommateurs', desc: 'Grand public (B2C)', icon: '👥' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                selected={draft.preferred_target === o.val}
                onClick={() => onChange({ preferred_target: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Complexité produit acceptable</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'mvp', label: 'MVP simple', desc: 'Lancer vite, itérer ensuite' },
              { val: 'elaborate', label: 'Produit élaboré', desc: 'Je vise la qualité dès le départ' },
              { val: 'indifferent', label: 'Indifférent', desc: "Selon l'opportunité" },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc}
                selected={draft.product_complexity === o.val}
                onClick={() => onChange({ product_complexity: o.val })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Step5({ draft, onChange }: { draft: ProfileDraft; onChange: (d: Partial<ProfileDraft>) => void }) {
  return (
    <div>
      <StepHeader step={5} title="Marché & géographie" subtitle="Où souhaitez-vous opérer ? Quelle est votre expertise sectorielle ?" />

      <div className="space-y-8">
        <div>
          <SectionLabel>Marché prioritaire</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'fr', label: 'France uniquement', desc: 'Je cible le marché français', icon: '🇫🇷' },
              { val: 'fr_qc', label: 'Francophone (FR + QC)', desc: 'France et Québec', icon: '🌍' },
              { val: 'europe', label: 'Europe', desc: 'Marché européen élargi', icon: '🇪🇺' },
              { val: 'international', label: 'International', desc: 'Ambition mondiale', icon: '🌐' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                selected={draft.priority_market === o.val}
                onClick={() => onChange({ priority_market: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Connaissance sectorielle particulière (optionnel)</SectionLabel>
          <p className="text-xs text-slate-500 font-medium mb-3">Y a-t-il un secteur que vous connaissez mieux que la moyenne grâce à votre parcours professionnel, personnel ou réseau ?</p>
          <textarea
            placeholder="Ex : J'ai travaillé 5 ans dans la logistique e-commerce. Je connais bien les problèmes des transporteurs et des entrepôts..."
            value={draft.existing_sector_knowledge ?? ''}
            onChange={e => onChange({ existing_sector_knowledge: e.target.value })}
            rows={4}
            className="w-full border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 focus:outline-none focus:border-[#00b4d8] transition resize-none"
          />
        </div>
      </div>
    </div>
  )
}

function Step6({ draft, onChange }: { draft: ProfileDraft; onChange: (d: Partial<ProfileDraft>) => void }) {
  return (
    <div>
      <StepHeader step={6} title="Préférences de rapport" subtitle="Comment souhaitez-vous que l'IA vous présente ses analyses ?" />

      <div className="space-y-8">
        <div>
          <SectionLabel>Niveau de détail souhaité</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'executive', label: 'Résumé exécutif', desc: 'Les points clés, sans détails superflus' },
              { val: 'full', label: 'Analyse complète', desc: 'Tout le contexte et les nuances' },
              { val: 'both', label: 'Les deux', desc: 'Résumé puis analyse détaillée' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc}
                selected={draft.report_detail_level === o.val}
                onClick={() => onChange({ report_detail_level: o.val })} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Ton préféré pour les rapports</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'analytical', label: 'Analytique', desc: 'Chiffré, factuel, comparatif', icon: '📊' },
              { val: 'narrative', label: 'Narratif', desc: 'Storytelling, contexte stratégique', icon: '📖' },
              { val: 'actionable', label: 'Actionnable', desc: 'Recommandations concrètes à chaque étape', icon: '⚡' },
            ].map(o => (
              <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                selected={draft.report_tone === o.val}
                onClick={() => onChange({ report_tone: o.val })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryStep({ summary, onEdit, onConfirm, loading }: {
  summary: string
  onEdit: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-[#2b3652] flex items-center justify-center mx-auto mb-8">
        <Sparkles className="w-10 h-10 text-[#00b4d8]" />
      </div>
      <h2 className="text-3xl font-black text-[#2b3652] mb-4 tracking-tight">Votre profil est prêt</h2>
      <p className="text-slate-500 font-medium text-sm mb-10">L'IA a synthétisé vos réponses. Voici comment elle vous perçoit :</p>

      <div className="bg-[#f4f7fb] border border-slate-200 p-8 mb-10 text-left relative">
        <div className="absolute -top-3 left-6 bg-[#00b4d8] px-3 py-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-white">Votre profil IA</span>
        </div>
        <p className="text-slate-700 font-medium leading-relaxed text-base italic">"{summary}"</p>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onEdit}
          disabled={loading}
          className="px-8 py-4 border border-slate-300 text-slate-600 font-bold uppercase tracking-widest text-xs hover:border-slate-400 transition"
        >
          Modifier mes réponses
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-[#2b3652] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#1e2840] transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Confirmer et accéder au dashboard
        </button>
      </div>
    </div>
  )
}

// ============================================
// Page principale — Wizard
// ============================================

export default function OnboardingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<ProfileDraft>({})
  const [saving, setSaving] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialisation : récupérer ou créer l'UUID
  useEffect(() => {
    async function init() {
      let id = localStorage.getItem('mi_user_id')

      if (!id) {
        const res = await fetch('/api/user/profile', { method: 'POST' })
        const data = await res.json()
        id = data.userId
        localStorage.setItem('mi_user_id', id!)
      } else {
        // Charger le profil existant
        const res = await fetch(`/api/user/profile?userId=${id}`)
        const data = await res.json()
        if (data.profile) {
          // Si onboarding déjà complété → redirect dashboard
          if (data.profile.onboarding_completed) {
            router.push('/')
            return
          }
          // Reprendre là où on en était
          const p = data.profile
          setDraft({
            entrepreneurial_stage: p.entrepreneurial_stage,
            main_motivation: p.main_motivation ?? [],
            time_horizon: p.time_horizon,
            prior_experience: p.prior_experience,
            tech_level: p.tech_level,
            secondary_skills: p.secondary_skills ?? [],
            spoken_languages: p.spoken_languages ?? [],
            weekly_availability: p.weekly_availability,
            budget_range: p.budget_range,
            preferred_business_models: p.preferred_business_models ?? [],
            excluded_sectors: p.excluded_sectors ?? [],
            preferred_sectors: p.preferred_sectors ?? [],
            preferred_solution_types: p.preferred_solution_types ?? [],
            preferred_target: p.preferred_target,
            product_complexity: p.product_complexity,
            priority_market: p.priority_market,
            existing_sector_knowledge: p.existing_sector_knowledge,
            report_detail_level: p.report_detail_level,
            report_tone: p.report_tone,
          })
          if (p.onboarding_step > 0) setCurrentStep(Math.min(p.onboarding_step, TOTAL_STEPS))
        }
      }

      setUserId(id!)
      setInitialized(true)
    }
    init()
  }, [router])

  const handleChange = useCallback((partial: Partial<ProfileDraft>) => {
    setDraft(prev => ({ ...prev, ...partial }))
  }, [])

  // Sauvegarde partielle à chaque passage d'étape
  const saveStep = useCallback(async (step: number, extraFields?: Record<string, unknown>) => {
    if (!userId) return
    setSaving(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...draft, onboarding_step: step, ...extraFields }),
      })
    } finally {
      setSaving(false)
    }
  }, [userId, draft])

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      await saveStep(currentStep + 1)
      setCurrentStep(s => s + 1)
    } else {
      // Étape 6 terminée → générer le résumé
      await saveStep(TOTAL_STEPS)
      setGeneratingSummary(true)
      try {
        const res = await fetch('/api/user/profile/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        const data = await res.json()
        setSummary(data.summary)
        setShowSummary(true)
      } catch {
        // En cas d'erreur, afficher un résumé générique
        setSummary("Votre profil a bien été enregistré. Vous pourrez le modifier depuis les paramètres.")
        setShowSummary(true)
      } finally {
        setGeneratingSummary(false)
      }
    }
  }

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false)
    } else {
      setCurrentStep(s => Math.max(1, s - 1))
    }
  }

  const handleConfirm = async () => {
    if (!userId) return
    setConfirming(true)
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, onboarding_completed: true }),
    })
    router.push('/')
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00b4d8]" />
      </div>
    )
  }

  const progress = showSummary ? 100 : ((currentStep - 1) / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      {/* Barre de progression */}
      <div className="h-1 bg-slate-200 shrink-0">
        <div
          className="h-full bg-[#00b4d8] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header minimal */}
      <div className="py-6 px-10 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2b3652] flex items-center justify-center">
              <span className="text-[#00b4d8] font-black text-xs">MI</span>
            </div>
            <span className="font-black text-[#2b3652] text-sm uppercase tracking-widest">Market Intelligence</span>
          </div>
          {!showSummary && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {currentStep} / {TOTAL_STEPS}
            </span>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-2xl">

          {showSummary ? (
            <SummaryStep
              summary={summary ?? ''}
              onEdit={() => setShowSummary(false)}
              onConfirm={handleConfirm}
              loading={confirming}
            />
          ) : (
            <>
              {currentStep === 1 && <Step1 draft={draft} onChange={handleChange} />}
              {currentStep === 2 && <Step2 draft={draft} onChange={handleChange} />}
              {currentStep === 3 && <Step3 draft={draft} onChange={handleChange} />}
              {currentStep === 4 && <Step4 draft={draft} onChange={handleChange} />}
              {currentStep === 5 && <Step5 draft={draft} onChange={handleChange} />}
              {currentStep === 6 && <Step6 draft={draft} onChange={handleChange} />}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700 transition disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" /> Précédent
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving || generatingSummary}
                  className="flex items-center gap-3 bg-[#2b3652] text-white px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-[#1e2840] transition disabled:opacity-50"
                >
                  {saving || generatingSummary ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {generatingSummary ? 'Génération...' : 'Sauvegarde...'}</>
                  ) : (
                    <>{currentStep === TOTAL_STEPS ? 'Générer mon profil' : 'Continuer'} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              {/* Lien pour passer */}
              <div className="text-center mt-6">
                <button
                  onClick={() => { if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1); else router.push('/'); }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium transition"
                >
                  Passer cette étape →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
