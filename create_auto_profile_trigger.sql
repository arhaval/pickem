-- Otomatik profil oluşturma trigger'ı
-- Bu scripti Supabase SQL Editor'de çalıştır

-- 1. Eski trigger'ı kaldır (varsa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Yeni trigger fonksiyonu oluştur
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
  
  -- Username'i temizle (sadece harf, rakam, alt çizgi)
  username_value := REGEXP_REPLACE(LOWER(username_value), '[^a-z0-9_]', '_', 'g');
  username_value := SUBSTRING(username_value, 1, 30);
  
  -- Profil oluştur (eğer yoksa)
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
    FALSE,
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
    -- Hata olursa logla ama işlemi durdurma
    RAISE WARNING 'Profil oluşturulurken hata: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Mevcut kullanıcılar için profil oluştur (eğer yoksa)
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
  FALSE,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Kontrol: Trigger'ın çalıştığını doğrula
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 6. Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE 'Trigger başarıyla oluşturuldu! Yeni kullanıcılar için otomatik profil oluşturulacak.';
END $$;











