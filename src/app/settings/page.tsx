'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Sparkles, RefreshCw, Save, UserCircle } from 'lucide-react'
import { getProfile } from '@/lib/data'
import type { ProfileDraft } from '@/components/profile/FormControls'
import { EntrepreneurSection } from '@/components/profile/EntrepreneurSection'
import { SkillsSection } from '@/components/profile/SkillsSection'
import { ContextSection } from '@/components/profile/ContextSection'
import { ProductSection } from '@/components/profile/ProductSection'
import { MarketSection } from '@/components/profile/MarketSection'
import { ReportPrefsSection } from '@/components/profile/ReportPrefsSection'
import { regenerateProfileSummary, saveProfile } from '@/lib/actions'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

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

        <EntrepreneurSection draft={draft} update={update} toggle={toggle} />

        <SkillsSection draft={draft} update={update} toggle={toggle} />

        <ContextSection draft={draft} update={update} toggle={toggle} />

        <ProductSection draft={draft} update={update} toggle={toggle} />

        <MarketSection draft={draft} update={update} toggle={toggle} />

        <ReportPrefsSection draft={draft} update={update} toggle={toggle} />

      </div>
    </div>
  )
}
