'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Sparkles, RefreshCw, Save, UserCircle, ChevronRight } from 'lucide-react'
import { getProfile, type Profile } from '@/lib/data'
import { regenerateProfileSummary, saveProfile } from '@/lib/actions'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type ProfileDraft = Omit<Profile, 'profile_summary'>

// ──────────────────────────────────────────────
// Reusable sub-components
// ──────────────────────────────────────────────

function OptionCard({
  label, description, selected, onClick, icon
}: {
  label: string; description?: string; selected: boolean; onClick: () => void; icon?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        selected
          ? 'border-[#257b57] bg-[#E6F4EA]'
          : 'border-[#F0F2F4] bg-[#FAFBFC] hover:border-[#E0E0E0] hover:bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {icon && <span className="text-lg mb-1.5 block">{icon}</span>}
          <p className={`font-bold text-[13px] ${selected ? 'text-[#1A1C1E]' : 'text-[#707478]'}`}>{label}</p>
          {description && <p className="text-[11px] text-[#A0A4A8] mt-0.5 font-medium leading-snug">{description}</p>}
        </div>
        {selected && (
          <div className="w-5 h-5 bg-[#257b57] rounded-full flex items-center justify-center shrink-0 mt-0.5">
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
      className={`px-3.5 py-1.5 text-[12px] font-bold rounded-xl border transition-all ${
        selected
          ? 'bg-[#1A1C1E] text-white border-[#1A1C1E]'
          : 'bg-white text-[#707478] border-[#E0E0E0] hover:border-[#1A1C1E] hover:text-[#1A1C1E]'
      }`}
    >
      {label}
    </button>
  )
}

function SectionCard({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F4F6F8]">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#F4F6F8] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-black text-[#1A1C1E] text-[15px]">{title}</h2>
          {subtitle && <p className="text-[11px] text-[#707478] font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-2.5">{children}</p>
  )
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function SettingsPage() {
  const [hasProfile, setHasProfile] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>({})
  const [profileSummary, setProfileSummary] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function load() {
      const profile = await getProfile()
      if (profile) {
        const { profile_summary, ...fields } = profile
        setHasProfile(true)
        setProfileSummary(profile_summary ?? null)
        setDraft(fields)
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
    if (!hasProfile) return
    setSaving(true)
    try {
      await saveProfile(draft)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!hasProfile) return
    setRegenerating(true)
    try {
      await saveProfile(draft)
      const data = await regenerateProfileSummary(draft)
      setProfileSummary(data.summary)
    } finally {
      setRegenerating(false)
    }
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#257b57]" />
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <UserCircle className="w-12 h-12 text-[#D0D4D8]" strokeWidth={1.5} />
        <p className="text-[#707478] font-medium text-sm">Aucun profil trouvé. Complétez d&apos;abord l&apos;onboarding.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full min-h-0 pl-4">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[22px] font-black text-[#1A1C1E] tracking-tight">Mon Profil</h1>
          <p className="text-[13px] text-[#707478] font-medium mt-0.5">Ces informations personnalisent vos analyses et rapports IA.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all shadow-sm disabled:opacity-60 ${
            saveSuccess
              ? 'bg-[#E6F4EA] text-[#257b57] border border-[#257b57]/20'
              : 'bg-[#1A1C1E] text-white hover:bg-black'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde...</>
          ) : saveSuccess ? (
            <><Check className="w-3.5 h-3.5" /> Sauvegardé</>
          ) : (
            <><Save className="w-3.5 h-3.5" /> Sauvegarder</>
          )}
        </button>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto plugin-noscrollbar space-y-4 pb-4">

        {/* AI Profile Summary */}
        {profileSummary && (
          <div className="bg-[#1A1C1E] rounded-[24px] p-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#257b57] opacity-10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#257b57]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#257b57]">Résumé IA de ton profil</span>
              </div>
              <p className="text-white/70 text-[13px] font-medium leading-relaxed italic">&quot;{profileSummary}&quot;</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white/60 text-[11px] font-bold rounded-xl hover:border-white/40 hover:text-white transition-all disabled:opacity-40"
                >
                  {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Régénérer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 1 — Profil Entrepreneurial */}
        <SectionCard
          title="Profil Entrepreneurial"
          subtitle="Votre stade de développement et vos motivations"
          icon={<ChevronRight className="w-4 h-4 text-[#707478]" />}
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Où en êtes-vous dans votre démarche ?</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'exploration', label: "J'explore des idées",  desc: "Pas encore de direction claire", icon: "🔍" },
                  { val: 'validation',  label: "Je valide une idée",    desc: "J'ai une piste et je la teste", icon: "🧪" },
                  { val: 'building',    label: "Je construis",          desc: "Je développe activement",       icon: "🏗️" },
                  { val: 'launched',    label: "Déjà lancé",            desc: "Mon produit est en vie",         icon: "🚀" },
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
                  { val: 'passion',           label: 'Passion technique' },
                  { val: 'reconversion',      label: 'Reconversion' },
                  { val: 'impact',            label: 'Impact positif' },
                  { val: 'autonomy',          label: 'Autonomie' },
                  { val: 'revenue',           label: 'Revenu complémentaire' },
                ].map(o => (
                  <TagButton key={o.val} label={o.label}
                    selected={(draft.main_motivation ?? []).includes(o.val)}
                    onClick={() => toggle('main_motivation', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Horizon de temps pour rentabilité</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'short',  label: '< 6 mois',      desc: 'Je veux des revenus rapidement' },
                  { val: 'medium', label: '6 à 24 mois',   desc: 'Je peux investir du temps' },
                  { val: 'long',   label: '+ de 2 ans',    desc: 'Je joue sur le long terme' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.time_horizon === o.val}
                    onClick={() => update({ time_horizon: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Expérience entrepreneuriale</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <OptionCard label="Première fois" description="Je n'ai jamais lancé de projet"
                  selected={draft.prior_experience === false}
                  onClick={() => update({ prior_experience: false })} />
                <OptionCard label="Déjà tenté" description="J'ai de l'expérience entrepreneuriale"
                  selected={draft.prior_experience === true}
                  onClick={() => update({ prior_experience: true })} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 2 — Compétences */}
        <SectionCard
          title="Compétences"
          subtitle="Votre niveau technique et vos forces complémentaires"
          icon={<ChevronRight className="w-4 h-4 text-[#707478]" />}
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Niveau technique</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'non_tech',   label: 'Non-technique',         desc: 'Je ne code pas du tout',          icon: '👤' },
                  { val: 'low_code',   label: 'Low-code / No-code',    desc: 'Bubble, Webflow, Make...',         icon: '🧩' },
                  { val: 'junior_dev', label: 'Développeur junior',    desc: "Je code mais j'apprends encore",  icon: '💻' },
                  { val: 'senior_dev', label: 'Développeur confirmé',  desc: 'Je maîtrise plusieurs stacks',    icon: '⚡' },
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
                  { val: 'marketing', label: 'Marketing' }, { val: 'design',  label: 'Design' },
                  { val: 'sales',     label: 'Vente' },     { val: 'finance', label: 'Finance' },
                  { val: 'pm',        label: 'Gestion de projet' }, { val: 'writing', label: 'Rédaction' },
                  { val: 'data',      label: 'Data / Analyse' }, { val: 'seo', label: 'SEO' },
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
                  { val: 'fr', label: '🇫🇷 Français' }, { val: 'en', label: '🇬🇧 Anglais' },
                  { val: 'es', label: '🇪🇸 Espagnol' }, { val: 'de', label: '🇩🇪 Allemand' },
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'few_hours', label: 'Quelques heures', desc: 'Projet secondaire' },
                  { val: 'half_time', label: 'Mi-temps',        desc: '~20h / semaine' },
                  { val: 'full_time', label: 'Plein temps',     desc: 'Je me consacre à ça' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.weekly_availability === o.val}
                    onClick={() => update({ weekly_availability: o.val })} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 3 — Contexte & Contraintes */}
        <SectionCard
          title="Contexte & Contraintes"
          subtitle="Budget, business model, secteurs préférés"
          icon={<ChevronRight className="w-4 h-4 text-[#707478]" />}
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Budget disponible</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'bootstrapped',   label: 'Bootstrapped serré',  desc: '< 1 000 €',         icon: '🌱' },
                  { val: 'few_thousands',  label: 'Quelques milliers',   desc: '1 000 – 10 000 €',  icon: '💰' },
                  { val: 'comfortable',    label: 'Budget confortable',  desc: '> 10 000 €',         icon: '💎' },
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
                  { val: 'b2b', label: 'B2B' }, { val: 'b2c', label: 'B2C' },
                  { val: 'b2b2c', label: 'B2B2C' }, { val: 'marketplace', label: 'Marketplace' },
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
                  { val: 'health',       label: 'Santé / Pharma' }, { val: 'finance', label: 'Finance / Banque' },
                  { val: 'legal',        label: 'Légal / Juridique' }, { val: 'insurance', label: 'Assurance' },
                  { val: 'defense',      label: 'Défense' }, { val: 'hr_sensitive', label: 'RH sensible' },
                  { val: 'real_estate',  label: 'Immobilier' },
                ].map(o => (
                  <TagButton key={o.val} label={o.label}
                    selected={(draft.excluded_sectors ?? []).includes(o.val)}
                    onClick={() => toggle('excluded_sectors', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Secteurs d&apos;affinité (texte libre)</FieldLabel>
              <input
                type="text"
                placeholder="Ex : e-commerce, logistique, education..."
                value={(draft.preferred_sectors ?? []).join(', ')}
                onChange={e => update({ preferred_sectors: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [] })}
                className="w-full bg-[#FAFBFC] border border-[#F0F2F4] rounded-xl px-4 py-3 text-[13px] text-[#1A1C1E] font-medium focus:outline-none focus:border-[#257b57] focus:ring-2 focus:ring-[#257b57]/10 transition-all"
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 4 — Vision Produit */}
        <SectionCard
          title="Vision Produit"
          subtitle="Type de solution, cible et complexité"
          icon={<ChevronRight className="w-4 h-4 text-[#707478]" />}
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Type de solution préférée</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: 'productivity', label: 'Outil productivité' }, { val: 'automation', label: 'Automatisation' },
                  { val: 'platform',     label: 'Plateforme' },          { val: 'api',        label: 'API / Service' },
                  { val: 'widget',       label: 'Widget / Extension' }, { val: 'template',   label: 'Template / Workflow' },
                ].map(o => (
                  <TagButton key={o.val} label={o.label}
                    selected={(draft.preferred_solution_types ?? []).includes(o.val)}
                    onClick={() => toggle('preferred_solution_types', o.val)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Cible préférée</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'sme',         label: 'TPE / PME',         desc: 'Petites et moyennes entreprises', icon: '🏢' },
                  { val: 'enterprise',  label: 'Grandes entreprises', desc: 'Corporate et grands comptes',   icon: '🏦' },
                  { val: 'freelancers', label: 'Indépendants',       desc: 'Freelances et solopreneurs',    icon: '💼' },
                  { val: 'consumers',   label: 'Consommateurs',      desc: 'Grand public (B2C)',             icon: '👥' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.preferred_target === o.val}
                    onClick={() => update({ preferred_target: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Complexité produit acceptable</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'mvp',        label: 'MVP simple',     desc: 'Lancer vite, itérer ensuite' },
                  { val: 'elaborate',  label: 'Produit élaboré', desc: 'Je vise la qualité dès le départ' },
                  { val: 'indifferent', label: 'Indifférent',   desc: "Selon l'opportunité" },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.product_complexity === o.val}
                    onClick={() => update({ product_complexity: o.val })} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 5 — Marché & Géographie */}
        <SectionCard
          title="Marché & Géographie"
          subtitle="Votre marché cible et votre connaissance sectorielle"
          icon={<ChevronRight className="w-4 h-4 text-[#707478]" />}
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Marché prioritaire</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'fr',            label: 'France uniquement',        desc: 'Je cible le marché français', icon: '🇫🇷' },
                  { val: 'fr_qc',         label: 'Francophone (FR + QC)',    desc: 'France et Québec',            icon: '🌍' },
                  { val: 'europe',        label: 'Europe',                   desc: 'Marché européen élargi',      icon: '🇪🇺' },
                  { val: 'international', label: 'International',            desc: 'Ambition mondiale',           icon: '🌐' },
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
                rows={3}
                className="w-full bg-[#FAFBFC] border border-[#F0F2F4] rounded-xl px-4 py-3 text-[13px] text-[#1A1C1E] font-medium focus:outline-none focus:border-[#257b57] focus:ring-2 focus:ring-[#257b57]/10 transition-all resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 6 — Préférences Rapports */}
        <SectionCard
          title="Préférences de Rapports"
          subtitle="Niveau de détail et ton de vos rapports IA"
          icon={<ChevronRight className="w-4 h-4 text-[#707478]" />}
        >
          <div className="space-y-6">
            <div>
              <FieldLabel>Niveau de détail souhaité</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'executive', label: 'Résumé exécutif',  desc: 'Les points clés, sans détails superflus' },
                  { val: 'full',      label: 'Analyse complète', desc: 'Tout le contexte et les nuances' },
                  { val: 'both',      label: 'Les deux',         desc: 'Résumé puis analyse détaillée' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc}
                    selected={draft.report_detail_level === o.val}
                    onClick={() => update({ report_detail_level: o.val })} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Ton préféré</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'analytical',  label: 'Analytique',  desc: 'Chiffré, factuel, comparatif',       icon: '📊' },
                  { val: 'narrative',   label: 'Narratif',    desc: 'Storytelling, contexte stratégique', icon: '📖' },
                  { val: 'actionable',  label: 'Actionnable', desc: 'Recommandations concrètes',          icon: '⚡' },
                ].map(o => (
                  <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon}
                    selected={draft.report_tone === o.val}
                    onClick={() => update({ report_tone: o.val })} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  )
}
