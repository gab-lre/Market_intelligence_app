'use client'

// Section 6 — Préférences de rapports : niveau de détail et ton.

import { ChevronRight } from 'lucide-react'
import { OptionCard, SectionCard, FieldLabel, type ProfileSectionProps } from './FormControls'

export function ReportPrefsSection({ draft, update }: ProfileSectionProps) {
  return (
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
  )
}
