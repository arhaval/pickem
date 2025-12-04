-- ✅ ÇÖZÜM: Admin Kullanıcısı Oluşturma (Trigger Sorunu Varsa)

-- YÖNTEM 1: Mevcut Kullanıcıyı Admin Yap (EN KOLAY)
-- Eğer zaten bir kullanıcın varsa:

-- 1. Önce mevcut kullanıcıları listele
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.username,
  p.is_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Yukarıdaki listeden bir kullanıcı seç ve ID'sini kopyala
-- 3. Aşağıdaki SQL'i çalıştır (ID'yi değiştir):

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

-- YÖNTEM 2: Trigger'ı Geçici Devre Dışı Bırak (Kullanıcı Yoksa)

-- 1. Trigger'ı geçici olarak kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Şimdi Supabase Dashboard'dan kullanıcı oluştur
-- Authentication → Users → Add User
-- Email: admin@arhaval.com
-- Password: Admin123!
-- Auto Confirm: ✅

-- 3. Kullanıcı ID'sini al

-- 4. Profil oluştur (Service Role ile çalıştır)
INSERT INTO public.profiles (
  id,
  username,
  is_admin,
  total_points,
  created_at,
  updated_at
) VALUES (
  'BURAYA_KULLANICI_ID_GIR',
  'admin',
  true,
  0,
  NOW(),
  NOW()
);

-- 5. Trigger'ı tekrar aktif et (opsiyonel)
-- CREATE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION handle_new_user();






