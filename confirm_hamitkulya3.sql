-- hamitkulya3@icloud.com email'ini onayla
-- confirmed_at otomatik oluşturulan bir kolon, sadece email_confirmed_at güncellenebilir
UPDATE auth.users
SET 
  email_confirmed_at = NOW()
WHERE email = 'hamitkulya3@icloud.com';

-- Kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'hamitkulya3@icloud.com';

