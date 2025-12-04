-- Sıralama görünürlüğü kontrolü için kolon ekle
-- site_settings tablosuna is_ranking_visible kolonu ekler

DO $$ 
BEGIN
  -- Kolon yoksa ekle
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'site_settings' 
    AND column_name = 'is_ranking_visible'
  ) THEN
    ALTER TABLE public.site_settings 
    ADD COLUMN is_ranking_visible BOOLEAN DEFAULT true;
    
    -- Mevcut kayıtları true yap (varsayılan olarak açık)
    UPDATE public.site_settings 
    SET is_ranking_visible = true 
    WHERE is_ranking_visible IS NULL;
  END IF;
END $$;

-- Kontrol için:
-- SELECT id, is_ranking_visible FROM public.site_settings;






