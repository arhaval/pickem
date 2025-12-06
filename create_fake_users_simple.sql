-- Basit versiyon: Sadece profil ve puan ekle (auth.users atla)
-- Eğer yukarıdaki script çalışmazsa bunu deneyin

-- Önce aktif sezonu kontrol et
SELECT id, name, is_active FROM seasons WHERE is_active = true;

-- Eğer aktif sezon yoksa, bir tane oluştur:
-- INSERT INTO seasons (name, start_date, end_date, is_active)
-- VALUES ('Test Sezonu', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true);

-- Test kullanıcıları için UUID'ler oluştur ve profillere ekle
DO $$
DECLARE
    active_season_id UUID;
    user_id UUID;
    i INTEGER;
    username TEXT;
    points_val INTEGER;
    correct_val INTEGER;
    total_val INTEGER;
BEGIN
    -- Aktif sezonu al
    SELECT id INTO active_season_id FROM seasons WHERE is_active = true LIMIT 1;
    
    IF active_season_id IS NULL THEN
        RAISE EXCEPTION 'Aktif sezon bulunamadı! Önce bir sezon oluşturun.';
    END IF;

    -- Profilleri ve puanları oluştur
    -- 1. Kullanıcı
    user_id := gen_random_uuid();
    username := 'ArhavalMaster';
    points_val := 20000;
    correct_val := 50;
    total_val := 60;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 2. Kullanıcı
    user_id := gen_random_uuid();
    username := 'TahminKralı';
    points_val := 18000;
    correct_val := 45;
    total_val := 58;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 3. Kullanıcı
    user_id := gen_random_uuid();
    username := 'TahminCı';
    points_val := 16000;
    correct_val := 40;
    total_val := 55;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 4. Kullanıcı
    user_id := gen_random_uuid();
    username := 'ProGamer';
    points_val := 14000;
    correct_val := 35;
    total_val := 50;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 5. Kullanıcı
    user_id := gen_random_uuid();
    username := 'SkinHunter';
    points_val := 12000;
    correct_val := 30;
    total_val := 45;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 6. Kullanıcı
    user_id := gen_random_uuid();
    username := 'AcePlayer';
    points_val := 10000;
    correct_val := 25;
    total_val := 40;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 7. Kullanıcı
    user_id := gen_random_uuid();
    username := 'HeadshotPro';
    points_val := 8000;
    correct_val := 20;
    total_val := 35;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 8. Kullanıcı
    user_id := gen_random_uuid();
    username := 'ClutchKing';
    points_val := 6000;
    correct_val := 15;
    total_val := 30;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 9. Kullanıcı
    user_id := gen_random_uuid();
    username := 'RifleMaster';
    points_val := 4000;
    correct_val := 10;
    total_val := 25;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    -- 10. Kullanıcı
    user_id := gen_random_uuid();
    username := 'TacticalMind';
    points_val := 2000;
    correct_val := 5;
    total_val := 20;
    INSERT INTO profiles (id, username, total_points, is_admin, created_at, updated_at)
    VALUES (user_id, username, 0, false, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (user_id, active_season_id, points_val, correct_val, total_val)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    RAISE NOTICE '10 test kullanıcısı başarıyla oluşturuldu!';
END $$;

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

