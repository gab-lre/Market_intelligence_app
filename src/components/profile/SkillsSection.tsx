'use client'

// Section 2 — Compétences : niveau technique, compétences, langues, disponibilité.

import { ChevronRight } from 'lucide-react'
import { OptionCard, TagButton, SectionCard, FieldLabel, type ProfileSectionProps } from './FormControls'

export function SkillsSection({ draft, update, toggle }: ProfileSectionProps) {
  return (
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
  )
}
