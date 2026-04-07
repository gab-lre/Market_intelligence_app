import { supabase } from '@/lib/supabase'
import type { RawSignal } from '@/types/database'

export interface PrefilterResult {
  passed: RawSignal[]
  discarded: Array<{ signal: RawSignal; reason: string }>
}

const SAAS_KEYWORDS = [
  // Anglais
  'saas', 'automation', 'workflow', 'software', 'tool', 'api', 'integration',
  'dashboard', 'crm', 'erp', 'no-code', 'low-code', 'nocode', 'agent', ' ai ',
  'llm', 'subscription', 'b2b', 'mvp', 'startup', 'recurring', 'automate',
  'productize', 'process', 'reporting', 'spreadsheet', 'excel', 'manual',
  'repetitive', 'outsource', 'freelance', 'hire', 'looking for', 'need a',
  'platform', 'solution', 'plugin', 'extension', 'bot', 'script',
  // Français
  'outil', 'logiciel', 'automatisation', 'abonnement', 'tableau de bord',
  'gestion', 'intégration', 'plateforme', 'flux', 'tâche répétitive',
  'agent ia', 'facturation', 'indépendant', 'prestation', 'besoin',
  'problème', 'solution', 'recherche', 'recruter', 'embaucher', 'processus',
  'productivité', 'reporting', 'tableau', 'automatique', 'script',
]

function hasSaasKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return SAAS_KEYWORDS.some((kw) => lower.includes(kw))
}

function getDiscardReason(signal: RawSignal): string | null {
  const content = (signal.content ?? '').trim()
  const title = (signal.title ?? '').trim()
  const metadata = signal.metadata ?? {}

  // Contenu trop court
  if (content.length < 50) return 'content_too_short'

  // Pas de mot-clé SaaS
  if (!hasSaasKeyword(title + ' ' + content)) return 'no_saas_relevance'

  // HN : score trop faible
  if (signal.source === 'hackernews') {
    const points = (metadata.points as number | undefined) ?? 0
    if (points < 3) return 'low_engagement'
  }

  // Upwork : pas de budget et pas de description
  if (signal.source === 'upwork') {
    const budget = metadata.budget as string | undefined
    const hasBudget = budget && budget !== '' && budget !== 'N/A'
    const hasContent = content.length >= 100
    if (!hasBudget && !hasContent) return 'missing_context'
  }

  // Reddit : score trop faible
  if (signal.source === 'reddit') {
    const score = (metadata.score as number | undefined) ?? 0
    if (score < 2) return 'low_engagement'
  }

  return null
}

export async function prefilterSignals(signals: RawSignal[]): Promise<PrefilterResult> {
  const passed: RawSignal[] = []
  const discarded: Array<{ signal: RawSignal; reason: string }> = []

  for (const signal of signals) {
    const reason = getDiscardReason(signal)
    if (reason) {
      discarded.push({ signal, reason })
    } else {
      passed.push(signal)
    }
  }

  // Mise à jour Supabase pour les signaux rejetés
  if (discarded.length > 0) {
    for (const { signal, reason } of discarded) {
      await supabase
        .from('raw_signals')
        .update({
          status: 'discarded',
          metadata: {
            ...(signal.metadata ?? {}),
            discard_reason: reason,
            filtered_by: 'prefilter',
          },
        })
        .eq('id', signal.id)
    }
  }

  // Log résumé
  if (discarded.length > 0) {
    const counts: Record<string, number> = {}
    for (const { reason } of discarded) {
      counts[reason] = (counts[reason] ?? 0) + 1
    }
    const summary = Object.entries(counts).map(([r, n]) => `${r}: ${n}`).join(', ')
    console.log(`[Prefilter] ${signals.length} reçus → ${discarded.length} rejetés (${summary})`)
  } else {
    console.log(`[Prefilter] ${signals.length} reçus → 0 rejetés`)
  }

  return { passed, discarded }
}
