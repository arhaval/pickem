-- Mevcut kullanıcılara puan ekle
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Önce mevcut kullanıcıları görelim
SELECT 
    p.id,
    p.username,
    p.is_admin,
    COUNT(sp.user_id) as existing_points
FROM profiles p
LEFT JOIN season_points sp ON sp.user_id = p.id
GROUP BY p.id, p.username, p.is_admin
ORDER BY p.created_at ASC
LIMIT 15;

-- Mevcut kullanıcılara puan ekle (admin hariç, ilk 10 kullanıcıya)
WITH active_season AS (
    SELECT id FROM seasons WHERE is_active = true LIMIT 1
),
users_to_update AS (
    SELECT p.id, p.username
    FROM profiles p
    WHERE p.is_admin = false
    ORDER BY p.created_at ASC
    LIMIT 10
)
INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT 
    utu.id,
    ase.id,
    CASE ROW_NUMBER() OVER (ORDER BY utu.id)
        WHEN 1 THEN 20000
        WHEN 2 THEN 18000
        WHEN 3 THEN 16000
        WHEN 4 THEN 14000
        WHEN 5 THEN 12000
        WHEN 6 THEN 10000
        WHEN 7 THEN 8000
        WHEN 8 THEN 6000
        WHEN 9 THEN 4000
        ELSE 2000
    END as total_points,
    CASE ROW_NUMBER() OVER (ORDER BY utu.id)
        WHEN 1 THEN 50
        WHEN 2 THEN 45
        WHEN 3 THEN 40
        WHEN 4 THEN 35
        WHEN 5 THEN 30
        WHEN 6 THEN 25
        WHEN 7 THEN 20
        WHEN 8 THEN 15
        WHEN 9 THEN 10
        ELSE 5
    END as correct_predictions,
    CASE ROW_NUMBER() OVER (ORDER BY utu.id)
        WHEN 1 THEN 60
        WHEN 2 THEN 58
        WHEN 3 THEN 55
        WHEN 4 THEN 50
        WHEN 5 THEN 45
        WHEN 6 THEN 40
        WHEN 7 THEN 35
        WHEN 8 THEN 30
        WHEN 9 THEN 25
        ELSE 20
    END as total_predictions
FROM users_to_update utu
CROSS JOIN active_season ase
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    correct_predictions = EXCLUDED.correct_predictions,
    total_predictions = EXCLUDED.total_predictions;

-- Sonuçları göster
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




