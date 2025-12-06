-- Profil tablosu için otomatik profil oluşturma trigger'ı
-- Bu trigger, yeni bir kullanıcı kayıt olduğunda otomatik olarak profil oluşturur

-- Önce mevcut trigger'ı sil (varsa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Yeni kullanıcı oluşturulduğunda profil oluşturan fonksiyon
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Username'i user_metadata'dan al veya email'den oluştur
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Avatar URL'ini user_metadata'dan al
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'image_url',
    NULL
  );
  
  -- Username'i temizle (sadece harf, rakam, alt çizgi)
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  v_username := SUBSTRING(v_username, 1, 30);
  
  -- Eğer hala username yoksa, user ID'den oluştur
  IF v_username IS NULL OR v_username = '' THEN
    v_username := 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8);
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
    NEW.id,
    v_username,
    v_avatar_url,
    0,
    FALSE,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING; -- Eğer profil zaten varsa hiçbir şey yapma
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS politikalarını kontrol et ve gerekirse güncelle
-- Kullanıcılar kendi profillerini görebilir ve güncelleyebilir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil (varsa)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

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

-- Kullanıcılar kendi profillerini oluşturabilir (trigger zaten yapıyor ama yine de ekleyelim)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);










