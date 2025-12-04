"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";

export function useRankingVisibility() {
  const [isRankingVisible, setIsRankingVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankingVisibility = async () => {
      try {
        // Önce tüm kolonları çek, is_ranking_visible varsa kullan
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (error) {
          // Tablo yoksa veya hata varsa varsayılan olarak true
          setIsRankingVisible(true);
        } else {
          // is_ranking_visible kolonu varsa kullan, yoksa true
          setIsRankingVisible((data as any)?.is_ranking_visible ?? true);
        }
      } catch (error) {
        // Sessizce varsayılan değeri kullan
        setIsRankingVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadRankingVisibility();

    // Real-time subscription - sadece kolon varsa
    let channel: any = null;
    try {
      channel = supabase
        .channel("ranking_visibility_changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "site_settings",
            filter: "id=eq.1",
          },
          (payload) => {
            const newValue = (payload.new as any)?.is_ranking_visible;
            if (newValue !== undefined) {
              setIsRankingVisible(newValue);
            }
          }
        )
        .subscribe();
    } catch (e) {
      // Subscription hatası - sessizce devam et
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { isRankingVisible, loading };
}

