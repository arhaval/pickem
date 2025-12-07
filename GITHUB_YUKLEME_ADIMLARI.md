# 🚀 GitHub'a Yükleme - Adım Adım

## Seçenek 1: GitHub Desktop (KOLAY - Önerilen) ⭐

### 1. GitHub Desktop İndir
- [desktop.github.com](https://desktop.github.com) → Download
- Kurulumu tamamla

### 2. GitHub'a Bağlan
- GitHub Desktop'u aç
- File → Options → Accounts → GitHub'a login ol

### 3. Repository'yi Yükle
1. File → **"Add Local Repository"**
2. **"Choose..."** tıkla
3. `C:\Users\Casper\Desktop\pick` klasörünü seç
4. **"Add Repository"** tıkla

### 4. GitHub'a Push Yap
1. Sol üstte **"Publish repository"** butonuna tıkla
2. Repository adını kontrol et (GitHub'da oluşturduğun isim)
3. **"Private"** veya **"Public"** seç
4. ✅ **"Publish Repository"** tıkla
5. 🎉 Tamamlandı!

---

## Seçenek 2: Komut Satırı (Git Yüklüyse)

### 1. Git Yükle (Eğer yoksa)
- [git-scm.com/download/win](https://git-scm.com/download/win) → Download
- Kurulumu tamamla
- Terminal'i yeniden başlat

### 2. Terminal'de Şu Komutları Çalıştır

```bash
# 1. Git repository başlat
git init

# 2. Tüm dosyaları ekle
git add .

# 3. İlk commit
git commit -m "Initial commit - Production ready"

# 4. GitHub repo URL'ini ekle (KENDI URL'İN İLE DEĞİŞTİR!)
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADI.git

# 5. GitHub'a yükle
git branch -M main
git push -u origin main
```

**Önemli:** 
- `KULLANICI_ADIN` → GitHub kullanıcı adın
- `REPO_ADI` → GitHub'da oluşturduğun repository adı

---

## ✅ Kontrol

GitHub.com'da repository'ni aç:
- Tüm dosyalar görünüyor mu? ✅
- `package.json`, `app/`, `components/` klasörleri var mı? ✅

---

## 🚀 Sonraki Adım: Vercel'e Deploy

GitHub'a yüklendikten sonra:

1. [vercel.com](https://vercel.com) → Login
2. **"Add New Project"**
3. GitHub repo'nu seç
4. Environment variables ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy** butonuna tıkla
6. 🎉 Site canlıda!

---

**Hangi yöntemi kullanacaksın?** GitHub Desktop daha kolay! 😊






