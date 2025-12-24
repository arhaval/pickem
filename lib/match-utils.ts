/**
 * Maç ile ilgili utility fonksiyonlar
 */

/**
 * Maçın başlayıp başlamadığını kontrol eder
 * @param matchDate - Maç tarihi (YYYY-MM-DD formatında)
 * @param matchTime - Maç saati (HH:MM formatında)
 * @returns Maç başladıysa true, henüz başlamadıysa false
 */
export function isMatchStarted(matchDate: string | null, matchTime: string): boolean {
  if (!matchDate || !matchTime) {
    // Tarih veya saat yoksa maç başlamış sayılır (güvenlik için)
    return true;
  }

  try {
    // Tarih ve saati birleştir
    const matchDateTime = new Date(`${matchDate}T${matchTime}:00`);
    
    // Şu anki tarih/saat
    const now = new Date();
    
    // Maç başladı mı?
    return now >= matchDateTime;
  } catch (error) {
    console.error("Maç tarihi kontrol edilirken hata:", error);
    // Hata durumunda güvenlik için true döndür (maç başlamış sayılır)
    return true;
  }
}

// Cache için
let lockMinutesCache: number | null = null;
let lockMinutesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

/**
 * Tahmin kilitleme ayarını Supabase'den çeker (cache'li)
 * @returns Maçtan kaç dakika önce kilitleneceği (varsayılan: 0)
 */
export async function getPredictionLockMinutes(): Promise<number> {
  // Cache kontrolü
  const now = Date.now();
  if (lockMinutesCache !== null && (now - lockMinutesCacheTime) < CACHE_DURATION) {
    return lockMinutesCache;
  }

  try {
    const { supabase } = await import('@/supabase/client');
    const supabaseClient = supabase;
    const { data, error } = await supabaseClient
      .from("site_settings")
      .select("prediction_lock_minutes_before_match")
      .eq("id", 1)
      .maybeSingle();
    
    // Kolon yoksa veya hata varsa varsayılan değer döndür
    if (error) {
      // Kolon yoksa hatası (schema cache hatası)
      if (error.message && (
        error.message.includes("prediction_lock_minutes_before_match") ||
        error.message.includes("column") ||
        error.message.includes("schema cache")
      )) {
        console.warn("prediction_lock_minutes_before_match kolonu bulunamadı. Migration dosyasını çalıştırın: supabase/migrations/add_prediction_lock_setting.sql");
        lockMinutesCache = 0;
        lockMinutesCacheTime = now;
        return 0; // Varsayılan: maç saati
      }
      // Diğer hatalar için de varsayılan değer döndür
      lockMinutesCache = 0;
      lockMinutesCacheTime = now;
      return 0;
    }
    
    if (!data) {
      lockMinutesCache = 0;
      lockMinutesCacheTime = now;
      return 0; // Varsayılan: maç saati
    }
    
    const minutes = (data as any).prediction_lock_minutes_before_match ?? 0;
    lockMinutesCache = minutes;
    lockMinutesCacheTime = now;
    return minutes;
  } catch (error: any) {
    // Schema hatası veya diğer hatalar
    if (error?.message && (
      error.message.includes("prediction_lock_minutes_before_match") ||
      error.message.includes("column") ||
      error.message.includes("schema cache")
    )) {
      console.warn("prediction_lock_minutes_before_match kolonu bulunamadı. Migration dosyasını çalıştırın: supabase/migrations/add_prediction_lock_setting.sql");
    } else {
      console.error("Tahmin kilitleme ayarı yüklenirken hata:", error);
    }
    lockMinutesCache = 0;
    lockMinutesCacheTime = now;
    return 0; // Varsayılan: maç saati
  }
}

/**
 * Maçın kilitli olup olmadığını kontrol eder (sync versiyon - cache kullanır)
 * (Maç başladıysa veya winner varsa kilitli)
 * @param matchDate - Maç tarihi (YYYY-MM-DD formatında)
 * @param matchTime - Maç saati (HH:MM formatında)
 * @param winner - Maç kazananı (varsa kilitli)
 * @param lockMinutesBeforeMatch - Maçtan kaç dakika önce kilitleneceği (opsiyonel, yoksa cache'den alınır)
 */
export function isMatchLocked(
  matchDate: string | null,
  matchTime: string,
  winner: string | null,
  lockMinutesBeforeMatch?: number
): boolean {
  // Eğer maç sonucu varsa kilitli
  if (winner) {
    return true;
  }
  
  if (!matchDate || !matchTime) {
    // Tarih veya saat yoksa kilitli (güvenlik için)
    return true;
  }

  try {
    // Kilitleme dakikasını al (parametre yoksa cache'den)
    const lockMinutes = lockMinutesBeforeMatch ?? (lockMinutesCache ?? 0);
    
    // Tarih ve saati birleştir
    const matchDateTime = new Date(`${matchDate}T${matchTime}:00`);
    
    // Kilitleme zamanını hesapla (maçtan X dakika önce)
    const lockDateTime = new Date(matchDateTime.getTime() - (lockMinutes * 60 * 1000));
    
    // Şu anki tarih/saat
    const now = new Date();
    
    // Kilitleme zamanı geçti mi?
    return now >= lockDateTime;
  } catch (error) {
    console.error("Maç kilit kontrolü yapılırken hata:", error);
    // Hata durumunda güvenlik için true döndür (kilitli sayılır)
    return true;
  }
}






