# 📝 Günlük Kullanım Rehberi

## ✅ Artık Her Şey Hazır!

Şu anki durum:
- ✅ GitHub'a yüklendi
- ✅ Vercel'de canlıda
- ✅ Environment variables eklendi
- ✅ Admin hesabı hazır
- ✅ Site çalışıyor

## 💻 Bilgisayarı Açtığında Ne Yapacaksın?

### Sadece 3 Adım:

#### 1. Proje Klasörüne Git
```bash
cd C:\Users\Casper\Desktop\pick
```

#### 2. Development Server Başlat (İstersen)
```bash
npm run dev
```
- Sadece local'de test etmek istersen
- http://localhost:3000 → Test et

#### 3. Kod Değiştir ve Push Yap
```bash
# Kodunu değiştir
# Sonra:
git add .
git commit -m "Açıklayıcı mesaj"
git push
```

**Vercel otomatik deploy yapar!** ✅

---

## 🔄 Normal Workflow (Her Gün)

### Senaryo 1: Küçük Değişiklik
```bash
# 1. Kod değiştir
# 2. Test et (opsiyonel)
npm run dev

# 3. Push yap
git add .
git commit -m "Navbar renk düzeltmesi"
git push

# ✅ Vercel otomatik deploy (2-5 dk)
```

### Senaryo 2: Sadece Canlıda Test
- https://pickem-six.vercel.app/ → Direkt test et
- Kod değiştirmeden test yapabilirsin

---

## 🚀 Hızlı Komutlar

### Proje Klasörüne Git
```bash
cd C:\Users\Casper\Desktop\pick
```

### Local Test
```bash
npm run dev
```

### Değişiklikleri Yükle
```bash
git add .
git commit -m "Açıklama"
git push
```

---

## 📋 Önemli Bilgiler

### GitHub Repository
- URL: https://github.com/arhaval/pickem
- Her `git push` sonrası otomatik deploy

### Vercel (Canlı Site)
- URL: https://pickem-six.vercel.app/
- Otomatik deploy aktif
- Environment variables hazır

### Admin Paneli
- URL: https://pickem-six.vercel.app/admin/login
- Hesabın hazır

### Supabase
- Dashboard: https://supabase.com/dashboard
- Database, Authentication, Storage yönetimi

---

## ⚡ Hızlı Referans

| İşlem | Komut |
|-------|-------|
| Local test | `npm run dev` |
| Build test | `npm run build` |
| Değişiklik yükle | `git add . && git commit -m "mesaj" && git push` |
| Proje klasörü | `cd C:\Users\Casper\Desktop\pick` |

---

## 🎯 Özet

**Bilgisayarı açtığında:**
1. ✅ Proje klasörüne git
2. ✅ Kod değiştir
3. ✅ `git push` yap
4. ✅ Vercel otomatik deploy!

**Artık uzun kurulum yok, sadece geliştirme!** 🚀






