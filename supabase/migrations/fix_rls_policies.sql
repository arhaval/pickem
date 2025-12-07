-- ============================================
-- Düzeltilmiş RLS Politikaları
-- ============================================
-- Bu migration, RLS politikalarını düzgün şekilde ayarlar

-- ============================================
-- 1. site_settings Tablosu RLS Politikaları
-- ============================================

-- Önce mevcut politikaları temizle
DROP POLICY IF EXISTS "Allow authenticated users to read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public access to site_settings" ON site_settings;

-- RLS'yi etkinleştir
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Herkes okuyabilir (public read)
CREATE POLICY "Allow public read site_settings"
ON site_settings
FOR SELECT
TO public
USING (true);

-- Policy: Authenticated kullanıcılar güncelleyebilir
CREATE POLICY "Allow authenticated users to update site_settings"
ON site_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Authenticated kullanıcılar ekleyebilir
CREATE POLICY "Allow authenticated users to insert site_settings"
ON site_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 2. Storage Bucket RLS Politikaları
-- ============================================

-- Mevcut storage politikalarını temizle
DROP POLICY IF EXISTS "Allow authenticated users to upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload banners (TEMPORARY)" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update banners (TEMPORARY)" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete banners (TEMPORARY)" ON storage.objects;

-- Policy: Herkes okuyabilir (public read - banner'lar public olmalı)
CREATE POLICY "Allow public read banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Policy: Authenticated kullanıcılar yükleyebilir
CREATE POLICY "Allow authenticated users to upload banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Policy: Authenticated kullanıcılar güncelleyebilir
CREATE POLICY "Allow authenticated users to update banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

-- Policy: Authenticated kullanıcılar silebilir
CREATE POLICY "Allow authenticated users to delete banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'banners');













