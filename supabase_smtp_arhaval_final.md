# Supabase SMTP Ayarları - arhaval.com

## Supabase Dashboard → Authentication → Email → SMTP Settings

### Ayarlar:
```
Host: arhaval.com
Port: 465
Username: pickem@arhaval.com
Password: [pickem@arhaval.com email hesabının şifresi]
Sender email: pickem@arhaval.com
Sender name: CS2 Pick'em
```

### Önemli Notlar:
- **Port 465** SSL kullanır (Secure)
- **Host**: `arhaval.com` (giden sunucu)
- **Username**: Tam email adresi `pickem@arhaval.com`
- **Password**: Email hesabının şifresi
- **Authentication**: Evet (IMAP, POP3 ve SMTP requires authentication)

## Adım Adım:

1. **Supabase Dashboard** → **Authentication** → **Email**
2. **SMTP Settings** → **"Set up SMTP"** butonuna tıkla
3. Bilgileri gir:
   - **Host**: `arhaval.com`
   - **Port**: `465`
   - **Username**: `pickem@arhaval.com`
   - **Password**: Email hesabının şifresi
   - **Sender email**: `pickem@arhaval.com`
   - **Sender name**: `CS2 Pick'em` (veya istediğin isim)
4. **Save** butonuna tıkla
5. Test email gönder

## Test:

1. SMTP ayarlarını kaydettikten sonra
2. Test email gönder
3. Email gelirse ayarlar doğru ✅

## Email Onayını Aktif Et:

1. **Authentication** → **Email** → **Authentication**
2. **"Confirm sign up"** toggle'ını **AÇIK** yap (yeşil)
3. **Save**

## Hazır! 🎉

Artık yeni kullanıcılar kayıt olduğunda:
1. `pickem@arhaval.com` adresinden email gönderilecek
2. Kullanıcı email'ine doğrulama linki gelecek
3. Linke tıklayınca hesap aktif olacak






