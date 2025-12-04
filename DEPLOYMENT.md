# 🚀 Arhaval - Deployment Rehberi

## 📋 Ön Hazırlık Checklist

### ✅ Tamamlananlar
- [x] TypeScript hataları düzeltildi
- [x] Admin erişim kontrolü sıkılaştırıldı
- [x] Kritik güvenlik açıkları kapatıldı

### ⚠️ Yapılacaklar (Canlıda)
- [ ] Console.log temizliği (164 adet - performans için)
- [ ] Error monitoring kurulumu (Sentry, LogRocket vb.)
- [ ] Analytics entegrasyonu (Google Analytics, Plausible vb.)

## 🔧 Environment Variables

Production'da şu environment variable'ları ayarlanmalı:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📦 Deployment Seçenekleri

### 1. Vercel (Önerilen) ⭐

**Avantajlar:**
- ⚡ Çok hızlı deploy (2-5 dakika)
- 🔄 Otomatik CI/CD (Git push → deploy)
- 📊 Built-in analytics
- 🔙 Anında rollback
- 💰 Ücretsiz plan yeterli başlangıç için

**Adımlar:**
1. [Vercel.com](https://vercel.com) hesabı oluştur
2. GitHub repo'yu bağla
3. Environment variables'ı ekle
4. Deploy butonuna tıkla
5. ✅ Hazır!

**Hızlı Düzeltme:**
- Git push yap → Otomatik deploy (2-5 dk)
- Vercel Dashboard'dan rollback yapabilirsin

### 2. Netlify

**Avantajlar:**
- ⚡ Hızlı deploy (5-10 dakika)
- 🔄 Otomatik CI/CD
- 💰 Ücretsiz plan

**Adımlar:**
1. [Netlify.com](https://netlify.com) hesabı oluştur
2. GitHub repo'yu bağla
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Environment variables ekle
5. Deploy!

### 3. Kendi Sunucun (VPS/Dedicated)

**Gereksinimler:**
- Node.js 18+
- PM2 veya systemd
- Nginx veya Apache
- SSL sertifikası (Let's Encrypt)

**Adımlar:**
```bash
# 1. Sunucuya bağlan
ssh user@your-server.com

# 2. Repo'yu klonla
git clone your-repo-url
cd pick

# 3. Dependencies yükle
npm install

# 4. Build yap
npm run build

# 5. PM2 ile çalıştır
npm install -g pm2
pm2 start npm --name "arhaval" -- start
pm2 save
pm2 startup

# 6. Nginx reverse proxy kur
# (Nginx config örneği aşağıda)
```

## 🔒 Güvenlik Kontrolleri

### ✅ Yapılanlar
- [x] Admin erişim kontrolü aktif
- [x] Test endpoint'leri production'da kapalı
- [x] Environment variables güvenli

### ⚠️ Yapılacaklar
- [ ] Rate limiting (API routes için)
- [ ] CORS ayarları kontrolü
- [ ] SQL injection koruması (Supabase zaten yapıyor)
- [ ] XSS koruması (React zaten yapıyor)

## 📊 Monitoring & Logging

### Önerilen Araçlar:
1. **Vercel Analytics** (Vercel kullanıyorsan ücretsiz)
2. **Sentry** (Error tracking - ücretsiz plan var)
3. **LogRocket** (Session replay - ücretli)
4. **Google Analytics** (Traffic analizi)

## 🐛 Hızlı Düzeltme Senaryoları

### Senaryo 1: Kritik Bug
1. Git'te hotfix branch oluştur
2. Düzeltmeyi yap
3. Commit & push
4. Vercel otomatik deploy eder (2-5 dk)
5. ✅ Düzeltildi

### Senaryo 2: Rollback Gerekirse
1. Vercel Dashboard → Deployments
2. Eski versiyonu seç
3. "Promote to Production" tıkla
4. ✅ Geri alındı

### Senaryo 3: Database Hatası
1. Supabase Dashboard → SQL Editor
2. Düzeltme SQL'ini çalıştır
3. ✅ Anında düzeltildi (kod değişikliği gerekmez)

## 📝 Post-Deployment Checklist

İlk 24 saat içinde kontrol et:

- [ ] Ana sayfa yükleniyor mu?
- [ ] Giriş/Kayıt çalışıyor mu?
- [ ] Admin paneli erişilebilir mi?
- [ ] Maçlar görüntüleniyor mu?
- [ ] Tahmin yapılabiliyor mu?
- [ ] Profil sayfası çalışıyor mu?
- [ ] Leaderboard görüntüleniyor mu?
- [ ] Mobil görünüm test edildi mi?

## 🚨 Acil Durum Planı

### Site Çöktüyse:
1. Vercel Dashboard'dan son deploy'u kontrol et
2. Rollback yap
3. Hata loglarını incele
4. Düzeltmeyi yap
5. Tekrar deploy et

### Database Sorunu:
1. Supabase Dashboard → Database
2. Connection pool'u kontrol et
3. Query performance'ı incele
4. Gerekirse Supabase support'a ulaş

## 📞 Destek

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Son Güncelleme:** $(date)
**Hazırlayan:** AI Assistant
**Versiyon:** 1.0.0






