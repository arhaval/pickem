-- Homepage Pick Matches kolonu ekle
-- Bu kolon, ana sayfada "PICK EM" bölümünde gösterilecek 3 maçın ID'lerini tutar

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS homepage_pick_match_ids JSONB DEFAULT '[]'::jsonb;

-- Kolon için açıklama ekle
COMMENT ON COLUMN site_settings.homepage_pick_match_ids IS 'Ana sayfada PICK EM bölümünde gösterilecek 3 maçın ID''lerini tutar. Örnek: ["match-id-1", "match-id-2", "match-id-3"]';





