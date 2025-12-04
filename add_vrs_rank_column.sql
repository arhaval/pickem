-- Türk Takımları Sıralaması tablosuna vrs_rank kolonu ekle
ALTER TABLE turkish_teams_ranking 
ADD COLUMN IF NOT EXISTS vrs_rank INTEGER;

-- Kolonun eklendiğini kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'turkish_teams_ranking' 
AND column_name = 'vrs_rank';







