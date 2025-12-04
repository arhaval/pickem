-- 🚀 Basit Admin Kurulumu
-- Key'lere gerek yok, sadece SQL çalıştır!

-- ADIM 1: Önce mevcut kullanıcıları listele
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.username,
  p.is_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ADIM 2: Yukarıdaki listeden bir kullanıcı seç ve ID'sini kopyala
-- Sonra aşağıdaki SQL'i çalıştır (KULLANICI_ID_BURAYA kısmını değiştir):

-- Profil varsa admin yap
UPDATE public.profiles
SET is_admin = true,
    username = COALESCE(username, 'admin'),
    updated_at = NOW()
WHERE id = 'KULLANICI_ID_BURAYA';

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
  'KULLANICI_ID_BURAYA',
  'admin',
  true,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = 'KULLANICI_ID_BURAYA'
);

-- ADIM 3: Kontrol et
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = 'KULLANICI_ID_BURAYA';

-- ✅ is_admin = true görünmeli!






