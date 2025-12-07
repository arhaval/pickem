-- update_live_questions_for_numeric.sql
-- Soruları çoktan seçmeli yerine sayısal tahmin formatına çevirir

-- Önce mevcut tabloyu kontrol et ve gerekirse kolonları güncelle
DO $$
BEGIN
    -- option_a, option_b, option_c, option_d kolonlarını kaldır (artık gerekli değil)
    -- correct_answer kolonunu kaldır (sayısal tahmin için gerekli değil)
    -- Yeni kolonlar ekle: expected_answer (sayısal cevap), answer_tolerance (tolerans)
    
    -- Eğer kolonlar varsa, önce verileri yedekle ve sonra kaldır
    -- Bu migration sadece yeni kolonları ekler, eskileri kaldırmaz (geriye dönük uyumluluk için)
    
    -- expected_answer kolonu ekle (doğru cevap - sayısal)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_questions' 
        AND column_name = 'expected_answer'
    ) THEN
        ALTER TABLE public.live_questions
        ADD COLUMN expected_answer numeric(10,2) NULL;
        
        COMMENT ON COLUMN public.live_questions.expected_answer IS 'Beklenen sayısal cevap (örneğin: 18 kill)';
    END IF;
    
    -- answer_tolerance kolonu ekle (tolerans - kaç puan fark olabilir)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_questions' 
        AND column_name = 'answer_tolerance'
    ) THEN
        ALTER TABLE public.live_questions
        ADD COLUMN answer_tolerance numeric(5,2) DEFAULT 0;
        
        COMMENT ON COLUMN public.live_questions.answer_tolerance IS 'Cevap toleransı (örneğin: 2 = ±2 puan fark kabul edilir)';
    END IF;
END $$;

-- live_question_answers tablosunu güncelle - answer kolonunu numeric yap
DO $$
BEGIN
    -- answer kolonunu text'ten numeric'e çevir
    -- Önce mevcut verileri kontrol et
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_question_answers' 
        AND column_name = 'answer'
        AND data_type = 'text'
    ) THEN
        -- Yeni numeric kolon ekle
        ALTER TABLE public.live_question_answers
        ADD COLUMN numeric_answer numeric(10,2) NULL;
        
        -- Mevcut text cevapları numeric'e çevirmeye çalış (A, B, C, D -> NULL)
        -- Sayısal değerler varsa onları kopyala
        UPDATE public.live_question_answers
        SET numeric_answer = CASE 
            WHEN answer ~ '^[0-9]+\.?[0-9]*$' THEN answer::numeric
            ELSE NULL
        END;
        
        -- Eski answer kolonunu kaldır (opsiyonel - geriye dönük uyumluluk için bırakabiliriz)
        -- ALTER TABLE public.live_question_answers DROP COLUMN answer;
        
        COMMENT ON COLUMN public.live_question_answers.numeric_answer IS 'Kullanıcının verdiği sayısal cevap';
    END IF;
END $$;





