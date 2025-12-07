-- Live Questions tablosuna banner_image_url kolonu ekleme
-- Bu migration, live_questions tablosuna banner görseli kolonunu ekler

ALTER TABLE live_questions
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- Kolona açıklama ekle
COMMENT ON COLUMN live_questions.banner_image_url IS 'Soru banner görseli URL';



