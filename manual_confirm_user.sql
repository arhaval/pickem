-- Manuel olarak kullanıcı onaylama (test için)
-- Belirli bir email'i onayla

-- Örnek: test@example.com email'ini onayla
-- confirmed_at otomatik oluşturulan bir kolon, sadece email_confirmed_at güncellenebilir
UPDATE auth.users
SET 
  email_confirmed_at = NOW()
WHERE email = 'test@example.com'; -- BURAYA KENDİ EMAIL'İNİ YAZ

-- VEYA tüm onaylanmamış kullanıcıları onayla (DİKKAT: Production'da kullanma!)
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = COALESCE(email_confirmed_at, NOW())
-- WHERE email_confirmed_at IS NULL;

