-- ============================================
-- TAM ÇÖZÜM: Kullanıcı Kayıt Sistemi (Düzeltilmiş)
-- Bu scripti Supabase SQL Editor'de çalıştır
-- ============================================

-- ============================================
-- ADIM 0: is_admin kolonunu ekle (eğer yoksa)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'is_admin kolonu eklendi';
  ELSE
    RAISE NOTICE 'is_admin kolonu zaten var';
  END IF;
END $$;

-- ============================================
-- ADIM 1: RLS POLİTİKALARINI DÜZELT
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eski politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Yeni politikalar
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- ADIM 2: OTOMATİK PROFİL OLUŞTURMA TRİGGER'I
-- ============================================

-- Eski trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Yeni trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_value TEXT;
  avatar_url_value TEXT;
BEGIN
  -- Username'i user_metadata'dan al veya email'den oluştur
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1),
    'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Avatar URL'ini user_metadata'dan al
  avatar_url_value := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'image_url',
    NULL
  );
  
  -- Username'i temizle
  username_value := REGEXP_REPLACE(LOWER(username_value), '[^a-z0-9_]', '_', 'g');
  username_value := SUBSTRING(username_value, 1, 30);
  
  -- Profil oluştur (is_admin varsa ekle, yoksa ekleme)
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    steam_id,
    total_points,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    username_value,
    avatar_url_value,
    COALESCE((NEW.raw_user_meta_data->>'steam_id')::TEXT, NULL),
    0,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(profiles.username, EXCLUDED.username),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profil oluşturulurken hata: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ADIM 3: MEVCUT KULLANICILAR İÇİN PROFİL OLUŞTUR
-- ============================================

INSERT INTO public.profiles (
  id,
  username,
  avatar_url,
  steam_id,
  total_points,
  is_admin,
  created_at,
  updated_at
)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'username',
    SPLIT_PART(u.email, '@', 1),
    'user_' || SUBSTRING(u.id::TEXT, 1, 8)
  ) as username,
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    u.raw_user_meta_data->>'image_url',
    NULL
  ) as avatar_url,
  COALESCE((u.raw_user_meta_data->>'steam_id')::TEXT, NULL) as steam_id,
  0,
  COALESCE((u.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE) as is_admin,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BAŞARI MESAJI
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tüm ayarlar tamamlandı!';
  RAISE NOTICE '✅ is_admin kolonu kontrol edildi/eklendi';
  RAISE NOTICE '✅ RLS politikaları kuruldu';
  RAISE NOTICE '✅ Otomatik profil oluşturma trigger''ı aktif';
  RAISE NOTICE '✅ Mevcut kullanıcılar için profil oluşturuldu';
  RAISE NOTICE '';
  RAISE NOTICE 'Artık yeni kullanıcılar kayıt olduğunda otomatik olarak profil oluşturulacak!';
END $$;










