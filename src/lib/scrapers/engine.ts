// Moteur d'orchestration du scraping
// Coordonne l'exécution des collecteurs et persiste les résultats en base.

import { supabase } from '@/lib/supabase'
import { getScraper, getAvailableScrapers, getDefaultConfig } from './registry'
import { buildScraperParamsFromProfile } from './profileParams'
import type { RawSignalInput, ScraperResult } from './types'
import type { RawSignalInsert, UserProfile } from '@/types/database'

export interface SourceRequest {
  source: string
  params?: Record<string, unknown>
}

export interface EngineRunResult {
  batchId: string
  status: 'completed' | 'partial' | 'failed'
  totalSignalsCollected: number
  results: ScraperResult[]
  durationMs: number
  errors: string[]
}

// Insère les signaux en base en filtrant les doublons (source + external_id)
async function insertSignals(
  signals: RawSignalInput[],
  batchId: string
): Promise<{ inserted: number; skipped: number }> {
  if (signals.length === 0) return { inserted: 0, skipped: 0 }

  // Récupérer les external_ids déjà présents pour cette source
  const source = signals[0].source
  const externalIds = signals.map((s) => s.externalId)

  const { data: existing } = await supabase
    .from('raw_signals')
    .select('external_id')
    .eq('source', source)
    .in('external_id', externalIds)

  const alreadyExists = new Set((existing ?? []).map((r) => r.external_id))
  const newSignals = signals.filter((s) => !alreadyExists.has(s.externalId))
  const skipped = signals.length - newSignals.length

  if (newSignals.length === 0) return { inserted: 0, skipped }

  const rows: RawSignalInsert[] = newSignals.map((s) => ({
    source: s.source,
    source_type: s.sourceType,
    external_id: s.externalId,
    title: s.title,
    content: s.content,
    url: s.url,
    author: s.author ?? null,
    metadata: s.metadata ?? null,
    published_at: s.publishedAt ?? null,
    status: 'pending',
    batch_id: batchId,
  }))

  const { data, error } = await supabase
    .from('raw_signals')
    .insert(rows)
    .select('id')

  if (error) {
    throw new Error(`Erreur insertion signaux : ${error.message}`)
  }

  return { inserted: data?.length ?? 0, skipped }
}

export async function runScrapingEngine(
  sources?: SourceRequest[],
  profile?: UserProfile | null
): Promise<EngineRunResult> {
  const startTime = Date.now()

  // Overrides de params dérivés du profil utilisateur (keywords, tags, locations)
  const profileOverrides = profile ? buildScraperParamsFromProfile(profile) : {}

  // Si aucune source spécifiée, prendre toutes les sources actives
  const baseSources: SourceRequest[] = sources && sources.length > 0
    ? sources
    : getAvailableScrapers()
        .filter((s) => s.enabled)
        .map((s) => ({ source: s.source, params: s.defaultParams }))

  // Appliquer les overrides profil sur tous les sources (manuels ou auto)
  const sourcesToRun: SourceRequest[] = baseSources.map(req => ({
    ...req,
    params: { ...(req.params ?? {}), ...(profileOverrides[req.source] ?? {}) },
  }))

  if (sourcesToRun.length === 0) {
    return {
      batchId: '',
      status: 'failed',
      totalSignalsCollected: 0,
      results: [],
      durationMs: Date.now() - startTime,
      errors: ['Aucun collecteur disponible ou activé.'],
    }
  }

  // Créer l'entrée collections_history (batch)
  const sourcesConfig = { sources: sourcesToRun }
  const { data: batchData, error: batchError } = await supabase
    .from('collections_history')
    .insert({
      status: 'running',
      sources_config: sourcesConfig,
      signals_collected: 0,
    })
    .select('id')
    .single()

  if (batchError || !batchData) {
    throw new Error(`Impossible de créer le batch : ${batchError?.message}`)
  }

  const batchId: string = batchData.id
  const results: ScraperResult[] = []
  const globalErrors: string[] = []
  let totalCollected = 0
  const resultsSummary: Record<string, unknown> = {}

  // Exécution séquentielle (évite les rate limits)
  for (const req of sourcesToRun) {
    const scraper = getScraper(req.source)

    if (!scraper) {
      const err = `Collecteur inconnu : ${req.source}`
      globalErrors.push(err)
      results.push({
        source: req.source as never,
        success: false,
        signalsCollected: 0,
        errors: [err],
        durationMs: 0,
      })
      continue
    }

    const sourceStart = Date.now()
    const config = getDefaultConfig(req.source)
    const params = { ...(config?.params ?? {}), ...(req.params ?? {}) }

    let signals: RawSignalInput[] = []
    const sourceErrors: string[] = []

    try {
      signals = await scraper.collect(params)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      sourceErrors.push(msg)
      globalErrors.push(`[${req.source}] ${msg}`)
    }

    let inserted = 0
    if (signals.length > 0) {
      try {
        const insertResult = await insertSignals(signals, batchId)
        inserted = insertResult.inserted
        totalCollected += inserted
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        sourceErrors.push(msg)
        globalErrors.push(`[${req.source}] Insertion : ${msg}`)
      }
    }

    const durationMs = Date.now() - sourceStart
    results.push({
      source: scraper.source,
      success: sourceErrors.length === 0,
      signalsCollected: inserted,
      errors: sourceErrors,
      durationMs,
    })

    resultsSummary[req.source] = {
      collected: inserted,
      errors: sourceErrors.length,
      durationMs,
    }

    // Mise à jour du compteur en temps réel
    await supabase
      .from('collections_history')
      .update({ signals_collected: totalCollected })
      .eq('id', batchId)
  }

  // Statut final
  const allFailed = results.every((r) => !r.success)
  const someFailed = results.some((r) => !r.success)
  const finalStatus = allFailed ? 'failed' : someFailed ? 'partial' : 'completed'
  const totalDuration = Date.now() - startTime

  // Clôture du batch
  await supabase
    .from('collections_history')
    .update({
      status: finalStatus,
      finished_at: new Date().toISOString(),
      signals_collected: totalCollected,
      results_summary: resultsSummary,
    })
    .eq('id', batchId)

  return {
    batchId,
    status: finalStatus,
    totalSignalsCollected: totalCollected,
    results,
    durationMs: totalDuration,
    errors: globalErrors,
  }
}
