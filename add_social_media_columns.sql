-- Profil tablosuna sosyal medya alanları ekle
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'instagram_url') THEN
    ALTER TABLE public.profiles ADD COLUMN instagram_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'twitter_url') THEN
    ALTER TABLE public.profiles ADD COLUMN twitter_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'youtube_url') THEN
    ALTER TABLE public.profiles ADD COLUMN youtube_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'twitch_url') THEN
    ALTER TABLE public.profiles ADD COLUMN twitch_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tiktok_url') THEN
    ALTER TABLE public.profiles ADD COLUMN tiktok_url TEXT;
  END IF;
END $$;

