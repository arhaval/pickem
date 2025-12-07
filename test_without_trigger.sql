-- Trigger'ı geçici olarak devre dışı bırak (test için)
-- Bu scripti çalıştır, sonra kayıt olmayı dene

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Kontrol: Trigger kaldırıldı mı?
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Trigger başarıyla kaldırıldı'
    ELSE '❌ Trigger hala var'
  END as durum
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- NOT: Test sonrası trigger'ı tekrar aktif etmek için TAM_COZUM_FINAL.sql'i çalıştır











