-- Live Question Answers tablosuna is_winner kolonu ekleme
-- Bu migration, live_question_answers tablosuna kazanan işaretleme kolonunu ekler

ALTER TABLE live_question_answers
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE;

-- Kolona açıklama ekle
COMMENT ON COLUMN live_question_answers.is_winner IS 'Bu cevap kazanan olarak işaretlendi mi?';

-- İndeks ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_live_question_answers_is_winner 
ON live_question_answers(question_id, is_winner) 
WHERE is_winner = TRUE;


