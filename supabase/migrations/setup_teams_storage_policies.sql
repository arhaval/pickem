-- ============================================
-- Teams Storage Bucket RLS Politikaları
-- ============================================
-- Bu migration, teams bucket için RLS politikalarını ayarlar

-- Mevcut politikaları temizle (çakışmaları önlemek için)
DROP POLICY IF EXISTS "Allow public upload teams" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read teams" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update teams" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete teams" ON storage.objects;

-- Teams bucket için public erişim politikaları (geçici - geliştirme için)
CREATE POLICY "Allow public upload teams"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'teams');

CREATE POLICY "Allow public read teams"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'teams');

CREATE POLICY "Allow public update teams"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'teams')
WITH CHECK (bucket_id = 'teams');

CREATE POLICY "Allow public delete teams"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'teams');












