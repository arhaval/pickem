# Otomatik Puanlama Trigger - Açıklama

## 📋 Özet

Bu migration dosyası, admin panelinden maç kazananı (`matches.winner`) girildiğinde otomatik olarak puanlama yapan bir trigger ve function oluşturur.

## 🎯 Nasıl Çalışır?

### 1. Trigger Tetiklenmesi

- `matches` tablosunda `winner` kolonu güncellendiğinde tetiklenir
- Sadece `winner` kolonu değiştiğinde çalışır (`AFTER UPDATE OF winner`)
- `winner` NULL'dan bir değere veya değer değiştiğinde çalışır
- Aynı değere tekrar set edilirse çalışmaz

### 2. Puan Hesaplama

#### Doğru Tahmin:
- Kullanıcının `selected_team` değeri, maçın `winner` değeri ile aynıysa
- Puan belirleme:
  - `winner = "A"` veya `"OVER"` → `difficulty_score_a` puanı
  - `winner = "B"` veya `"UNDER"` → `difficulty_score_b` puanı
- İşlemler:
  1. `predictions.points_earned` güncellenir
  2. `profiles.total_points` artırılır
  3. `season_points` güncellenir (varsa ve `live_lobby_id` yoksa)

#### Yanlış Tahmin:
- Kullanıcının `selected_team` değeri, maçın `winner` değeri ile farklıysa
- İşlemler:
  1. `predictions.points_earned = 0` olarak set edilir
  2. `profiles.total_points` değişmez
  3. `season_points.total_predictions` artırılır (varsa ve `live_lobby_id` yoksa)

### 3. Season Points Mantığı

- Eğer maçın `season_id` varsa ve `live_lobby_id` yoksa:
  - Sezon puanları güncellenir
  - Doğru tahmin için: `total_points` artırılır, `correct_predictions` ve `total_predictions` artırılır
  - Yanlış tahmin için: Sadece `total_predictions` artırılır
- Eğer `live_lobby_id` varsa:
  - Sezon puanlarına eklenmez (lobi maçları sezon puanına dahil değil)

## 🔒 Güvenlik

- `SECURITY DEFINER`: Fonksiyon, fonksiyon sahibinin yetkileriyle çalışır
- RLS politikaları bu fonksiyonu etkilemez
- Ancak sadece adminler `matches.winner` güncelleyebilir (RLS policy ile korunmalı)

## ⚡ Performans

- Trigger sadece `winner` kolonu değiştiğinde çalışır
- `WHEN` koşulu ile gereksiz çalışmalar önlenir
- Eğer `points_earned` zaten set edilmişse, tekrar puanlama yapılmaz (duplicate prevention)

## 📝 Kullanım

### Migration Dosyasını Çalıştırma

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/auto_score_predictions_trigger.sql` dosyasını açın
3. Çalıştırın

### Test Etme

```sql
-- 1. Maç kazananını güncelle
UPDATE public.matches 
SET winner = 'A' 
WHERE id = 'your-match-id';

-- 2. Tahminleri kontrol et
SELECT id, user_id, selected_team, points_earned 
FROM public.predictions 
WHERE match_id = 'your-match-id';

-- 3. Kullanıcı puanlarını kontrol et
SELECT id, total_points 
FROM public.profiles 
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.predictions 
  WHERE match_id = 'your-match-id'
);

-- 4. Sezon puanlarını kontrol et
SELECT * FROM public.season_points 
WHERE season_id = 'your-season-id';
```

## ⚠️ Önemli Notlar

1. **Duplicate Prevention**: Eğer bir tahmin için zaten `points_earned` set edilmişse, tekrar puanlama yapılmaz.

2. **Winner Değerleri**: 
   - `"A"` ve `"OVER"` → `difficulty_score_a` puanı
   - `"B"` ve `"UNDER"` → `difficulty_score_b` puanı

3. **Season Points**: 
   - Sadece `season_id` varsa ve `live_lobby_id` yoksa güncellenir
   - Lobi maçları sezon puanına dahil değildir

4. **Admin Panel**: 
   - Admin panelindeki manuel puanlama kodunu kaldırabilirsiniz
   - Artık trigger otomatik olarak yapacak
   - Ancak mevcut kod ile çakışmaz, ikisi birlikte de çalışabilir (ama duplicate puan vermeyi önlemek için birini kaldırmak daha iyi)

## 🔄 Mevcut Kod ile Entegrasyon

Eğer admin panelinde manuel puanlama kodu varsa:

- **Seçenek 1**: Trigger'ı kullanın, admin panelindeki kodu kaldırın (Önerilen)
- **Seçenek 2**: İkisini birlikte kullanın (ama duplicate prevention sayesinde sorun olmaz)

## 🐛 Sorun Giderme

### Problem: Puanlar verilmiyor

**Çözüm**: 
- `matches.winner` kolonunun gerçekten güncellenip güncellenmediğini kontrol edin
- Trigger'ın çalışıp çalışmadığını kontrol edin:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'trigger_calculate_match_prediction_points';
  ```

### Problem: Duplicate puanlar veriliyor

**Çözüm**: 
- Trigger'da duplicate prevention var, ancak eğer sorun devam ederse `points_earned IS NOT NULL` kontrolünü güçlendirin

### Problem: Season points güncellenmiyor

**Çözüm**: 
- Maçın `season_id`'sinin set edildiğini kontrol edin
- `live_lobby_id`'nin NULL olduğunu kontrol edin
- `season_points` tablosunun var olduğunu kontrol edin

