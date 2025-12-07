-- En basit versiyon - DO bloğu yok, direkt INSERT
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Önce aktif sezonu kontrol et
SELECT id, name, is_active FROM seasons WHERE is_active = true;

-- Eğer aktif sezon yoksa, önce bir tane oluşturun:
-- INSERT INTO seasons (name, start_date, end_date, is_active)
-- VALUES ('Test Sezonu', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true);

-- 1. Kullanıcı: ArhavalMaster (20,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'ArhavalMaster', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 20000, 50, 60
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'ArhavalMaster' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 20000,
    correct_predictions = 50,
    total_predictions = 60;

-- 2. Kullanıcı: TahminKralı (18,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'TahminKralı', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 18000, 45, 58
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'TahminKralı' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 18000,
    correct_predictions = 45,
    total_predictions = 58;

-- 3. Kullanıcı: TahminCı (16,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'TahminCı', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 16000, 40, 55
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'TahminCı' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 16000,
    correct_predictions = 40,
    total_predictions = 55;

-- 4. Kullanıcı: ProGamer (14,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'ProGamer', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 14000, 35, 50
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'ProGamer' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 14000,
    correct_predictions = 35,
    total_predictions = 50;

-- 5. Kullanıcı: SkinHunter (12,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'SkinHunter', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 12000, 30, 45
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'SkinHunter' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 12000,
    correct_predictions = 30,
    total_predictions = 45;

-- 6. Kullanıcı: AcePlayer (10,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'AcePlayer', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 10000, 25, 40
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'AcePlayer' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 10000,
    correct_predictions = 25,
    total_predictions = 40;

-- 7. Kullanıcı: HeadshotPro (8,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'HeadshotPro', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 8000, 20, 35
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'HeadshotPro' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 8000,
    correct_predictions = 20,
    total_predictions = 35;

-- 8. Kullanıcı: ClutchKing (6,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'ClutchKing', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 6000, 15, 30
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'ClutchKing' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 6000,
    correct_predictions = 15,
    total_predictions = 30;

-- 9. Kullanıcı: RifleMaster (4,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'RifleMaster', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 4000, 10, 25
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'RifleMaster' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 4000,
    correct_predictions = 10,
    total_predictions = 25;

-- 10. Kullanıcı: TacticalMind (2,000 puan)
INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
VALUES (gen_random_uuid(), 'TacticalMind', 0, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
SELECT p.id, s.id, 2000, 5, 20
FROM profiles p
CROSS JOIN seasons s
WHERE p.username = 'TacticalMind' AND s.is_active = true
ON CONFLICT (user_id, season_id) DO UPDATE SET
    total_points = 2000,
    correct_predictions = 5,
    total_predictions = 20;

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





