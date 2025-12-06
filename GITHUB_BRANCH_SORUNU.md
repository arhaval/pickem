# GitHub Branch Sorunu Çözümü

## Hata: "src refspec main does not match any"

Bu hata local'de main branch'inin olmadığı veya commit olmadığı anlamına gelir.

## Kontroller

### 1. Hangi branch'te olduğunu kontrol et:
```bash
git branch
```

### 2. Commit var mı kontrol et:
```bash
git log --oneline
```

### 3. Status kontrol et:
```bash
git status
```

## Çözümler

### Senaryo 1: Master branch'inde isen
```bash
# Master branch'ini main'e çevir
git branch -M main
git push -u origin main
```

### Senaryo 2: Hiç commit yoksa
```bash
# Önce commit yap
git add .
git commit -m "Initial commit - Production ready"
git branch -M main
git push -u origin main
```

### Senaryo 3: Branch ismi farklıysa
```bash
# Hangi branch'te olduğunu gör
git branch

# O branch'i main'e çevir
git branch -M main
git push -u origin main
```





