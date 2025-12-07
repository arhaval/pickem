-- 🚀 EN BASIT ÇÖZÜM - 2 ADIMDA ADMIN

-- ADIM 1: Mevcut kullanıcıları gör
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
ORDER BY u.created_at DESC
LIMIT 10;

-- ADIM 2: Yukarıdaki listeden bir email seç
-- Sonra aşağıdaki SQL'i çalıştır (EMAIL'i değiştir):

-- Email ile admin yap (EN KOLAY YOL!)
UPDATE public.profiles
SET is_admin = true,
    username = COALESCE(username, 'admin'),
    updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'BURAYA_EMAIL_GIR'
);

-- Eğer profil yoksa oluştur
INSERT INTO public.profiles (
  id,
  username,
  is_admin,
  total_points,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'admin',
  true,
  0,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'BURAYA_EMAIL_GIR'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = u.id
  );

-- KONTROL ET:
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'BURAYA_EMAIL_GIR';

-- ✅ is_admin = true görünmeli!











