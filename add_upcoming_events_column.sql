-- Site ayarları tablosuna upcoming_events kolonu ekle
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS upcoming_events TEXT;

-- Kolonun eklendiğini kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
AND column_name = 'upcoming_events';











