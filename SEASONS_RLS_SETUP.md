# Seasons Tablosu RLS Kurulum Rehberi

Bu rehber, `seasons` ve `season_points` tabloları için Row Level Security (RLS) politikalarını kurmanız için hazırlanmıştır.

## Hızlı Kurulum

Supabase SQL Editor'de aşağıdaki migration dosyalarını sırayla çalıştırın:

1. `supabase/migrations/setup_seasons_rls.sql`
2. `supabase/migrations/setup_season_points_rls.sql`

## Adım Adım Kurulum

### 1. Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor** sekmesine tıklayın

### 2. Seasons Tablosu RLS Politikaları

SQL Editor'de aşağıdaki kodu yapıştırın ve çalıştırın:

```sql
-- Seasons tablosu için RLS politikaları

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Allow public read seasons" ON seasons;
DROP POLICY IF EXISTS "Allow public insert seasons" ON seasons;
DROP POLICY IF EXISTS "Allow public update seasons" ON seasons;
DROP POLICY IF EXISTS "Allow public delete seasons" ON seasons;

-- RLS'yi etkinleştir
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Herkes sezonları okuyabilir (public read)
CREATE POLICY "Allow public read seasons"
  ON seasons
  FOR SELECT
  USING (true);

-- Herkes sezon ekleyebilir (public insert)
CREATE POLICY "Allow public insert seasons"
  ON seasons
  FOR INSERT
  WITH CHECK (true);

-- Herkes sezon güncelleyebilir (public update)
CREATE POLICY "Allow public update seasons"
  ON seasons
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Herkes sezon silebilir (public delete)
CREATE POLICY "Allow public delete seasons"
  ON seasons
  FOR DELETE
  USING (true);
```

### 3. Season_points Tablosu RLS Politikaları

SQL Editor'de aşağıdaki kodu yapıştırın ve çalıştırın:

```sql
-- Season_points tablosu için RLS politikaları

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Allow public read season_points" ON season_points;
DROP POLICY IF EXISTS "Allow public insert season_points" ON season_points;
DROP POLICY IF EXISTS "Allow public update season_points" ON season_points;
DROP POLICY IF EXISTS "Allow public delete season_points" ON season_points;

-- RLS'yi etkinleştir
ALTER TABLE season_points ENABLE ROW LEVEL SECURITY;

-- Herkes sezon puanlarını okuyabilir (public read) - Liderlik tablosu için
CREATE POLICY "Allow public read season_points"
  ON season_points
  FOR SELECT
  USING (true);

-- Herkes sezon puanı ekleyebilir (public insert) - Sistem otomatik ekliyor
CREATE POLICY "Allow public insert season_points"
  ON season_points
  FOR INSERT
  WITH CHECK (true);

-- Herkes sezon puanı güncelleyebilir (public update) - Sistem otomatik güncelliyor
CREATE POLICY "Allow public update season_points"
  ON season_points
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Herkes sezon puanı silebilir (public delete) - Sezon bitince sistem siliyor
CREATE POLICY "Allow public delete season_points"
  ON season_points
  FOR DELETE
  USING (true);
```

## Politikaların Açıklaması

### Seasons Tablosu

- **SELECT (Okuma)**: Herkes sezonları okuyabilir (liderlik tablosu, tahminler sayfası için gerekli)
- **INSERT (Ekleme)**: Herkes sezon ekleyebilir (admin paneli için)
- **UPDATE (Güncelleme)**: Herkes sezon güncelleyebilir (admin paneli için)
- **DELETE (Silme)**: Herkes sezon silebilir (admin paneli için)

### Season_points Tablosu

- **SELECT (Okuma)**: Herkes sezon puanlarını okuyabilir (liderlik tablosu için)
- **INSERT (Ekleme)**: Herkes sezon puanı ekleyebilir (puan dağıtımı için)
- **UPDATE (Güncelleme)**: Herkes sezon puanı güncelleyebilir (puan dağıtımı için)
- **DELETE (Silme)**: Herkes sezon puanı silebilir (sezon bitişi için)

## Notlar

- Bu politikalar **geliştirme ortamı** için hazırlanmıştır
- **Production ortamında** admin kontrolü eklenebilir (örneğin `is_admin` kontrolü)
- Tüm işlemler public olarak açıktır, çünkü sistem otomatik olarak puan dağıtımı yapıyor

## Sorun Giderme

Eğer hala "new row violates row-level security policy" hatası alıyorsanız:

1. Supabase Dashboard'da **Authentication** > **Policies** sekmesine gidin
2. `seasons` ve `season_points` tabloları için politikaların oluşturulduğunu kontrol edin
3. RLS'nin aktif olduğundan emin olun (tablo ayarlarında kontrol edin)













