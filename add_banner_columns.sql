-- Site Settings Banner Kolonları Ekleme
-- Bu migration, site_settings tablosuna banner kolonlarını ekler

-- Profile Banner Kolonları
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS profile_banner_url TEXT,
ADD COLUMN IF NOT EXISTS profile_banner_button_text TEXT,
ADD COLUMN IF NOT EXISTS profile_banner_button_link TEXT;

-- Ranking Banner Kolonları (eğer yoksa)
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS ranking_banner_url TEXT,
ADD COLUMN IF NOT EXISTS ranking_banner_button_text TEXT,
ADD COLUMN IF NOT EXISTS ranking_banner_button_link TEXT;

-- Kolonlara açıklama ekle
COMMENT ON COLUMN site_settings.profile_banner_url IS 'Profil sayfası banner görseli URL';
COMMENT ON COLUMN site_settings.profile_banner_button_text IS 'Profil sayfası banner buton metni';
COMMENT ON COLUMN site_settings.profile_banner_button_link IS 'Profil sayfası banner buton linki';

COMMENT ON COLUMN site_settings.ranking_banner_url IS 'Sıralama sayfası banner görseli URL';
COMMENT ON COLUMN site_settings.ranking_banner_button_text IS 'Sıralama sayfası banner buton metni';
COMMENT ON COLUMN site_settings.ranking_banner_button_link IS 'Sıralama sayfası banner buton linki';

-- Mevcut kolonları kontrol et (matches ve predictions banner kolonları zaten varsa hata vermez)
DO $$
BEGIN
  -- Matches banner kolonları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'matches_banner_url') THEN
    ALTER TABLE site_settings ADD COLUMN matches_banner_url TEXT;
    ALTER TABLE site_settings ADD COLUMN matches_banner_button_text TEXT;
    ALTER TABLE site_settings ADD COLUMN matches_banner_button_link TEXT;
  END IF;

  -- Predictions banner kolonları
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'predictions_banner_url') THEN
    ALTER TABLE site_settings ADD COLUMN predictions_banner_url TEXT;
    ALTER TABLE site_settings ADD COLUMN predictions_banner_button_text TEXT;
    ALTER TABLE site_settings ADD COLUMN predictions_banner_button_link TEXT;
  END IF;
END $$;




