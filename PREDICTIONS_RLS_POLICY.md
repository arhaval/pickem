# Predictions Tablosu RLS Politikası - Uygulama Adımları

## Sorun
`predictions` tablosunda Row Level Security (RLS) politikası olmadığı için kullanıcılar tahmin ekleyemiyor. Hata mesajı: "new row violates row-level security policy for table "predictions""

## Çözüm

Supabase Dashboard'da aşağıdaki SQL komutlarını çalıştırın:

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden "SQL Editor" seçin
4. "New Query" butonuna tıklayın
5. Aşağıdaki SQL komutlarını kopyalayıp yapıştırın:

```sql
-- Predictions Tablosu için RLS Politikaları
-- Kullanıcılar kendi tahminlerini ekleyebilir, görebilir ve güncelleyebilir

-- RLS'yi aktif et
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- INSERT Politikası: Kullanıcılar kendi user_id'leri ile tahmin ekleyebilir
CREATE POLICY "Kullanıcılar kendi tahminlerini ekleyebilir"
ON predictions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- SELECT Politikası: Kullanıcılar kendi tahminlerini görebilir
CREATE POLICY "Kullanıcılar kendi tahminlerini görebilir"
ON predictions
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);
```

6. "Run" butonuna tıklayın (veya Ctrl+Enter)

## Açıklama

Bu politikalar:
- **INSERT**: Kullanıcılar sadece kendi `user_id`'leri ile tahmin ekleyebilir
- **SELECT**: Kullanıcılar sadece kendi tahminlerini görebilir

## Önemli Notlar

- `user_id` kolonu `predictions` tablosunda `text` tipinde olmalı
- Kullanıcılar giriş yapmış olmalı (authenticated)
- Eğer `user_id` kolonu farklı bir tipte ise, SQL'deki `::text` casting'i kaldırın veya uygun tipe çevirin

## Test

Politikaları ekledikten sonra:
1. Sitede bir kullanıcı olarak giriş yapın
2. Tahmin yapmayı deneyin
3. "Tahminleri Gönder" butonuna tıklayın
4. Hata olmadan kaydedilmeli

## İsteğe Bağlı: Admin Erişimi

Eğer adminlerin tüm tahminleri görmesini istiyorsanız, SQL'in sonuna şunu ekleyin:

```sql
-- Admin'ler tüm tahminleri görebilir
CREATE POLICY "Adminler tüm tahminleri görebilir"
ON predictions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.is_admin = true
  )
);
```










