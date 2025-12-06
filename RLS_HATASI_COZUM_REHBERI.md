# RLS Hatası Çözüm Rehberi

## Hata: "StorageApiError - new row violates row-level security policy"

Bu hata, Supabase'de RLS (Row Level Security) politikalarının düzgün ayarlanmamış olmasından kaynaklanır.

## 🔍 Sorun Tespiti

Hatanın hangi tablodan kaynaklandığını bulmak için:

1. **Browser Console'da** hatayı kontrol edin
2. Hangi işlem sırasında olduğunu not edin:
   - Tahmin gönderme? → `predictions` tablosu
   - Avatar yükleme? → `avatars` storage bucket
   - Logo yükleme? → `teams` storage bucket

## ✅ Çözüm Adımları

### ADIM 1: Predictions Tablosu RLS Politikası (Eğer tahmin gönderirken hata alıyorsanız)

1. **Supabase Dashboard'a** gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor**'a tıklayın
4. **Yeni Query** oluşturun
5. `RLS_HATASI_COZUM.txt` dosyasının içeriğini kopyalayıp yapıştırın
6. **"Run as" → "Service Role"** seçin (RLS bypass için)
7. **Run** butonuna tıklayın

### ADIM 2: Storage Bucket RLS Politikası (Eğer dosya yüklerken hata alıyorsanız)

1. Aynı **SQL Editor**'da
2. `RLS_STORAGE_HATASI_COZUM.txt` dosyasının içeriğini kopyalayıp yapıştırın
3. **"Run as" → "Service Role"** seçin
4. **Run** butonuna tıklayın

### ADIM 3: Kontrol Et

1. Tahmin göndermeyi tekrar deneyin
2. Hata hala devam ediyorsa, browser console'daki tam hata mesajını kontrol edin

## 🐛 Hala Çalışmıyorsa

1. **Predictions tablosunun yapısını kontrol edin:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'predictions' 
     AND column_name = 'user_id';
   ```

2. **Mevcut RLS politikalarını kontrol edin:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'predictions';
   ```

3. **RLS'nin aktif olup olmadığını kontrol edin:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'predictions';
   ```

## 📝 Notlar

- RLS politikaları her tablo için ayrı ayrı ayarlanmalıdır
- Storage bucket'lar için RLS politikaları farklıdır
- Service Role kullanarak RLS'yi bypass edebilirsiniz (sadece admin işlemleri için)
- Production'da mutlaka RLS aktif olmalıdır

## ✅ Başarılı Olduğunuzda

- Tahminler kaydedilecek
- Dosya yüklemeleri çalışacak
- Console'da hata görünmeyecek









