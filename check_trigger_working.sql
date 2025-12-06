-- Trigger'ın çalışıp çalışmadığını kontrol et

-- 1. Trigger var mı?
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%auto_confirm%' OR trigger_name LIKE '%user_created%';

-- 2. Fonksiyon var mı?
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%auto_confirm%';

-- 3. Son oluşturulan kullanıcıları kontrol et
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.confirmed_at,
  u.created_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'ONAYLI ✅'
    ELSE 'ONAYSIZ ❌'
  END as durum
FROM auth.users u
ORDER BY u.created_at DESC
LIMIT 5;










