-- Türk Takımları Sıralaması Tablosu
CREATE TABLE IF NOT EXISTS turkish_teams_ranking (
  id SERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  hltv_rank INTEGER NOT NULL,
  change INTEGER DEFAULT 0,
  points INTEGER,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eğer tablo zaten varsa logo_url kolonunu ekle
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'turkish_teams_ranking' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE turkish_teams_ranking ADD COLUMN logo_url TEXT;
  END IF;
END $$;

-- Index ekle (sıralama için)
CREATE INDEX IF NOT EXISTS idx_turkish_teams_ranking_rank ON turkish_teams_ranking(rank);

-- Updated_at otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı tabloya ekle
DROP TRIGGER IF EXISTS update_turkish_teams_ranking_updated_at ON turkish_teams_ranking;
CREATE TRIGGER update_turkish_teams_ranking_updated_at
    BEFORE UPDATE ON turkish_teams_ranking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Örnek veri ekle (isteğe bağlı)
INSERT INTO turkish_teams_ranking (rank, team_name, hltv_rank, change, points) VALUES
  (1, 'EF', 8, 2, 680),
  (2, 'MANA', 15, -1, 520),
  (3, 'Eternal Fire', 23, 3, 410),
  (4, 'Sangal', 31, 0, 350),
  (5, 'Fire Flux', 42, -2, 280)
ON CONFLICT DO NOTHING;

