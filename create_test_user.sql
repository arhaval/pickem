-- Test kullanıcısı oluşturma scripti
-- Bu scripti Supabase SQL Editor'de çalıştır

-- 1. Test kullanıcısını auth.users tablosuna ekle
-- NOT: Şifre hash'leme için Supabase'in crypt fonksiyonunu kullanıyoruz
-- Şifre: Test123! (güvenli bir şifre)

DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test@arhaval.com';
  test_password TEXT := 'Test123!';
  hashed_password TEXT;
BEGIN
  -- Şifreyi hash'le (Supabase'in kendi hash fonksiyonunu kullan)
  -- NOT: Supabase şifreleri kendi içinde hash'ler, bu yüzden direkt insert yapmak zor
  -- Alternatif: Admin API kullan veya auth.users tablosuna direkt insert yap
  
  -- Önce kullanıcı var mı kontrol et
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = test_email;
  
  IF test_user_id IS NULL THEN
    -- Yeni kullanıcı oluştur
    -- NOT: auth.users tablosuna direkt insert yapmak için özel izinler gerekir
    -- Bu yüzden Supabase Admin API kullanmak daha iyi
    
    -- Alternatif: Kullanıcıyı auth.users tablosuna ekle (şifre hash'lenmemiş olacak)
    -- Bu durumda kullanıcı şifre sıfırlama yapmalı
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      test_email,
      crypt(test_password, gen_salt('bf')), -- Şifreyi hash'le
      NOW(), -- Email onaylı
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}',
      '{"username":"testuser"}',
      FALSE,
      NOW(),
      NOW(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      FALSE,
      NULL
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Test kullanıcısı oluşturuldu: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test kullanıcısı zaten var: %', test_user_id;
  END IF;
  
  -- 2. Profil oluştur (eğer yoksa)
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
  
  RAISE NOTICE 'Profil oluşturuldu/güncellendi';
  
END $$;

-- Kullanıcı bilgilerini göster
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






