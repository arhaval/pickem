-- Season_points tablosunu düzelt (season_id BIGINT olmalı)

-- Önce tabloyu sil (eğer varsa ve yanlış tip ile oluşturulmuşsa)
DROP TABLE IF EXISTS season_points CASCADE;

-- Season_points tablosunu doğru tiplerle oluştur
CREATE TABLE season_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season_id BIGINT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

-- Index'ler
CREATE INDEX idx_season_points_user_id ON season_points(user_id);
CREATE INDEX idx_season_points_season_id ON season_points(season_id);
CREATE INDEX idx_season_points_total_points ON season_points(total_points DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_season_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_season_points_updated_at
  BEFORE UPDATE ON season_points
  FOR EACH ROW
  EXECUTE FUNCTION update_season_points_updated_at();

COMMENT ON TABLE season_points IS 'Kullanıcıların sezon bazlı puanları ve istatistikleri';
COMMENT ON COLUMN season_points.user_id IS 'Kullanıcı ID';
COMMENT ON COLUMN season_points.season_id IS 'Sezon ID (BIGINT)';
COMMENT ON COLUMN season_points.total_points IS 'Sezon toplam puanı';
COMMENT ON COLUMN season_points.correct_predictions IS 'Doğru tahmin sayısı';
COMMENT ON COLUMN season_points.total_predictions IS 'Toplam tahmin sayısı';












