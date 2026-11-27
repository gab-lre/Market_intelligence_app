'use client'

// Section 5 — Marché & géographie : marché prioritaire, connaissance sectorielle.

import { ChevronRight } from 'lucide-react'
import { OptionCard, SectionCard, FieldLabel, type ProfileSectionProps } from './FormControls'

export function MarketSection({ draft, update }: ProfileSectionProps) {
  return (
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
  )
}
