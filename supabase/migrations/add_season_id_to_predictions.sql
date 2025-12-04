-- Predictions tablosuna season_id kolonu ekle
-- NOT: seasons.id BIGINT tipindedir, matches.season_id ve season_points.season_id ile uyumlu olmalı

-- Önce kolonun var olup olmadığını kontrol et ve ekle
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_predictions_season_id ON predictions(season_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_season ON predictions(user_id, season_id);

-- Mevcut tahminler için season_id'yi match'lerden al
UPDATE predictions p
SET season_id = m.season_id
FROM matches m
WHERE p.match_id = m.id::text
  AND p.season_id IS NULL
  AND m.season_id IS NOT NULL;

COMMENT ON COLUMN predictions.season_id IS 'Tahminin ait olduğu sezon ID (BIGINT) - Tahminler sezon bazlı tutulur';

