-- Migration 002 — Ajout des champs IA à la table opportunities
-- À exécuter dans le SQL Editor de Supabase

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS opportunity_type text NOT NULL DEFAULT 'saas';
-- Valeurs : 'saas', 'ai_agent_service', 'ai_agent_product', 'template', 'micro_product'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS target_market text DEFAULT 'fr_qc';
-- Valeurs : 'fr', 'qc', 'fr_qc', 'international'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS revenue_model text;
-- Valeurs : 'subscription', 'one_time', 'per_project', 'usage_based', 'freemium'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS time_to_mvp text;
-- Valeurs : 'days', 'weeks', 'months'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS complexity text;
-- Valeurs : 'low', 'medium', 'high'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS estimated_cost text;
-- Valeurs : '< 500$', '500-2000$', '2000-5000$', '5000$+'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS solo_dev_feasible boolean DEFAULT true;

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS key_challenges text[];

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS price_range text;

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS market_size_hint text;
-- Valeurs : 'niche', 'medium', 'large'

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS recurring_potential boolean;

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS alternative_types text[];
