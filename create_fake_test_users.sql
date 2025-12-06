-- Fake test kullanıcıları oluştur ve puan ekle
-- Bu scripti Supabase SQL Editor'de çalıştırın

DO $$
DECLARE
    active_season_id UUID;
    test_user_ids UUID[] := ARRAY[]::UUID[];
    i INTEGER;
    new_user_id UUID;
BEGIN
    -- Aktif sezonu al
    SELECT id INTO active_season_id FROM seasons WHERE is_active = true LIMIT 1;
    
    IF active_season_id IS NULL THEN
        RAISE EXCEPTION 'Aktif sezon bulunamadı! Önce bir sezon oluşturun.';
    END IF;

    RAISE NOTICE 'Aktif sezon ID: %', active_season_id;

    -- 10 test kullanıcısı oluştur
    FOR i IN 1..10 LOOP
        -- Yeni UUID oluştur
        new_user_id := gen_random_uuid();
        
        -- Auth kullanıcısı oluştur
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'testuser' || i || '@test.com',
            crypt('test123456', gen_salt('bf')),
            NOW(),
            NULL,
            '',
            NULL,
            '',
            NULL,
            '',
            '',
            NULL,
            NULL,
            '{"provider":"email","providers":["email"]}',
            '{}',
            false,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL,
            false,
            NULL
        )
        ON CONFLICT (id) DO NOTHING;

        -- Profil oluştur
        INSERT INTO profiles (
            id,
            username,
            total_points,
            is_admin,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            CASE i
                WHEN 1 THEN 'ArhavalMaster'
                WHEN 2 THEN 'TahminKralı'
                WHEN 3 THEN 'TahminCı'
                WHEN 4 THEN 'ProGamer'
                WHEN 5 THEN 'SkinHunter'
                WHEN 6 THEN 'AcePlayer'
                WHEN 7 THEN 'HeadshotPro'
                WHEN 8 THEN 'ClutchKing'
                WHEN 9 THEN 'RifleMaster'
                ELSE 'TacticalMind'
            END,
            0,
            false,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username;
        
        test_user_ids := array_append(test_user_ids, new_user_id);
        
        RAISE NOTICE 'Kullanıcı % oluşturuldu: %', i, new_user_id;
    END LOOP;

    -- Puanları ekle (admin 25k ile 1. sırada, diğerleri altında)
    -- 2. sıra: 20,000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[1], active_season_id, 20000, 50, 60)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 20000,
        correct_predictions = 50,
        total_predictions = 60;

    -- 3. sıra: 18,000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[2], active_season_id, 18000, 45, 58)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 18000,
        correct_predictions = 45,
        total_predictions = 58;

    -- 4. sıra: 16,000 puan
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES (test_user_ids[3], active_season_id, 16000, 40, 55)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = 16000,
        correct_predictions = 40,
        total_predictions = 55;

    -- 5-10. sıralar
    INSERT INTO season_points (user_id, season_id, total_points, correct_predictions, total_predictions)
    VALUES 
        (test_user_ids[4], active_season_id, 14000, 35, 50),
        (test_user_ids[5], active_season_id, 12000, 30, 45),
        (test_user_ids[6], active_season_id, 10000, 25, 40),
        (test_user_ids[7], active_season_id, 8000, 20, 35),
        (test_user_ids[8], active_season_id, 6000, 15, 30),
        (test_user_ids[9], active_season_id, 4000, 10, 25),
        (test_user_ids[10], active_season_id, 2000, 5, 20)
    ON CONFLICT (user_id, season_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions;

    RAISE NOTICE 'Tüm test kullanıcıları ve puanları başarıyla eklendi!';
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




