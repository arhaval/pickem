-- Partnerler kolonu ekleme
-- site_settings tablosuna partners kolonu ekler (JSON formatında)

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS partners TEXT;

-- Açıklama ekle
COMMENT ON COLUMN site_settings.partners IS 'Partner listesi JSON formatında: [{"name": "Partner Adı", "logo_url": "url", "url": "link"}]';








