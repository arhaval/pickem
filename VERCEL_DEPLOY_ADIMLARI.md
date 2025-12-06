# 🚀 Vercel'e Deploy Adımları

## ✅ Tamamlananlar
- [x] Proje GitHub'a yüklendi: https://github.com/arhaval/pickem

## 📦 Vercel'e Deploy (5 dakika)

### 1. Vercel Hesabı Oluştur
- [vercel.com](https://vercel.com) → Sign up
- "Continue with GitHub" ile GitHub hesabınla giriş yap

### 2. Yeni Proje Ekle
1. Dashboard'da **"Add New Project"** butonuna tıkla
2. GitHub repository'lerinden **"pickem"** seç
3. **"Import"** butonuna tıkla

### 3. Proje Ayarları
- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `./` (değiştirme)
- **Build Command:** `npm run build` (otomatik)
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install` (otomatik)

### 4. Environment Variables Ekle (ÇOK ÖNEMLİ!)

**"Environment Variables"** bölümüne şunları ekle:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Nereden bulacaksın:**
- Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon/public key

### 5. Deploy!
- **"Deploy"** butonuna tıkla
- ⏳ 2-5 dakika bekle
- ✅ Site canlıda!

## 🌐 Domain Ayarlama (Opsiyonel)

### Vercel Domain
- Vercel otomatik bir domain verir: `pickem.vercel.app`
- Bu domain'i kullanabilirsin

### Custom Domain (İstersen)
1. Vercel Dashboard → Settings → Domains
2. Kendi domain'ini ekle
3. DNS ayarlarını yap (Vercel talimatları verir)

## ✅ Post-Deployment Kontrolleri

Site canlıya alındıktan sonra test et:

- [ ] Ana sayfa yükleniyor mu?
- [ ] Giriş/Kayıt çalışıyor mu?
- [ ] Maçlar görüntüleniyor mu?
- [ ] Tahmin yapılabiliyor mu?
- [ ] Profil sayfası çalışıyor mu?
- [ ] Leaderboard görüntüleniyor mu?
- [ ] Mobil görünüm test edildi mi?

## 🔧 Sorun Giderme

### Site çalışmıyorsa:
1. Vercel Dashboard → Deployments → Son deployment'ı kontrol et
2. Logs'a bak (hata var mı?)
3. Environment variables doğru mu kontrol et

### Environment Variables hatası:
- Supabase URL ve Key'lerin doğru olduğundan emin ol
- Vercel'de "Redeploy" yap

---

**Sonraki Adım:** Vercel'e giriş yap ve projeyi deploy et! 🚀





