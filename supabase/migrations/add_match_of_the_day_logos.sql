-- ============================================
-- Günün Maçı Logo Alanları Ekleme
-- ============================================
-- Bu migration, site_settings tablosuna günün maçı için logo URL'leri ekler

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_team_a_logo TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_team_b_logo TEXT;

-- Comment ekle
COMMENT ON COLUMN site_settings.match_of_the_day_team_a_logo IS 'Günün Maçı - Takım A Logo URL (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_team_b_logo IS 'Günün Maçı - Takım B Logo URL (manuel, maçlara bağlı değil)';












