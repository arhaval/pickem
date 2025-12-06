-- Trigger'ı geçici olarak devre dışı bırak (test için)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Kontrol: Trigger'ın kaldırıldığını doğrula
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Eğer sonuç boşsa, trigger başarıyla kaldırıldı demektir










