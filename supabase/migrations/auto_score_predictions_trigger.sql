-- ============================================================
-- OTOMATİK PUANLAMA TRIGGER VE FUNCTION
-- ============================================================
-- 
-- Bu migration dosyası:
-- 1. matches.winner güncellendiğinde otomatik olarak puanlama yapar
-- 2. Doğru tahminler için difficulty_score puanı verir
-- 3. Yanlış tahminler için 0 puan verir
-- 4. predictions.points_earned günceller
-- 5. profiles.total_points artırır
-- 6. season_points tablosunu günceller (varsa ve live_lobby_id yoksa)
-- 
-- ============================================================

-- ============================================================
-- 1. PUANLAMA FONKSİYONU
-- ============================================================

-- Mevcut fonksiyonu temizle (varsa)
DROP FUNCTION IF EXISTS public.calculate_match_prediction_points() CASCADE;

-- Maç kazananı güncellendiğinde tahminleri puanlayan fonksiyon
CREATE OR REPLACE FUNCTION public.calculate_match_prediction_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prediction_record RECORD;
  points_to_add INTEGER;
  match_season_id BIGINT; -- seasons.id BIGINT tipinde
  match_live_lobby_id TEXT; -- UUID veya başka tip olabilir
  match_difficulty_score_a INTEGER;
  match_difficulty_score_b INTEGER;
  match_prediction_type TEXT;
  current_season_points RECORD;
