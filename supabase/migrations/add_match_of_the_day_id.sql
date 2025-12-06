-- Günün maçını match ID ile ilişkilendirmek için kolon ekle
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_id TEXT;

COMMENT ON COLUMN site_settings.match_of_the_day_id IS 'Günün maçı olarak gösterilecek maçın ID''si - matches tablosuna referans';

-- Index ekle (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_site_settings_match_of_the_day_id ON site_settings(match_of_the_day_id) WHERE match_of_the_day_id IS NOT NULL;









