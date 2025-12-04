-- BASIT TEST KULLANICISI OLUŞTURMA
-- Bu scripti Supabase SQL Editor'de çalıştır
-- NOT: Bu script sadece profil oluşturur, auth kullanıcısı için Supabase Dashboard veya API kullan

-- Test kullanıcısı için profil oluştur (auth.users tablosunda kullanıcı olmalı)
-- Önce Supabase Dashboard > Authentication > Users'dan manuel olarak kullanıcı oluştur:
-- Email: test@arhaval.com
-- Password: Test123!
-- Email'i onayla

-- Sonra bu scripti çalıştır:

-- 1. Kullanıcı ID'sini bul
DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test@arhaval.com';
BEGIN
  -- Kullanıcı ID'sini al
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = test_email;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı! Önce Supabase Dashboard > Authentication > Users''dan kullanıcı oluşturun.';
  END IF;
  
  -- Profil oluştur veya güncelle
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
    test_user_id,
    'testuser',
    NULL,
    NULL,
    0,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    updated_at = NOW();
  
  RAISE NOTICE 'Profil oluşturuldu/güncellendi. Kullanıcı ID: %', test_user_id;
END $$;

-- Kontrol et
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.username,
  p.total_points
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'test@arhaval.com';






