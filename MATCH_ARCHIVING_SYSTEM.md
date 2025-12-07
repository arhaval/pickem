# Maç Arşivleme ve Puan Yönetim Sistemi

## 🎯 Sistem Mimarisi

### Güvenli Silme (Soft Delete) Sistemi

Maçlar **asla fiziksel olarak silinmez**. Bunun yerine **arşivlenir** (`is_archived = true`).

## 📋 Nasıl Çalışır?

### 1. Maç Arşivleme

**Admin Panel → Fikstür ve Sonuçlar** sayfasından:

- **"Arşivle"** butonuna tıklayınca:
  - Maç `is_archived = true` olarak işaretlenir
  - Maç listeden gizlenir (aktif maçlar listesinde görünmez)
  - **Tahminler korunur** ✅
  - **Puanlar korunur** ✅
  - **Veriler silinmez** ✅

### 2. Tahmin ve Puan Kontrolü

Maç arşivlenmeden önce sistem otomatik kontrol yapar:

- **Tahmin var mı?** → Uyarı gösterir
- **Puan dağıtılmış mı?** → Özel uyarı gösterir
- Kullanıcı onaylarsa arşivlenir

### 3. Arşivlenmiş Maçları Görüntüleme

Admin panelinde **"Arşivlenmiş Maçlar"** butonuna tıklayarak:
- Tüm arşivlenmiş maçları görebilirsiniz
- **"Geri Getir"** butonu ile maçı tekrar aktif edebilirsiniz

## 🔒 Güvenlik Özellikleri

### ✅ Korunan Veriler

1. **Tahminler** (`predictions` tablosu)
   - Hiçbir tahmin silinmez
   - Tüm tahmin kayıtları korunur

2. **Puanlar** (`profiles.total_points`)
   - Dağıtılmış puanlar korunur
   - Puanlar geri alınmaz

3. **Maç Verileri** (`matches` tablosu)
   - Maç bilgileri korunur
   - Sadece `is_archived` flag'i değişir

### ⚠️ Uyarılar

- **Puan dağıtılmış maçlar**: Özel uyarı mesajı gösterilir
- **Tahmin yapılmış maçlar**: Tahmin sayısı gösterilir
- **Onay gerektirir**: Kullanıcı onaylamadan arşivlenmez

## 📊 Veritabanı Yapısı

### Migration Dosyası

`supabase/migrations/add_match_archiving.sql` dosyasını çalıştırın:

```sql
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_matches_is_archived ON matches(is_archived);
```

## 🎮 Kullanım Senaryoları

### Senaryo 1: Henüz Tahmin Yapılmamış Maç
- ✅ Direkt arşivlenebilir
- Uyarı: "Bu maçı arşivlemek istediğinize emin misiniz?"

### Senaryo 2: Tahmin Yapılmış Ama Puan Dağıtılmamış
- ⚠️ Uyarı: "Bu maça X tahmin yapılmış"
- ✅ Arşivlenebilir (tahminler korunur)

### Senaryo 3: Puan Dağıtılmış Maç
- 🚨 Özel Uyarı: "DİKKAT: Bu maça X tahmin yapılmış ve puan dağıtılmış!"
- ⚠️ Açıklama: "Puanlar geri alınmayacak"
- ✅ Arşivlenebilir (puanlar korunur)

## 🔄 Geri Getirme

Arşivlenmiş maçları geri getirmek için:

1. Admin Panel → "Arşivlenmiş Maçlar" butonuna tıklayın
2. Geri getirmek istediğiniz maçın yanındaki **"Geri Getir"** butonuna tıklayın
3. Maç tekrar aktif maçlar listesinde görünür

## 📝 Önemli Notlar

1. **Fiziksel Silme YOK**: Maçlar asla veritabanından silinmez
2. **Puanlar Korunur**: Arşivleme puanları etkilemez
3. **Tahminler Korunur**: Tüm tahmin kayıtları korunur
4. **Geri Dönüşümlü**: Arşivlenmiş maçlar her zaman geri getirilebilir

## 🚀 Kurulum

1. Migration dosyasını çalıştırın:
   ```sql
   -- supabase/migrations/add_match_archiving.sql
   ```

2. Sistem otomatik olarak çalışmaya başlar

3. Admin panelinden maçları arşivleyebilirsiniz

## ❓ Sık Sorulan Sorular

**S: Maç arşivlenince puanlar geri alınır mı?**
C: Hayır, puanlar korunur. Arşivleme sadece maçı listeden gizler.

**S: Arşivlenmiş maçları silebilir miyim?**
C: Hayır, fiziksel silme yok. Sadece arşivleme var. Bu güvenlik için.

**S: Tahminler sayfasında arşivlenmiş maçlar görünür mü?**
C: Hayır, sadece `is_archived = false` olan maçlar görünür.

**S: Puan dağıtılmış bir maçı arşivleyebilir miyim?**
C: Evet, ama özel uyarı gösterilir. Puanlar korunur.













