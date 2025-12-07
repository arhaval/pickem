-- Şu anki kullanıcıyı admin yap
-- Bu script, auth.users tablosundaki tüm kullanıcıları listeler
-- Sonra hangi kullanıcıyı admin yapmak istediğini seçebilirsin

-- 1. ÖNCE TÜM KULLANICILARI LİSTELE:
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.username,
  p.is_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. BELİRLİ BİR EMAİL'E SAHİP KULLANICIYI ADMIN YAP:
-- Aşağıdaki satırda 'BURAYA_EMAIL_GIR' kısmını kendi email'inle değiştir ve çalıştır:
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'BURAYA_EMAIL_GIR'
-- );

-- 3. VEYA EN SON KAYIT OLAN KULLANICIYI ADMIN YAP:
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (
--   SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1
-- );

-- 4. KONTROL ET:
-- SELECT id, username, email, is_admin 
-- FROM public.profiles 
-- WHERE is_admin = true;











