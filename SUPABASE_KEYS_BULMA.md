# 🔑 Supabase Key'lerini Bulma Rehberi

## 📍 Adım Adım Key'leri Bulma

### 1. Supabase Dashboard'a Git
1. Tarayıcıda https://supabase.com/dashboard adresine git
2. Giriş yap (eğer giriş yapmadıysan)

### 2. Projeni Seç
- Dashboard'da projeni seç (veya yeni proje oluştur)

### 3. Settings Sayfasına Git
- Sol menüden **Settings** (⚙️ Ayarlar) ikonuna tıkla
- Veya direkt: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

### 4. API Sayfasına Git
- Settings menüsünden **API** sekmesine tıkla
- Veya URL: `Settings → API`

---

## 🔍 Key'leri Bulma

### ✅ Project URL (NEXT_PUBLIC_SUPABASE_URL)
**Konum:** API sayfasının en üstünde

```
Project URL
https://xxxxx.supabase.co
```

**Kopyala:** Tüm URL'yi kopyala (https:// ile başlayan)

---

### ✅ anon public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
**Konum:** API sayfasında "Project API keys" bölümünde

```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhc3RkbnphZGt1b2VraWFyenFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3M...
```

**Kopyala:** 
- "Reveal" veya "Show" butonuna tıkla (gizliyse)
- Tüm key'i kopyala (eyJ ile başlayan uzun string)

---

### ⚠️ service_role secret Key (SUPABASE_SERVICE_ROLE_KEY)
**Konum:** Aynı sayfada, "Project API keys" bölümünde

```
service_role secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhc3RkbnphZGt1b2VraWFyenFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcz...
```

**Kopyala:**
- "Reveal" veya "Show" butonuna tıkla (genelde gizlidir)
- Tüm key'i kopyala (eyJ ile başlayan uzun string)
- ⚠️ **ÖNEMLİ:** Bu key çok hassas! Asla paylaşma!

---

## 📝 Görsel Yerleşim

```
┌─────────────────────────────────────┐
│  Supabase Dashboard                 │
│                                     │
│  Settings → API                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Project URL                   │ │
│  │ https://xxxxx.supabase.co     │ │ ← NEXT_PUBLIC_SUPABASE_URL
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Project API keys              │ │
│  │                               │ │
│  │ anon public                   │ │
│  │ [Reveal] eyJhbGci...          │ │ ← NEXT_PUBLIC_SUPABASE_ANON_KEY
│  │                               │ │
│  │ service_role secret           │ │
│  │ [Reveal] eyJhbGci...          │ │ ← SUPABASE_SERVICE_ROLE_KEY
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎯 Hızlı Erişim URL'i

Eğer direkt API sayfasına gitmek istersen:

```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
```

`YOUR_PROJECT_ID` kısmını kendi proje ID'nle değiştir.

---

## ✅ Kontrol Listesi

- [ ] Project URL bulundu ve kopyalandı
- [ ] anon public key bulundu ve kopyalandı
- [ ] service_role secret key bulundu ve kopyalandı
- [ ] Tüm key'ler `.env.local` dosyasına yapıştırıldı
- [ ] Server yeniden başlatıldı

---

## ❓ Key'leri Göremiyorum

### "Reveal" butonu yoksa:
- Key zaten görünür olabilir
- Direkt kopyalayabilirsin

### Key'ler çok uzun görünüyorsa:
- Normal! Key'ler genelde 200-300 karakter uzunluğunda
- Tüm key'i kopyala (baştan sona)

### service_role key'i göremiyorum:
- Bazen gizli olabilir
- "Reveal" veya "Show" butonuna tıkla
- Eğer hala göremiyorsan, proje ayarlarını kontrol et

---

## 🔒 Güvenlik Uyarısı

- ✅ `NEXT_PUBLIC_SUPABASE_URL` → Public, paylaşılabilir
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Public, paylaşılabilir
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` → **GİZLİ!** Asla paylaşma, commit etme!

---

## 📞 Yardım

Eğer hala bulamıyorsan:
1. Supabase Dashboard'da "Settings" → "API" sayfasına git
2. Sayfanın ekran görüntüsünü al
3. Key'lerin nerede olduğunu görebilirsin






