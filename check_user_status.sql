-- hamitkulya3@icloud.com kullanıcısının durumunu kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at,
  encrypted_password IS NOT NULL as has_password,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Email Onaylı ✅'
    ELSE 'Email Onaysız ❌'
  END as email_durum,
  CASE 
    WHEN confirmed_at IS NOT NULL THEN 'Hesap Onaylı ✅'
    ELSE 'Hesap Onaysız ❌'
  END as hesap_durum
FROM auth.users
WHERE email = 'hamitkulya3@icloud.com';










