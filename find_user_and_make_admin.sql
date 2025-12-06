-- Kullanıcıyı bul ve admin yap
-- Önce tüm kullanıcıları listele:

-- 1. Tüm kullanıcıları ve email'lerini görüntüle
SELECT 
  p.id,
  p.username,
  u.email,
  p.is_admin
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 2. Belirli bir email'e sahip kullanıcıyı admin yap:
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'BURAYA_EMAIL_GIR'
-- );

-- 3. İlk kullanıcıyı admin yap (en eski kayıt):
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- 4. Son kullanıcıyı admin yap (en yeni kayıt):
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 1);










