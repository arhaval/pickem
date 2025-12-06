-- TRİGGER'I KALDIR - TEST İÇİN
-- Bu scripti Supabase SQL Editor'de çalıştır, sonra kayıt olmayı dene

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Kontrol
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Trigger kaldırıldı - Artık kayıt olmayı deneyebilirsin'
    ELSE '❌ Trigger hala var'
  END as durum
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';










