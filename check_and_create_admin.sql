-- Admin kullanıcısını kontrol et ve oluştur

-- 1. ÖNCE MEVCUT KULLANICILARI KONTROL ET:
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.username,
  p.is_admin,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@arhaval.com'
ORDER BY u.created_at DESC;

-- 2. EĞER KULLANICI YOKSA VEYA ADMIN DEĞİLSE:
-- Aşağıdaki adımları takip et:

-- ADIM 1: Supabase Dashboard → Authentication → Users → Add User
-- Email: admin@arhaval.com
-- Password: Admin123!
-- Auto Confirm: ✅ (işaretle)
-- User Metadata: {"username": "admin"}

-- ADIM 2: Yukarıdaki sorguyu tekrar çalıştır ve kullanıcı ID'sini al

-- ADIM 3: Aşağıdaki SQL'i çalıştır (KULLANICI_ID_BURAYA kısmını değiştir):
-- UPDATE public.profiles
-- SET is_admin = true,
--     username = 'admin',
--     updated_at = NOW()
-- WHERE id = 'KULLANICI_ID_BURAYA';

-- ADIM 4: Eğer profil yoksa oluştur:
-- INSERT INTO public.profiles (
--   id,
--   username,
--   is_admin,
--   total_points,
--   created_at,
--   updated_at
-- ) VALUES (
--   'KULLANICI_ID_BURAYA',
--   'admin',
--   true,
--   0,
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   is_admin = true,
--   username = 'admin',
--   updated_at = NOW();

-- 5. KONTROL ET:
-- SELECT p.id, p.username, p.is_admin, u.email, u.email_confirmed_at
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE u.email = 'admin@arhaval.com';






