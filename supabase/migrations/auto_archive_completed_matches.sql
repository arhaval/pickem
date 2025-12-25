-- ============================================================
-- OTOMATİK ARŞİVLEME TRIGGER
-- ============================================================
-- 
-- Bu migration:
-- 1. matches.winner güncellendiğinde otomatik olarak maçı arşivler
-- 2. Sonuçlanan maçlar kalıcı olarak saklanır (is_archived = true)
-- 3. Tahminler ve puanlar korunur
-- 
-- ============================================================

-- ============================================================
-- 1. ARŞİVLEME FONKSİYONU
-- ============================================================

-- Mevcut fonksiyonu temizle (varsa)
DROP FUNCTION IF EXISTS public.auto_archive_completed_match() CASCADE;

-- Maç kazananı güncellendiğinde otomatik arşivleyen fonksiyon
CREATE OR REPLACE FUNCTION public.auto_archive_completed_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eğer winner NULL'dan bir değere güncellenmişse ve maç henüz arşivlenmemişse
  IF NEW.winner IS NOT NULL AND (OLD.winner IS NULL OR OLD.winner IS DISTINCT FROM NEW.winner) THEN
    -- Maçı otomatik olarak arşivle
    UPDATE public.matches
    SET is_archived = true
    WHERE id = NEW.id AND (is_archived IS NULL OR is_archived = false);
    
    RAISE NOTICE 'Maç otomatik olarak arşivlendi (match_id: %)', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Fonksiyona açıklama ekle
COMMENT ON FUNCTION public.auto_archive_completed_match() IS 
'Maç kazananı (winner) güncellendiğinde otomatik olarak maçı arşivler. Sonuçlanan maçlar kalıcı olarak saklanır.';

-- ============================================================
-- 2. TRIGGER OLUŞTURMA
-- ============================================================

-- Mevcut trigger'ı temizle (varsa)
DROP TRIGGER IF EXISTS trigger_auto_archive_completed_match ON public.matches;

-- Trigger oluştur: matches.winner güncellendiğinde tetiklenir
CREATE TRIGGER trigger_auto_archive_completed_match
AFTER UPDATE OF winner ON public.matches
FOR EACH ROW
WHEN (NEW.winner IS NOT NULL AND (OLD.winner IS NULL OR OLD.winner IS DISTINCT FROM NEW.winner))
EXECUTE FUNCTION public.auto_archive_completed_match();

-- Trigger'a açıklama ekle
COMMENT ON TRIGGER trigger_auto_archive_completed_match ON public.matches IS 
'Maç kazananı güncellendiğinde otomatik olarak maçı arşivler. Sonuçlanan maçlar kalıcı olarak saklanır.';

-- ============================================================
-- 3. ÖNEMLİ NOTLAR
-- ============================================================
-- 
-- ARŞİVLEME MANTIĞI:
-- 
-- 1. matches.winner NULL'dan bir değere güncellendiğinde tetiklenir
-- 2. Maç otomatik olarak arşivlenir (is_archived = true)
-- 3. Tahminler ve puanlar korunur
-- 4. Maç listeden gizlenir ama veritabanında kalır
-- 
-- YEDEKLEME:
-- 
-- - Supabase otomatik yedekleme: Supabase Dashboard → Settings → Database → Backups
-- - Manuel yedekleme: Admin panelinden export özelliği kullanılabilir
-- - Arşivlenen maçlar hiçbir zaman silinmez (kalıcı saklama)
-- 
-- ============================================================

