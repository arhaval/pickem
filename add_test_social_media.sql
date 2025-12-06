-- Test için örnek sosyal medya verileri ekle
-- ÖNCE add_social_media_columns.sql'i çalıştırmalısın!

-- Tüm kullanıcılara örnek Instagram ve Twitter hesapları ekle
UPDATE public.profiles
SET 
  instagram_url = CASE 
    WHEN username IS NOT NULL THEN 'https://instagram.com/' || LOWER(username)
    ELSE NULL
  END,
  twitter_url = CASE 
    WHEN username IS NOT NULL THEN 'https://twitter.com/' || LOWER(username)
    ELSE NULL
  END
WHERE username IS NOT NULL;

-- Veya belirli bir kullanıcıya eklemek için:
-- UPDATE public.profiles
-- SET 
--   instagram_url = 'https://instagram.com/testuser',
--   twitter_url = 'https://twitter.com/testuser'
-- WHERE id = 'BURAYA_KULLANICI_ID_GIR';










