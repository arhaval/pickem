# GitHub Token ile Push

## Yöntem 1: Remote URL'e Token Ekle (Önerilen)

```bash
# Remote URL'i token ile güncelle
git remote set-url origin https://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@github.com/arhaval/pickem.git

# Şimdi push yap
git push -u origin main
```

## Yöntem 2: Push Yaparken Token Kullan

```bash
# Normal push komutu
git push -u origin main

# Username sorarsa: GitHub kullanıcı adın (arhaval)
# Password sorarsa: Token'ı yapıştır (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)
```

## Yöntem 3: Git Credential Helper (Kalıcı)

```bash
# Token'ı kaydet (bir daha sormaz)
git config --global credential.helper store

# Push yap (bir kere username ve token gir)
git push -u origin main
```

