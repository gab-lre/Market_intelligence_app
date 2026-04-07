-- ============================================
-- Migration 001 — Refonte complète du schéma
-- SaaS Market Intelligence App
-- Date : 2026-03-29
-- ============================================
-- ATTENTION : Cette migration supprime et recrée les 3 tables existantes.
-- Aucune donnée de production n'est perdue (outil interne, base vide en dev).
-- ============================================

-- 1. Nettoyage (ordre important : enfants avant parents)
DROP TABLE IF EXISTS opportunity_signals CASCADE;
DROP TABLE IF EXISTS raw_signals CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS collections_history CASCADE;

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. collections_history
-- Une ligne = une session de collecte (batch).
-- L'id de cette table sert de batch_id dans raw_signals.
-- ============================================
CREATE TABLE collections_history (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at     TIMESTAMPTZ,
    status          TEXT        NOT NULL DEFAULT 'running',
    -- 'running' | 'completed' | 'partial' | 'failed'
    sources_config  JSONB,
    -- config utilisée : { sources: [{ source, params }] }
    results_summary JSONB,
    -- résumé par source : { hackernews: { collected: 12, errors: 0 }, ... }
    signals_collected    INTEGER DEFAULT 0,
    signals_analyzed     INTEGER DEFAULT 0,
    opportunities_created  INTEGER DEFAULT 0,
    opportunities_updated  INTEGER DEFAULT 0
);

ALTER TABLE collections_history DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. raw_signals
-- Une ligne = un signal brut (post HN, offre d'emploi, avis, etc.)
-- ============================================
CREATE TABLE raw_signals (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    source       TEXT        NOT NULL,
    -- 'hackernews' | 'reddit' | 'francetravail' | 'producthunt' |
    -- 'indiehackers' | 'g2' | 'linkedin' | 'indeed' | 'wellfound' | 'upwork'
    source_type  TEXT        NOT NULL,
    -- 'community' | 'review' | 'job' | 'freelance'
    external_id  TEXT,
    -- ID unique côté source (pour dédupliquer)
    title        TEXT,
    content      TEXT        NOT NULL,
    url          TEXT,
    author       TEXT,
    metadata     JSONB,
    -- Données propres à la source : { points, num_comments, subreddit, salary, ... }
    collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    status       TEXT        NOT NULL DEFAULT 'pending',
    -- 'pending' | 'analyzed' | 'discarded' | 'error'
    batch_id     UUID        REFERENCES collections_history(id) ON DELETE SET NULL
);

-- Déduplication : même source + même external_id → skip
CREATE UNIQUE INDEX idx_raw_signals_dedup
    ON raw_signals(source, external_id)
    WHERE external_id IS NOT NULL;

-- Filtrage rapide des signaux en attente d'analyse
CREATE INDEX idx_raw_signals_status  ON raw_signals(status);
CREATE INDEX idx_raw_signals_batch   ON raw_signals(batch_id);

ALTER TABLE raw_signals DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. opportunities
-- Une ligne = une opportunité SaaS identifiée par l'IA.
-- Peut agréger plusieurs signaux via opportunity_signals.
-- ============================================
CREATE TABLE opportunities (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT    NOT NULL,
    description      TEXT,
    problem          TEXT,
    repetitive_tasks TEXT[]  DEFAULT '{}',
    existing_tools   TEXT[]  DEFAULT '{}',
    tool_gaps        TEXT,
    department       TEXT,
    -- 'commercial' | 'marketing' | 'operations' | 'finance' |
    -- 'rh' | 'technique' | 'support' | 'autre'
    company_size     TEXT[]  DEFAULT '{}',
    -- 'startup' | 'pme' | 'grande_entreprise'
    score_volume     INTEGER DEFAULT 0,
    -- Basé sur signal_count relatif au max en base (0-100)
    score_urgency    INTEGER DEFAULT 0,
    -- Moyenne des urgency_score Gemini (0-100)
    score_tool_gap   INTEGER DEFAULT 0,
    -- Moyenne des tool_gap_score Gemini (0-100)
    score_saturation INTEGER DEFAULT 0,
    -- Moyenne des saturation_score Gemini (0-100)
    score_global     INTEGER DEFAULT 0,
    -- Pondéré : volume×0.30 + urgency×0.35 + tool_gap×0.25 - saturation×0.10
    signal_count     INTEGER DEFAULT 1,
    source_types     TEXT[]  DEFAULT '{}',
    -- Types de sources ayant contribué
    status           TEXT    NOT NULL DEFAULT 'active',
    -- 'active' | 'archived' | 'dismissed'
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_score  ON opportunities(score_global DESC);
CREATE INDEX idx_opportunities_status ON opportunities(status);

ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. opportunity_signals
-- Liaison N-N : plusieurs signaux → une opportunité.
-- ============================================
CREATE TABLE opportunity_signals (
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    signal_id      UUID NOT NULL REFERENCES raw_signals(id)   ON DELETE CASCADE,
    relevance_note TEXT,
    PRIMARY KEY (opportunity_id, signal_id)
);

ALTER TABLE opportunity_signals DISABLE ROW LEVEL SECURITY;
