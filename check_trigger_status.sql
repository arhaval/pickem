-- Trigger durumunu kontrol et

-- 1. Trigger'ın var olup olmadığını kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Trigger fonksiyonunu kontrol et
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 3. Son oluşturulan kullanıcıları kontrol et
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.id as profile_id,
  p.username,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;






