-- Predictions Tablosu için RLS Politikaları
-- Kullanıcılar kendi tahminlerini ekleyebilir, görebilir ve güncelleyebilir

-- RLS'yi aktif et
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Kullanıcılar kendi tahminlerini ekleyebilir" ON predictions;
DROP POLICY IF EXISTS "Kullanıcılar kendi tahminlerini görebilir" ON predictions;

-- INSERT Politikası: Kullanıcılar kendi user_id'leri ile tahmin ekleyebilir
-- user_id kolonu UUID tipindeyse direkt karşılaştırma, TEXT tipindeyse ::text kullan
CREATE POLICY "Kullanıcılar kendi tahminlerini ekleyebilir"
ON predictions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECT Politikası: Kullanıcılar kendi tahminlerini görebilir
CREATE POLICY "Kullanıcılar kendi tahminlerini görebilir"
ON predictions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- UPDATE Politikası: Kullanıcılar kendi tahminlerini güncelleyebilir (isteğe bağlı, şu an için yok)
-- CREATE POLICY "Kullanıcılar kendi tahminlerini güncelleyebilir"
-- ON predictions
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid()::text = user_id)
-- WITH CHECK (auth.uid()::text = user_id);

-- Admin'ler tüm tahminleri görebilir (isteğe bağlı)
-- Bu policy, admin kontrolü için profiles tablosundaki is_admin kolonunu kullanır
-- CREATE POLICY "Adminler tüm tahminleri görebilir"
-- ON predictions
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.id = auth.uid()::text
--     AND profiles.is_admin = true
--   )
-- );

