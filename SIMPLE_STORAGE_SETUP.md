# Basit Storage Kurulumu

## En Basit Çözüm (2 Adım)

### 1. Bucket Oluştur
- Supabase Dashboard → Storage
- "New bucket" → Adı: `uploads`
- **Public bucket: ✅ İŞARETLE** (en önemli kısım!)
- "Create bucket"

### 2. RLS'yi Kapat (Opsiyonel)
- Bucket'a tıkla → "Settings"
- "Public bucket" zaten işaretliyse, RLS genellikle otomatik olarak doğru ayarlanır
- Eğer hala hata alıyorsanız, bucket ayarlarından RLS'yi kapatabilirsiniz

## Neden Bu Kadar Basit?

Public bucket oluşturduğunuzda Supabase otomatik olarak:
- ✅ Herkesin okuyabilmesi için izin verir
- ✅ Authenticated kullanıcıların yükleyebilmesi için izin verir

**Manuel policy eklemeye gerek yok!**

## Hala Çalışmıyorsa

Bucket ayarlarından:
- "Public bucket" seçeneğinin işaretli olduğundan emin olun
- "File size limit" yeterince büyük olsun (örn: 50MB)
- Bucket'ı silip tekrar oluşturmayı deneyin




