-- Admin hesabını 6. sıraya yerleştir
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Admin kullanıcıyı ve aktif sezonu bul
WITH admin_user AS (
    SELECT id FROM profiles WHERE is_admin = true LIMIT 1
),
active_season AS (
    SELECT id FROM seasons WHERE is_active = true LIMIT 1
)

-- 2. Admin'e orta seviye puan ekle/güncelle (6. sırada görünsün)
-- Önce diğer kullanıcılara yüksek puanlar verelim (eğer yoksa)
-- Sonra admin'e 6. sıraya uygun puan verelim

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT 
    au.id,
    ase.id,
    13000,  -- 6. sıra için uygun puan
    35,     -- Doğru tahmin sayısı
    50      -- Toplam tahmin sayısı
FROM admin_user au
CROSS JOIN active_season ase
ON CONFLICT (user_id, season_id) 
DO UPDATE SET
    total_points = 13000,
    correct_predictions = 35,
    total_predictions = 50;

-- Eğer yeterli kullanıcı yoksa, test için birkaç fake kayıt ekleyebiliriz
-- (Opsiyonel - sadece test için)

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





