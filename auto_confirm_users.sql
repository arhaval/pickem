-- Yeni kullanıcıları otomatik olarak email onaylı yap
-- Email onayı açık kalır ama yeni kullanıcılar otomatik onaylanır

-- Önce mevcut trigger'ı sil (varsa)
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_auto_confirm();

-- Yeni kullanıcıyı otomatik onaylayan fonksiyon
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_confirm()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Kullanıcıyı otomatik olarak email onaylı yap
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auto_confirm();

-- Test: Mevcut onaylanmamış kullanıcıları da onayla (opsiyonel)
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
--   confirmed_at = COALESCE(confirmed_at, NOW())
-- WHERE email_confirmed_at IS NULL;






