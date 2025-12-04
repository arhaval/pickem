# Teams Storage Bucket Kurulum Rehberi

## Hata: "Bucket not found"

Bu hata, `teams` storage bucket'ının henüz oluşturulmamış olmasından kaynaklanır.

## Adım Adım Kurulum

### 1. Supabase Dashboard'a Giriş Yapın
- https://app.supabase.com
- Projenize giriş yapın

### 2. Storage Bucket Oluşturun

1. Sol menüden **Storage** sekmesine tıklayın
2. **Create a new bucket** butonuna tıklayın
3. Bucket ayarları:
   - **Name**: `teams` (tam olarak bu isim olmalı!)
   - **Public bucket**: ✅ **Evet** (mutlaka işaretleyin!)
   - **File size limit**: Varsayılan (veya 2MB)
   - **Allowed MIME types**: Varsayılan (veya image/*)
4. **Create bucket** butonuna tıklayın

### 3. RLS Politikalarını Ayarlayın

Bucket oluşturduktan sonra, **SQL Editor**'da şu migration dosyasını çalıştırın:

**Dosya:** `supabase/migrations/setup_teams_storage_policies.sql`

Veya direkt şu SQL'i çalıştırın:

```sql
-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Allow public upload teams" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read teams" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update teams" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete teams" ON storage.objects;

-- Yeni politikalar oluştur
CREATE POLICY "Allow public upload teams"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'teams');

CREATE POLICY "Allow public read teams"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'teams');

CREATE POLICY "Allow public update teams"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'teams')
WITH CHECK (bucket_id = 'teams');

CREATE POLICY "Allow public delete teams"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'teams');
```

### 4. Test Edin

1. Admin panel → Takım Bankası
2. "Yeni Takım Ekle" butonuna tıklayın
3. Logo yükleme butonuna tıklayın
4. Bir logo dosyası seçin
5. Yükleme başarılı olmalı

## Alternatif: Logo URL Kullanımı

Eğer bucket oluşturmak istemiyorsanız, direkt logo URL'i girebilirsiniz:
- Örn: `/teams/navi.png` (public klasöründen)
- Örn: `https://example.com/logo.png` (dış URL)

## Notlar

- Bucket adı **tam olarak** `teams` olmalı (küçük harf)
- Bucket **mutlaka Public** olmalı
- RLS politikaları ayarlanmalı (yukarıdaki SQL'i çalıştırın)

