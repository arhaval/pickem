-- ============================================================
-- BAŞARI KONTROLÜ SORGULARI
-- ============================================================
-- 
-- Bu sorguları Supabase SQL Editor'de çalıştırarak
-- tüm migration'ların başarılı olup olmadığını kontrol edebilirsiniz.
-- 
-- ============================================================

-- ============================================================
-- 1. INDEX'LER KONTROLÜ
-- ============================================================
-- Beklenen: idx_matches_match_date, idx_matches_match_time, 
-- idx_matches_date_time, idx_matches_prediction_lock_minutes,
-- idx_predictions_match_id, idx_predictions_user_id, 
-- idx_profiles_is_admin

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('matches', 'predictions', 'profiles')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================
-- 2. FONKSİYONLAR KONTROLÜ
-- ============================================================
-- Beklenen: get_turkey_time, is_match_lock_time_passed,
-- calculate_match_prediction_points

SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_turkey_time', 
    'is_match_lock_time_passed', 
    'calculate_match_prediction_points'
  )
ORDER BY routine_name;

-- ============================================================
-- 3. TRIGGER KONTROLÜ
-- ============================================================
-- Beklenen: trigger_calculate_match_prediction_points

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'trigger_calculate_match_prediction_points';

-- ============================================================
-- 4. RLS POLICY KONTROLÜ (Predictions)
-- ============================================================
-- Beklenen: "Kullanıcılar zaman kilidi içinde tahmin ekleyebilir"
-- ve "Kullanıcılar zaman kilidi içinde tahmin güncelleyebilir"

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'predictions'
  AND policyname LIKE '%zaman kilidi%'
ORDER BY policyname;

-- ============================================================
-- 5. FONKSİYON TESTLERİ
-- ============================================================

-- 5.1. get_turkey_time() testi
-- Bu fonksiyon Türkiye saatini (UTC+3) döndürmelidir
SELECT 
  'get_turkey_time()' as test_name,
  public.get_turkey_time() as turkey_time,
  NOW() as utc_time,
  (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul') as expected_turkey_time;

-- 5.2. is_match_lock_time_passed() testi (gelecek bir tarih için false döndürmeli)
SELECT 
  'is_match_lock_time_passed (gelecek tarih)' as test_name,
  public.is_match_lock_time_passed('2025-12-31', '20:00', 15) as should_be_false;

-- 5.3. is_match_lock_time_passed() testi (geçmiş bir tarih için true döndürmeli)
SELECT 
  'is_match_lock_time_passed (geçmiş tarih)' as test_name,
  public.is_match_lock_time_passed('2020-01-01', '20:00', 15) as should_be_true;

-- ============================================================
-- 6. ÖZET RAPOR
-- ============================================================

SELECT 
  'INDEX' as type,
  COUNT(*) as count,
  string_agg(DISTINCT tablename, ', ') as tables
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('matches', 'predictions', 'profiles')
  AND indexname LIKE 'idx_%'

UNION ALL

SELECT 
  'FUNCTION' as type,
  COUNT(*) as count,
  string_agg(routine_name, ', ') as tables
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_turkey_time', 
    'is_match_lock_time_passed', 
    'calculate_match_prediction_points'
  )

UNION ALL

SELECT 
  'TRIGGER' as type,
  COUNT(*) as count,
  string_agg(event_object_table, ', ') as tables
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'trigger_calculate_match_prediction_points'

UNION ALL

SELECT 
  'RLS POLICY (predictions zaman kilidi)' as type,
  COUNT(*) as count,
  string_agg(policyname, ', ') as tables
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'predictions'
  AND policyname LIKE '%zaman kilidi%';

-- ============================================================
-- SONUÇ
-- ============================================================
-- 
-- Beklenen sonuçlar:
-- - INDEX: En az 7 index olmalı
-- - FUNCTION: 3 fonksiyon olmalı
-- - TRIGGER: 1 trigger olmalı
-- - RLS POLICY: 2 policy olmalı (INSERT ve UPDATE)
-- 
-- Eğer tüm sayılar beklenen değerlerse, migration başarılıdır!
-- 
-- ============================================================

