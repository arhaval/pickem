# 🔐 Admin Paneli Erişim Rehberi

## ✅ 1. Buradan Devam Et (Doğru!)

Evet, local development ortamından devam edeceksin:
- Kod değiştir → Test et → Git push → Vercel otomatik deploy

## 🔑 2. Admin Paneli Erişimi

### Admin Paneli URL'leri:
- **Canlı Site:** https://pickem-six.vercel.app/admin/login
- **Local:** http://localhost:3000/admin/login

### Admin Oluşturma (İlk Kez)

#### Yöntem 1: Supabase Dashboard'dan (Önerilen)

1. **Supabase Dashboard'a Git**
   - [supabase.com](https://supabase.com) → Projeni seç
   - **Authentication** → **Users** → **Add User**

2. **Kullanıcı Oluştur**
   - **Email:** `admin@arhaval.com` (veya istediğin email)
   - **Password:** Güçlü bir şifre (örn: `Admin123!`)
   - **Auto Confirm Email:** ✅ (ÖNEMLİ! İşaretle)
   - **Create User**

3. **Kullanıcı ID'sini Kopyala**
   - Oluşturulan kullanıcının **ID**'sini kopyala (UUID formatında)

4. **SQL Editor'de Admin Yetkisi Ver**
   - Supabase Dashboard → **SQL Editor**
   - Aşağıdaki SQL'i çalıştır (KULLANICI_ID_BURAYA kısmını yukarıdaki ID ile değiştir):

```sql
-- Profil var mı kontrol et ve admin yap
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
```

5. **Kontrol Et**
```sql
SELECT 
  p.id, 
  p.username, 
  p.is_admin, 
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@arhaval.com';
```

**Beklenen:** `is_admin = true` olmalı

### Admin Paneline Giriş

1. **Admin Login Sayfasına Git**
   - Canlı: https://pickem-six.vercel.app/admin/login
   - Local: http://localhost:3000/admin/login

2. **Giriş Yap**
   - **Email:** Oluşturduğun admin email'i
   - **Password:** Belirlediğin şifre
   - **Sign In** butonuna tıkla

3. **Admin Paneline Yönlendirileceksin**
   - Başarılı giriş sonrası `/admin` sayfasına yönlendirilirsin
   - Sol menüden tüm admin özelliklerine erişebilirsin

## 📋 Admin Panel Özellikleri

- **Genel Bakış** - Dashboard istatistikleri
- **Sezon Yönetimi** - Sezonlar oluştur/düzenle
- **Fikstür ve Sonuçlar** - Maç ekle/düzenle/sonuç gir
- **Maçlar Sayfası** - Maç görünürlük ayarları
- **Canlı Yayın Kumandası** - Canlı yayın yönetimi
- **Takım Bankası** - Takımları yönet
- **Türk Takımları Sıralaması** - Türk takımları sıralaması
- **Kullanıcı Yönetimi** - Kullanıcıları görüntüle/yönet
- **Site Ayarları** - Site genel ayarları
- **Ana Sayfa Videoları** - Video yönetimi
- **PICK EM Maç Seçimi** - Ana sayfa maç seçimi

## 🧪 Test Et

### Local'de Test:
```bash
# Development server başlat
npm run dev

# Tarayıcıda aç
http://localhost:3000/admin/login
```

### Canlıda Test:
- https://pickem-six.vercel.app/admin/login

## ⚠️ Sorun Giderme

### "Email veya şifre hatalı"
- ✅ Email'in doğru olduğundan emin ol
- ✅ Şifrenin doğru olduğundan emin ol
- ✅ Kullanıcının `email_confirmed_at` değerinin null olmadığından emin ol (Auto Confirm işaretli olmalı)

### "Bu hesap admin yetkisine sahip değil"
- ✅ SQL ile `is_admin = true` olduğundan emin ol
- ✅ Profil tablosunda kayıt olduğundan emin ol

### "Profil bulunamadı"
- ✅ Yukarıdaki SQL'i çalıştırarak profil oluştur

---

**Özet:** Supabase'de admin kullanıcı oluştur → SQL ile admin yetkisi ver → `/admin/login` sayfasından giriş yap! 🚀






