# Takım Logoları Boyut Rehberi

## Önerilen Logo Boyutları

Web sitesinde logolar farklı boyutlarda gösteriliyor. Yüksek kaliteli görüntü için aşağıdaki boyutları kullanın:

### 📐 Logo Dosyası Boyutları

**Önerilen: 512x512 piksel**
- Format: PNG (şeffaf arka plan için) veya SVG (en iyi kalite)
- Çözünürlük: 72-96 DPI (web için yeterli)
- Dosya boyutu: Mümkün olduğunca küçük (50-200 KB arası ideal)

**Alternatif Boyutlar:**
- **Minimum:** 256x256 piksel (küçük logolar için yeterli)
- **İdeal:** 512x512 piksel (tüm ekranlar için optimal)
- **Maksimum:** 1024x1024 piksel (çok büyük dosyalar olmaması için)

### 🖥️ Ekranda Görünen Boyutlar

Sitede logolar şu boyutlarda gösteriliyor:

1. **Tahmin Kartları (Ana Görünüm):**
   - Mobil: 48x48 piksel
   - Masaüstü: 80x80 piksel
   - Retina ekranlar için: 160x160 piksel (2x)

2. **Küçük Logolar:**
   - Sonuçlar: 32x32 piksel
   - Tahminlerim: 28x28 piksel
   - Sıralama: 40x40 piksel

### ✅ Logo Hazırlama İpuçları

1. **Format Seçimi:**
   - PNG: Şeffaf arka plan için ideal
   - SVG: En yüksek kalite, her boyutta keskin
   - JPG: Sadece şeffaflık gerekmiyorsa

2. **Optimizasyon:**
   - Dosya boyutunu küçültmek için TinyPNG veya ImageOptim kullanın
   - Gereksiz metadata'yı temizleyin

3. **Tasarım Kuralları:**
   - Logo ortalanmış olmalı
   - Kenarlarda yeterli boşluk olmalı (padding)
   - Kare format (1:1 oran) önerilir

4. **Renk ve Kontrast:**
   - Koyu arka plan üzerinde görünecek
   - Yeterli kontrast sağlayın
   - Şeffaf arka plan kullanabilirsiniz

### 📁 Dosya Adlandırma

- Dosya adları: `takim-adi.png` veya `takim-adi.svg`
- Örnek: `navi.png`, `faze-clan.png`
- Küçük harf kullanın, boşluk yerine tire (-) kullanın

### 🔧 Teknik Detaylar

- Next.js Image component otomatik optimizasyon yapıyor
- Retina ekranlar için 2x boyutlar otomatik kullanılıyor
- `object-contain` kullanılıyor (logolar kırpılmıyor)
- Kalite: %95 (yüksek kalite)

### ⚠️ Yaygın Hatalar

1. **Çok küçük logo:** 128px'den küçük logolar bulanık görünür
2. **Çok büyük dosya:** 500KB'den büyük logolar yavaş yüklenir
3. **Yanlış format:** JPG şeffaf arka planı desteklemez
4. **Düşük kalite:** 72 DPI'den düşük logolar bulanık görünür

### 📝 Özet

**En İyi Sonuç İçin:**
- Boyut: **512x512 piksel**
- Format: **PNG** (şeffaf) veya **SVG**
- Dosya boyutu: **50-200 KB**
- Çözünürlük: **72-96 DPI**

Bu ayarlarla logolar tüm ekranlarda keskin ve profesyonel görünecektir.







