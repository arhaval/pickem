-- ============================================
-- Maç Arşivleme Sistemi
-- ============================================
-- Bu migration, maçları silmek yerine arşivlemek için is_archived field'ı ekler

-- matches tablosuna is_archived field'ı ekle
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_matches_is_archived ON matches(is_archived);

-- Comment ekle
COMMENT ON COLUMN matches.is_archived IS 'Maçın arşivlenip arşivlenmediğini belirtir. Arşivlenen maçlar silinmez, sadece gizlenir.';













