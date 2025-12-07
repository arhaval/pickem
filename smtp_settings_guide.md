# SMTP Ayarları Rehberi

## Email Sağlayıcılarına Göre SMTP Ayarları

### Gmail
- **Host**: `smtp.gmail.com`
- **Port**: `587` (TLS) veya `465` (SSL)
- **Username**: Gmail adresin (örn: `hamitkulya3@gmail.com`)
- **Password**: **App Password** (normal şifre çalışmaz!)
- **Sender email**: Gmail adresin
- **Sender name**: "CS2 Pick'em" (istediğin isim)

**App Password Nasıl Alınır:**
1. Google Account → Security
2. 2-Step Verification açık olmalı
3. App Passwords → Select app → Mail → Generate
4. Oluşan 16 haneli şifreyi kopyala (SMTP password olarak kullan)

### iCloud Mail
- **Host**: `smtp.mail.me.com`
- **Port**: `587` (TLS)
- **Username**: iCloud email adresin (örn: `hamitkulya3@icloud.com`)
- **Password**: **App-Specific Password** (normal şifre çalışmaz!)
- **Sender email**: iCloud email adresin
- **Sender name**: "CS2 Pick'em"

**App-Specific Password Nasıl Alınır:**
1. appleid.apple.com → Sign-In and Security
2. App-Specific Passwords → Generate
3. Oluşan şifreyi kopyala

### Outlook / Hotmail
- **Host**: `smtp-mail.outlook.com`
- **Port**: `587` (TLS)
- **Username**: Outlook email adresin
- **Password**: Outlook şifren
- **Sender email**: Outlook email adresin

### Yahoo Mail
- **Host**: `smtp.mail.yahoo.com`
- **Port**: `587` (TLS) veya `465` (SSL)
- **Username**: Yahoo email adresin
- **Password**: Yahoo şifren (veya App Password)
- **Sender email**: Yahoo email adresin

### Custom Domain Email (cPanel, etc.)
Eğer kendi domain'in üzerinden email kullanıyorsan:
- **Host**: Hosting sağlayıcının SMTP sunucusu (örn: `mail.tudomain.com` veya `smtp.tudomain.com`)
- **Port**: `587` (TLS) veya `465` (SSL)
- **Username**: Tam email adresin (örn: `noreply@tudomain.com`)
- **Password**: Email şifren
- **Sender email**: Email adresin

**Hosting sağlayıcından SMTP bilgilerini al:**
- cPanel → Email Accounts → Email Client Configuration
- Veya hosting destek ekibine sor

## Önemli Notlar

1. **App Password Kullan**: Gmail ve iCloud için normal şifre çalışmaz, mutlaka App Password kullan
2. **Port Seçimi**: 
   - `587` (TLS/STARTTLS) - Önerilen
   - `465` (SSL) - Alternatif
3. **Sender Email**: Gönderen email adresi, doğrulanmış olmalı
4. **Test Et**: Ayarları yaptıktan sonra test email gönder

## Test

SMTP ayarlarını yaptıktan sonra:
1. Supabase Dashboard → Authentication → Email
2. Test email gönder
3. Email gelirse ayarlar doğru ✅











