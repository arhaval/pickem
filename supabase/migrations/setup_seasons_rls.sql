-- Seasons tablosu için RLS politikaları

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Allow public read seasons" ON seasons;
DROP POLICY IF EXISTS "Allow public insert seasons" ON seasons;
DROP POLICY IF EXISTS "Allow public update seasons" ON seasons;
DROP POLICY IF EXISTS "Allow public delete seasons" ON seasons;
DROP POLICY IF EXISTS "Allow authenticated read seasons" ON seasons;
DROP POLICY IF EXISTS "Allow authenticated insert seasons" ON seasons;
DROP POLICY IF EXISTS "Allow authenticated update seasons" ON seasons;
DROP POLICY IF EXISTS "Allow authenticated delete seasons" ON seasons;

-- RLS'yi etkinleştir
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Herkes sezonları okuyabilir (public read)
CREATE POLICY "Allow public read seasons"
  ON seasons
  FOR SELECT
  USING (true);

-- Herkes sezon ekleyebilir (public insert) - Geliştirme için
-- Production'da sadece admin'ler ekleyebilmeli
CREATE POLICY "Allow public insert seasons"
  ON seasons
  FOR INSERT
  WITH CHECK (true);

-- Herkes sezon güncelleyebilir (public update) - Geliştirme için
-- Production'da sadece admin'ler güncelleyebilmeli
CREATE POLICY "Allow public update seasons"
  ON seasons
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Herkes sezon silebilir (public delete) - Geliştirme için
-- Production'da sadece admin'ler silebilmeli
CREATE POLICY "Allow public delete seasons"
  ON seasons
  FOR DELETE
  USING (true);

COMMENT ON POLICY "Allow public read seasons" ON seasons IS 'Herkes sezonları okuyabilir';
COMMENT ON POLICY "Allow public insert seasons" ON seasons IS 'Herkes sezon ekleyebilir (geliştirme için)';
COMMENT ON POLICY "Allow public update seasons" ON seasons IS 'Herkes sezon güncelleyebilir (geliştirme için)';
COMMENT ON POLICY "Allow public delete seasons" ON seasons IS 'Herkes sezon silebilir (geliştirme için)';













