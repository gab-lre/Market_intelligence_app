'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Sparkles, RefreshCw, Save } from 'lucide-react'

// ============================================
// Types
// ============================================

type ProfileDraft = {
  entrepreneurial_stage?: string
  main_motivation?: string[]
  time_horizon?: string
  prior_experience?: boolean
  tech_level?: string
  secondary_skills?: string[]
  spoken_languages?: string[]
  weekly_availability?: string
  budget_range?: string
  preferred_business_models?: string[]
  excluded_sectors?: string[]
  preferred_sectors?: string[]
  preferred_solution_types?: string[]
  preferred_target?: string
  product_complexity?: string
  priority_market?: string
  existing_sector_knowledge?: string
  report_detail_level?: string
  report_tone?: string
}

// ============================================
// UI composants réutilisables
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-black text-[#2b3652] mb-6 pb-3 border-b border-slate-100">{children}</h2>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{children}</p>
  )
}

// ============================================
// Page Settings
// ============================================

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ProfileDraft>({})
  const [profileSummary, setProfileSummary] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function load() {
      const id = localStorage.getItem('mi_user_id')
      if (!id) { setInitialized(true); return }
      setUserId(id)

      const res = await fetch(`/api/user/profile?userId=${id}`)
      const data = await res.json()
      if (data.profile) {
        const p = data.profile
        setProfileSummary(p.profile_summary ?? null)
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
      }
      setInitialized(true)
    }
    load()
  }, [])

  const update = (partial: Partial<ProfileDraft>) => {
    setDraft(prev => ({ ...prev, ...partial }))
    setSaveSuccess(false)
  }

  const toggle = (field: keyof ProfileDraft, val: string) => {
    const current = (draft[field] as string[] | undefined) ?? []
    update({ [field]: current.includes(val) ? current.filter(v => v !== val) : [...current, val] })
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...draft }),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!userId) return
    setRegenerating(true)
    try {
      // Sauvegarder d'abord le profil courant
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...draft }),
      })
      // Puis régénérer le résumé
      const res = await fetch('/api/user/profile/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      setProfileSummary(data.summary)
    } finally {
      setRegenerating(false)
    }
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#00b4d8]" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-slate-500 font-medium">Aucun profil trouvé. Complétez d'abord l'onboarding.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto pb-20">

      {/* Header */}
      <div className="mb-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00b4d8] mb-2 block">
          Paramètres
        </span>
        <h1 className="text-3xl font-black text-[#2b3652] tracking-tight">Mon profil</h1>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Ces informations personnalisent toutes les analyses et rapports générés par l'IA.
        </p>
      </div>

      {/* Résumé IA */}
      {profileSummary && (
        <div className="bg-[#2b3652] p-8 mb-10 relative">
          <div className="absolute -top-3 left-6 bg-[#00b4d8] px-3 py-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Profil IA</span>
          </div>
          <div className="flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-[#00b4d8] shrink-0 mt-0.5" />
            <p className="text-white/80 font-medium leading-relaxed text-sm italic flex-1">"{profileSummary}"</p>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest hover:border-white/40 hover:text-white transition disabled:opacity-40"
            >
              {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Régénérer
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">

        {/* BLOC 1 — Profil entrepreneurial */}
        <div className="bg-white border border-slate-200 p-8">
          <SectionTitle>Profil entrepreneurial</SectionTitle>
          <div className="space-y-8">
            <div>
              <FieldLabel>Où en êtes-vous dans votre démarche ?</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'exploration', label: "J'explore des idées", desc: "Pas encore de direction claire", icon: "🔍" },
                  { val: 'validation', label: "Je valide une idée", desc: "J'ai une piste et je la teste", icon: "🧪" },
                  { val: 'building', label: "Je construis", desc: "Je développe activement", icon: "🏗️" },
                  { val: 'launched', label: "Déjà lancé", desc: "Mon produit est en vie", icon: "🚀" },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.entrepreneurial_stage === o.val}
                    onClick={() => update({ entrepreneurial_stage: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Motivation principale (plusieurs choix)</FieldLabel>
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
                    onClick={() => toggle('main_motivation', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Horizon de temps pour rentabilité</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'short', label: '< 6 mois', desc: 'Je veux des revenus rapidement' },
                  { val: 'medium', label: '6 à 24 mois', desc: 'Je peux investir du temps' },
                  { val: 'long', label: '+ de 2 ans', desc: 'Je joue sur le long terme' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.time_horizon === o.val}
                    onClick={() => update({ time_horizon: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Expérience entrepreneuriale</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <OptionCard label="Première fois" description="Je n'ai jamais lancé de projet"
                  selected={draft.prior_experience === false}
                  onClick={() => update({ prior_experience: false })} />
                <OptionCard label="Déjà tenté" description="J'ai de l'expérience entrepreneuriale"
                  selected={draft.prior_experience === true}
                  onClick={() => update({ prior_experience: true })} />
              </div>
            </div>
          </div>
        </div>

        {/* BLOC 2 — Compétences */}
        <div className="bg-white border border-slate-200 p-8">
          <SectionTitle>Compétences</SectionTitle>
          <div className="space-y-8">
            <div>
              <FieldLabel>Niveau technique</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'non_tech', label: 'Non-technique', desc: 'Je ne code pas du tout', icon: '👤' },
                  { val: 'low_code', label: 'Low-code / No-code', desc: 'Bubble, Webflow, Make...', icon: '🧩' },
                  { val: 'junior_dev', label: 'Développeur junior', desc: 'Je code mais j\'apprends encore', icon: '💻' },
                  { val: 'senior_dev', label: 'Développeur confirmé', desc: 'Je maîtrise plusieurs stacks', icon: '⚡' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.tech_level === o.val}
                    onClick={() => update({ tech_level: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Compétences secondaires</FieldLabel>
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
                    onClick={() => toggle('secondary_skills', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Langues</FieldLabel>
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
                    onClick={() => toggle('spoken_languages', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Disponibilité</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'few_hours', label: 'Quelques heures', desc: 'Projet secondaire' },
                  { val: 'half_time', label: 'Mi-temps', desc: '~20h / semaine' },
                  { val: 'full_time', label: 'Plein temps', desc: 'Je me consacre à ça' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.weekly_availability === o.val}
                    onClick={() => update({ weekly_availability: o.val })} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BLOC 3 — Contexte & contraintes */}
        <div className="bg-white border border-slate-200 p-8">
          <SectionTitle>Contexte & contraintes</SectionTitle>
          <div className="space-y-8">
            <div>
              <FieldLabel>Budget disponible</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'bootstrapped', label: 'Bootstrapped serré', desc: '< 1 000 €', icon: '🌱' },
                  { val: 'few_thousands', label: 'Quelques milliers', desc: '1 000 – 10 000 €', icon: '💰' },
                  { val: 'comfortable', label: 'Budget confortable', desc: '> 10 000 €', icon: '💎' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.budget_range === o.val}
                    onClick={() => update({ budget_range: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Modèle business préféré</FieldLabel>
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
                    onClick={() => toggle('preferred_business_models', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Secteurs à éviter</FieldLabel>
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
                    onClick={() => toggle('excluded_sectors', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Secteurs d'affinité</FieldLabel>
              <input
                type="text"
                placeholder="Ex : e-commerce, logistique, education..."
                value={(draft.preferred_sectors ?? []).join(', ')}
                onChange={e => update({ preferred_sectors: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [] })}
                className="w-full border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 focus:outline-none focus:border-[#00b4d8] transition"
              />
            </div>
          </div>
        </div>

        {/* BLOC 4 — Vision produit */}
        <div className="bg-white border border-slate-200 p-8">
          <SectionTitle>Vision produit</SectionTitle>
          <div className="space-y-8">
            <div>
              <FieldLabel>Type de solution préférée</FieldLabel>
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
                    onClick={() => toggle('preferred_solution_types', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Cible préférée</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'sme', label: 'TPE / PME', desc: 'Petites et moyennes entreprises', icon: '🏢' },
                  { val: 'enterprise', label: 'Grandes entreprises', desc: 'Corporate et grands comptes', icon: '🏦' },
                  { val: 'freelancers', label: 'Indépendants', desc: 'Freelances et solopreneurs', icon: '💼' },
                  { val: 'consumers', label: 'Consommateurs', desc: 'Grand public (B2C)', icon: '👥' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.preferred_target === o.val}
                    onClick={() => update({ preferred_target: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Complexité produit acceptable</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'mvp', label: 'MVP simple', desc: 'Lancer vite, itérer ensuite' },
                  { val: 'elaborate', label: 'Produit élaboré', desc: 'Je vise la qualité dès le départ' },
                  { val: 'indifferent', label: 'Indifférent', desc: 'Selon l\'opportunité' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.product_complexity === o.val}
                    onClick={() => update({ product_complexity: o.val })} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BLOC 5 — Marché */}
        <div className="bg-white border border-slate-200 p-8">
          <SectionTitle>Marché & géographie</SectionTitle>
          <div className="space-y-8">
            <div>
              <FieldLabel>Marché prioritaire</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'fr', label: 'France uniquement', desc: 'Je cible le marché français', icon: '🇫🇷' },
                  { val: 'fr_qc', label: 'Francophone (FR + QC)', desc: 'France et Québec', icon: '🌍' },
                  { val: 'europe', label: 'Europe', desc: 'Marché européen élargi', icon: '🇪🇺' },
                  { val: 'international', label: 'International', desc: 'Ambition mondiale', icon: '🌐' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.priority_market === o.val}
                    onClick={() => update({ priority_market: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Connaissance sectorielle particulière (optionnel)</FieldLabel>
              <textarea
                placeholder="Ex : J'ai travaillé 5 ans dans la logistique e-commerce..."
                value={draft.existing_sector_knowledge ?? ''}
                onChange={e => update({ existing_sector_knowledge: e.target.value })}
                rows={4}
                className="w-full border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 focus:outline-none focus:border-[#00b4d8] transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* BLOC 6 — Préférences rapport */}
        <div className="bg-white border border-slate-200 p-8">
          <SectionTitle>Préférences de rapport</SectionTitle>
          <div className="space-y-8">
            <div>
              <FieldLabel>Niveau de détail souhaité</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'executive', label: 'Résumé exécutif', desc: 'Les points clés, sans détails superflus' },
                  { val: 'full', label: 'Analyse complète', desc: 'Tout le contexte et les nuances' },
                  { val: 'both', label: 'Les deux', desc: 'Résumé puis analyse détaillée' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.report_detail_level === o.val}
                    onClick={() => update({ report_detail_level: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Ton préféré</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'analytical', label: 'Analytique', desc: 'Chiffré, factuel, comparatif', icon: '📊' },
                  { val: 'narrative', label: 'Narratif', desc: 'Storytelling, contexte stratégique', icon: '📖' },
                  { val: 'actionable', label: 'Actionnable', desc: 'Recommandations concrètes', icon: '⚡' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.report_tone === o.val}
                    onClick={() => update({ report_tone: o.val })} />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bouton Sauvegarder */}
      <div className="mt-10 flex items-center justify-between bg-white border border-slate-200 p-6">
        <div>
          <p className="text-sm font-bold text-slate-700">Sauvegarder les modifications</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Les prochains rapports générés utiliseront ce profil mis à jour.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-[#2b3652] text-white px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-[#1e2840] transition disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
          ) : saveSuccess ? (
            <><Check className="w-4 h-4" /> Sauvegardé</>
          ) : (
            <><Save className="w-4 h-4" /> Sauvegarder</>
          )}
        </button>
      </div>

    </div>
  )
}
