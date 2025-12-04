-- ============================================
-- Günün Maçı Manuel Alanları Ekleme
-- ============================================
-- Bu migration, site_settings tablosuna günün maçı için manuel bilgiler ekler
-- Bu bilgiler hiçbir maça bağlı değildir, tamamen bağımsızdır

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_team_a TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_team_b TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_date DATE,
ADD COLUMN IF NOT EXISTS match_of_the_day_time TIME,
ADD COLUMN IF NOT EXISTS match_of_the_day_tournament TEXT;

-- Comment ekle
COMMENT ON COLUMN site_settings.match_of_the_day_team_a IS 'Günün Maçı - Takım A (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_team_b IS 'Günün Maçı - Takım B (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_date IS 'Günün Maçı - Tarih (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_time IS 'Günün Maçı - Saat (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_tournament IS 'Günün Maçı - Turnuva Adı (manuel, maçlara bağlı değil)';








