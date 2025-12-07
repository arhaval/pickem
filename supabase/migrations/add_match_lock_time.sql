-- Maç bazlı tahmin kilitleme saati ekle
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS prediction_lock_minutes_before_match integer DEFAULT NULL;

COMMENT ON COLUMN public.matches.prediction_lock_minutes_before_match IS 'Bu maç için tahminlerin maçtan kaç dakika önce kilitleneceği (NULL = genel ayarı kullan, 0 = maç saati, 15 = maçtan 15 dakika önce)';

