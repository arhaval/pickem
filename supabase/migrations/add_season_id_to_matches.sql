-- Matches tablosuna season_id kolonu ekle

-- Önce kolonun var olup olmadığını kontrol et ve ekle
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_matches_season_id ON matches(season_id);

-- Mevcut veriler için varsayılan değer (opsiyonel - null kalabilir)
-- UPDATE matches SET season_id = NULL WHERE season_id IS NULL;

COMMENT ON COLUMN matches.season_id IS 'Maçın ait olduğu sezon ID (BIGINT) - Tahminler için olan maçlarda zorunlu';













