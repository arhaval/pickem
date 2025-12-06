-- Basit test kullanıcıları ekle (daha kolay versiyon)
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Aktif sezonu al
WITH active_season AS (
    SELECT id FROM seasons WHERE is_active = true LIMIT 1
)

-- 2. Mevcut kullanıcılardan test için kullan veya yeni oluştur
-- Önce mevcut kullanıcıları kontrol et
SELECT 
    p.id,
    p.username,
    sp.total_points,
    s.name as season_name
FROM profiles p
CROSS JOIN active_season ase
LEFT JOIN season_points sp ON sp.user_id = p.id AND sp.season_id = ase.id
LEFT JOIN seasons s ON s.id = ase.id
WHERE p.is_admin = false
ORDER BY sp.total_points DESC NULLS LAST
LIMIT 10;

-- Eğer yeterli kullanıcı yoksa, manuel olarak test kullanıcıları ekleyin
-- Aşağıdaki scripti kullanarak mevcut kullanıcılara puan ekleyebilirsiniz:

-- Test için: Mevcut ilk 10 kullanıcıya farklı puanlar ver
WITH active_season AS (
    SELECT id FROM seasons WHERE is_active = true LIMIT 1
),
test_users AS (
    SELECT id FROM profiles 
    WHERE is_admin = false 
    ORDER BY created_at ASC 
    LIMIT 10
)
INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT 
    tu.id,
    ase.id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 1 THEN 20000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 2 THEN 18000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 3 THEN 16000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 4 THEN 14000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 5 THEN 12000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 6 THEN 10000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 7 THEN 8000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 8 THEN 6000
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 9 THEN 4000
        ELSE 2000
    END as total_points,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 1 THEN 50
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 2 THEN 45
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 3 THEN 40
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 4 THEN 35
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 5 THEN 30
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 6 THEN 25
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 7 THEN 20
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 8 THEN 15
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 9 THEN 10
        ELSE 5
    END as correct_predictions,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 1 THEN 60
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 2 THEN 58
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 3 THEN 55
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 4 THEN 50
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 5 THEN 45
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 6 THEN 40
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 7 THEN 35
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 8 THEN 30
        WHEN ROW_NUMBER() OVER (ORDER BY tu.id) = 9 THEN 25
        ELSE 20
    END as total_predictions
FROM test_users tu
CROSS JOIN active_season ase
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    correct_predictions = EXCLUDED.correct_predictions,
    total_predictions = EXCLUDED.total_predictions;

-- Sonuçları kontrol et
SELECT 
    ROW_NUMBER() OVER (ORDER BY sp.total_points DESC, sp.correct_predictions DESC) as rank,
    p.username,
    p.is_admin,
    sp.total_points,
    sp.correct_predictions,
    sp.total_predictions,
    ROUND((sp.correct_predictions::numeric / NULLIF(sp.total_predictions, 0) * 100), 0) as accuracy
FROM season_points sp
JOIN profiles p ON sp.user_id = p.id
JOIN seasons s ON sp.season_id = s.id
WHERE s.is_active = true
ORDER BY sp.total_points DESC, sp.correct_predictions DESC
LIMIT 15;




