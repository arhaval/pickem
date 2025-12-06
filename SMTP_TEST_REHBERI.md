# SMTP Ayarları ve Test Email Gönderme - Adım Adım

## ✅ 1. Enable Custom SMTP - AÇIK OLMALI!

**Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**

### Kontrol Et:
- ✅ **"Enable custom SMTP"** toggle **AÇIK** (yeşil) olmalı
- ✅ Eğer kapalıysa → Toggle'ı aç → **Save**

**Neden Açık Olmalı?**
- Custom SMTP açık olmazsa → Supabase kendi email servisini kullanır
- Custom SMTP açık olursa → Senin SMTP ayarlarını kullanır (pickem@arhaval.com)

---

## 📧 2. SMTP Ayarlarını Yap

### Adım 1: SMTP Settings Sayfasına Git
1. **Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**
2. **"Enable custom SMTP"** toggle'ını **AÇIK** yap (yeşil)
3. **"Set up SMTP"** veya **"Configure SMTP"** butonuna tıkla

### Adım 2: SMTP Bilgilerini Gir

#### arhaval.com Email İçin:
```
✅ Enable custom SMTP: AÇIK (yeşil)

Host: mail.arhaval.com
      VEYA smtp.arhaval.com
      (hosting sağlayıcına göre değişir)

Port: 587 (TLS) - Önce bunu dene
      VEYA 465 (SSL) - Çalışmazsa bunu dene
      VEYA 25 - Son çare

Username: pickem@arhaval.com
          (tam email adresi)

Password: [pickem@arhaval.com email hesabının şifresi]

Sender email: pickem@arhaval.com

Sender name: CS2 Pick'em
             (veya istediğin isim)
```

#### Gmail İçin:
```
✅ Enable custom SMTP: AÇIK (yeşil)

Host: smtp.gmail.com
Port: 587 (TLS)
Username: hamitkulya3@gmail.com (Gmail adresin)
Password: [App Password - 16 haneli şifre]
          (normal şifre çalışmaz!)
Sender email: hamitkulya3@gmail.com
Sender name: CS2 Pick'em
```

### Adım 3: Kaydet
- Tüm bilgileri girdikten sonra **"Save"** veya **"Update"** butonuna tıkla
- Başarılı mesajı görürsen → Ayarlar kaydedildi ✅

---

## 🧪 3. Test Email Gönderme

### Yöntem 1: Supabase Dashboard'dan (EN KOLAY)

#### Adım 1: SMTP Settings Sayfasında
1. **Supabase Dashboard** → **Authentication** → **Email** → **SMTP Settings**
2. SMTP ayarlarını kaydettikten sonra
3. Sayfanın altında veya üstünde **"Send test email"** veya **"Test SMTP"** butonu olmalı
4. Butona tıkla

#### Adım 2: Email Adresini Gir
- Test email göndermek istediğin email adresini gir
- **"Send"** veya **"Send test email"** butonuna tıkla

#### Adım 3: Email'i Kontrol Et
- Email adresini kontrol et (gelen kutusu + spam klasörü)
- Email gelirse → ✅ SMTP ayarları doğru!
- Email gelmezse → SMTP ayarlarını tekrar kontrol et

---

### Yöntem 2: Authentication → Email → Test Email

Eğer SMTP Settings sayfasında test butonu yoksa:

1. **Supabase Dashboard** → **Authentication** → **Email**
2. **"Send test email"** veya **"Test"** sekmesine git
3. Email adresini gir
4. **"Send"** butonuna tıkla
5. Email'i kontrol et

---

### Yöntem 3: Yeni Kullanıcı Kaydı ile Test

