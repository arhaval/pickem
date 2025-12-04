-- hamitkulya3@icloud.com kullanıcısının durumunu kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'hamitkulya3@icloud.com';

-- Eğer kullanıcı varsa ama şifre sorunluysa, şifreyi sıfırlamak için:
-- Supabase Dashboard → Authentication → Users → kullanıcıyı bul → Reset Password






