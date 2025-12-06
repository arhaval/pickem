# Sezon Bazlı Tahmin ve Puan Sistemi - Nasıl Çalışıyor?

## ✅ Sistem Zaten Kurulu ve Çalışıyor!

Sistem tamamen sezon bazlı çalışıyor. İşte nasıl:

## 📊 Nasıl Çalışıyor?

### 1. **Tahmin Yapma (Kullanıcı)**
- Kullanıcı `/predictions` sayfasına gider
- Sistem **aktif sezonu** otomatik bulur
- Sadece **aktif sezona ait maçlar** gösterilir
- Kullanıcı tahmin yapar

### 2. **Puan Dağıtımı (Admin)**
- Admin maç sonucunu girer (`/admin/matches`)
- Sistem:
  1. Maçın `season_id`'sini alır
  2. Doğru tahmin yapanları bulur
  3. **Sezon bazlı puanları** günceller (`season_points` tablosu)
  4. Her kullanıcı için:
     - `total_points` artar (sadece o sezon için)
     - `correct_predictions` artar
     - `total_predictions` artar

### 3. **Puan Hesaplama Örneği**

**Sezon 1:**
- X kullanıcısı 10 maça tahmin yaptı
- 7'sini doğru bildi
- Toplam 50 puan kazandı
- `season_points` tablosunda:
  ```json
  {
    "user_id": "X",
    "season_id": 1,
    "total_points": 50,
    "correct_predictions": 7,
    "total_predictions": 10
  }
  ```

**Sezon 2:**
- X kullanıcısı 15 maça tahmin yaptı
- 12'sini doğru bildi
- Toplam 80 puan kazandı
- `season_points` tablosunda:
  ```json
  {
    "user_id": "X",
    "season_id": 2,
    "total_points": 80,
    "correct_predictions": 12,
    "total_predictions": 15
  }
  ```

**Sonuç:**
- Sezon 1'de: 50 puan, #5 sırada
- Sezon 2'de: 80 puan, #3 sırada
- Her sezon **ayrı ayrı** hesaplanır!

### 4. **Liderlik Tablosu (`/leaderboard`)**
- Kullanıcı sezon seçer (dropdown)
- Seçilen sezona göre sıralama gösterilir
- Her sezon için **ayrı sıralama**
- İlk 3 özel gösterim (podyum)

### 5. **Profil Sayfası (`/profile`)**
- Aktif sezon puanını gösterir
- Sıralama bilgisi (#5 / 100 oyuncu)
- İstatistikler (doğru/toplam tahmin, başarı oranı)

### 6. **Sezon Bitişi (`/admin/seasons`)**
- Admin "Sezonu Bitir" butonuna tıklar
- Liderlik tablosu gösterilir
- Ödül dağıtımı yapılır (manuel)
- **Tüm puanlar sıfırlanır** (`season_points` tablosu temizlenir)
- Yeni sezon başlar

## 🎯 Özet

✅ **Tahminler sezon bazlı:** Sadece aktif sezona ait maçlar gösterilir
✅ **Puanlar sezon bazlı:** Her sezon için ayrı puan hesaplanır
✅ **Sıralama sezon bazlı:** Her sezon için ayrı liderlik tablosu
✅ **Profil sezon bazlı:** Aktif sezon puanı gösterilir
✅ **Sezon bitişi:** Puanlar sıfırlanır, yeni sezon başlar

## 📝 Veritabanı Yapısı

### `seasons` tablosu
- `id` (BIGINT) - Sezon ID
- `name` - Sezon adı
- `start_date` - Başlangıç tarihi
- `end_date` - Bitiş tarihi
- `is_active` - Aktif sezon mu?

### `season_points` tablosu
- `user_id` - Kullanıcı ID
- `season_id` - Sezon ID
- `total_points` - Sezon toplam puanı
- `correct_predictions` - Doğru tahmin sayısı
- `total_predictions` - Toplam tahmin sayısı

### `matches` tablosu
- `season_id` - Maçın ait olduğu sezon (tahminler için zorunlu)

## 🔄 Akış Diyagramı

```
1. Admin → Sezon Oluştur → Aktif Yap
2. Admin → Maç Ekle → Sezon Seç (zorunlu)
3. Kullanıcı → Tahmin Yap → Aktif Sezona Ait Maçlar
4. Admin → Sonuç Gir → Puanlar Sezon Bazlı Dağıtılır
5. Kullanıcı → Profil → Aktif Sezon Puanını Görür
6. Kullanıcı → Liderlik → Sezon Seç → Sıralama Görür
7. Admin → Sezon Bitir → Puanlar Sıfırlanır → Yeni Sezon
```

## ✨ Sonuç

Sistem **tamamen sezon bazlı** çalışıyor! Her sezon:
- Ayrı maçlar
- Ayrı puanlar
- Ayrı sıralama
- Ayrı istatistikler

Sezon bitince her şey sıfırlanır ve yeni sezon başlar! 🎮