#### Adım 1: Test Kullanıcısı Kaydet
1. Production URL'inde (veya localhost'ta) yeni bir kullanıcı kaydet
2. Gerçek bir email adresi kullan (kendi email'in)
3. Kayıt formunu doldur ve **"Sign up"** butonuna tıkla

#### Adım 2: Email'i Kontrol Et
- Email adresini kontrol et
- **"Confirm your email"** veya **"Verify your email"** başlıklı email gelmeli
- Email gelirse → ✅ SMTP çalışıyor!
- Email gelmezse → SMTP ayarlarını kontrol et

---

### Yöntem 4: API ile Test (Gelişmiş)

Kod ile test email göndermek için:

```typescript
// app/api/test-email/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email gerekli' },
        { status: 400 }
      )
    }

    // Service role key gerekli (admin işlemleri için)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // .env.local'e ekle
    )

    // Test email gönder
    const { data, error } = await supabase.auth.admin.sendEmail({
      email: email,
      type: 'signup', // veya 'invite', 'magiclink', 'recovery'
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pickem-six.vercel.app'}/auth/callback`
      }
    })

    if (error) {
      console.error('Email gönderme hatası:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test email gönderildi!',
      data
    })
  } catch (error: any) {
    console.error('Hata:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

**Kullanım:**
```bash
# Terminal'den
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 🔍 Test Email Gönderme - Görsel Rehber

### Supabase Dashboard'da Test Email Butonu Nerede?

#### Senaryo 1: SMTP Settings Sayfasında
```
Authentication → Email → SMTP Settings
└── [SMTP ayarları formu]
    └── [Save butonu]
        └── [Send test email] ← BURADA
```

#### Senaryo 2: Email Ayarları Ana Sayfasında
```
Authentication → Email
└── [Email ayarları]
    └── [Test] sekmesi ← BURADA
        └── [Send test email] butonu
```

#### Senaryo 3: Test Butonu Yoksa
- SMTP ayarlarını kaydet
- Sayfayı yenile (F5)
- Test butonu görünmeli

---

## ✅ Kontrol Listesi

Test email göndermeden önce:

- [ ] **"Enable custom SMTP"** toggle **AÇIK** (yeşil)
- [ ] SMTP Host doğru (`mail.arhaval.com` veya `smtp.gmail.com`)
- [ ] Port doğru (`587` veya `465`)
- [ ] Username tam email adresi (`pickem@arhaval.com`)
- [ ] Password doğru (Gmail için App Password)
- [ ] Sender email doğru
- [ ] **Save** butonuna tıklandı ve başarılı mesajı görüldü
- [ ] Test email gönderildi
- [ ] Email geldi (gelen kutusu + spam kontrol edildi)

---

## 🚨 Sorun Giderme

### Test Email Gitmiyor?

#### 1. "Enable custom SMTP" Kapalı mı?
- ✅ Toggle'ı **AÇIK** yap
- ✅ **Save** butonuna tıkla

#### 2. SMTP Ayarları Yanlış mı?
- Host'u kontrol et
- Port'u değiştir (587 → 465 → 25)
- Username/Password'u kontrol et

#### 3. Test Butonu Görünmüyor mu?
- Sayfayı yenile (F5)
- SMTP ayarlarını kaydet
- Farklı bir yöntem dene (yeni kullanıcı kaydı)

#### 4. Email Gelmiyor mu?
- Spam klasörünü kontrol et
- Email adresini doğru yazdığından emin ol
- SMTP loglarını kontrol et (Supabase Dashboard → Logs)

---

## 📧 Test Email Örneği

Test email'i başarıyla gönderdiysen, şöyle bir email gelmeli:

```
Konu: Confirm your signup
Gönderen: CS2 Pick'em <pickem@arhaval.com>

Hoş geldin!

Hesabını aktifleştirmek için aşağıdaki linke tıkla:
[Confirm your email] butonu veya link
```

---

## 🎉 Başarılı!

Test email geldiyse:
- ✅ SMTP ayarları doğru
- ✅ Email gönderme çalışıyor
- ✅ Production'da da çalışacak

Artık yeni kullanıcılar kayıt olduğunda email alacaklar!

---

## 📞 Yardım

Hala çalışmıyorsa:
1. **Supabase Logs** → Auth Logs → Hata mesajlarını kontrol et
2. **SMTP Test** → Farklı port dene (587 → 465)
3. **Hosting Destek** → SMTP bilgilerini doğrula




