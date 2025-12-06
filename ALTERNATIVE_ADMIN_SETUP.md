# 🔧 Alternatif Admin Kurulumu (Key'ler Olmadan)

Eğer Supabase Dashboard'da "Project API keys" bölümünü bulamıyorsan, manuel olarak admin kullanıcısı oluşturabiliriz.

---

## ✅ Yöntem 1: Supabase Dashboard'dan Direkt Kullanıcı Oluştur

### Adım 1: Authentication → Users
1. Supabase Dashboard → **Authentication** (sol menüden)
2. **Users** sekmesine tıkla
3. **Add User** veya **Create User** butonuna tıkla

### Adım 2: Admin Kullanıcısı Oluştur
- **Email**: `yönetici@arhaval.com`
- **Password**: `Admin123!`
- **Auto Confirm Email**: ✅ (işaretle - önemli!)
- **User Metadata**: 
  ```json
  {
    "username": "admin"
  }
  ```
- **Create User** butonuna tıkla

### Adım 3: Kullanıcı ID'sini Kopyala
- Oluşturulan kullanıcının **UUID**'sini kopyala (tıklayınca görünür)

### Adım 4: SQL Editor'de Admin Yetkisi Ver
1. Supabase Dashboard → **SQL Editor**
2. Aşağıdaki SQL'i çalıştır (KULLANICI_ID_BURAYA kısmını değiştir):

```sql
-- Profil varsa admin yap
UPDATE public.profiles
SET is_admin = true,
    username = COALESCE(username, 'admin'),
    updated_at = NOW()
WHERE id = 'KULLANICI_ID_BURAYA';

-- Eğer profil yoksa oluştur
INSERT INTO public.profiles (
  id,
  username,
  is_admin,
  total_points,
  created_at,
  updated_at
)
SELECT 
  'KULLANICI_ID_BURAYA',
  'admin',
  true,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = 'KULLANICI_ID_BURAYA'
);

-- Kontrol et
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'yönetici@arhaval.com';
```

### Adım 5: Giriş Yap
1. `/admin/login` sayfasına git
2. Email: `yönetici@arhaval.com`
3. Şifre: `Admin123!`

---

## ✅ Yöntem 2: Mevcut Kullanıcıyı Admin Yap

Eğer zaten bir kullanıcın varsa:

### Adım 1: Kullanıcı ID'sini Bul
1. Supabase Dashboard → **Authentication** → **Users**
2. Kullanıcını bul
3. ID'sini kopyala (UUID)

### Adım 2: SQL ile Admin Yap
1. **SQL Editor**'e git
2. Aşağıdaki SQL'i çalıştır:

```sql
-- Kullanıcı ID'sini değiştir
UPDATE public.profiles
SET is_admin = true,
    updated_at = NOW()
WHERE id = 'KULLANICI_ID_BURAYA';

-- Kontrol et
SELECT id, username, email, is_admin 
FROM public.profiles 
WHERE id = 'KULLANICI_ID_BURAYA';
```

---

## ✅ Yöntem 3: Email ile Admin Yap

Eğer email adresini biliyorsan:

```sql
-- Email adresini değiştir
UPDATE public.profiles
SET is_admin = true,
    updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'SENIN_EMAIL_BURAYA'
);

-- Kontrol et
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'SENIN_EMAIL_BURAYA';
```

---

## 🎯 Hangi Yöntemi Seçmeliyim?

- **Yöntem 1**: Yeni admin kullanıcısı oluşturmak istiyorsan
- **Yöntem 2**: Mevcut kullanıcını admin yapmak istiyorsan
- **Yöntem 3**: Email adresini biliyorsan (en kolay)

---

## ❓ Hala Sorun mu Var?

Eğer SQL çalıştıramıyorsan veya hata alıyorsan:
1. SQL Editor'de hata mesajını kontrol et
2. Kullanıcı ID'sinin doğru olduğundan emin ol
3. Profil tablosunda kayıt olduğundan emin ol










