-- ============================================
-- RLS Policies for Banner Upload System
-- ============================================
-- Bu migration dosyası, banner yükleme sistemi için gerekli RLS politikalarını ayarlar.
-- Supabase SQL Editor'da çalıştırın.

-- ============================================
-- 1. site_settings Tablosu RLS Politikaları
-- ============================================

-- RLS'yi etkinleştir
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (çakışmaları önlemek için)
DROP POLICY IF EXISTS "Allow authenticated users to read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert site_settings" ON site_settings;

-- Policy: Authenticated kullanıcılar site_settings'i okuyabilir
CREATE POLICY "Allow authenticated users to read site_settings"
ON site_settings
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated kullanıcılar site_settings'i güncelleyebilir
CREATE POLICY "Allow authenticated users to update site_settings"
ON site_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Authenticated kullanıcılar site_settings'e yeni kayıt ekleyebilir
CREATE POLICY "Allow authenticated users to insert site_settings"
ON site_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 2. Storage Bucket RLS Politikaları
-- ============================================
-- NOT: Önce Supabase Dashboard'dan "banners" bucket'ını oluşturmanız gerekiyor!
-- Storage > Create Bucket > name: "banners" > Public: Yes

-- Mevcut storage politikalarını temizle
DROP POLICY IF EXISTS "Allow authenticated users to upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete banners" ON storage.objects;

-- Policy: Authenticated kullanıcılar banners bucket'ına dosya yükleyebilir
CREATE POLICY "Allow authenticated users to upload banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Policy: Authenticated kullanıcılar banners bucket'ından dosya okuyabilir
CREATE POLICY "Allow authenticated users to read banners"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'banners');

-- Policy: Authenticated kullanıcılar banners bucket'ındaki dosyaları güncelleyebilir
CREATE POLICY "Allow authenticated users to update banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

-- Policy: Authenticated kullanıcılar banners bucket'ındaki dosyaları silebilir
CREATE POLICY "Allow authenticated users to delete banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'banners');