BEGIN
  -- Eğer winner NULL ise veya değişmemişse, işlem yapma
  -- (NULL'dan bir değere güncellenmiş olmalı veya değer değişmiş olmalı)
  IF NEW.winner IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Eğer winner değişmemişse (aynı değere güncellenmişse), işlem yapma
  -- (İlk kez set ediliyor veya değişmiş olmalı)
  IF OLD.winner IS NOT NULL AND OLD.winner = NEW.winner THEN
    -- Winner zaten set edilmiş ve aynı değere güncellenmiş, işlem yapma
    -- Ancak ilk kez set ediliyorsa (OLD.winner IS NULL), işlem yap
    RETURN NEW;
  END IF;

  -- Maç bilgilerini al
  SELECT 
    season_id,
    live_lobby_id::TEXT,
    difficulty_score_a,
    difficulty_score_b,
    prediction_type
  INTO 
    match_season_id,
    match_live_lobby_id,
    match_difficulty_score_a,
    match_difficulty_score_b,
    match_prediction_type
  FROM public.matches
  WHERE id = NEW.id;

  -- Maç bilgileri bulunamazsa hata
  IF match_difficulty_score_a IS NULL OR match_difficulty_score_b IS NULL THEN
    RAISE WARNING 'Maç bilgileri bulunamadı (match_id: %)', NEW.id;
    RETURN NEW;
  END IF;

  -- Bu maça ait tüm tahminleri döngüye al
  FOR prediction_record IN
    SELECT 
      id,
      user_id,
      selected_team,
      points_earned
    FROM public.predictions
    WHERE match_id = NEW.id
  LOOP
    -- Eğer bu tahmin için zaten puan verilmişse, tekrar puanlama yapma
    -- (Bu sayede tekrar tetiklenme durumunda duplicate puan vermez)
    IF prediction_record.points_earned IS NOT NULL AND prediction_record.points_earned > 0 THEN
      CONTINUE; -- Zaten puanlanmış, bir sonraki tahmine geç
    END IF;

    -- Puan hesaplama: Doğru tahmin mi?
    IF prediction_record.selected_team = NEW.winner THEN
      -- DOĞRU TAHMİN
      -- Puanı belirle: winner "A" veya "OVER" ise difficulty_score_a, "B" veya "UNDER" ise difficulty_score_b
      IF NEW.winner = 'A' OR NEW.winner = 'OVER' THEN
        points_to_add := match_difficulty_score_a;
      ELSIF NEW.winner = 'B' OR NEW.winner = 'UNDER' THEN
        points_to_add := match_difficulty_score_b;
      ELSE
        -- Beklenmeyen winner değeri, varsayılan olarak difficulty_score_a kullan
        points_to_add := match_difficulty_score_a;
      END IF;

      -- 1. predictions.points_earned güncelle
      UPDATE public.predictions
      SET points_earned = points_to_add
      WHERE id = prediction_record.id;

      -- 2. profiles.total_points artır
      UPDATE public.profiles
      SET 
        total_points = COALESCE(total_points, 0) + points_to_add,
        updated_at = NOW()
      WHERE id = prediction_record.user_id;

      -- 3. Season points güncelle (eğer season_id varsa ve live_lobby_id yoksa)
      IF match_season_id IS NOT NULL AND match_live_lobby_id IS NULL THEN
        -- Mevcut sezon puanını kontrol et
        SELECT * INTO current_season_points
        FROM public.season_points
        WHERE user_id = prediction_record.user_id
          AND season_id = match_season_id
        LIMIT 1;

        IF FOUND THEN
          -- Sezon puanı var, güncelle
          UPDATE public.season_points
          SET 
            total_points = COALESCE(total_points, 0) + points_to_add,
            correct_predictions = COALESCE(correct_predictions, 0) + 1,
            total_predictions = COALESCE(total_predictions, 0) + 1,
            updated_at = NOW()
          WHERE user_id = prediction_record.user_id
            AND season_id = match_season_id;
        ELSE
          -- Sezon puanı yok, oluştur
          INSERT INTO public.season_points (
            user_id,
            season_id,
            total_points,
            correct_predictions,
            total_predictions,
            created_at,
            updated_at
          )
          VALUES (
            prediction_record.user_id,
            match_season_id,
            points_to_add,
            1,
            1,
            NOW(),
            NOW()
          );
        END IF;
      END IF;

    ELSE
      -- YANLIŞ TAHMİN
      -- 0 puan ver

      -- 1. predictions.points_earned = 0 olarak güncelle
      UPDATE public.predictions
      SET points_earned = 0
      WHERE id = prediction_record.id;

      -- 2. Season points'e toplam tahmin sayısını artır (sadece sezon varsa ve live_lobby_id yoksa)
      IF match_season_id IS NOT NULL AND match_live_lobby_id IS NULL THEN
        -- Mevcut sezon puanını kontrol et
        SELECT * INTO current_season_points
        FROM public.season_points
        WHERE user_id = prediction_record.user_id
          AND season_id = match_season_id
        LIMIT 1;

        IF FOUND THEN
          -- Sezon puanı var, sadece total_predictions artır
          UPDATE public.season_points
          SET 
            total_predictions = COALESCE(total_predictions, 0) + 1,
            updated_at = NOW()
          WHERE user_id = prediction_record.user_id
            AND season_id = match_season_id;
        ELSE
          -- Sezon puanı yok, oluştur (0 puan ile)
          INSERT INTO public.season_points (
            user_id,
            season_id,
            total_points,
            correct_predictions,
            total_predictions,
            created_at,
            updated_at
          )
          VALUES (
            prediction_record.user_id,
            match_season_id,
            0,
            0,
            1,
            NOW(),
            NOW()
          );
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Fonksiyona açıklama ekle
COMMENT ON FUNCTION public.calculate_match_prediction_points() IS 
'Maç kazananı güncellendiğinde tahminleri otomatik olarak puanlar. Doğru tahminler için difficulty_score puanı verir, yanlış tahminler için 0 puan verir.';

-- ============================================================
-- 2. TRIGGER OLUŞTURMA
-- ============================================================

-- Mevcut trigger'ı temizle (varsa)
DROP TRIGGER IF EXISTS trigger_calculate_match_prediction_points ON public.matches;

-- Trigger oluştur: matches.winner güncellendiğinde tetiklenir
CREATE TRIGGER trigger_calculate_match_prediction_points
AFTER UPDATE OF winner ON public.matches
FOR EACH ROW
WHEN (NEW.winner IS NOT NULL AND (OLD.winner IS NULL OR OLD.winner IS DISTINCT FROM NEW.winner))
EXECUTE FUNCTION public.calculate_match_prediction_points();

-- Trigger'a açıklama ekle
COMMENT ON TRIGGER trigger_calculate_match_prediction_points ON public.matches IS 
'Maç kazananı (winner) güncellendiğinde otomatik olarak tahminleri puanlar.';

-- ============================================================
-- 3. ÖNEMLİ NOTLAR
-- ============================================================
-- 
-- TRIGGER MANTIĞI:
-- 
-- 1. matches.winner kolonu güncellendiğinde tetiklenir
-- 2. Sadece winner NULL'dan bir değere veya değer değiştiğinde çalışır
-- 3. Aynı değere tekrar set edilirse çalışmaz (WHEN koşulu ile)
-- 
-- PUAN HESAPLAMA:
-- 
-- 1. Doğru Tahmin:
--    - winner = "A" veya "OVER" → difficulty_score_a puanı
--    - winner = "B" veya "UNDER" → difficulty_score_b puanı
--    - predictions.points_earned güncellenir
--    - profiles.total_points artırılır
--    - season_points güncellenir (varsa ve live_lobby_id yoksa)
-- 
-- 2. Yanlış Tahmin:
--    - 0 puan verilir
--    - predictions.points_earned = 0 olarak set edilir
--    - profiles.total_points değişmez
--    - season_points.total_predictions artırılır (varsa ve live_lobby_id yoksa)
-- 
-- GÜVENLİK:
-- 
-- - SECURITY DEFINER: Fonksiyon, fonksiyon sahibinin yetkileriyle çalışır
-- - RLS politikaları bu fonksiyonu etkilemez (SECURITY DEFINER sayesinde)
-- - Ancak sadece adminler matches.winner güncelleyebilir (RLS policy ile korunmalı)
-- 
-- PERFORMANS:
-- 
-- - Trigger sadece winner kolonu değiştiğinde çalışır (AFTER UPDATE OF winner)
-- - WHEN koşulu ile gereksiz çalışmalar önlenir
-- - Eğer points_earned zaten set edilmişse, tekrar puanlama yapılmaz
-- 
-- ============================================================

-- ============================================================
-- 4. TEST ETME
-- ============================================================
-- 
-- Test için örnek sorgular:
-- 
-- 1. Maç kazananını güncelle:
--    UPDATE public.matches SET winner = 'A' WHERE id = 'match-id-here';
-- 
-- 2. Tahminleri kontrol et:
--    SELECT id, user_id, selected_team, points_earned 
--    FROM public.predictions 
--    WHERE match_id = 'match-id-here';
-- 
-- 3. Kullanıcı puanlarını kontrol et:
--    SELECT id, total_points 
--    FROM public.profiles 
--    WHERE id IN (SELECT DISTINCT user_id FROM public.predictions WHERE match_id = 'match-id-here');
-- 
-- 4. Sezon puanlarını kontrol et:
--    SELECT * FROM public.season_points 
--    WHERE season_id = 'season-id-here';
-- 
-- ============================================================

