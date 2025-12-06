-- Trigger'ı geçici olarak devre dışı bırak (test için)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Profil oluşturma fonksiyonunu silme, sadece trigger'ı kaldır
-- Böylece auth callback'te manuel oluşturabiliriz










