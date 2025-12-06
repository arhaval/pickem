    -- setup_storage_rls_policies.sql
    -- Supabase Storage bucket'ı için RLS politikalarını oluşturur
    -- Bu dosyayı Supabase SQL Editor'de çalıştırın

    -- Önce bucket'ın var olduğundan emin olun
    -- Supabase Dashboard > Storage > "uploads" bucket'ı oluşturun

-- setup_storage_rls_policies.sql
-- NOT: Bu dosya çalıştırılamaz!
-- Supabase Storage RLS politikaları SQL ile oluşturulamaz.
-- storage.objects tablosu sistem tablosu olduğu için doğrudan değiştirilemez.

-- LÜTFEN STORAGE_RLS_SETUP.md DOSYASINI OKUYUN!
-- Dashboard'dan manuel olarak policy eklemeniz gerekiyor.

-- Alternatif olarak, Supabase Dashboard'dan:
-- 1. Storage > uploads bucket > Policies
-- 2. "New Policy" butonuna tıklayın
-- 3. Aşağıdaki policy'leri manuel olarak ekleyin:

/*
Policy 1: Public Read
- Operation: SELECT
- Target: public
- USING: bucket_id = 'uploads'

Policy 2: Authenticated Upload
- Operation: INSERT
- Target: authenticated
- WITH CHECK: bucket_id = 'uploads' AND auth.role() = 'authenticated'

Policy 3: Authenticated Update
- Operation: UPDATE
- Target: authenticated
- USING: bucket_id = 'uploads' AND auth.role() = 'authenticated'
- WITH CHECK: bucket_id = 'uploads' AND auth.role() = 'authenticated'

Policy 4: Authenticated Delete
- Operation: DELETE
- Target: authenticated
- USING: bucket_id = 'uploads' AND auth.role() = 'authenticated'
*/

