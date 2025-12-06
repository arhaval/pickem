-- Season_points tablosu için RLS politikaları

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Allow public read season_points" ON season_points;
DROP POLICY IF EXISTS "Allow public insert season_points" ON season_points;
DROP POLICY IF EXISTS "Allow public update season_points" ON season_points;
DROP POLICY IF EXISTS "Allow public delete season_points" ON season_points;
DROP POLICY IF EXISTS "Allow authenticated read season_points" ON season_points;
DROP POLICY IF EXISTS "Allow authenticated insert season_points" ON season_points;
DROP POLICY IF EXISTS "Allow authenticated update season_points" ON season_points;
DROP POLICY IF EXISTS "Allow authenticated delete season_points" ON season_points;
DROP POLICY IF EXISTS "Users can read own season_points" ON season_points;
DROP POLICY IF EXISTS "Users can insert own season_points" ON season_points;
DROP POLICY IF EXISTS "Users can update own season_points" ON season_points;

-- RLS'yi etkinleştir
ALTER TABLE season_points ENABLE ROW LEVEL SECURITY;

-- Herkes sezon puanlarını okuyabilir (public read) - Liderlik tablosu için
CREATE POLICY "Allow public read season_points"
  ON season_points
  FOR SELECT
  USING (true);

-- Herkes sezon puanı ekleyebilir (public insert) - Sistem otomatik ekliyor
CREATE POLICY "Allow public insert season_points"
  ON season_points
  FOR INSERT
  WITH CHECK (true);

-- Herkes sezon puanı güncelleyebilir (public update) - Sistem otomatik güncelliyor
CREATE POLICY "Allow public update season_points"
  ON season_points
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Herkes sezon puanı silebilir (public delete) - Sezon bitince sistem siliyor
CREATE POLICY "Allow public delete season_points"
  ON season_points
  FOR DELETE
  USING (true);

COMMENT ON POLICY "Allow public read season_points" ON season_points IS 'Herkes sezon puanlarını okuyabilir (liderlik tablosu için)';
COMMENT ON POLICY "Allow public insert season_points" ON season_points IS 'Herkes sezon puanı ekleyebilir (sistem otomatik ekliyor)';
COMMENT ON POLICY "Allow public update season_points" ON season_points IS 'Herkes sezon puanı güncelleyebilir (sistem otomatik güncelliyor)';
COMMENT ON POLICY "Allow public delete season_points" ON season_points IS 'Herkes sezon puanı silebilir (sezon bitince sistem siliyor)';












