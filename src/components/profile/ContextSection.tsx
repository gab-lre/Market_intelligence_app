'use client'

// Section 3 — Contexte & contraintes : budget, modèle business, secteurs.

import { ChevronRight } from 'lucide-react'
import { OptionCard, TagButton, SectionCard, FieldLabel, type ProfileSectionProps } from './FormControls'

export function ContextSection({ draft, update, toggle }: ProfileSectionProps) {
  return (
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
  )
}
