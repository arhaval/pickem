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

/**
 * Maçın kilitli olup olmadığını kontrol eder
 * (Maç başladıysa veya winner varsa kilitli)
 */
export function isMatchLocked(
  matchDate: string | null,
  matchTime: string,
  winner: string | null
): boolean {
  // Eğer maç sonucu varsa kilitli
  if (winner) {
    return true;
  }
  
  // Eğer maç başladıysa kilitli
  return isMatchStarted(matchDate, matchTime);
}





