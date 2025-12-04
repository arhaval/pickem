-- Trigger'ın çalışıp çalışmadığını test et

-- 1. Trigger'ın var olup olmadığını kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Fonksiyonun var olup olmadığını kontrol et
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. Son oluşturulan kullanıcıları ve profillerini kontrol et
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.username,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN 'PROFIL YOK!'
    ELSE 'Profil var'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 4. Profil olmayan kullanıcıları göster
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ORDER BY created_at DESC;






