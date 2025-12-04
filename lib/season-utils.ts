/**
 * Sezon yönetimi için utility fonksiyonlar
 */

import { supabase } from "@/supabase/client";

export interface ActiveSeason {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

/**
 * Aktif sezonu getirir
 * @returns Aktif sezon veya null
 */
export async function getActiveSeason(): Promise<ActiveSeason | null> {
  try {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Aktif sezon bulunamadı
        console.warn("Aktif sezon bulunamadı");
        return null;
      }
      console.error("Aktif sezon getirilirken hata:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Aktif sezon getirilirken beklenmeyen hata:", error);
    return null;
  }
}

/**
 * Aktif sezon ID'sini getirir
 * @returns Aktif sezon ID veya null
 */
export async function getActiveSeasonId(): Promise<string | null> {
  const activeSeason = await getActiveSeason();
  return activeSeason?.id || null;
}

/**
 * Belirli bir sezonu ID'ye göre getirir
 * @param seasonId - Sezon ID
 * @returns Sezon veya null
 */
export async function getSeasonById(seasonId: string): Promise<ActiveSeason | null> {
  try {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("id", seasonId)
      .single();

    if (error) {
      console.error("Sezon getirilirken hata:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Sezon getirilirken beklenmeyen hata:", error);
    return null;
  }
}





