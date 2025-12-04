# Production Email Aktivasyonu Kurulumu

## 1. Supabase Email Ayarları

### SMTP Ayarları (Önemli!)
1. **Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**
2. **"Set up SMTP"** butonuna tıkla
3. SMTP bilgilerini gir:
   - **Host**: Email sağlayıcının SMTP sunucusu (örn: smtp.gmail.com, smtp.icloud.com)
   - **Port**: 587 (TLS) veya 465 (SSL)
   - **Username**: Email adresin
   - **Password**: Email şifren veya app password
   - **Sender email**: Gönderen email (doğrulanmış olmalı)
   - **Sender name**: Gönderen isim (örn: "CS2 Pick'em")

### Email Onayını Aktif Et
1. **Authentication** → **Email** → **Authentication** bölümü
2. **"Confirm sign up"** toggle'ını **AÇIK** yap (yeşil)
3. **Save**

### Email Template'lerini Özelleştir (Opsiyonel)
1. **Authentication** → **Email** → **Templates**
2. Email template'lerini düzenle (Türkçe yapabilirsin)

## 2. Email Sağlayıcı Ayarları

### Gmail için:
- SMTP Host: `smtp.gmail.com`
- Port: `587`
- App Password kullan (normal şifre çalışmaz)
- App Password oluştur: Google Account → Security → 2-Step Verification → App Passwords

### iCloud için:
- SMTP Host: `smtp.mail.me.com`
- Port: `587`
- App Password kullan

### Diğer sağlayıcılar:
- Kendi SMTP ayarlarını kullan

## 3. Test

1. Yeni kullanıcı kaydı oluştur
2. Email'ine doğrulama linki gelmeli
3. Linke tıkla
4. Hesap aktif olmalı
5. Giriş yapabilmeli






