-- add_live_lobbies_columns.sql
-- live_lobbies tablosuna eksik kolonları ekler

-- event_title kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'event_title'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN event_title text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.event_title IS 'Etkinlik başlığı';
    END IF;
END $$;

-- primary_color kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'primary_color'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN primary_color text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.primary_color IS 'Ana renk (hex formatında)';
    END IF;
END $$;

-- hero_image_url kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'hero_image_url'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN hero_image_url text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.hero_image_url IS 'Hero görsel URL';
    END IF;
END $$;





