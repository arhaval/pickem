-- Maçlar sayfası için görüntüleme maçları flag'i ekle
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS is_display_match BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN matches.is_display_match IS 'true ise sadece maçlar sayfasında görüntüleme için, false/null ise tahminler için kullanılır';













