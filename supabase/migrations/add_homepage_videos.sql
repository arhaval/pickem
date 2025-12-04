-- Homepage Videos kolonu ekle
-- Bu kolon, ana sayfada "SON VIDEOLARIMIZ" bölümünde gösterilecek 3 videonun bilgilerini tutar

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS homepage_videos JSONB DEFAULT '[]'::jsonb;

-- Kolon için açıklama ekle
COMMENT ON COLUMN site_settings.homepage_videos IS 'Ana sayfada SON VIDEOLARIMIZ bölümünde gösterilecek 3 videonun bilgilerini tutar. Format: [{"title": "Video Başlığı", "thumbnailUrl": "https://...", "href": "https://youtube.com/..."}, ...]';





