-- add_live_lobbies_match_columns.sql
-- live_lobbies tablosuna maç bilgisi kolonları ekler

-- team_a kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'team_a'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN team_a text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.team_a IS 'Takım A ismi';
    END IF;
END $$;

-- team_b kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'team_b'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN team_b text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.team_b IS 'Takım B ismi';
    END IF;
END $$;

-- team_a_logo kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'team_a_logo'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN team_a_logo text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.team_a_logo IS 'Takım A logo URL';
    END IF;
END $$;

-- team_b_logo kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_lobbies' 
        AND column_name = 'team_b_logo'
    ) THEN
        ALTER TABLE public.live_lobbies
        ADD COLUMN team_b_logo text NULL;
        
        COMMENT ON COLUMN public.live_lobbies.team_b_logo IS 'Takım B logo URL';
    END IF;
END $$;





