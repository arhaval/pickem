-- ============================================
-- Günün Maçı Yayın Bilgilerini JSON Formatına Çevirme
-- ============================================
-- Bu migration, tek yayın alanlarını kaldırıp JSON formatında çoklu yayın ekler

-- Eski kolonları kaldır (eğer varsa)
ALTER TABLE site_settings
DROP COLUMN IF EXISTS match_of_the_day_stream_platform,
DROP COLUMN IF EXISTS match_of_the_day_stream_channel;

-- Yeni JSON kolonu ekle
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS match_of_the_day_streams TEXT;

-- Comment ekle
COMMENT ON COLUMN site_settings.match_of_the_day_streams IS 'Günün Maçı - Yayın Bilgileri (JSON: [{"platform": "twitch", "channel": "esl_cs2"}, ...])';








