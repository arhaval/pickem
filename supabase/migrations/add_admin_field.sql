-- Add is_admin field to profiles table
-- Bu migration, admin kontrolü için profiles tablosuna is_admin field'ı ekler

-- is_admin field'ını ekle
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Mevcut admin kullanıcılarını işaretlemek için (isteğe bağlı)
-- Kendi email'inizi buraya yazın ve çalıştırın:
-- UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Comment ekle
COMMENT ON COLUMN profiles.is_admin IS 'Kullanıcının admin yetkisi olup olmadığını belirtir';








