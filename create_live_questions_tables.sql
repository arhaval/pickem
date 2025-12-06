-- create_live_questions_tables.sql
-- Live soru sistemi için tabloları oluşturur

-- live_questions tablosu
CREATE TABLE IF NOT EXISTS public.live_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id bigint NOT NULL REFERENCES public.live_lobbies(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    question_type text NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'match_score', 'player_stats')),
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text,
    option_d text,
    correct_answer text CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    is_active boolean NOT NULL DEFAULT false,
    is_answered boolean NOT NULL DEFAULT false,
    player_image_url text,
    player_name text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- live_question_answers tablosu
CREATE TABLE IF NOT EXISTS public.live_question_answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES public.live_questions(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answer text NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
    is_winner boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(question_id, user_id)
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_live_questions_lobby_id ON public.live_questions(lobby_id);
CREATE INDEX IF NOT EXISTS idx_live_questions_is_active ON public.live_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_live_question_answers_question_id ON public.live_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_live_question_answers_user_id ON public.live_question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_live_question_answers_is_winner ON public.live_question_answers(is_winner);

-- RLS (Row Level Security) politikaları
ALTER TABLE public.live_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_question_answers ENABLE ROW LEVEL SECURITY;

-- Herkes soruları okuyabilir (aktif olanlar)
CREATE POLICY "Anyone can read active questions"
    ON public.live_questions
    FOR SELECT
    USING (is_active = true);

-- Sadece adminler soru ekleyebilir/düzenleyebilir
CREATE POLICY "Only admins can manage questions"
    ON public.live_questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Kullanıcılar kendi cevaplarını görebilir
CREATE POLICY "Users can view their own answers"
    ON public.live_question_answers
    FOR SELECT
    USING (auth.uid() = user_id);

-- Kullanıcılar cevap verebilir
CREATE POLICY "Users can insert answers"
    ON public.live_question_answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi cevaplarını güncelleyebilir (soru aktifken)
CREATE POLICY "Users can update their own answers"
    ON public.live_question_answers
    FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.live_questions
            WHERE live_questions.id = live_question_answers.question_id
            AND live_questions.is_active = true
            AND live_questions.is_answered = false
        )
    );

-- Adminler tüm cevapları görebilir
CREATE POLICY "Admins can view all answers"
    ON public.live_question_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_live_questions_updated_at
    BEFORE UPDATE ON public.live_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Yorumlar
COMMENT ON TABLE public.live_questions IS 'Canlı yayın soruları';
COMMENT ON TABLE public.live_question_answers IS 'Kullanıcıların sorulara verdiği cevaplar';
COMMENT ON COLUMN public.live_questions.question_type IS 'Soru tipi: text (normal soru), match_score (maç skoru), player_stats (oyuncu istatistiği)';
COMMENT ON COLUMN public.live_questions.is_active IS 'Soru aktif mi? (Aktif olan soru kullanıcılara gösterilir)';
COMMENT ON COLUMN public.live_questions.is_answered IS 'Soru cevaplandı mı? (Doğru cevap girildi mi?)';
COMMENT ON COLUMN public.live_question_answers.is_winner IS 'Bu kullanıcı kazanan mı?';

