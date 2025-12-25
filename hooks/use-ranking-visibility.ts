"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";

export function useRankingVisibility() {
  const [isRankingVisible, setIsRankingVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const loadRankingVisibility = async () => {
      try {
        // Önce kullanıcının admin olup olmadığını kontrol et
        const { data: { user } } = await supabase.auth.getUser();
        let userIsAdmin = false;

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();
          
          userIsAdmin = (profile as any)?.is_admin === true;
          setIsAdmin(userIsAdmin);
        }

        // Admin ise her zaman görünür
        if (userIsAdmin) {
          setIsRankingVisible(true);
          setLoading(false);
          return;
        }

        // Normal kullanıcılar için site_settings'ten kontrol et
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

    // Real-time subscription - admin kontrolü için
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
          async (payload) => {
            // Admin kontrolü yap (her zaman güncel)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();
              
              // Admin ise güncelleme yapma (her zaman görünür)
              if ((profile as any)?.is_admin === true) return;
            }
            
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

  return { isRankingVisible, loading, isAdmin };
}

