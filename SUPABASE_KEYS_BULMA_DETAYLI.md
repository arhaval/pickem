# 🔑 Supabase Keys Bulma - Detaylı Rehber

## Adım Adım

### 1. Supabase'e Giriş Yap
- [supabase.com](https://supabase.com) → Login
- Projeni seç (pickem veya proje adın)

### 2. Settings'e Git
- Sol menüden **"Settings"** (⚙️) tıkla
- Alt menüden **"API"** seç

### 3. Project URL'i Bul
- **"Project URL"** bölümünde bir URL göreceksin
- Örnek: `https://xxxxxxxxxxxxx.supabase.co`
- Bu URL'i kopyala
- **Vercel'de:** `NEXT_PUBLIC_SUPABASE_URL` değişkenine yapıştır

### 4. anon/public Key'i Bul
- Aynı sayfada **"Project API keys"** bölümü var
- **"anon"** veya **"public"** yazan key'i bul
- Key'in yanında **"Reveal"** veya **"Copy"** butonu var
- Tıkla ve key'i kopyala
- Uzun bir string olacak, örnek: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Vercel'de:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` değişkenine yapıştır

## 📸 Görsel Yol Haritası

```
Supabase Dashboard
├── Sol Menü
│   └── Settings (⚙️)
│       └── API
│           ├── Project URL ← BURADAN AL
│           └── Project API keys
│               └── anon public ← BURADAN AL
```

## ⚠️ Önemli Notlar

- **anon/public key** → Client-side için (güvenli, public olabilir)
- **service_role key** → Şimdilik gerekmez (admin işlemleri için)
- Key'leri kimseyle paylaşma (özellikle service_role)

## ✅ Kontrol

Vercel'de ekledikten sonra:
- `NEXT_PUBLIC_SUPABASE_URL` → URL formatında olmalı (https://...)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Uzun bir string olmalı (eyJ... ile başlar)






