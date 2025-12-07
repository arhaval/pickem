# Migration Uygulama Talimatları

## ❌ Hata: `homepage_pick_match_ids` kolonu bulunamadı

Bu hatayı çözmek için aşağıdaki migration'ı Supabase'de uygulamanız gerekiyor.

## Adım 1: Supabase Dashboard'a Gidin

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin

## Adım 2: SQL Editor'u Açın

1. Sol menüden **SQL Editor**'a tıklayın
2. **New query** butonuna tıklayın

## Adım 3: Migration SQL'ini Çalıştırın

Aşağıdaki SQL kodunu kopyalayıp SQL Editor'a yapıştırın:

```sql
-- Homepage Pick Matches kolonu ekle
-- Bu kolon, ana sayfada "PICK EM" bölümünde gösterilecek 3 maçın ID'lerini tutar

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS homepage_pick_match_ids JSONB DEFAULT '[]'::jsonb;

-- Kolon için açıklama ekle
COMMENT ON COLUMN site_settings.homepage_pick_match_ids IS 'Ana sayfada PICK EM bölümünde gösterilecek 3 maçın ID''lerini tutar. Örnek: ["match-id-1", "match-id-2", "match-id-3"]';
```

## Adım 4: SQL'i Çalıştırın

1. **Run** butonuna tıklayın (veya `Ctrl+Enter` tuşlarına basın)
2. "Success. No rows returned" mesajını görmelisiniz

## Adım 5: Doğrulama

1. Sol menüden **Table Editor**'a gidin
2. `site_settings` tablosunu seçin
3. `homepage_pick_match_ids` kolonunu görebilmelisiniz

## ✅ Tamamlandı!

Migration başarıyla uygulandı. Artık `/admin/picks` sayfasından PICK EM maçlarını seçebilirsiniz.

---

## Alternatif: Migration Dosyası

Migration dosyası şu konumda:
```
supabase/migrations/add_homepage_pick_matches.sql
```

Bu dosyayı da doğrudan Supabase SQL Editor'a kopyalayıp çalıştırabilirsiniz.










