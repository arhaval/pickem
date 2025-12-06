-- ============================================
-- Günün Maçı Yayın Bilgisi Alanları Ekleme
-- ============================================
-- Bu migration, site_settings tablosuna günün maçı için yayın bilgileri ekler

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_stream_platform TEXT,
ADD COLUMN IF NOT EXISTS match_of_the_day_stream_channel TEXT;

-- Comment ekle
COMMENT ON COLUMN site_settings.match_of_the_day_stream_platform IS 'Günün Maçı - Yayın Platformu (twitch, youtube, kick)';
COMMENT ON COLUMN site_settings.match_of_the_day_stream_channel IS 'Günün Maçı - Yayıncı Kanal Adı';












