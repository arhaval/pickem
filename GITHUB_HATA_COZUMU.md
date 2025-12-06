# GitHub Push Hatası Çözümü

## Hata: "failed to push some refs"

Bu hata genellikle GitHub'da repository oluştururken "Initialize with README" seçildiğinde olur.

## Çözüm 1: Pull yapıp merge et (Önerilen)

```bash
# GitHub'daki değişiklikleri çek
git pull origin main --allow-unrelated-histories

# Merge commit mesajı çıkarsa kaydet (vim açılırsa :wq yazıp Enter)
# Sonra tekrar push yap
git push -u origin main
```

## Çözüm 2: Force push (Dikkatli kullan!)

Eğer GitHub'daki dosyaları silmek istiyorsan (README vb.):

```bash
git push -u origin main --force
```

⚠️ **Dikkat:** Bu komut GitHub'daki tüm dosyaları siler ve yerel dosyalarını yükler.

## Çözüm 3: Remote'u kontrol et

```bash
# Remote URL'i kontrol et
git remote -v

# Eğer yanlışsa düzelt
git remote set-url origin https://github.com/arhaval/pickem.git
```





