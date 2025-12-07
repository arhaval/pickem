-- ============================================
-- site_settings Tablosuna Eksik Kolonları Ekle
-- ============================================
-- Bu migration, site_settings tablosuna eksik olan kolonları ekler

-- Hero bölümü kolonları
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_button_text TEXT,
ADD COLUMN IF NOT EXISTS hero_button_link TEXT;

-- Matches banner kolonları
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS matches_banner_url TEXT,
ADD COLUMN IF NOT EXISTS matches_banner_button_text TEXT,
ADD COLUMN IF NOT EXISTS matches_banner_button_link TEXT;

-- Predictions banner kolonları
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS predictions_banner_url TEXT,
ADD COLUMN IF NOT EXISTS predictions_banner_button_text TEXT,
ADD COLUMN IF NOT EXISTS predictions_banner_button_link TEXT;

-- Notification kolonları
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS notification_text TEXT,
ADD COLUMN IF NOT EXISTS is_notification_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_color TEXT;

-- System kolonları
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS is_maintenance_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- updated_at için trigger oluştur (otomatik güncelleme için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı site_settings tablosuna ekle
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();













