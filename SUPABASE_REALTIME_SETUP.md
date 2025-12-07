# Supabase Realtime Ayarları - Sorun Giderme Rehberi

## Sorun
Admin panelinden yapılan değişiklikler (maçlar, tahminler, site ayarları) sitede otomatik olarak görünmüyor.

## Çözüm Adımları

### 1. Supabase Dashboard'da Realtime Kontrolü

1. **Supabase Dashboard'a giriş yapın**: https://app.supabase.com
2. **Projenizi seçin**
3. **Database** sekmesine gidin
4. **Replication** alt sekmesine tıklayın

### 2. Tabloları Realtime için Aktif Edin

Aşağıdaki tabloların **Realtime** özelliği aktif olmalı:

- ✅ `matches` - Maçlar tablosu
- ✅ `site_settings` - Site ayarları tablosu
- ✅ `teams` - Takımlar tablosu
- ✅ `seasons` - Sezonlar tablosu

**Her tablo için:**
1. Tablonun yanındaki **toggle switch**'i açın (yeşil olmalı)
2. Veya tabloyu seçip **"Enable Realtime"** butonuna tıklayın

### 3. Supabase SQL Editor ile Kontrol

Eğer UI'dan yapamıyorsanız, SQL Editor'den şu komutları çalıştırın:

```sql
-- matches tablosunu Realtime için aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- site_settings tablosunu Realtime için aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;

-- teams tablosunu Realtime için aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- seasons tablosunu Realtime için aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE seasons;
```

### 4. Kontrol Etme

Tabloların Realtime için aktif olup olmadığını kontrol etmek için:

```sql
-- Aktif Realtime tablolarını listele
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Bu sorgu, Realtime için aktif olan tüm tabloları gösterecektir.

### 5. Test Etme

1. Admin panelinden bir maç ekleyin veya düzenleyin
2. Ana sayfaya veya tahminler sayfasına dönün
3. Değişikliklerin otomatik olarak görünmesi gerekir
4. Eğer görünmüyorsa, sayfayı yenileyin (F5) veya sekme değiştirip geri dönün

### 6. Browser Console Kontrolü

Browser console'da (F12) şu mesajları görmelisiniz:

- ✅ `Matches channel subscribed`
- ✅ `Site settings channel subscribed`
- ✅ `Teams channel subscribed`
- ✅ `Predictions matches channel subscribed`

Eğer `CHANNEL_ERROR` görüyorsanız, Realtime ayarlarını kontrol edin.

### 7. Sorun Giderme

**Problem: Real-time subscription çalışmıyor**

1. Supabase Dashboard > Database > Replication'da tabloların aktif olduğundan emin olun
2. Browser console'da hata mesajlarını kontrol edin
3. Network sekmesinde WebSocket bağlantısını kontrol edin
4. Sayfa yenileme mekanizması (focus/visibility) çalışıyor mu kontrol edin

**Problem: Değişiklikler hala görünmüyor**

1. Sayfayı yenileyin (F5)
2. Sekme değiştirip geri dönün
3. Browser cache'ini temizleyin
4. Supabase Realtime'ın aktif olduğundan emin olun

### 8. Alternatif Çözüm (Realtime çalışmıyorsa)

Eğer Supabase Realtime çalışmıyorsa, sayfa odağa geldiğinde veya görünür olduğunda otomatik yenileme mekanizması devreye girer. Bu sayede admin panelinden değişiklik yaptıktan sonra:

- Sayfayı yenilediğinizde (F5)
- Sekme değiştirip geri döndüğünüzde
- Başka bir sekmeden bu sekmeye geçtiğinizde

Veriler otomatik olarak yenilenecektir.

## Notlar

- Realtime özelliği Supabase'in ücretsiz planında da mevcuttur
- Realtime, WebSocket bağlantısı kullanır
- Bazı firewall veya proxy ayarları Realtime'ı engelleyebilir
- Production ortamında Realtime'ın çalıştığından emin olun












