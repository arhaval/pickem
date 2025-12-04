# 🚀 Canlıya Alma Kontrol Listesi

## ✅ Build Durumu
- [x] Build başarılı (`npm run build` çalışıyor)
- [x] TypeScript hataları yok
- [x] Linter hataları yok

## 🔧 Environment Variables (ZORUNLU)

Deployment platformunda (Vercel/Netlify) şu değişkenleri ayarla:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Bu değişkenler olmadan site çalışmaz!**

## 📦 Deployment Adımları

### Vercel ile Deploy (Önerilen - 5 dakika)

1. **GitHub'a Push Yap**
   ```bash
   git add .
   git commit -m "Production ready"
   git push
   ```

2. **Vercel'e Bağla**
   - [vercel.com](https://vercel.com) → Sign up/Login
   - "Add New Project" → GitHub repo'yu seç
   - Environment Variables ekle:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - "Deploy" butonuna tıkla
   - ✅ 2-5 dakika içinde hazır!

3. **Domain Ayarla (Opsiyonel)**
   - Vercel Dashboard → Settings → Domains
   - Kendi domain'ini ekle

### Netlify ile Deploy

1. **GitHub'a Push Yap**
2. [netlify.com](https://netlify.com) → "New site from Git"
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Environment variables ekle
5. Deploy!

## ✅ Post-Deployment Kontrolleri

Site canlıya alındıktan sonra şunları test et:

- [ ] Ana sayfa yükleniyor mu?
- [ ] Giriş/Kayıt çalışıyor mu?
- [ ] Maçlar görüntüleniyor mu?
- [ ] Tahmin yapılabiliyor mu?
- [ ] Profil sayfası çalışıyor mu?
- [ ] Leaderboard görüntüleniyor mu?
- [ ] Admin paneli erişilebilir mi? (admin kullanıcısı var mı?)
- [ ] Mobil görünüm test edildi mi?

## 🔒 Güvenlik Kontrolleri

- [x] Admin erişim kontrolü aktif
- [x] Environment variables güvenli (public key'ler public olabilir)
- [ ] Rate limiting (opsiyonel - sonra eklenebilir)

## 📊 Sonraki Adımlar (Opsiyonel)

Bu özellikler canlıya aldıktan sonra eklenebilir:

- [ ] Error monitoring (Sentry)
- [ ] Analytics (Google Analytics / Vercel Analytics)
- [ ] Console.log temizliği (performans için)
- [ ] Custom domain SSL sertifikası

## 🚨 Acil Durum

### Site Çalışmıyorsa:
1. Vercel/Netlify dashboard'dan logları kontrol et
2. Environment variables'ın doğru olduğundan emin ol
3. Supabase connection'ı kontrol et

### Database Sorunu:
1. Supabase Dashboard → Database
2. Connection pool kontrolü
3. RLS policies kontrolü

---

**Son Kontrol:** Build başarılı ✅ | Environment variables hazır olmalı ⚠️

