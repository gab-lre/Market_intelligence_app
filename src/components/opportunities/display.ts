// Libellés et couleurs d'affichage des opportunités, partagés par le dashboard,
// la page Opportunités et la fiche détaillée.

export const DEPARTMENTS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  technique:  { label: 'Technique',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  commercial: { label: 'Commercial', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  marketing:  { label: 'Marketing',  bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200' },
  operations: { label: 'Opérations', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  finance:    { label: 'Finance',    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rh:         { label: 'RH',         bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  support:    { label: 'Support',    bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200' },
  autre:      { label: 'Autre',      bg: 'bg-gray-100',   text: 'text-gray-500',    border: 'border-gray-200' },
}

export const ALL_DEPTS = ['technique', 'commercial', 'marketing', 'operations', 'finance', 'rh', 'support', 'autre']

/** Classes du badge d'un département (fond, texte, bordure), ou undefined s'il est inconnu. */
export function deptClasses(dept: string): string | undefined {
  const cfg = DEPARTMENTS[dept]
  return cfg ? `${cfg.bg} ${cfg.text} ${cfg.border}` : undefined
}

export const MARKET_LABELS: Record<string, string> = {
  fr: 'France', qc: 'Québec', fr_qc: 'FR & QC', international: 'International',
}

export const SCORE_PRESETS = [
  { label: 'Tous', min: 0 },
  { label: '50+',  min: 50 },
  { label: '60+',  min: 60 },
  { label: '70+',  min: 70 },
  { label: '80+',  min: 80 },
]

/** Couleurs associées à un score : vert ≥ 60, orange ≥ 40, rouge en dessous. */
export function getScoreColor(score: number) {
  if (score >= 60) return { bg: 'bg-[#E6F4EA]', text: 'text-[#257b57]', ring: 'ring-[#257b57]/20' }
  if (score >= 40) return { bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]',  ring: 'ring-amber-200' }
  return                  { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]',  ring: 'ring-rose-200' }
}
