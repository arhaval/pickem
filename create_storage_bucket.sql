-- create_storage_bucket.sql
-- Supabase Storage'da 'uploads' bucket'ını oluşturur
-- NOT: Bu SQL komutu Supabase SQL Editor'de çalışmayabilir
-- Supabase Dashboard > Storage > New Bucket ile manuel olarak oluşturmanız gerekebilir

-- Storage bucket'ları SQL ile oluşturulamaz, Supabase Dashboard'dan oluşturulmalıdır
-- Aşağıdaki adımları takip edin:

/*
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden "Storage" sekmesine tıklayın
4. "New bucket" butonuna tıklayın
5. Bucket adı: "uploads"
6. Public bucket: ✅ (işaretleyin - herkes erişebilir)
7. File size limit: 50MB (veya istediğiniz limit)
8. Allowed MIME types: image/* (veya boş bırakın - tüm tiplere izin verir)
9. "Create bucket" butonuna tıklayın

NOT: "public" adı Supabase'de özel bir kelime olduğu için kullanılamaz.
Bu yüzden "uploads" adını kullanıyoruz.

Alternatif olarak, bucket'ı "private" yapıp RLS politikaları ile kontrol edebilirsiniz.
*/

-- Eğer bucket zaten varsa, sadece RLS politikalarını ayarlayın:
-- (Bu komutlar çalışabilir)

-- Public bucket için herkesin okuma izni olmalı (zaten public bucket ise otomatik)
-- Private bucket için RLS politikaları ekleyin:

-- INSERT policy (sadece authenticated users)
-- UPDATE policy (sadece authenticated users)
-- DELETE policy (sadece authenticated users veya admins)

