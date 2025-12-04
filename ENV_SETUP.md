# 🔧 Environment Variables Kurulumu

## Sorun: "Supabase yapılandırması eksik" hatası

Bu hata, `.env.local` dosyasının eksik veya yanlış yapılandırılmış olduğunu gösterir.

---

## ✅ Çözüm: .env.local Dosyası Oluştur

### Adım 1: Supabase Dashboard'dan Key'leri Al

1. **Supabase Dashboard**'a git: https://supabase.com/dashboard
2. Projeni seç
3. **Settings** (⚙️ Sol menüden) → **API** sekmesine tıkla
4. Şu bilgileri kopyala:

   **a) Project URL:**
   - Sayfanın en üstünde "Project URL" yazıyor
   - Örnek: `https://xxxxx.supabase.co`
   - Bu → `NEXT_PUBLIC_SUPABASE_URL`

   **b) anon public Key:**
   - "Project API keys" bölümünde
   - "anon public" yazıyor
   - Yanında "Reveal" veya "Show" butonu varsa tıkla
   - Uzun bir key görünecek (eyJ ile başlar)
   - Bu → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **c) service_role secret Key:**
   - Aynı bölümde "service_role secret" yazıyor
   - Yanında "Reveal" veya "Show" butonu varsa tıkla
   - Uzun bir key görünecek (eyJ ile başlar)
   - Bu → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Önemli: Bu gizli key!)
   
   **Detaylı rehber için:** `SUPABASE_KEYS_BULMA.md` dosyasına bak

### Adım 2: .env.local Dosyası Oluştur

1. Proje klasöründe (pick klasöründe) `.env.local` dosyası oluştur
2. Aşağıdaki içeriği yapıştır ve değerleri doldur:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Adım 3: Dosyayı Kaydet

- Dosya adı: `.env.local` (nokta ile başlamalı!)
- Konum: Proje kök dizini (`C:\Users\Casper\Desktop\pick\.env.local`)

### Adım 4: Development Server'ı Yeniden Başlat

1. Terminal'de `Ctrl+C` ile server'ı durdur
2. Tekrar başlat: `npm run dev`
3. Sayfayı yenile (F5)

---

## 📝 Örnek .env.local Dosyası

```env
NEXT_PUBLIC_SUPABASE_URL=https://gastdnzadkuoekiarzqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhc3RkbnphZGt1b2VraWFyenFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3M...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhc3RkbnphZGt1b2VraWFyenFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcz...
```

---

## ⚠️ Önemli Notlar

1. **SUPABASE_SERVICE_ROLE_KEY** çok hassas bir key! 
   - Asla public repository'ye commit etme
   - `.gitignore` dosyasında `.env*` zaten var, bu yüzden otomatik ignore edilir

2. **Dosya adı önemli:**
   - `.env.local` (nokta ile başlamalı)
   - `.env` değil
   - `.env.local.txt` değil

3. **Server'ı yeniden başlat:**
   - Environment variable'lar değiştiğinde server'ı yeniden başlatmak gerekir

---

## 🔍 Kontrol Et

Environment variable'ların yüklendiğini kontrol etmek için:

1. Terminal'de: `echo %NEXT_PUBLIC_SUPABASE_URL%` (Windows)
2. Veya browser console'da: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

---

## ❓ Hala Çalışmıyor mu?

1. ✅ Dosya adının `.env.local` olduğundan emin ol
2. ✅ Dosyanın proje kök dizininde olduğundan emin ol
3. ✅ Server'ı yeniden başlattığından emin ol
4. ✅ Key'lerin doğru kopyalandığından emin ol (boşluk, satır sonu yok)

