# Test Adımları - Migration Sonrası Kontrol

## ✅ SQL Migration'ları Tamamlandı

Tüm SQL dosyalarını çalıştırdıktan sonra bu adımları takip edin.

---

## 1️⃣ Başarı Kontrolü (SQL Sorguları)

`TEST_KONTROL_SORULARI.sql` dosyasındaki sorguları Supabase SQL Editor'de çalıştırın:

- ✅ Index'ler oluşturulmuş mu?
- ✅ Fonksiyonlar oluşturulmuş mu?
- ✅ Trigger oluşturulmuş mu?
- ✅ RLS Policy'ler güncellenmiş mi?

**Beklenen Sonuçlar:**
- INDEX: En az 7 index
- FUNCTION: 3 fonksiyon (get_turkey_time, is_match_lock_time_passed, calculate_match_prediction_points)
- TRIGGER: 1 trigger (trigger_calculate_match_prediction_points)
- RLS POLICY: 2 policy (INSERT ve UPDATE için zaman kilidi)

---

## 2️⃣ Fonksiyon Testleri

### 2.1. Türkiye Saati Fonksiyonu

```sql
SELECT public.get_turkey_time();
```

**Beklenen:** Şu anki Türkiye saati (UTC+3) döndürülmeli

### 2.2. Zaman Kilidi Fonksiyonu (Gelecek Tarih)

```sql
SELECT public.is_match_lock_time_passed('2025-12-31', '20:00', 15);
```

**Beklenen:** `false` (henüz kilitleme zamanı geçmedi)

### 2.3. Zaman Kilidi Fonksiyonu (Geçmiş Tarih)

```sql
SELECT public.is_match_lock_time_passed('2020-01-01', '20:00', 15);
```

**Beklenen:** `true` (kilitleme zamanı geçti)

---

## 3️⃣ RLS Policy Testi (Zaman Kilidi)

### 3.1. Tahmin Ekleme Testi (Zaman Kilidi İçinde)

1. Admin panelinden bir maç ekleyin (gelecek bir tarih/saat ile)
2. Kullanıcı olarak giriş yapın
3. Tahminler sayfasından tahmin yapmayı deneyin

**Beklenen:** Eğer maç başlama saatine `prediction_lock_minutes_before_match` kadar süre kalmışsa, tahmin eklenebilir.

### 3.2. Tahmin Ekleme Testi (Zaman Kilidi Dışında)

1. Admin panelinden bir maç ekleyin (geçmiş bir tarih/saat ile)
2. Kullanıcı olarak giriş yapın
3. Tahminler sayfasından tahmin yapmayı deneyin

**Beklenen:** Tahmin eklenemez (zaman kilidi geçmiş)

---

## 4️⃣ Otomatik Puanlama Trigger Testi

### 4.1. Test Senaryosu

1. **Admin panelinden bir maç ekleyin:**
   - Takım A ve Takım B seçin
   - `difficulty_score_a = 10`
   - `difficulty_score_b = 15`
   - Gelecek bir tarih/saat seçin

2. **Kullanıcı olarak tahmin yapın:**
   - Tahminler sayfasından bu maça tahmin yapın
   - Takım A'yı seçin

3. **Admin panelinden maç kazananını girin:**
   - Maç sonucu → Winner: "A"

4. **Kontrol edin:**
   ```sql
   -- Tahmin puanını kontrol et
   SELECT id, user_id, selected_team, points_earned 
   FROM public.predictions 
   WHERE match_id = 'match-id-buraya';
   
   -- Kullanıcı toplam puanını kontrol et
   SELECT id, total_points 
   FROM public.profiles 
   WHERE id = 'user-id-buraya';
   
   -- Sezon puanını kontrol et (eğer season_id varsa)
   SELECT * FROM public.season_points 
   WHERE user_id = 'user-id-buraya';
   ```

**Beklenen Sonuçlar:**
- `predictions.points_earned = 10` (difficulty_score_a)
- `profiles.total_points` 10 artmış olmalı
- `season_points.total_points = 10` (eğer season_id varsa)

### 4.2. Yanlış Tahmin Testi

1. Yukarıdaki adımları tekrarlayın, ancak bu sefer:
   - Kullanıcı Takım A'yı seçsin
   - Admin Winner: "B" olarak girin

**Beklenen Sonuçlar:**
- `predictions.points_earned = 0`
- `profiles.total_points` değişmez (yanlış tahmin için puan verilmez)
- `season_points.total_predictions` artar ama `total_points` artmaz

---

## 5️⃣ Admin Yetkileri Testi

### 5.1. Admin Olmayan Kullanıcı Testi

1. Admin olmayan bir kullanıcı ile giriş yapın
2. Maç eklemeyi/güncellemeyi deneyin (doğrudan SQL veya admin paneli erişimi)

**Beklenen:** INSERT/UPDATE/DELETE işlemleri reddedilmeli (RLS policy ile)

### 5.2. Admin Kullanıcı Testi

1. Admin kullanıcı ile giriş yapın
2. Maç ekleyin/güncelleyin

**Beklenen:** İşlemler başarılı olmalı

---

## 6️⃣ Performance Testi

Index'lerin çalışıp çalışmadığını kontrol edin:

```sql
-- EXPLAIN ANALYZE ile sorgu planını kontrol et
EXPLAIN ANALYZE
SELECT * FROM public.matches 
WHERE match_date = '2025-12-25' 
  AND match_time = '20:00';
```

**Beklenen:** `idx_matches_date_time` index'i kullanılmalı (Index Scan)

---

## ✅ Test Sonuçları

Eğer tüm testler başarılıysa:

- ✅ RLS Policy'ler çalışıyor
- ✅ Zaman kilidi çalışıyor
- ✅ Otomatik puanlama çalışıyor
- ✅ Admin yetkileri çalışıyor
- ✅ Performance index'leri çalışıyor

---

## ⚠️ Sorun Giderme

### Trigger çalışmıyor mu?

```sql
-- Trigger'ın aktif olup olmadığını kontrol et
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_calculate_match_prediction_points';

-- Fonksiyonun var olup olmadığını kontrol et
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'calculate_match_prediction_points';
```

### RLS Policy çalışmıyor mu?

```sql
-- Policy'lerin var olup olmadığını kontrol et
SELECT * FROM pg_policies 
WHERE tablename = 'predictions';
```

### Fonksiyon hataları mı alıyorsunuz?

```sql
-- Fonksiyon tanımlarını kontrol et
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'get_turkey_time';
```

---

## 📞 Yardım

Herhangi bir sorun yaşarsanız:
1. Hata mesajını kaydedin
2. Test sorgularının sonuçlarını paylaşın
3. Yapılan işlemleri adım adım açıklayın

