# ✅ Site Canlıda - Kontrol Listesi

## 🎉 Site Canlıda!
- URL: https://pickem-six.vercel.app/

## ⚠️ "Yükleniyor..." Sorunu

Eğer site sadece "Yükleniyor..." gösteriyorsa:

### 1. Environment Variables Kontrolü
- Vercel Dashboard → Settings → Environment Variables
- Şu iki değişken var mı kontrol et:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Eğer Yoksa Ekle
- Settings → Environment Variables → Add New
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://gastdnzadkuoekiarzqr.supabase.co`
- Save

- Add New
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhc3RkbnphZGt1b2VraWFyenFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDAxNDQsImV4cCI6MjA3OTQ3NjE0NH0.T2MSGCxtPSreusHasUzA16bJsGlKLjp9b4WYv0LP8WM`
- Save

### 3. Redeploy Yap
- Deployments → Son deployment → ... → Redeploy
- Veya yeni bir commit push et

## ✅ Site Çalışıyorsa Test Et

- [ ] Ana sayfa yükleniyor mu?
- [ ] Giriş/Kayıt çalışıyor mu?
- [ ] Maçlar görüntüleniyor mu?
- [ ] Mobil görünüm test edildi mi?





