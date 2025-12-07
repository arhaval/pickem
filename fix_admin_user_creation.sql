-- Admin kullanıcısı oluşturma sorununu çöz
-- Bu script trigger'ı kontrol eder ve düzeltir

-- 1. ÖNCE TRIGGER'IN ÇALIŞIP ÇALIŞMADIĞINI KONTROL ET
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

-- 2. EĞER TRIGGER YOKSA VEYA ÇALIŞMIYORSA:
-- Kullanıcıyı manuel oluştur ve profil oluştur

-- ADIM 1: Supabase Dashboard → Authentication → Users → Add User
-- Email: admin@arhaval.com
-- Password: Admin123!
-- Auto Confirm: ✅
-- User Metadata: {"username": "admin"}

-- ADIM 2: Kullanıcı ID'sini al (UUID)

-- ADIM 3: Aşağıdaki SQL'i çalıştır (KULLANICI_ID_BURAYA kısmını değiştir):

-- Önce profil var mı kontrol et
SELECT id, username, is_admin 
FROM public.profiles 
WHERE id = 'KULLANICI_ID_BURAYA';

-- Profil yoksa oluştur (Service Role Key ile çalıştırılmalı veya RLS bypass)
-- Eğer hata alırsan, Supabase Dashboard → SQL Editor'de "Run as" → "Service Role" seç

INSERT INTO public.profiles (
  id,
  username,
  is_admin,
  total_points,
  created_at,
  updated_at
) VALUES (
  'KULLANICI_ID_BURAYA',
  'admin',
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  username = 'admin',
  updated_at = NOW();

-- Kontrol et
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = 'KULLANICI_ID_BURAYA';











