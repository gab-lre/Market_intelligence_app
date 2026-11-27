// Actions déclenchées par les boutons de l'UI (collecte, analyse, rapports, profil).
// Version factice : chaque action attend ~800 ms puis renvoie un faux résultat,
// sans aucun appel réseau. À remplacer par les vrais appels au backend.

import { reports } from './data/mock'
import type { Profile, ReportType } from './data/types'

const FAKE_DELAY_MS = 800

const wait = (ms = FAKE_DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms))

/** Lance une collecte sur les sources données (toutes si absent). */
export async function startCollection(sources?: string[]): Promise<{ signalsCollected: number }> {
  await wait()
  return { signalsCollected: sources && sources.length > 0 ? sources.length * 12 : 87 }
}

/** Analyse par l'IA un lot de signaux en attente. */
export async function runAnalysis(limit = 50): Promise<{
  analyzed: number; created: number; updated: number; discarded: number; pendingRemaining: number
}> {
  await wait()
  return { analyzed: limit, created: 4, updated: 2, discarded: limit - 6, pendingRemaining: 0 }
}

/** Génère un rapport et renvoie l'identifiant du rapport à ouvrir. */
export async function generateReport(
  type: ReportType,
  _options: { category?: string; categories?: string[] } = {}
): Promise<{ reportId: string }> {
  await wait()
  const existing = reports.find(r => r.type === type)
  return { reportId: existing?.id ?? `demo-${type}` }
}

/** Enregistre le profil. */
export async function saveProfile(_profile: Profile): Promise<void> {
  await wait()
}

/** Régénère le résumé IA du profil. */
export async function regenerateProfileSummary(_profile: Profile): Promise<{ summary: string }> {
  await wait()
  return {
    summary: 'Profil exploratoire orienté B2B : vous cherchez une opportunité réaliste à lancer seul, sur le marché francophone.',
  }
}
