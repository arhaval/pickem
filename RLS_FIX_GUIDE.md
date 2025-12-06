# RLS Hatası Çözüm Rehberi

## Hata: "new row violates row-level security policy"

Bu hata, Supabase RLS (Row Level Security) politikaları nedeniyle oluşuyor.

## Hızlı Çözüm (Geçici - Sadece Geliştirme İçin)

### Seçenek 1: RLS'yi Geçici Olarak Devre Dışı Bırak

Supabase SQL Editor'da şu dosyayı çalıştırın:
- `supabase/migrations/disable_rls_temporarily.sql`

**DİKKAT:** Bu sadece geliştirme aşamasında kullanılmalıdır! Production'da asla kullanmayın!

### Seçenek 2: Düzeltilmiş RLS Politikaları (Önerilen)

Supabase SQL Editor'da şu dosyayı çalıştırın:
- `supabase/migrations/fix_rls_policies.sql`

Bu dosya:
- `site_settings` tablosu için public read, authenticated write izni verir
- Storage için public read, authenticated write izni verir

## Adım Adım Çözüm

### 1. Supabase Dashboard'a Giriş Yapın
- https://app.supabase.com
- Projenize giriş yapın

### 2. SQL Editor'ı Açın
- Sol menüden **SQL Editor** sekmesine tıklayın

### 3. Migration Dosyasını Çalıştırın

**Geçici Çözüm için:**
```sql
-- supabase/migrations/disable_rls_temporarily.sql içeriğini kopyalayıp yapıştırın
```

**Kalıcı Çözüm için (Önerilen):**
```sql
-- supabase/migrations/fix_rls_policies.sql içeriğini kopyalayıp yapıştırın
```

### 4. Run Butonuna Tıklayın

### 5. Test Edin
- Admin panelinden banner yüklemeyi deneyin
- Artık RLS hatası almamanız gerekir

## Notlar

- **Geçici çözüm** sadece geliştirme için kullanılmalıdır
- **Kalıcı çözüm** production için uygundur
- Eğer hala hata alıyorsanız, browser console'u kontrol edin
- Supabase Dashboard > Logs bölümünden detaylı hata mesajlarını görebilirsiniz












