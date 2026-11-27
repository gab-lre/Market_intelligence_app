'use client'

// Petits composants de formulaire de la page Mon Profil.

import { Check } from 'lucide-react'
import type { Profile } from '@/lib/data'

/** Champs du profil modifiables dans le formulaire. */
export type ProfileDraft = Omit<Profile, 'profile_summary'>

/** Props communes à toutes les sections du formulaire. */
export interface ProfileSectionProps {
  draft: ProfileDraft
  update: (partial: Partial<ProfileDraft>) => void
  toggle: (field: keyof ProfileDraft, val: string) => void
}

export function OptionCard({
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

export function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
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

export function SectionCard({ title, subtitle, icon, children }: {
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

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0A4A8] mb-2.5">{children}</p>
  )
}
