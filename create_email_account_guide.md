# Email Hesabı Oluşturma Rehberi

## cPanel'de Email Hesabı Oluşturma

### Adım 1: cPanel'e Gir
1. Hosting sağlayıcının web sitesine git
2. cPanel'e giriş yap
3. Genelde: `https://tudomain.com/cpanel` veya hosting sağlayıcının verdiği link

### Adım 2: Email Accounts Bölümüne Git
1. cPanel'de **"Email Accounts"** veya **"Email"** bölümünü bul
2. Tıkla

### Adım 3: Yeni Email Hesabı Oluştur
1. **"Create"** veya **"Add Email Account"** butonuna tıkla
2. Bilgileri gir:
   - **Email**: `iletisim@arhaval.com` (veya istediğin isim)
   - **Password**: Güçlü bir şifre oluştur (kaydet!)
   - **Mailbox Quota**: `250 MB` veya `Unlimited` (istediğin kadar)
3. **"Create Account"** veya **"Add Account"** butonuna tıkla

### Adım 4: Email Hesabı Hazır! ✅
Artık `iletisim@arhaval.com` email hesabın var.

## Farklı Hosting Panelleri

### Plesk Panel
1. Plesk'e gir
2. **Mail** → **Mail Accounts**
3. **Create Email Address**
4. Email ve şifre gir
5. **OK**

### DirectAdmin
1. DirectAdmin'e gir
2. **E-Mail Management** → **E-Mail Accounts**
3. **Create Account**
4. Email ve şifre gir
5. **Create**

### Hosting Sağlayıcı Paneli
- Her hosting sağlayıcının kendi paneli olabilir
- Genelde **"Email"** veya **"Mail"** bölümünde email hesabı oluşturabilirsin

## Email Hesabı Oluşturduktan Sonra

### SMTP Bilgileri
Artık Supabase'de kullanabileceğin bilgiler:
- **Host**: `mail.arhaval.com` (genelde)
- **Port**: `587`
- **Username**: `iletisim@arhaval.com`
- **Password**: Oluşturduğun şifre
- **Sender email**: `iletisim@arhaval.com`

### Email İstemcisi Ayarları (Opsiyonel)
cPanel'de email hesabını oluşturduktan sonra:
1. **Email Accounts** → `iletisim@arhaval.com` → **Connect Devices**
2. **Manual Settings** → **SMTP** bilgilerini gör
3. Bu bilgileri Supabase'e gir

## Önemli Notlar

1. **Şifreyi Kaydet**: Email hesabı şifresini mutlaka kaydet, Supabase'de kullanacaksın
2. **Quota**: Email kutusu boyutunu ayarla (çok fazla email gelirse dolabilir)
3. **Test Et**: Email hesabını oluşturduktan sonra test email gönder

## Alternatif: Hosting Destek

Eğer cPanel'e erişimin yoksa veya bulamıyorsan:
1. Hosting sağlayıcının destek ekibine yaz
2. "iletisim@arhaval.com için email hesabı oluşturmak istiyorum" de
3. Onlar oluşturur ve bilgileri verir






