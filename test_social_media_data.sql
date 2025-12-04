-- Test için örnek sosyal medya verileri ekle
-- Bu scripti çalıştırmadan önce add_social_media_columns.sql'i çalıştırmalısın

-- Örnek: Bir kullanıcıya Instagram ve Twitter ekle
-- Kullanıcı ID'sini kendi kullanıcı ID'n ile değiştir
UPDATE public.profiles
SET 
  instagram_url = 'https://instagram.com/testuser',
  twitter_url = 'https://twitter.com/testuser'
WHERE id = 'BURAYA_KULLANICI_ID_GIR'; -- Kendi kullanıcı ID'ni buraya yaz

-- Veya tüm kullanıcılara test verisi eklemek için:
-- UPDATE public.profiles
-- SET 
--   instagram_url = 'https://instagram.com/' || username,
--   twitter_url = 'https://twitter.com/' || username
-- WHERE username IS NOT NULL;






