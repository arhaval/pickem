-- Bağımsız Admin Profili Oluşturma
-- Bu admin profili auth.users'a bağlı değil, sadece profiles tablosunda var
-- NOT: Bu yöntemle giriş yapamazsın, sadece veritabanında admin kaydı olur

-- 1. Özel Admin Profili Oluştur (auth.users'a bağlı değil)
INSERT INTO public.profiles (
  id,
  username,
  avatar_url,
  steam_id,
  total_points,
  is_admin,
  created_at,
  updated_at
) VALUES (
  'admin-standalone-001', -- Özel admin ID
  'Admin',
  null,
  null,
  0,
  true, -- Admin yetkisi
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  updated_at = NOW();

-- Kontrol et:
SELECT id, username, is_admin, created_at 
FROM public.profiles 
WHERE id = 'admin-standalone-001';











