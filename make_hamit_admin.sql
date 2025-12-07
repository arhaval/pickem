-- Hamit kullanıcısını admin yap
-- ID: 6122da56-e596-4a69-8c19-a924fcffc39c
-- Email: hamitkulya3@icloud.com

-- Profil varsa admin yap
UPDATE public.profiles
SET is_admin = true,
    username = COALESCE(username, 'admin'),
    updated_at = NOW()
WHERE id = '6122da56-e596-4a69-8c19-a924fcffc39c';

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
  '6122da56-e596-4a69-8c19-a924fcffc39c',
  'admin',
  true,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '6122da56-e596-4a69-8c19-a924fcffc39c'
);

-- Kontrol et
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '6122da56-e596-4a69-8c19-a924fcffc39c';

-- ✅ is_admin = true görünmeli!











