'use client'

// Section 1 — Profil entrepreneurial : stade, motivations, horizon, expérience.

import { ChevronRight } from 'lucide-react'
import { OptionCard, TagButton, SectionCard, FieldLabel, type ProfileSectionProps } from './FormControls'

export function EntrepreneurSection({ draft, update, toggle }: ProfileSectionProps) {
  return (
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
  )
}
