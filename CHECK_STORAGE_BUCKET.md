# Storage Bucket Kontrolü

"uploads" bucket'ı zaten varsa, sadece ayarlarını kontrol edin:

## Kontrol Listesi

1. **Supabase Dashboard → Storage → "uploads" bucket'a tıklayın**

2. **"Settings" sekmesine gidin:**
   - ✅ "Public bucket" seçeneği **İŞARETLİ** olmalı
   - ✅ "File size limit" yeterince büyük olmalı (örn: 50MB)

3. **"Policies" sekmesine gidin:**
   - Eğer hiç policy yoksa veya RLS hatası alıyorsanız:
   - "New Policy" → "Create a policy from scratch"
   - Policy name: `Allow authenticated uploads`
   - Operation: `INSERT` (veya `ALL`)
   - Target: `authenticated`
   - WITH CHECK: `bucket_id = 'uploads'`
   - Kaydedin

## En Hızlı Çözüm

Eğer hala RLS hatası alıyorsanız:

1. Bucket'ı **silin** (içindeki dosyalar silinir, dikkatli olun)
2. **Yeniden oluşturun**:
   - Adı: `uploads`
   - **Public bucket: ✅ İŞARETLE**
   - "Create bucket"

Bu otomatik olarak doğru ayarları yapacaktır.




