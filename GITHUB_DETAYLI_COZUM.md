# GitHub Push Hatası - Detaylı Çözüm

## Kontroller

### 1. Remote URL'i kontrol et
```bash
git remote -v
```

Çıktı şöyle olmalı:
```
origin  https://github.com/arhaval/pickem.git (fetch)
origin  https://github.com/arhaval/pickem.git (push)
```

### 2. Branch'i kontrol et
```bash
git branch
```

### 3. Commit var mı kontrol et
```bash
git log --oneline
```

## Olası Sorunlar ve Çözümler

### Sorun 1: Authentication (En yaygın)
GitHub artık şifre ile push kabul etmiyor. Personal Access Token gerekli.

**Çözüm:**
1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "repo" seç → Generate
3. Token'ı kopyala
4. Push yaparken şifre yerine token'ı kullan

### Sorun 2: Remote yanlış
```bash
# Remote'u sil ve tekrar ekle
git remote remove origin
git remote add origin https://github.com/arhaval/pickem.git
git push -u origin main
```

### Sorun 3: Branch ismi
```bash
# Hangi branch'te olduğunu kontrol et
git branch

# Eğer master ise:
git branch -M main
git push -u origin main
```

### Sorun 4: Commit yok
```bash
# Commit var mı kontrol et
git status

# Eğer commit yoksa:
git add .
git commit -m "Initial commit"
git push -u origin main
```

