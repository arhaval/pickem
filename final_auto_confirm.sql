-- En güvenilir otomatik onaylama çözümü

-- 1. Önce mevcut trigger'ları temizle
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_auto_confirm();

-- 2. AFTER INSERT trigger (kullanıcı oluşturulduktan hemen sonra)
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_confirm()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Kullanıcıyı hemen otomatik olarak email onaylı yap
  -- Çok kısa bir gecikme ile (email gönderilmeden önce)
  PERFORM pg_sleep(0.1); -- 100ms bekle
  
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auto_confirm();

-- 3. Mevcut onaylanmamış kullanıcıları da onayla
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 4. Kontrol et
SELECT 
  COUNT(*) as toplam_kullanici,
  COUNT(email_confirmed_at) as onayli_kullanici,
  COUNT(*) - COUNT(email_confirmed_at) as onaysiz_kullanici
FROM auth.users;

