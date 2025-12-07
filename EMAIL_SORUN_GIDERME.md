# Email Sorun Giderme - Localhost vs Production

## 🎯 Durum: Ayarlar Yapıldı Ama Email Gitmiyor

### ✅ İyi Haber: Production'da Genelde Çalışır!

Localhost'ta email gönderimi sınırlı olabilir, ama **production'da (canlıda) genelde çalışır**. Yine de kontrol etmen gereken birkaç şey var:

---

## 🔍 Kontrol Listesi

### 1. SMTP Ayarları Doğru mu?

**Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**

Kontrol et:
- ✅ Host doğru mu? (`mail.arhaval.com` veya `smtp.gmail.com`)
- ✅ Port doğru mu? (`587` veya `465`)
- ✅ Username tam email adresi mi? (`pickem@arhaval.com`)
- ✅ Password doğru mu?
- ✅ **"Test email"** gönderildi mi ve geldi mi?

**Test Email Gönderme:**
1. SMTP Settings sayfasında **"Send test email"** butonuna tıkla
2. Kendi email adresini gir
3. Email gelirse → SMTP ayarları doğru ✅
4. Email gelmezse → SMTP ayarlarını tekrar kontrol et

---

### 2. Email Onayı Açık mı?

**Supabase Dashboard** → **Authentication** → **Email** → **Authentication**

Kontrol et:
- ✅ **"Confirm sign up"** toggle **AÇIK** (yeşil) olmalı
- ✅ **"Enable email confirmations"** aktif olmalı

**Eğer kapalıysa:**
- Toggle'ı aç
- **Save** butonuna tıkla

---

### 3. Redirect URL'ler Doğru mu?

**Supabase Dashboard** → **Authentication** → **URL Configuration**

Kontrol et:

#### Site URL:
```
Production: https://pickem-six.vercel.app (veya kendi domain'in)
Localhost: http://localhost:3000
```

#### Redirect URLs (Email linklerinin gideceği yerler):
```
https://pickem-six.vercel.app/auth/callback
https://pickem-six.vercel.app/auth/reset-password
http://localhost:3000/auth/callback (test için)
```

**Önemli:** Production URL'ini ekle! Email'deki linkler buraya yönlendirecek.

---

### 4. Email Şablonlarında URL Doğru mu?

**Supabase Dashboard** → **Authentication** → **Email Templates**

Her şablonda kontrol et:
- ✅ `{{ .ConfirmationURL }}` kullanılıyor mu?
- ✅ `{{ .SiteURL }}` doğru mu?

**Örnek Şablon:**
```html
<h2>Hoş Geldin!</h2>
<p>Hesabını aktifleştirmek için tıkla:</p>
<a href="{{ .ConfirmationURL }}">Aktifleştir</a>
```

---

## 🚨 Localhost'ta Email Gitmiyor - Normal mi?

### Evet, Normal! 

**Neden?**
- Localhost'ta (`http://localhost:3000`) Supabase email göndermeyi sınırlayabilir
- Bazı SMTP sağlayıcıları localhost'tan gelen istekleri reddeder
- Production URL'leri güvenilir kabul edilir

**Çözüm:**
- ✅ **Production'da test et** - Canlıya alınca çalışır
- ✅ Veya **ngrok** kullan (localhost'u public URL'e çevir)

---

## 🎯 Production'da Test Etme

### Adım 1: Site'i Canlıya Al
- Vercel/Netlify'a deploy et
- Environment variables ekle
- Site çalışıyor mu kontrol et

### Adım 2: Test Kayıt Yap
1. Production URL'inde yeni bir kullanıcı kaydet
2. Email adresini kontrol et
3. Email gelirse → ✅ Çalışıyor!
4. Email gelmezse → Aşağıdaki kontrolleri yap

---

## 🔧 Production'da Email Gitmiyorsa

### 1. SMTP Ayarlarını Tekrar Kontrol Et

**Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**

**Test Email Gönder:**
- Production URL'inden test email gönder
- Email gelirse → SMTP çalışıyor ✅
- Email gelmezse → SMTP ayarları yanlış

### 2. Email Loglarını Kontrol Et

**Supabase Dashboard** → **Logs** → **Auth Logs**

- Email gönderme denemelerini gör
- Hata mesajlarını kontrol et
- "Failed to send email" hatası varsa → SMTP ayarları yanlış

### 3. Spam Klasörünü Kontrol Et

- Email spam'a düşmüş olabilir
- Gmail/Outlook spam klasörünü kontrol et
- Email gelirse → SPF/DKIM kayıtları ekle

### 4. SMTP Port'unu Değiştir

**Port 587 çalışmazsa:**
- Port **465** (SSL) dene
- Port **25** dene

**Supabase Dashboard** → **SMTP Settings** → Port'u değiştir → **Save**

---

## 📧 Email Gönderme Testi (Kod ile)

Production'da test etmek için bir API endpoint oluşturabilirsin:

```typescript
// app/api/test-email/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key gerekli
    )

    // Test email gönder
    const { data, error } = await supabase.auth.admin.sendEmail({
      email: email,
      type: 'signup',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pickem-six.vercel.app'}/auth/callback`
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email gönderildi!' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

**Kullanım:**
```bash
curl -X POST https://pickem-six.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## ✅ Hızlı Kontrol Listesi

- [ ] SMTP ayarları yapıldı ve test email geldi
- [ ] "Confirm sign up" toggle açık
- [ ] Production URL'leri eklendi (Site URL + Redirect URLs)
- [ ] Email şablonlarında `{{ .ConfirmationURL }}` kullanılıyor
- [ ] Production'da test kayıt yapıldı
- [ ] Email geldi (spam klasörü kontrol edildi)
- [ ] Email logları kontrol edildi (hata var mı?)

---

## 🎉 Sonuç

**Localhost'ta email gitmiyorsa:**
- ✅ **Normal** - Production'da çalışır

**Production'da email gitmiyorsa:**
- SMTP ayarlarını kontrol et
- Email loglarını kontrol et
- Spam klasörünü kontrol et
- Port'u değiştir (587 → 465 → 25)

**Genelde:**
- ✅ SMTP ayarları doğruysa → Production'da çalışır
- ✅ Localhost'ta test etmek zor olabilir
- ✅ **Canlıya alınca test et** - En güvenilir yöntem

---

## 📞 Yardım

Hala çalışmıyorsa:
1. **Supabase Logs** → Auth Logs → Hata mesajlarını kontrol et
2. **SMTP Test** → Test email gönder → Email geliyor mu?
3. **Hosting Destek** → SMTP bilgilerini doğrula





