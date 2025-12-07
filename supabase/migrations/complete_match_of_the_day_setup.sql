-- ============================================
-- Günün Maçı - Tüm Alanlar (Tek Seferde)
-- ============================================
-- Bu migration, site_settings tablosuna günün maçı için tüm gerekli alanları ekler
-- Supabase SQL Editor'da çalıştırın

-- 1. Temel ID kolonu (opsiyonel, eski sistem için)
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_id TEXT;

-- 2. Manuel bilgiler (Takım isimleri, tarih, saat, turnuva)
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_team_a TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_team_b TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_date DATE,
ADD COLUMN IF NOT EXISTS match_of_the_day_time TIME,
ADD COLUMN IF NOT EXISTS match_of_the_day_tournament TEXT;

-- 3. Logo URL'leri
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_team_a_logo TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_team_b_logo TEXT;

-- 4. Yayın bilgileri
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_stream_platform TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_stream_channel TEXT;

-- Index ekle (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_site_settings_match_of_the_day_id ON site_settings(match_of_the_day_id);

-- Comment'ler
COMMENT ON COLUMN site_settings.match_of_the_day_id IS 'Ana sayfada gösterilecek "Günün Maçı"nın ID''si (matches tablosundan)';
COMMENT ON COLUMN site_settings.match_of_the_day_team_a IS 'Günün Maçı - Takım A (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_team_b IS 'Günün Maçı - Takım B (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_date IS 'Günün Maçı - Tarih (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_time IS 'Günün Maçı - Saat (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_tournament IS 'Günün Maçı - Turnuva Adı (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_team_a_logo IS 'Günün Maçı - Takım A Logo URL (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_team_b_logo IS 'Günün Maçı - Takım B Logo URL (manuel, maçlara bağlı değil)';
COMMENT ON COLUMN site_settings.match_of_the_day_stream_platform IS 'Günün Maçı - Yayın Platformu (twitch, youtube, kick)';
COMMENT ON COLUMN site_settings.match_of_the_day_stream_channel IS 'Günün Maçı - Yayıncı Kanal Adı';













