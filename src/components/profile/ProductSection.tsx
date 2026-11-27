'use client'

// Section 4 — Vision produit : type de solution, cible, complexité.

import { ChevronRight } from 'lucide-react'
import { OptionCard, TagButton, SectionCard, FieldLabel, type ProfileSectionProps } from './FormControls'

export function ProductSection({ draft, update, toggle }: ProfileSectionProps) {
  return (
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
  )
}
