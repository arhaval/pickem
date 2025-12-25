# Çalıştırılacak SQL Dosyaları - Özet ve Sıralama

## ⚠️ ÖNEMLİ: Bu SQL dosyalarını Supabase Dashboard → SQL Editor'de **SIRASIYLA** çalıştırın!

---

## 📋 Çalıştırma Sırası

### 1️⃣ Birinci Dosya: `rls_performance_and_timezone_fixes.sql`

**Ne yapar:**
- Performance için index'ler ekler
- Türkiye saati (UTC+3) için timezone-aware fonksiyonlar oluşturur
- `get_turkey_time()` ve `is_match_lock_time_passed()` fonksiyonları

**Dosya Konumu:** `supabase/migrations/rls_performance_and_timezone_fixes.sql`

**ÖNEMLİ:** Bu dosya ÖNCE çalıştırılmalı çünkü 2. dosya bu fonksiyonları kullanıyor!

---

### 2️⃣ İkinci Dosya: `rls_policies_with_timezone_function.sql`

**Ne yapar:**
- Predictions tablosu için zaman kilidi RLS policy'lerini günceller
- Timezone-aware fonksiyonları kullanır (1. dosyada oluşturulan)

**Dosya Konumu:** `supabase/migrations/rls_policies_with_timezone_function.sql`

**ÖNEMLİ:** Bu dosya 1. dosyadan SONRA çalıştırılmalı!

---

### 3️⃣ Üçüncü Dosya: `auto_score_predictions_trigger.sql`

**Ne yapar:**
- Otomatik puanlama fonksiyonu oluşturur (`calculate_match_prediction_points`)
- Trigger oluşturur (matches.winner güncellendiğinde tetiklenir)
- Doğru/yanlış tahminleri otomatik puanlar

**Dosya Konumu:** `supabase/migrations/auto_score_predictions_trigger.sql`

**ÖNEMLİ:** Bu dosya bağımsız çalışır, sıra önemli değil (ama en son çalıştırabilirsiniz)

---

## 🚀 Hızlı Başlangıç

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. **Projenizi seçin**
3. **SQL Editor'ü açın** (sol menüden)
4. **Sırayla dosyaları açın ve çalıştırın**:

   ```
   Dosya 1 → rls_performance_and_timezone_fixes.sql
   Dosya 2 → rls_policies_with_timezone_function.sql  
   Dosya 3 → auto_score_predictions_trigger.sql
   ```

---

## 📝 Dosya İçerikleri

Tüm SQL dosyaları `supabase/migrations/` klasöründe bulunuyor.

Her dosyayı açıp içeriğini kopyalayıp Supabase SQL Editor'de çalıştırabilirsiniz.

---

## ✅ Başarı Kontrolü

### 1. Index'ler kontrolü:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('matches', 'predictions', 'profiles')
AND indexname LIKE 'idx_%';
```

### 2. Fonksiyonlar kontrolü:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_turkey_time', 'is_match_lock_time_passed', 'calculate_match_prediction_points');
```

### 3. Trigger kontrolü:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'trigger_calculate_match_prediction_points';
```

---

## ⚠️ Hata Durumunda

Eğer bir hata alırsanız:
1. Hata mesajını not edin
2. Dosyaları sırayla çalıştırdığınızdan emin olun
3. Daha önce çalıştırılmış dosyaları tekrar çalıştırmaya gerek yok (IF NOT EXISTS kullanıldığı için)

---

## 📞 Yardım

Tüm dosyalar hazır ve test edilmeye hazır. Herhangi bir sorun olursa hata mesajını paylaşın.

