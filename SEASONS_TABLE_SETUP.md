# Seasons ve Season Points Tablolarını Oluşturma Rehberi

Bu rehber, `seasons` ve `season_points` tablolarını oluşturmanız için hazırlanmıştır.

## ⚠️ ÖNEMLİ: Önce Tabloları Oluşturun!

RLS politikalarını uygulamadan önce tabloların var olduğundan emin olun.

## Adım 1: Seasons Tablosunu Oluşturma

Supabase SQL Editor'de aşağıdaki kodu çalıştırın:

```sql
-- Seasons tablosunu oluştur
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_seasons_is_active ON seasons(is_active);
CREATE INDEX IF NOT EXISTS idx_seasons_created_at ON seasons(created_at DESC);

COMMENT ON TABLE seasons IS 'Sezon bilgileri';
COMMENT ON COLUMN seasons.name IS 'Sezon adı';
COMMENT ON COLUMN seasons.start_date IS 'Sezon başlangıç tarihi';
COMMENT ON COLUMN seasons.end_date IS 'Sezon bitiş tarihi';
COMMENT ON COLUMN seasons.is_active IS 'Aktif sezon mu?';
```

## Adım 2: Season Points Tablosunu Oluşturma

Supabase SQL Editor'de aşağıdaki kodu çalıştırın:

```sql
-- Season_points tablosunu oluştur
CREATE TABLE IF NOT EXISTS season_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_season_points_user_id ON season_points(user_id);
CREATE INDEX IF NOT EXISTS idx_season_points_season_id ON season_points(season_id);
CREATE INDEX IF NOT EXISTS idx_season_points_total_points ON season_points(total_points DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_season_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_season_points_updated_at
  BEFORE UPDATE ON season_points
  FOR EACH ROW
  EXECUTE FUNCTION update_season_points_updated_at();

COMMENT ON TABLE season_points IS 'Kullanıcıların sezon bazlı puanları ve istatistikleri';
COMMENT ON COLUMN season_points.user_id IS 'Kullanıcı ID';
COMMENT ON COLUMN season_points.season_id IS 'Sezon ID';
COMMENT ON COLUMN season_points.total_points IS 'Sezon toplam puanı';
COMMENT ON COLUMN season_points.correct_predictions IS 'Doğru tahmin sayısı';
COMMENT ON COLUMN season_points.total_predictions IS 'Toplam tahmin sayısı';
```

## Adım 3: RLS Politikalarını Uygulama

Tablolar oluşturulduktan sonra RLS politikalarını uygulayın (önceki rehberdeki SQL kodları).

## Sıralama

1. ✅ Seasons tablosunu oluştur
2. ✅ Season_points tablosunu oluştur
3. ✅ Seasons RLS politikalarını uygula
4. ✅ Season_points RLS politikalarını uygula












