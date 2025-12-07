# Supabase OAuth Yapılandırma Rehberi

Bu rehber, Google ve Discord ile giriş yapabilmek için Supabase'de OAuth provider'larını nasıl yapılandıracağınızı adım adım açıklar.

---

## 📋 Genel Bakış

1. **Google OAuth** - Google hesabı ile giriş
2. **Discord OAuth** - Discord hesabı ile giriş

Her iki provider için de:
- OAuth uygulaması oluşturmanız gerekiyor
- Client ID ve Secret almanız gerekiyor
- Supabase'e bu bilgileri eklemeniz gerekiyor
- Redirect URL'leri yapılandırmanız gerekiyor

---

## 🔵 1. DISCORD OAuth Yapılandırması

### Adım 1: Discord Developer Portal'a Giriş

1. https://discord.com/developers/applications adresine gidin
2. Discord hesabınızla giriş yapın
3. Sağ üstteki **"New Application"** butonuna tıklayın
4. Uygulama adını girin (örn: "CS2 Pick'em")
5. **"Create"** butonuna tıklayın

### Adım 2: OAuth2 Ayarları

1. Sol menüden **"OAuth2"** → **"General"** seçin
2. **"Redirects"** bölümüne aşağıdaki URL'leri ekleyin:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
   (Production domain'inizi ekleyin)

3. **"Scopes"** bölümünde şunları seçin:
   - ✅ `identify` - Kullanıcı kimliği
   - ✅ `email` - Email adresi

4. **"Save Changes"** butonuna tıklayın

### Adım 3: Client ID ve Secret Alma

1. Aynı **"OAuth2"** → **"General"** sayfasında:
   - **"Client ID"** değerini kopyalayın
   - **"Reset Secret"** butonuna tıklayarak **"Client Secret"** oluşturun ve kopyalayın
   - ⚠️ **Client Secret'i bir daha göremeyeceksiniz, güvenli bir yere kaydedin!**

### Adım 4: Supabase'e Discord Bilgilerini Ekleme

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **"Authentication"** → **"Providers"** seçin
4. **"Discord"** provider'ını bulun ve **"Enable Discord"** toggle'ını açın
5. Şu bilgileri girin:
   - **Client ID (for OAuth)**: Discord'dan kopyaladığınız Client ID
   - **Client Secret (for OAuth)**: Discord'dan kopyaladığınız Client Secret
6. **"Save"** butonuna tıklayın

---

## 🔴 2. GOOGLE OAuth Yapılandırması

### Adım 1: Google Cloud Console'a Giriş

1. https://console.cloud.google.com/ adresine gidin
2. Google hesabınızla giriş yapın
3. Üst kısımdan proje seçin veya **"New Project"** ile yeni proje oluşturun

### Adım 2: OAuth Consent Screen Yapılandırması

1. Sol menüden **"APIs & Services"** → **"OAuth consent screen"** seçin
2. **User Type** seçin:
   - **External** (genel kullanım için) veya **Internal** (sadece kuruluş için)
3. **"Create"** butonuna tıklayın
4. **App information** bölümünü doldurun:
   - **App name**: "CS2 Pick'em" (veya istediğiniz isim)
   - **User support email**: Email adresiniz
   - **Developer contact information**: Email adresiniz
5. **"Save and Continue"** butonuna tıklayın
6. **Scopes** bölümünde:
   - **"Add or Remove Scopes"** butonuna tıklayın
   - Şunları seçin:
     - ✅ `.../auth/userinfo.email` - Email adresi
     - ✅ `.../auth/userinfo.profile` - Profil bilgileri
   - **"Update"** → **"Save and Continue"**
7. **Test users** (External seçtiyseniz):
   - Test için email adresleri ekleyebilirsiniz
   - **"Save and Continue"**
8. **Summary** sayfasında **"Back to Dashboard"** tıklayın

### Adım 3: OAuth 2.0 Client ID Oluşturma

1. Sol menüden **"APIs & Services"** → **"Credentials"** seçin
2. Üstteki **"+ CREATE CREDENTIALS"** → **"OAuth client ID"** seçin
3. **Application type**: **"Web application"** seçin
4. **Name**: "CS2 Pick'em Web Client" (veya istediğiniz isim)
5. **Authorized redirect URIs** bölümüne şunları ekleyin:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
   ⚠️ **ÖNEMLİ**: `[YOUR_PROJECT_REF]` yerine Supabase proje referansınızı yazın!
   - Supabase Dashboard → Settings → API → Project URL'deki referansı kullanın
   - Örnek: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

6. **"Create"** butonuna tıklayın
7. Açılan popup'ta:
   - **"Your Client ID"** değerini kopyalayın
   - **"Your Client Secret"** değerini kopyalayın
   - ⚠️ **Client Secret'i bir daha göremeyeceksiniz, güvenli bir yere kaydedin!**

### Adım 4: Supabase'e Google Bilgilerini Ekleme

1. Supabase Dashboard'a gidin
2. **"Authentication"** → **"Providers"** seçin
3. **"Google"** provider'ını bulun ve **"Enable Google"** toggle'ını açın
4. Şu bilgileri girin:
   - **Client ID (for OAuth)**: Google'dan kopyaladığınız Client ID
   - **Client Secret (for OAuth)**: Google'dan kopyaladığınız Client Secret
5. **"Save"** butonuna tıklayın

---

## 🔧 3. Supabase Redirect URL Yapılandırması

### Adım 1: Site URL ve Redirect URLs

1. Supabase Dashboard → **"Authentication"** → **"URL Configuration"**
2. **"Site URL"** bölümüne production URL'inizi ekleyin:
   ```
   https://yourdomain.com
   ```
   (Development için: `http://localhost:3000`)

3. **"Redirect URLs"** bölümüne şunları ekleyin:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

4. **"Save"** butonuna tıklayın

---

## ✅ 4. Test Etme

### Test Adımları:

1. **Localhost'ta test:**
   - `npm run dev` ile projeyi çalıştırın
   - Giriş modalını açın
   - Google veya Discord butonuna tıklayın
   - OAuth akışının çalıştığını kontrol edin

2. **Hata durumunda:**
   - Browser console'u açın (F12)
   - Network tab'ında OAuth isteklerini kontrol edin
   - Supabase Dashboard → Authentication → Logs'u kontrol edin

---

## 🐛 Yaygın Hatalar ve Çözümleri

### Hata 1: "redirect_uri_mismatch"
**Çözüm:**
- Google Cloud Console'da Redirect URI'leri kontrol edin
- Supabase Redirect URL'lerini kontrol edin
- Her iki yerde de aynı URL'ler olmalı

### Hata 2: "invalid_client"
**Çözüm:**
- Client ID ve Secret'ı kontrol edin
- Supabase'de doğru girildiğinden emin olun
- Boşluk veya fazladan karakter olmamalı

### Hata 3: "access_denied"
**Çözüm:**
- OAuth Consent Screen'de test user ekleyin (External için)
- Scopes'ların doğru seçildiğinden emin olun

### Hata 4: "OAuth provider not enabled"
**Çözüm:**
- Supabase Dashboard'da provider'ın aktif olduğundan emin olun
- Toggle'ın açık (enabled) olduğunu kontrol edin

---

## 📝 Özet Checklist

### Discord:
- [ ] Discord Developer Portal'da uygulama oluşturuldu
- [ ] Redirect URL'ler eklendi
- [ ] Client ID ve Secret alındı
- [ ] Supabase'de Discord provider aktif edildi
- [ ] Client ID ve Secret Supabase'e eklendi

### Google:
- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth Consent Screen yapılandırıldı
- [ ] OAuth 2.0 Client ID oluşturuldu
- [ ] Redirect URI'ler eklendi (Supabase callback dahil)
- [ ] Client ID ve Secret alındı
- [ ] Supabase'de Google provider aktif edildi
- [ ] Client ID ve Secret Supabase'e eklendi

### Genel:
- [ ] Supabase Site URL yapılandırıldı
- [ ] Supabase Redirect URLs eklendi
- [ ] Test edildi ve çalışıyor

---

## 🔗 Hızlı Linkler

- **Discord Developer Portal**: https://discord.com/developers/applications
- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth

---

## 💡 İpuçları

1. **Development için**: `http://localhost:3000` kullanın
2. **Production için**: Gerçek domain URL'inizi kullanın
3. **Client Secret**: Asla public repository'ye commit etmeyin!
4. **Test Users**: Google OAuth için External kullanıyorsanız test user ekleyin
5. **Scopes**: Sadece ihtiyacınız olan scope'ları seçin (güvenlik için)

---

## 🆘 Yardım

Eğer sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Supabase Dashboard → Authentication → Logs'u kontrol edin
3. OAuth provider dashboard'larındaki log'ları kontrol edin
4. Redirect URL'lerin tam olarak eşleştiğinden emin olun













