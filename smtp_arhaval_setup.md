# arhaval.com Email SMTP Ayarları

## Supabase SMTP Ayarları

### Temel Bilgiler
- **Host**: `mail.arhaval.com` veya `smtp.arhaval.com` (hosting sağlayıcına göre değişir)
- **Port**: `587` (TLS) veya `465` (SSL) veya `25`
- **Username**: `iletisim@arhaval.com` (tam email adresi)
- **Password**: `iletisim@arhaval.com` email'inin şifresi
- **Sender email**: `iletisim@arhaval.com`
- **Sender name**: "CS2 Pick'em" veya "Arhaval"

## Hosting Sağlayıcına Göre SMTP Host

### cPanel kullanıyorsan:
- **Host**: `mail.arhaval.com` veya `smtp.arhaval.com`
- **Port**: `587` (TLS) - Önce bunu dene
- Alternatif: `465` (SSL)
- Alternatif: `25` (standart)

### Farklı hosting sağlayıcıları:
- **Hostinger**: `smtp.hostinger.com`
- **Namecheap**: `mail.privateemail.com` veya `smtp.privateemail.com`
- **GoDaddy**: `smtpout.secureserver.net`
- **Bluehost**: `mail.arhaval.com`
- **SiteGround**: `mail.arhaval.com`

## SMTP Bilgilerini Nereden Bulabilirsin?

### Yöntem 1: cPanel
1. cPanel'e gir
2. **Email Accounts** → `iletisim@arhaval.com` email'ini bul
3. **Connect Devices** veya **Email Client Configuration** tıkla
4. **Manual Settings** → **SMTP** bilgilerini gör

### Yöntem 2: Hosting Destek
1. Hosting sağlayıcının destek ekibine sor:
   - "iletisim@arhaval.com için SMTP ayarları nedir?"
   - SMTP Host, Port, Username, Password bilgilerini iste

### Yöntem 3: Email İstemcisi Ayarları
Eğer Outlook/Thunderbird gibi bir programda bu email'i kullanıyorsan:
1. Email programının ayarlarına bak
2. SMTP ayarlarını oradan al

## Test Adımları

1. **Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**
2. Bilgileri gir:
   - Host: `mail.arhaval.com` (veya hosting sağlayıcının verdiği)
   - Port: `587`
   - Username: `iletisim@arhaval.com`
   - Password: Email şifresi
   - Sender email: `iletisim@arhaval.com`
   - Sender name: "CS2 Pick'em"
3. **Save**
4. Test email gönder

## Önemli Notlar

- **Port 587** en yaygın, önce bunu dene
- Çalışmazsa **465** (SSL) dene
- Hala çalışmazsa **25** dene
- **Username** tam email adresi olmalı: `iletisim@arhaval.com`
- **Password** email hesabının şifresi

## Hata Alırsan

- "Connection refused" → Port yanlış, farklı port dene
- "Authentication failed" → Username/Password yanlış
- "Host not found" → SMTP host yanlış, hosting sağlayıcıya sor






