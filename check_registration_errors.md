# Kayıt Hatası Kontrol Listesi

## Hata Mesajını Bul

1. **F12** tuşuna bas (Console'u aç)
2. Kayıt olmayı tekrar dene
3. Console'da **"Kayıt hatası detayları:"** mesajını gör
4. Hata mesajını kopyala ve paylaş

## Olası Hatalar ve Çözümleri

### 1. "User already registered"
- **Sorun**: Bu email ile zaten kayıt var
- **Çözüm**: Giriş yapmayı dene veya farklı email kullan

### 2. "Email rate limit exceeded"
- **Sorun**: Çok fazla email gönderildi
- **Çözüm**: Birkaç dakika bekle

### 3. "Database error saving new user"
- **Sorun**: Profil oluşturma hatası
- **Çözüm**: SQL'i çalıştır (`setup_complete_auth.sql`)

### 4. "Invalid email"
- **Sorun**: Email formatı yanlış
- **Çözüm**: Email'i kontrol et

### 5. "Password too weak"
- **Sorun**: Şifre çok zayıf
- **Çözüm**: Daha güçlü şifre kullan (en az 6 karakter)

## Kontrol Et

1. Console'da hata mesajı var mı?
2. Hangi hata mesajını görüyorsun?
3. Email zaten kayıtlı mı? (Giriş yapmayı dene)






