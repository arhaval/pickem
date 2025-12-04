-- Daha güvenilir otomatik onaylama trigger'ı

-- Önce mevcut trigger'ları temizle
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_auto_confirm();

-- Yeni kullanıcıyı otomatik onaylayan fonksiyon (daha güvenilir)
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_confirm()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
BEGIN
  -- Kullanıcıyı hemen otomatik olarak email onaylı yap
  -- BEFORE trigger kullanarak email gönderilmeden önce onayla
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  NEW.confirmed_at := COALESCE(NEW.confirmed_at, NOW());
  
  RETURN NEW;
END;
$$;

-- BEFORE trigger kullan (email gönderilmeden önce çalışır)
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auto_confirm();

-- Mevcut onaylanmamış kullanıcıları da onayla
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;






