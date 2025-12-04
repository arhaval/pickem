# SQL Script Çalıştırma Rehberi

## Adım Adım Nasıl Yapılır:

### 1. Supabase Dashboard'a Git
- Tarayıcında https://supabase.com/dashboard adresine git
- Giriş yap (eğer giriş yapmadıysan)
- Projeni seç

### 2. SQL Editor'ü Aç
- Sol menüden **"SQL Editor"** seçeneğine tıkla
- Veya direkt bu linke git: https://supabase.com/dashboard/project/[PROJE_ID]/sql/new

### 3. Scripti Çalıştır
- Yeni bir sorgu penceresi açılacak
- Aşağıdaki SQL kodunu kopyala ve yapıştır:

```sql
-- Profil oluşturma RLS politikalarını düzelt

-- 1. Mevcut politikaları kontrol et ve gerekirse düzelt
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Yeni politikalar
-- 1. Kullanıcılar kendi profilini görebilir
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Herkes public profilleri görebilir (leaderboard için)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 3. Kullanıcılar kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Kullanıcılar kendi profilini oluşturabilir (kayıt sırasında)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 4. Çalıştır
- Sağ alttaki **"Run"** butonuna tıkla
- Veya klavyede **Ctrl + Enter** (Windows) veya **Cmd + Enter** (Mac) tuşlarına bas

### 5. Sonucu Kontrol Et
- Başarılı olursa: "Success. No rows returned" veya benzer bir mesaj göreceksin
- Hata olursa: Kırmızı bir hata mesajı göreceksin, onu bana gönder

## Görsel Rehber:

```
Supabase Dashboard
├── Sol Menü
│   ├── Table Editor
│   ├── Authentication
│   ├── Storage
│   ├── SQL Editor  ← BURAYA TIKLA
│   └── ...
│
SQL Editor Sayfası
├── Sol: Geçmiş sorgular
├── Orta: SQL yazma alanı
│   └── [Buraya SQL kodunu yapıştır]
└── Sağ Alt: "Run" butonu
```

## Alternatif: Dosyadan Yükleme

Eğer dosyayı direkt yüklemek istersen:
1. SQL Editor'de "New query" butonuna tıkla
2. Dosya seçme ikonuna tıkla (varsa)
3. `fix_profile_rls.sql` dosyasını seç
4. Run butonuna tıkla

## Sorun mu var?

Eğer hata alırsan:
1. Hata mesajını tam olarak kopyala
2. Bana gönder
3. Birlikte çözelim






