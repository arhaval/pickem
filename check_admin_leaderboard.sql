-- Admin'in leaderboard'daki durumunu kontrol et
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Admin kullanıcıyı bul
SELECT 
    p.id as user_id,
    p.username,
    p.is_admin,
    p.avatar_url
FROM profiles p
WHERE p.is_admin = true
LIMIT 1;

-- 2. Admin'in season_points kaydını kontrol et
SELECT 
    sp.*,
    p.username,
    p.is_admin,
    s.name as season_name,
    s.is_active
FROM season_points sp
JOIN profiles p ON sp.user_id = p.id
JOIN seasons s ON sp.season_id = s.id
WHERE p.is_admin = true
ORDER BY s.is_active DESC, s.created_at DESC;

-- 3. Aktif sezondaki tüm kullanıcıları sırala (admin dahil)
SELECT 
    ROW_NUMBER() OVER (ORDER BY sp.total_points DESC, sp.correct_predictions DESC) as rank,
    p.username,
    p.is_admin,
    sp.total_points,
    sp.correct_predictions,
    sp.total_predictions,
    ROUND((sp.correct_predictions::numeric / NULLIF(sp.total_predictions, 0) * 100), 0) as accuracy,
    sp.user_id
FROM season_points sp
JOIN profiles p ON sp.user_id = p.id
JOIN seasons s ON sp.season_id = s.id
WHERE s.is_active = true
ORDER BY sp.total_points DESC, sp.correct_predictions DESC
LIMIT 10;

-- 4. Profil bilgileri eksik mi kontrol et
SELECT 
    sp.user_id,
    p.username,
    p.avatar_url,
    CASE 
        WHEN p.username IS NULL THEN 'Username eksik!'
        WHEN p.avatar_url IS NULL THEN 'Avatar eksik (normal)'
        ELSE 'Tamam'
    END as durum
FROM season_points sp
LEFT JOIN profiles p ON sp.user_id = p.id
WHERE sp.season_id = (SELECT id FROM seasons WHERE is_active = true LIMIT 1)
ORDER BY sp.total_points DESC
LIMIT 5;





