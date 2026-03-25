-- Priority 3: Algorithme du Feed
-- Fonction PostgreSQL qui trie dynamiquement les publications d'un cluster.
-- Respect strict : 40% chronologie, 40% ts_rank, 20% réactions 24h (sur politique).

CREATE OR REPLACE FUNCTION get_cluster_feed(p_tag text, p_limit int DEFAULT 20)
RETURNS SETOF publications
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH scored_pubs AS (
      SELECT 
          p.*,
          
          -- 1. Score Chronologique (40%)
          -- Décroissance exponentielle basée sur l'âge. 7 jours (604800 secondes) = facteur de chute.
          EXP( -EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 604800.0 ) * 40.0 AS chrono_score,
          
          -- 2. Score de Pertinence Sémantique (40%)
          -- Utilisation de l'outil natif de Full-Text Search PostgreSQL (ts_rank)
          -- Compare le Tag demandé avec le titre et l'extrait de l'article (langue: français).
          ts_rank_cd(
              to_tsvector('french', COALESCE(p.title, '') || ' ' || COALESCE(p.excerpt, '')), 
              plainto_tsquery('french', p_tag)
          ) * 40.0 AS relevance_score,
          
          -- 3. Score de Réactions / Engagement (20%)
          -- Applicable UNIQUEMENT sur le contenu "politique" (bluesky dans notre cas) vieux de moins de 24h.
          CASE 
              WHEN p.source_type = 'bluesky' AND p.published_at > NOW() - INTERVAL '24 hours' THEN
                  -- Utilisation d'un logarithme naturel (ln) pour éviter l'effet "Bulle virale absolue"
                  -- Plafonné à un maximum de 20 points de score.
                  LEAST(20.0, ln(
                    GREATEST(1.0, 
                        COALESCE((p.reaction_counts->>'support')::float, 0.0) + 
                        COALESCE((p.reaction_counts->>'oppose')::float, 0.0) + 
                        COALESCE((p.reaction_counts->>'neutral')::float, 0.0)
                    )
                  ) * 4.0)
              ELSE 0.0
          END AS reaction_score

      FROM publications p
      -- PRE-FILTRE : ne retenir que ceux qui ont été taggés avec le cluster p_tag par la modération.
      WHERE p_tag = ANY(p.hashtags)
  )
  SELECT 
      id, source_type, source_name, title, excerpt, url, image_url, hashtags, published_at, reaction_counts, cluster_scores, created_at
  FROM scored_pubs
  -- TRI PAR LE SCORE COMPOSITE GLOBAL (Chronologie + Pertinence + Social)
  ORDER BY (chrono_score + relevance_score + reaction_score) DESC
  LIMIT p_limit;
END;
$$;
