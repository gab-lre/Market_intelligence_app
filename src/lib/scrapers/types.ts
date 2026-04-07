// Types communs pour tous les collecteurs de données
// Chaque source implémente l'interface Scraper

import type { SignalSource, SignalSourceType } from '@/types/database'

// ============================================
// Configuration d'un collecteur
// ============================================
export interface ScraperConfig {
  source: SignalSource
  sourceType: SignalSourceType
  enabled: boolean
  params: Record<string, unknown>
}

// ============================================
// Signal brut tel que retourné par un collecteur
// (avant insertion en base)
// ============================================
export interface RawSignalInput {
  source: SignalSource
  sourceType: SignalSourceType
  externalId: string
  title: string
  content: string
  url: string
  author?: string
  metadata?: Record<string, unknown>
  publishedAt?: string
}

// ============================================
// Résultat d'une exécution de collecteur
// ============================================
export interface ScraperResult {
  source: SignalSource
  success: boolean
  signalsCollected: number
  errors: string[]
  durationMs: number
}

// ============================================
// Interface que chaque collecteur doit respecter
// ============================================
export interface Scraper {
  name: string
  source: SignalSource
  sourceType: SignalSourceType
  collect(params: Record<string, unknown>): Promise<RawSignalInput[]>
}
