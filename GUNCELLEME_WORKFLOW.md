# 🔄 Güncelleme ve Test Workflow

## 📝 Yeni Değişiklik Yapma

### 1. Yerel Değişiklikler Yap
- Kodunu düzenle
- Dosyaları kaydet

### 2. Test Et (Yerelde)
```bash
# Development server'ı çalıştır
npm run dev

# Tarayıcıda test et: http://localhost:3000
```

### 3. Build Test Et (Opsiyonel ama önerilir)
```bash
# Production build test et
npm run build

# Hata varsa düzelt
```

### 4. Git'e Ekle ve Commit Yap
```bash
# Değişiklikleri ekle
git add .

# Commit yap (açıklayıcı mesaj yaz)
git commit -m "Maç listesi düzeltmesi"
# veya
git commit -m "Profil sayfası iyileştirmesi"
# veya
git commit -m "Bug fix: Login hatası düzeltildi"
```

### 5. GitHub'a Push Yap
```bash
git push
```

### 6. Vercel Otomatik Deploy
- ✅ Vercel otomatik olarak yeni commit'i algılar
- ✅ 2-5 dakika içinde otomatik deploy başlar
- ✅ Vercel Dashboard'da deployment'ı görebilirsin
- ✅ Deploy tamamlandığında site otomatik güncellenir

## 🧪 Test Senaryoları

### Yerel Test (Deploy Öncesi)
1. **Development Server**
   ```bash
   npm run dev
   ```
   - http://localhost:3000 → Test et

2. **Build Test**
   ```bash
   npm run build
   npm start
   ```
   - Production build çalışıyor mu kontrol et

### Canlı Test (Deploy Sonrası)
1. **Vercel Dashboard Kontrolü**
   - Deployments → Son deployment'ı kontrol et
   - Build loglarını incele (hata var mı?)

2. **Site Test**
   - https://pickem-six.vercel.app/ → Aç
   - Değişiklikler görünüyor mu?
   - Hata var mı? (F12 → Console kontrol et)

## 🔄 Hızlı Güncelleme Akışı

```
1. Kod değiştir
   ↓
2. npm run dev → Test et (yerelde)
   ↓
3. git add .
   ↓
4. git commit -m "Açıklama"
   ↓
5. git push
   ↓
6. Vercel otomatik deploy (2-5 dk)
   ↓
7. Site canlıda güncellenmiş! ✅
```

## 🐛 Bug Fix Workflow

### Senaryo: Canlıda Bug Buldun

1. **Yerelde Düzelt**
   ```bash
   # Bug'ı düzelt
   # Test et
   npm run dev
   ```

2. **Hızlı Deploy**
   ```bash
   git add .
   git commit -m "Bug fix: [açıklama]"
   git push
   ```

3. **Vercel Otomatik Deploy**
   - 2-5 dakika içinde düzeltme canlıda!

## 🔙 Rollback (Geri Alma)

Eğer bir güncelleme sorun çıkarırsa:

### Vercel Dashboard'dan
1. Vercel Dashboard → Deployments
2. Eski (çalışan) deployment'ı bul
3. "..." menüsü → "Promote to Production"
4. ✅ Site eski versiyona döner

### Git ile
```bash
# Eski commit'e dön
git revert HEAD
git push
```

## 📊 Best Practices

### Commit Mesajları
- ✅ İyi: `"Profil sayfası avatar düzeltmesi"`
- ✅ İyi: `"Bug fix: Login hatası"`
- ❌ Kötü: `"düzeltme"`
- ❌ Kötü: `"asdf"`

### Test Etme
- ✅ Her değişiklikten önce `npm run dev` ile test et
- ✅ Büyük değişikliklerden önce `npm run build` test et
- ✅ Deploy sonrası canlıda test et

### Güvenlik
- ✅ Environment variables'ı asla commit etme (zaten .gitignore'da)
- ✅ Token'ları asla kodda yazma
- ✅ .env dosyalarını commit etme

## 🚀 Örnek Senaryolar

### Senaryo 1: Küçük Düzeltme
```bash
# 1. Kod değiştir
# 2. Test et
npm run dev

# 3. Commit & Push
git add .
git commit -m "Navbar renk düzeltmesi"
git push

# 4. Vercel otomatik deploy (2-5 dk)
# ✅ Tamamlandı!
```

### Senaryo 2: Büyük Özellik
```bash
# 1. Feature branch oluştur (opsiyonel)
git checkout -b yeni-ozellik

# 2. Kod yaz, test et
npm run dev
npm run build

# 3. Commit & Push
git add .
git commit -m "Yeni özellik: Tahmin geçmişi"
git push

# 4. Vercel otomatik deploy
# ✅ Tamamlandı!
```

---

**Özet:** Kod değiştir → Test et → Git push → Vercel otomatik deploy! 🚀





