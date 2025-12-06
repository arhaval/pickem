-- Trigger ve fonksiyonu kontrol et ve düzelt

-- Önce mevcut trigger ve fonksiyonu tamamen temizle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Yeni kullanıcı oluşturulduğunda profil oluşturan fonksiyon
-- SECURITY DEFINER ile auth.users tablosuna erişim sağlar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Username'i user_metadata'dan al veya email'den oluştur
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)
  );
  
  -- Avatar URL'ini user_metadata'dan al
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'image_url',
    NULL
  );
  
  -- Username'i temizle (sadece harf, rakam, alt çizgi)
  IF v_username IS NOT NULL THEN
    v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
    v_username := SUBSTRING(v_username, 1, 30);
  END IF;
  
  -- Eğer hala username yoksa, user ID'den oluştur
  IF v_username IS NULL OR v_username = '' OR v_username = '_' THEN
    v_username := 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Profil oluştur (ON CONFLICT ile güvenli)
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    total_points,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_username,
    v_avatar_url,
    0,
    FALSE,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, profiles.username),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata olursa logla ama devam et
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS politikalarını güncelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Herkes tüm profilleri görebilir (sıralama için)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger SECURITY DEFINER kullandığı için INSERT policy'sine gerek yok
-- Ama yine de ekleyelim (kullanıcı manuel oluşturmak isterse)
CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Mevcut kullanıcılar için profil oluştur (eğer yoksa)
-- Bu sadece bir kez çalıştırılmalı
DO $$
DECLARE
  user_record RECORD;
  v_username TEXT;
BEGIN
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    -- Username oluştur
    v_username := COALESCE(
      user_record.raw_user_meta_data->>'username',
      SPLIT_PART(COALESCE(user_record.email, ''), '@', 1),
      'user_' || SUBSTRING(user_record.id::TEXT, 1, 8)
    );
    
    -- Temizle
    v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
    v_username := SUBSTRING(v_username, 1, 30);
    
    IF v_username IS NULL OR v_username = '' OR v_username = '_' THEN
      v_username := 'user_' || SUBSTRING(user_record.id::TEXT, 1, 8);
    END IF;
    
    -- Profil oluştur
    INSERT INTO public.profiles (
      id,
      username,
      avatar_url,
      total_points,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      user_record.id,
      v_username,
      COALESCE(
        user_record.raw_user_meta_data->>'avatar_url',
        user_record.raw_user_meta_data->>'picture',
        user_record.raw_user_meta_data->>'image_url',
        NULL
      ),
      0,
      FALSE,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;










