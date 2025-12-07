-- ============================================
-- Günün Maçı Seçimi için Kolon Ekleme
-- ============================================
-- Bu migration, site_settings tablosuna match_of_the_day_id kolonu ekler

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_id TEXT;

-- Index ekle (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_site_settings_match_of_the_day_id ON site_settings(match_of_the_day_id);

-- Comment ekle
COMMENT ON COLUMN site_settings.match_of_the_day_id IS 'Ana sayfada gösterilecek "Günün Maçı"nın ID''si (matches tablosundan)';













