-- Türk Takımları Sıralaması tablosuna logo_url kolonu ekle
ALTER TABLE turkish_teams_ranking 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Kolonun eklendiğini kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'turkish_teams_ranking' 
AND column_name = 'logo_url';







