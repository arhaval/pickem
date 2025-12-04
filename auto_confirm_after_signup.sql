-- Kayıt olduktan sonra kullanıcıyı otomatik onayla
-- Bu trigger kayıt işleminden HEMEN sonra çalışır

-- Önce mevcut trigger'ı temizle
DROP TRIGGER IF EXISTS auto_confirm_user_after_signup ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user();

-- Kullanıcıyı otomatik onaylayan fonksiyon
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Kullanıcı oluşturulduktan hemen sonra onayla
  -- Çok kısa bir gecikme ile (0.05 saniye)
  PERFORM pg_sleep(0.05);
  
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur (AFTER INSERT - kayıt işleminden sonra)
CREATE TRIGGER auto_confirm_user_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- Mevcut onaylanmamış kullanıcıları da onayla
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

