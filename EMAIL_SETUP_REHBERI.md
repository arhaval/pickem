# Üyelere Email Gönderme - Adım Adım Rehber

## 🎯 Ne Yapman Gerekiyor?

Supabase'de SMTP ayarlarını yaparak, üyelere otomatik email gönderebilirsin:
- ✅ Kayıt olma email'i (doğrulama linki)
- ✅ Şifre sıfırlama email'i
- ✅ Hoş geldin email'i
- ✅ Bildirim email'leri

---

## 📋 Adım 1: Email Hesabı Hazırla

### Seçenek 1: arhaval.com Email Kullan (Önerilen)
- **Email**: `pickem@arhaval.com` (veya `iletisim@arhaval.com`)
- **Şifre**: Email hesabının şifresi
- **SMTP Host**: `mail.arhaval.com` veya `smtp.arhaval.com` (hosting sağlayıcına göre değişir)

### Seçenek 2: Gmail Kullan
- **Email**: Gmail adresin (örn: `hamitkulya3@gmail.com`)
- **Şifre**: **App Password** (normal şifre çalışmaz!)
- **SMTP Host**: `smtp.gmail.com`

**Gmail App Password Nasıl Alınır:**
1. Google Account → Security
2. 2-Step Verification açık olmalı
3. App Passwords → Select app → Mail → Generate
4. Oluşan 16 haneli şifreyi kopyala

---

## 🔧 Adım 2: Supabase SMTP Ayarları

### 1. Supabase Dashboard'a Git
- [Supabase Dashboard](https://app.supabase.com) → Projeni seç

### 2. Authentication → Email → SMTP Settings
- Sol menüden **Authentication** → **Email** → **SMTP Settings**
- **"Set up SMTP"** veya **"Configure SMTP"** butonuna tıkla

### 3. SMTP Bilgilerini Gir

#### arhaval.com Email İçin:
```
Host: mail.arhaval.com (veya smtp.arhaval.com)
Port: 587 (TLS) - Önce bunu dene
      VEYA 465 (SSL) - Çalışmazsa bunu dene
      VEYA 25 - Son çare
Username: pickem@arhaval.com (tam email adresi)
Password: [Email hesabının şifresi]
Sender email: pickem@arhaval.com
Sender name: CS2 Pick'em (veya istediğin isim)
```

#### Gmail İçin:
```
Host: smtp.gmail.com
Port: 587 (TLS)
Username: hamitkulya3@gmail.com (Gmail adresin)
Password: [App Password - 16 haneli şifre]
Sender email: hamitkulya3@gmail.com
Sender name: CS2 Pick'em
```

### 4. Kaydet ve Test Et
- **Save** butonuna tıkla
- Test email gönder
- Email gelirse ayarlar doğru ✅

---

## ✅ Adım 3: Email Onayını Aktif Et

### Yeni Üyeler İçin Email Doğrulama:
1. **Authentication** → **Email** → **Authentication**
2. **"Confirm sign up"** toggle'ını **AÇIK** yap (yeşil)
3. **Save**

**Bu ayar açık olursa:**
- Yeni kullanıcılar kayıt olduğunda email'lerine doğrulama linki gönderilir
- Linke tıklayınca hesap aktif olur

---

## 🎨 Adım 4: Email Şablonlarını Özelleştir (Opsiyonel)

### Email Şablonlarını Düzenle:
1. **Authentication** → **Email Templates**
2. Şablonları düzenle:
   - **Confirm signup** - Kayıt doğrulama email'i
   - **Magic Link** - Magic link email'i
   - **Change Email Address** - Email değiştirme
   - **Reset Password** - Şifre sıfırlama

### Örnek Şablon:
```html
<h2>Hoş Geldin {{ .Email }}!</h2>
<p>CS2 Pick'em'e kayıt olduğun için teşekkürler.</p>
<p>Hesabını aktifleştirmek için aşağıdaki linke tıkla:</p>
<a href="{{ .ConfirmationURL }}">Hesabı Aktifleştir</a>
```

---

## 🚨 Sorun Giderme

### Email Gönderilmiyor?

#### 1. Port Sorunu
- **Port 587** çalışmazsa → **465** (SSL) dene
- Hala çalışmazsa → **25** dene

#### 2. Host Sorunu
- **"Connection refused"** hatası → SMTP host yanlış
- Hosting sağlayıcına sor: "SMTP host nedir?"
- cPanel → Email Accounts → Email Client Configuration

#### 3. Authentication Sorunu
- **"Authentication failed"** hatası → Username/Password yanlış
- Gmail kullanıyorsan → **App Password** kullandığından emin ol
- Normal şifre çalışmaz!

#### 4. Email Gidiyor Ama Spam'a Düşüyor
- **SPF/DKIM** kayıtlarını kontrol et
- Domain'in DNS ayarlarına SPF kaydı ekle
- Hosting sağlayıcından yardım al

---

## 📧 Test Email Gönderme

### Supabase Dashboard'dan:
1. **Authentication** → **Email** → **SMTP Settings**
2. **"Send test email"** butonuna tıkla
3. Email adresini gir
4. Test email'i gönder

### Kod ile Test (Opsiyonel):
```typescript
// app/api/test-email/route.ts
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.sendEmail({
    email: 'test@example.com',
    type: 'signup',
    options: {
      emailRedirectTo: 'https://arhaval.com/auth/callback'
    }
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, data })
}
```

---

## ✅ Kontrol Listesi

- [ ] Email hesabı hazır (pickem@arhaval.com veya Gmail)
- [ ] SMTP ayarları Supabase'de yapıldı
- [ ] Test email gönderildi ve geldi
- [ ] "Confirm sign up" toggle açık
- [ ] Email şablonları özelleştirildi (opsiyonel)

---

## 🎉 Hazır!

Artık:
- ✅ Yeni kullanıcılar kayıt olduğunda email alacak
- ✅ Şifre sıfırlama email'leri gönderilecek
- ✅ Doğrulama linkleri çalışacak

---

## 📞 Yardım Gerekirse

1. **Hosting Sağlayıcı Destek**: SMTP bilgilerini sor
2. **Supabase Dokümantasyon**: https://supabase.com/docs/guides/auth/auth-smtp
3. **Email Test Araçları**: https://www.mail-tester.com (spam testi için)




