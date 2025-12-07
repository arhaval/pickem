-- Admin hesabına puan ekleme scripti
-- Hem 1. sırada hem de 6. sırada görünmesi için test puanları

-- 1. Önce admin kullanıcıyı bulalım
SELECT 
    u.id as user_id,
    u.email,
    p.username,
    p.is_admin,
    p.total_points
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true
LIMIT 1;

-- 2. Aktif sezonu bulalım
SELECT id, name, is_active 
FROM seasons 
WHERE is_active = true 
LIMIT 1;

-- 3. Admin kullanıcıya yüksek puan ekle (1. sırada görünsün)
-- NOT: user_id ve season_id'yi yukarıdaki sorgulardan alınan değerlerle değiştirin

-- Önce mevcut kaydı kontrol et
SELECT * FROM season_points 
WHERE user_id = (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)
AND season_id = (SELECT id FROM seasons WHERE is_active = true LIMIT 1);

-- Eğer kayıt varsa güncelle, yoksa ekle
INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT 
    p.id,
    s.id,
    20000,  -- Yüksek puan (1. sırada görünsün)
    50,     -- Doğru tahmin sayısı
    60      -- Toplam tahmin sayısı
FROM profiles p
CROSS JOIN seasons s
WHERE p.is_admin = true
AND s.is_active = true
LIMIT 1
ON CONFLICT (user_id, season_id) 
DO UPDATE SET
    total_points = 20000,
    correct_predictions = 50,
    total_predictions = 60;

-- 4. Diğer kullanıcılara da puan ekle (admin 6. sırada görünsün diye)
-- Önce admin puanını düşürelim
UPDATE season_points
SET total_points = 12000,
    correct_predictions = 30,
    total_predictions = 45
WHERE user_id = (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)
AND season_id = (SELECT id FROM seasons WHERE is_active = true LIMIT 1);

-- 5. Test için birkaç fake kullanıcıya daha yüksek puan verelim
-- (Eğer test kullanıcıları varsa)
-- Bu kısım opsiyonel, sadece test için

-- Sonuçları kontrol et
SELECT 
    sp.*,
    p.username,
    p.is_admin,
    s.name as season_name
FROM season_points sp
JOIN profiles p ON sp.user_id = p.id
JOIN seasons s ON sp.season_id = s.id
WHERE s.is_active = true
ORDER BY sp.total_points DESC
LIMIT 10;





