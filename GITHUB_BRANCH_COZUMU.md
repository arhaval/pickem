# GitHub Branch Hatası Çözümü

## Sorun: "failed to push some refs"

Bu hata genellikle GitHub'da zaten bir branch olduğunda olur.

## Çözüm 1: Force Push (En Hızlı - Repository boşsa güvenli)

```bash
git push -u origin main --force
```

⚠️ **Dikkat:** Bu komut GitHub'daki tüm dosyaları siler ve yerel dosyalarını yükler. Repository boşsa sorun yok.

## Çözüm 2: Önce Pull Sonra Push

```bash
# Önce GitHub'daki değişiklikleri çek
git fetch origin

# Hangi branch'ler var kontrol et
git branch -r

# Eğer origin/main varsa:
git pull origin main --allow-unrelated-histories --no-edit

# Sonra push yap
git push -u origin main
```

## Çözüm 3: Remote Branch'i Kontrol Et

```bash
# Remote branch'leri gör
git ls-remote origin

# Eğer main yoksa master olabilir
git push -u origin main:main
```

