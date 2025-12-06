# 🔐 Admin Giriş Bilgileri

## Yeni Admin Kullanıcısı

**Email:** `yönetici@arhaval.com`  
**Şifre:** `Admin123!`  
**Kullanıcı Adı:** `admin`

---

## Oluşturma Adımları

### Yöntem 1: Otomatik (Önerilen)

1. `Supabase yapılandırması eksik

/test/create-admin` sayfasına git
2. "Admin Kullanıcısı Oluştur" butonuna tıkla
3. Giriş bilgileri ekranda görünecek

### Yöntem 2: Manuel

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add User**
2. Bilgileri gir:
   - Email: `yönetici@arhaval.com`
   - Password: `Admin123!`
   - Auto Confirm Email: ✅
   - User Metadata: `{"username": "admin"}`
3. **Create User**
4. Kullanıcı ID'sini kopyala
5. **SQL Editor**'de `create_admin_alternative.sql` dosyasını çalıştır (ID'yi değiştir)

---

## Giriş Yap

1. `/admin/login` sayfasına git
2. Email: `yönetici@arhaval.com`
3. Şifre: `Admin123!`
4. "Giriş Yap" butonuna tıkla

---

## ⚠️ Güvenlik Uyarısı

- İlk girişten sonra şifreyi mutlaka değiştir!
- Bu bilgileri güvenli bir yerde sakla
- Production'da `/test/create-admin` sayfasını kaldır veya korumalı yap










