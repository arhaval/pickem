-- Admin hesabını 1. sıraya yerleştir
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Admin kullanıcıyı ve aktif sezonu bul
WITH admin_user AS (
    SELECT id FROM profiles WHERE is_admin = true LIMIT 1
),
active_season AS (
    SELECT id FROM seasons WHERE is_active = true LIMIT 1
)

-- 2. Admin'e yüksek puan ekle/güncelle (1. sırada görünsün)
INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT 
    au.id,
    ase.id,
    25000,  -- Çok yüksek puan (1. sırada görünsün)
    55,     -- Doğru tahmin sayısı
    60      -- Toplam tahmin sayısı
FROM admin_user au
CROSS JOIN active_season ase
ON CONFLICT (user_id, season_id) 
DO UPDATE SET
    total_points = 25000,
    correct_predictions = 55,
    total_predictions = 60;

-- Sonucu kontrol et
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
LIMIT 10;





