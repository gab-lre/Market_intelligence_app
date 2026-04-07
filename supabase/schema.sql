-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des opportunités
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    department TEXT,
    mentions_count INTEGER DEFAULT 1,
    market TEXT[] DEFAULT '{}',
    urgency_avg NUMERIC DEFAULT 0,
    pain_points JSONB DEFAULT '[]'::jsonb,
    existing_tools JSONB DEFAULT '[]'::jsonb,
    unaddressed_needs JSONB DEFAULT '[]'::jsonb,
    full_report TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des signaux bruts
CREATE TABLE IF NOT EXISTS raw_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    original_id TEXT,
    content TEXT NOT NULL,
    url TEXT,
    author TEXT,
    publish_date TIMESTAMP WITH TIME ZONE,
    is_processed BOOLEAN DEFAULT FALSE,
    is_noise BOOLEAN DEFAULT FALSE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour éviter les doublons de signaux et accélérer les listes à traiter
CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_signals_source_original_id ON raw_signals(source, original_id);
CREATE INDEX IF NOT EXISTS idx_raw_signals_unprocessed ON raw_signals(is_processed) WHERE is_processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(score DESC);

-- 3. Table d'historique des collectes
CREATE TABLE IF NOT EXISTS collections_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    status TEXT NOT NULL, -- 'en cours', 'succès', 'erreur'
    items_collected INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Désactivation du Row Level Security (RLS)
-- L'application est un outil interne exécuté en local, 
-- nous autorisons donc l'API anonyme à lire/écrire sans restriction.
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE raw_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE collections_history DISABLE ROW LEVEL SECURITY;
