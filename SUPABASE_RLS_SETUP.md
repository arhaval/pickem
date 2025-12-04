# Supabase RLS Politikaları Kurulum Rehberi

Bu dosya, banner yükleme sistemi için gerekli RLS (Row Level Security) politikalarını nasıl kuracağınızı açıklar.

## Hata: "new row violates row-level security policy"

Bu hata, Supabase'de RLS politikalarının ayarlanmamış olmasından kaynaklanır. Aşağıdaki adımları takip ederek sorunu çözebilirsiniz.

## Adım 1: Supabase Dashboard'a Giriş Yapın

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenize giriş yapın

## Adım 2: Storage Bucket Oluşturma

1. Sol menüden **Storage** sekmesine tıklayın
2. **Create a new bucket** butonuna tıklayın
3. Bucket adı: `banners`
4. **Public bucket** seçeneğini işaretleyin (önemli!)
5. **Create bucket** butonuna tıklayın

## Adım 3: Storage RLS Politikalarını Ayarlama

1. **Storage** > **Policies** sekmesine gidin
2. `banners` bucket'ını seçin
3. Aşağıdaki politikaları ekleyin:

### Policy 1: Authenticated users can upload files
- **Policy name**: `Allow authenticated users to upload banners`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'banners'
```

### Policy 2: Authenticated users can read files
- **Policy name**: `Allow authenticated users to read banners`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'banners'
```

### Policy 3: Authenticated users can update files
- **Policy name**: `Allow authenticated users to update banners`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'banners'
```

### Policy 4: Authenticated users can delete files
- **Policy name**: `Allow authenticated users to delete banners`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'banners'
```

## Adım 4: site_settings Tablosu RLS Politikalarını Ayarlama

1. Sol menüden **SQL Editor** sekmesine tıklayın
2. Aşağıdaki SQL kodunu çalıştırın:

```sql
-- Enable RLS on site_settings table
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert site_settings" ON site_settings;

-- Policy: Allow authenticated users to read site_settings
CREATE POLICY "Allow authenticated users to read site_settings"
ON site_settings
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to update site_settings
CREATE POLICY "Allow authenticated users to update site_settings"
ON site_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to insert site_settings
CREATE POLICY "Allow authenticated users to insert site_settings"
ON site_settings
FOR INSERT
TO authenticated
WITH CHECK (true);
```

3. **Run** butonuna tıklayın

## Adım 5: Storage Politikalarını SQL ile Ayarlama (Alternatif)

Eğer Storage politikalarını SQL Editor üzerinden ayarlamak isterseniz:

1. **SQL Editor** sekmesine gidin
2. Aşağıdaki SQL kodunu çalıştırın:

```sql
-- Storage Policy: Allow authenticated users to upload files to banners bucket
CREATE POLICY "Allow authenticated users to upload banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Storage Policy: Allow authenticated users to read banners
CREATE POLICY "Allow authenticated users to read banners"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'banners');

-- Storage Policy: Allow authenticated users to update banners
CREATE POLICY "Allow authenticated users to update banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

-- Storage Policy: Allow authenticated users to delete banners
CREATE POLICY "Allow authenticated users to delete banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'banners');
```

## Notlar

- **Önemli**: `banners` bucket'ının **Public** olarak işaretlenmesi gerekiyor, aksi halde dosyalara erişilemez.
- Tüm politikalar **authenticated** kullanıcılar için geçerlidir. Yani kullanıcının giriş yapmış olması gerekir.
- Eğer daha güvenli bir yapı istiyorsanız, admin kullanıcıları için özel bir role oluşturabilir ve sadece o role izin verebilirsiniz.

## Sorun Giderme

Eğer hala hata alıyorsanız:

1. Kullanıcının giriş yaptığından emin olun
2. Supabase Dashboard'da **Authentication** > **Users** bölümünden kullanıcının aktif olduğunu kontrol edin
3. Browser console'da hata mesajlarını kontrol edin
4. Supabase Dashboard'da **Logs** bölümünden detaylı hata mesajlarını inceleyin








