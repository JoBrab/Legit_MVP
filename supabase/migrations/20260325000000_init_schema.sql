-- Initial Legit Backend Schema
-- Respects strict quotas for PostgreSQL instance.

-- 1. Extensibilité & Performances
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TENDANCES / CLUSTERS
CREATE TABLE IF NOT EXISTS clusters (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 3. SOURCES AUTORISÉES (RSS)
CREATE TABLE IF NOT EXISTS sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('rss', 'bluesky', 'citizen')),
    url text UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- 4. COMPTES BLUESKY (Liste blanche)
CREATE TABLE IF NOT EXISTS bluesky_accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    handle text UNIQUE NOT NULL,
    did text UNIQUE NOT NULL,
    party text,
    added_at timestamptz DEFAULT now()
);

-- 5. PUBLICATIONS CRITIQUES
CREATE TABLE IF NOT EXISTS publications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type text NOT NULL CHECK (source_type IN ('rss', 'bluesky', 'citizen')),
    source_name text NOT NULL,
    title text,
    excerpt varchar(200),
    url text UNIQUE NOT NULL, -- Mécanisme de déduplication fondamental
    image_url text,
    hashtags text[], -- Permet l'assignation aux clusters thématiques
    published_at timestamptz NOT NULL DEFAULT now(),
    reaction_counts jsonb DEFAULT '{"support":0, "neutral":0, "oppose":0}',
    cluster_scores jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Optimisation d'Indexation pour l'algorithme de Feed
CREATE INDEX IF NOT EXISTS idx_publications_published_at ON publications(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_hashtags ON publications USING GIN(hashtags);

-- 6. RÉACTIONS CITOYENNES
CREATE TABLE IF NOT EXISTS reactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id uuid REFERENCES publications(id) ON DELETE CASCADE,
    user_id uuid, -- Sera lié à auth.users après le setup auth natif
    level integer NOT NULL CHECK (level IN (1, 0, -1)),
    created_at timestamptz DEFAULT now(),
    UNIQUE(publication_id, user_id)
);

-- 7. MESSAGES TEMPS-RÉEL (P2P)
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id text NOT NULL, -- Temporal text until Auth is setup
    receiver_id text NOT NULL, 
    content varchar(500) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Activation OBLIGATOIRE du 'Supabase Realtime' en base UNIQUEMENT sur cette table
-- Cela garantit de ne pas consommer les 200 conns quotas pour le Feed (réglé par React Query)
BEGIN;
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
COMMIT;

-- 8. POLITIQUE DE RÉTENTION (500MB Limit Supabase Free)
-- Supprime quotidiennement les posts > 30 jours SI leurs interactions totales < 50
CREATE EXTENSION IF NOT EXISTS "pg_cron";

SELECT cron.schedule(
  'purge_old_publications',
  '0 0 * * *', -- Exécution tous les jours à minuit
  $$
    DELETE FROM publications 
    WHERE published_at < NOW() - INTERVAL '30 days'
    AND (
      COALESCE((reaction_counts->>'support')::int, 0) + 
      COALESCE((reaction_counts->>'oppose')::int, 0) + 
      COALESCE((reaction_counts->>'neutral')::int, 0)
    ) < 50;
  $$
);
