-- ============================================
-- RLS'yi Tamamen Devre Dışı Bırak (Geçici)
-- ============================================
-- DİKKAT: Bu sadece geliştirme aşamasında kullanılmalıdır!
-- Production'da mutlaka RLS aktif olmalıdır.

-- site_settings tablosu için RLS'yi devre dışı bırak
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Storage için tüm politikaları kaldır
DROP POLICY IF EXISTS "Allow authenticated users to upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload banners (TEMPORARY)" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update banners (TEMPORARY)" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete banners (TEMPORARY)" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert site_settings" ON site_settings;

-- Storage için RLS'yi devre dışı bırak (eğer mümkünse)
-- NOT: Storage için RLS'yi doğrudan devre dışı bırakamayız, 
-- bunun yerine public politikalar oluşturuyoruz

-- Storage için public erişim politikaları (herkes yapabilir - GÜVENSİZ!)
CREATE POLICY "Allow public upload banners"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Allow public read banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');

CREATE POLICY "Allow public update banners"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Allow public delete banners"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'banners');













