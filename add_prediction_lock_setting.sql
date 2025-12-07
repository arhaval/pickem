-- Tahmin kilitleme ayarı ekle
-- Maçtan kaç dakika önce tahminlerin kilitleneceğini belirler

ALTER TABLE public.site_settings
ADD COLUMN prediction_lock_minutes_before_match integer DEFAULT 0;

COMMENT ON COLUMN public.site_settings.prediction_lock_minutes_before_match IS 'Maçtan kaç dakika önce tahminlerin kilitleneceği (0 = maç saati, 15 = maçtan 15 dakika önce)';

-- Varsayılan değer: 0 (maç saati geldiğinde kilitlenir)
UPDATE public.site_settings
SET prediction_lock_minutes_before_match = 0
WHERE id = 1;





