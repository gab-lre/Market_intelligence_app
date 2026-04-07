-- ============================================
-- Migration 003 — Profils utilisateurs + Rapports générés
-- SaaS Market Intelligence App
-- Date : 2026-04-01
-- ============================================

-- ============================================
-- 1. user_profiles
-- Un profil par utilisateur (single-user pour l'instant).
-- UUID stocké côté client (localStorage) comme clé d'accès.
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Bloc 1 — Identité entrepreneuriale
    entrepreneurial_stage   TEXT,
    -- 'exploration' | 'validation' | 'building' | 'launched'
    main_motivation         TEXT[],
    -- ['financial_freedom', 'passion', 'technical', 'reconversion', 'impact']
    time_horizon            TEXT,
    -- 'short' (< 6 mois) | 'medium' (6-24 mois) | 'long' (> 24 mois)
    prior_experience        BOOLEAN,

    -- Bloc 2 — Compétences
    tech_level              TEXT,
    -- 'non_tech' | 'low_code' | 'junior_dev' | 'senior_dev'
    secondary_skills        TEXT[],
    -- ['marketing', 'design', 'sales', 'finance', 'pm', 'writing']
    spoken_languages        TEXT[],
    -- ['fr', 'en', 'es', 'de', ...]
    weekly_availability     TEXT,
    -- 'few_hours' | 'half_time' | 'full_time'

    -- Bloc 3 — Contexte & contraintes
    budget_range            TEXT,
    -- 'bootstrapped' | 'few_thousands' | 'comfortable'
    preferred_business_models TEXT[],
    -- ['b2b', 'b2c', 'b2b2c', 'marketplace']
    excluded_sectors        TEXT[],
    -- ['health', 'finance', 'legal', 'insurance', 'defense']
    preferred_sectors       TEXT[],

    -- Bloc 4 — Vision produit
    preferred_solution_types TEXT[],
    -- ['productivity', 'automation', 'platform', 'api', 'widget']
    preferred_target        TEXT,
    -- 'sme' | 'enterprise' | 'freelancers' | 'consumers'
    product_complexity      TEXT,
    -- 'mvp' | 'elaborate' | 'indifferent'
    vertical_vs_horizontal  TEXT,
    -- 'vertical' | 'horizontal' | 'indifferent'

    -- Bloc 5 — Marché & géographie
    priority_market         TEXT,
    -- 'fr' | 'fr_qc' | 'europe' | 'international'
    existing_sector_knowledge TEXT,
    -- Texte libre : secteur que l'utilisateur connaît mieux que les autres

    -- Bloc 6 — Préférences rapport
    report_detail_level     TEXT,
    -- 'executive' | 'full' | 'both'
    report_tone             TEXT,
    -- 'analytical' | 'narrative' | 'actionable'
    report_frequency        TEXT,
    -- 'daily' | 'weekly' | 'monthly' | 'on_demand'

    -- Résumé IA généré par Gemini à la fin de l'onboarding
    profile_summary         TEXT,

    -- État de l'onboarding
    onboarding_completed    BOOLEAN NOT NULL DEFAULT false,
    onboarding_step         INTEGER NOT NULL DEFAULT 0,
    -- Étape courante (0-6), permet la sauvegarde partielle

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. generated_reports
-- Un rapport = une analyse IA générée à la demande.
-- Peut être de type 'category', 'cross', ou 'full'.
-- ============================================
CREATE TABLE IF NOT EXISTS generated_reports (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id         UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,

    type            TEXT        NOT NULL,
    -- 'category' | 'cross' | 'full'

    title           TEXT        NOT NULL,

    -- Sections du rapport : tableau de { order, title, content (markdown) }
    sections        JSONB       NOT NULL DEFAULT '[]',

    -- Métadonnées sur les sources utilisées
    sources_used    TEXT[]      DEFAULT '{}',
    -- Catégories de sources : ['community', 'job', 'startup']

    collection_ids  UUID[]      DEFAULT '{}',
    -- IDs des collections_history utilisées comme base de données

    -- Paramètres de génération (nb signaux, filtres, profil snapshot...)
    generation_params JSONB,

    -- Statut de génération (utile pour les rapports longs)
    status          TEXT        NOT NULL DEFAULT 'completed',
    -- 'generating' | 'completed' | 'error'
    sections_total  INTEGER     DEFAULT 0,
    sections_done   INTEGER     DEFAULT 0,

    error_message   TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_reports_user    ON generated_reports(user_id);
CREATE INDEX idx_generated_reports_type    ON generated_reports(type);
CREATE INDEX idx_generated_reports_status  ON generated_reports(status);
CREATE INDEX idx_generated_reports_created ON generated_reports(created_at DESC);

ALTER TABLE generated_reports DISABLE ROW LEVEL SECURITY;
