-- Test kullanıcıları ekle - Leaderboard testi için
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Aktif sezonu bul
DO $$
DECLARE
    active_season_id UUID;
    test_user_ids UUID[] := ARRAY[]::UUID[];
    i INTEGER;
BEGIN
    -- Aktif sezonu al
    SELECT id INTO active_season_id FROM seasons WHERE is_active = true LIMIT 1;
    
    IF active_season_id IS NULL THEN
        RAISE EXCEPTION 'Aktif sezon bulunamadı!';
    END IF;

    -- 2. Test kullanıcıları oluştur (eğer yoksa)
    -- Önce mevcut test kullanıcılarını kontrol et
    FOR i IN 1..10 LOOP
        DECLARE
            test_email TEXT := 'testuser' || i || '@test.com';
            test_user_id UUID;
            existing_user_id UUID;
        BEGIN
            -- Kullanıcı var mı kontrol et
            SELECT id INTO existing_user_id 
            FROM auth.users 
            WHERE email = test_email;
            
            IF existing_user_id IS NULL THEN
                -- Yeni kullanıcı oluştur
                INSERT INTO auth.users (
                    id,
                    email,
                    encrypted_password,
                    email_confirmed_at,
                    created_at,
                    updated_at,
                    raw_app_meta_data,
                    raw_user_meta_data,
                    is_super_admin,
                    role
                ) VALUES (
                    gen_random_uuid(),
                    test_email,
                    crypt('test123456', gen_salt('bf')),
                    NOW(),
                    NOW(),
                    NOW(),
                    '{"provider":"email","providers":["email"]}',
                    '{}',
                    false,
                    'authenticated'
                ) RETURNING id INTO test_user_id;
            ELSE
                test_user_id := existing_user_id;
            END IF;
            
            -- Profil oluştur (eğer yoksa)
            INSERT INTO profiles (
                id,
                username,
                total_points,
                is_admin,
                created_at,
                updated_at
            ) VALUES (
                test_user_id,
                'TestUser' || i,
                0,
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                username = 'TestUser' || i;
            
            test_user_ids := array_append(test_user_ids, test_user_id);
        END;
    END LOOP;

    -- 3. Test kullanıcılarına puan ekle (farklı puanlar)
    -- 1. sıra: 25000 puan (admin zaten var)
    -- 2. sıra: 20000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[1], active_season_id, 20000, 50, 60)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 20000,
        correct_predictions = 50,
        total_predictions = 60;

    -- 3. sıra: 18000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[2], active_season_id, 18000, 45, 58)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 18000,
        correct_predictions = 45,
        total_predictions = 58;

    -- 4. sıra: 16000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[3], active_season_id, 16000, 40, 55)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 16000,
        correct_predictions = 40,
        total_predictions = 55;

    -- 5. sıra: 14000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[4], active_season_id, 14000, 35, 50)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 14000,
        correct_predictions = 35,
        total_predictions = 50;

    -- 6. sıra: 12000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[5], active_season_id, 12000, 30, 45)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 12000,
        correct_predictions = 30,
        total_predictions = 45;

    -- 7-10. sıralar: Daha düşük puanlar
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES 
        (test_user_ids[6], active_season_id, 10000, 25, 40),
        (test_user_ids[7], active_season_id, 8000, 20, 35),
        (test_user_ids[8], active_season_id, 6000, 15, 30),
        (test_user_ids[9], active_season_id, 4000, 10, 25),
        (test_user_ids[10], active_season_id, 2000, 5, 20)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    RAISE NOTICE 'Test kullanıcıları başarıyla eklendi!';
    RAISE NOTICE 'Aktif sezon ID: %', active_season_id;
END $$;

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





