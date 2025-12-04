-- Manuel Admin Kullanıcısı Oluşturma (Trigger Sorunu Varsa)
-- Bu yöntem trigger'a bağlı değil, direkt SQL ile oluşturur

-- ⚠️ ÖNEMLİ: Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştır
-- "Run as" → "Service Role" seç (RLS bypass için)

-- ADIM 1: Önce kullanıcıyı Supabase Dashboard'dan oluştur
-- Authentication → Users → Add User
-- Email: admin@arhaval.com
-- Password: Admin123!
-- Auto Confirm: ✅
-- User Metadata: {"username": "admin"}

-- ADIM 2: Kullanıcı ID'sini kopyala (UUID)

-- ADIM 3: Aşağıdaki SQL'i çalıştır (ID'yi değiştir):

-- Profil oluştur (Service Role ile çalıştır)
INSERT INTO public.profiles (
  id,
  username,
  is_admin,
  total_points,
  created_at,
  updated_at
) VALUES (
  'BURAYA_KULLANICI_ID_GIR',  -- ← ID'yi buraya yapıştır
  'admin',
  true,                        -- ← Admin yetkisi
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  username = 'admin',
  updated_at = NOW();

-- ADIM 4: Kontrol et
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@arhaval.com';

-- ✅ is_admin = true görünmeli!






