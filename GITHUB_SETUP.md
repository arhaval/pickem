# 📦 GitHub'a Yükleme Rehberi

## Durum
❌ Proje şu anda GitHub'da değil. Git repository oluşturulmamış.

## 🚀 GitHub'a Yükleme Adımları

### 1. Git Kurulumu (Eğer yüklü değilse)

Git yüklü değil gibi görünüyor. Önce Git'i yükle:

**Windows için:**
- [Git for Windows](https://git-scm.com/download/win) indir ve yükle
- Veya: `winget install Git.Git` (Windows Package Manager varsa)

### 2. GitHub Repository Oluştur

1. [GitHub.com](https://github.com) → Login
2. Sağ üstteki **"+"** → **"New repository"**
3. Repository adı: `pick` veya `arhaval` (istediğin isim)
4. **Public** veya **Private** seç
5. **"Create repository"** tıkla
6. ⚠️ **"Initialize with README"** seçme! (Boş repo oluştur)

### 3. Projeyi GitHub'a Yükle

Terminal'de (Git yüklendikten sonra) şu komutları çalıştır:

```bash
# 1. Git repository başlat
git init

# 2. Tüm dosyaları ekle
git add .

# 3. İlk commit
git commit -m "Initial commit - Production ready"

# 4. GitHub repo URL'ini ekle (kendi repo URL'in ile değiştir)
git remote add origin https://github.com/KULLANICI_ADIN/pick.git

# 5. GitHub'a yükle
git branch -M main
git push -u origin main
```

**Not:** `KULLANICI_ADIN` yerine kendi GitHub kullanıcı adını yaz.

### 4. Alternatif: GitHub Desktop Kullan

Eğer komut satırı kullanmak istemiyorsan:

1. [GitHub Desktop](https://desktop.github.com) indir
2. File → Add Local Repository → Proje klasörünü seç
3. Publish repository → GitHub'a yükle

## ✅ Kontrol

GitHub'a yüklendikten sonra:
- GitHub.com'da repo'nu görüyor musun? ✅
- Tüm dosyalar orada mı? ✅

## 🚀 Sonraki Adım: Vercel'e Deploy

GitHub'a yüklendikten sonra:

1. [Vercel.com](https://vercel.com) → Login
2. "Add New Project"
3. GitHub repo'nu seç
4. Environment variables ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy! 🎉

---

**Önemli:** Git yüklü değilse önce Git'i yüklemen gerekiyor.





