-- ============================================================
-- MATCHES TABLOSUNA live_lobby_id KOLONU EKLEME
-- ============================================================
--
-- Bu migration:
-- 1. matches tablosuna live_lobby_id kolonu ekler (eğer yoksa)
-- 2. Bu kolon, maçın hangi live lobby'ye ait olduğunu belirtir
-- 3. NULL olabilir (normal maçlar için)
--
-- ============================================================

-- live_lobby_id kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'matches' 
        AND column_name = 'live_lobby_id'
    ) THEN
        ALTER TABLE public.matches
        ADD COLUMN live_lobby_id TEXT NULL;
        
        COMMENT ON COLUMN public.matches.live_lobby_id IS 'Maçın bağlı olduğu live lobby ID (varsa)';
        
        RAISE NOTICE 'live_lobby_id kolonu matches tablosuna eklendi';
    ELSE
        RAISE NOTICE 'live_lobby_id kolonu zaten mevcut';
    END IF;
END $$;

-- ============================================================
-- ÖNEMLİ NOTLAR
-- ============================================================
--
-- - live_lobby_id NULL olabilir (normal maçlar için)
-- - live_lobby_id varsa, maç live lobby'ye bağlıdır
-- - auto_score_predictions_trigger.sql bu kolonu kullanır
-- - live_lobby_id olan maçlar season_points'e eklenmez
--
-- ============================================================

