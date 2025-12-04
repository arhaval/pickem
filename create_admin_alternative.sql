-- Alternatif Admin Kullanıcısı Oluşturma
-- Email: yönetici@arhaval.com

-- ADIM 1: Supabase Dashboard → Authentication → Users → Add User
-- Email: yönetici@arhaval.com
-- Password: Admin123!
-- Auto Confirm: ✅ (işaretle)
-- User Metadata: {"username": "admin"}

-- ADIM 2: Kullanıcı ID'sini al ve aşağıdaki SQL'i çalıştır:

-- Profil varsa admin yap
UPDATE public.profiles
SET is_admin = true,
    username = COALESCE(username, 'admin'),
    updated_at = NOW()
WHERE id = 'BURAYA_KULLANICI_ID_GIR';

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
  'BURAYA_KULLANICI_ID_GIR',
  'admin',
  true,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = 'BURAYA_KULLANICI_ID_GIR'
);

-- Kontrol et:
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'yönetici@arhaval.com';






