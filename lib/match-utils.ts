/**
 * Maç ile ilgili utility fonksiyonlar
 */

/**
 * Türkiye saatini alır (UTC+3 - Europe/Istanbul)
 */
function getTurkeyTime(): Date {
  const now = new Date();
  // Türkiye UTC+3 (Europe/Istanbul)
  const turkeyOffset = 3 * 60; // UTC+3 in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (turkeyOffset * 60000));
}

/**
 * Tarih string'ini Türkiye saati olarak parse eder
 * @param dateString - YYYY-MM-DD formatında tarih
 * @param timeString - HH:MM formatında saat
 * @returns Türkiye saatine göre Date objesi
 */
function parseTurkeyDateTime(dateString: string, timeString: string): Date {
  // Tarih ve saati parse et
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Girilen saat Türkiye saati (UTC+3) olarak yorumlanmalı
  // Örnek: 2025-12-25 01:15 Türkiye saati = 2025-12-24 22:15 UTC
  // UTC olarak Date objesi oluştur, sonra Türkiye offset'ini çıkar
  const utcTimestamp = Date.UTC(year, month - 1, day, hours, minutes, 0);
  // Türkiye UTC+3, yani Türkiye saati = UTC + 3 saat
  // UTC = Türkiye - 3 saat
  const turkeyOffsetMs = 3 * 60 * 60 * 1000; // 3 saat in milliseconds
  return new Date(utcTimestamp - turkeyOffsetMs);
}

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
    // Tarih ve saati Türkiye saati olarak parse et
    const matchDateTime = parseTurkeyDateTime(matchDate, matchTime);
    
    // Şu anki Türkiye saati
    const now = getTurkeyTime();
    
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
    
    // Tarih ve saati Türkiye saati olarak parse et
    const matchDateTime = parseTurkeyDateTime(matchDate, matchTime);
    
    // Kilitleme zamanını hesapla (maçtan X dakika önce)
    const lockDateTime = new Date(matchDateTime.getTime() - (lockMinutes * 60 * 1000));
    
    // Şu anki Türkiye saati
    const now = getTurkeyTime();
    
    // Kilitleme zamanı geçti mi?
    return now >= lockDateTime;
  } catch (error) {
    console.error("Maç kilit kontrolü yapılırken hata:", error);
    // Hata durumunda güvenlik için true döndür (kilitli sayılır)
    return true;
  }
}
