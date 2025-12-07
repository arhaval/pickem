-- Özel Admin Kullanıcısı Oluşturma (Önerilen)
-- Bu yöntemle hem auth.users'da hem profiles'da kayıt olur
-- Böylece giriş yapabilir ve admin paneline erişebilir

-- 1. Özel admin kullanıcısı oluştur
-- Email: admin@arhaval.com
-- Şifre: Admin123! (İlk girişte değiştir)
-- Username: admin

-- Supabase Admin API kullanarak oluşturulmalı, ama SQL ile de yapılabilir:

-- ÖNCE: Supabase Dashboard → Authentication → Users → Add User
-- Email: admin@arhaval.com
-- Password: Admin123!
-- Auto Confirm: ✅ (işaretle)
-- User Metadata: {"username": "admin"}

-- SONRA: Aşağıdaki SQL'i çalıştır (kullanıcı ID'sini yukarıdaki adımdan al):
-- UPDATE public.profiles
-- SET is_admin = true,
--     username = 'admin',
--     updated_at = NOW()
-- WHERE id = 'KULLANICI_ID_BURAYA';

-- VEYA: Eğer profil yoksa oluştur:
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

-- Kontrol:
-- SELECT p.id, p.username, p.is_admin, u.email
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE p.is_admin = true;











