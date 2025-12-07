-- ============================================
-- Maçlara Turnuva İsmi Ekleme
-- ============================================
-- Bu migration, matches tablosuna tournament_name field'ı ekler

-- tournament_name field'ını ekle (direkt yazılacak)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS tournament_name TEXT;

-- Index ekle (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_matches_tournament_name ON matches(tournament_name);

-- Comment ekle
COMMENT ON COLUMN matches.tournament_name IS 'Maçın turnuva/sezon ismi (direkt yazılır)';













