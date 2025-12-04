# Predictions Tablosuna Season ID Ekleme - Migration Uygulama Adımları

`predictions` tablosuna `season_id` kolonunun eklenmesi gerekiyor. Bu adımları takip ederek migration'ı uygulayabilirsiniz:

## Adımlar

1. **Supabase Dashboard'a Giriş Yapın:**
   - Tarayıcınızda [https://app.supabase.com](https://app.supabase.com) adresine gidin.
   - Projenizi seçin.

2. **SQL Editor'a Gidin:**
   - Sol menüde "SQL Editor" seçeneğine tıklayın.

3. **Yeni Bir Sorgu Oluşturun:**
   - "New query" butonuna tıklayın.

4. **SQL Komutunu Yapıştırın:**
   - **ÖNEMLİ:** Aşağıdaki **SADECE SQL KOMUTLARI**nı kopyalayın (markdown başlıklarını değil!)
   - `supabase/migrations/add_season_id_to_predictions_CLEAN.sql` dosyasını açın ve içindeki SQL komutlarını kopyalayıp yapıştırın
   - Ya da aşağıdaki SQL komutlarını direkt kopyalayın:

```sql
-- Predictions tablosuna season_id kolonu ekle
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS season_id BIGINT REFERENCES seasons(id) ON DELETE SET NULL;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_predictions_season_id ON predictions(season_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_season ON predictions(user_id, season_id);

-- Mevcut tahminler için season_id'yi match'lerden al
UPDATE predictions p
SET season_id = m.season_id
FROM matches m
WHERE p.match_id = m.id::text
  AND p.season_id IS NULL
  AND m.season_id IS NOT NULL;

COMMENT ON COLUMN predictions.season_id IS 'Tahminin ait olduğu sezon ID (BIGINT) - Tahminler sezon bazlı tutulur';
```

   **DİKKAT:** Markdown başlıklarını (# ile başlayan satırları) kopyalamayın! Sadece yukarıdaki SQL komutlarını kopyalayın.

5. **Sorguyu Çalıştırın:**
   - Sağ üst köşedeki "Run" butonuna tıklayın (veya `Ctrl + Enter` kullanın).

## Önemli Notlar

- Bu migration, mevcut tahminlere otomatik olarak `season_id` atar (match'lerden alarak)
- Eğer bir tahminin match'i `season_id` içermiyorsa, o tahmin için `season_id` `NULL` kalır
- Yeni tahminler artık otomatik olarak aktif sezon ile ilişkilendirilecek
- Index'ler performans için eklenmiştir

Bu adımları tamamladıktan sonra `predictions` tablosuna `season_id` kolonu eklenecek ve sezon bazlı tahmin sistemi aktif hale gelecektir.

