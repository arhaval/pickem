-- ============================================
-- Geçici RLS Devre Dışı Bırakma (Sadece Geliştirme İçin)
-- ============================================
-- DİKKAT: Bu sadece geliştirme aşamasında kullanılmalıdır!
-- Production'da RLS mutlaka aktif olmalıdır.

-- site_settings tablosu için RLS'yi geçici olarak devre dışı bırak
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Storage için RLS politikalarını kaldır (geçici)
DROP POLICY IF EXISTS "Allow authenticated users to upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete banners" ON storage.objects;

-- Storage için public erişim politikaları (geçici - sadece geliştirme)
-- NOT: Bu güvenlik açığı yaratır, sadece test için kullanın!

-- Public upload (herkes yükleyebilir - GÜVENSİZ!)
CREATE POLICY "Allow public upload banners (TEMPORARY)"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'banners');

-- Public read (herkes okuyabilir)
CREATE POLICY "Allow public read banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Public update (herkes güncelleyebilir - GÜVENSİZ!)
CREATE POLICY "Allow public update banners (TEMPORARY)"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

-- Public delete (herkes silebilir - GÜVENSİZ!)
CREATE POLICY "Allow public delete banners (TEMPORARY)"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'banners');













