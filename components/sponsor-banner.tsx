"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import Image from "next/image";
import Link from "next/link";

interface Partner {
  logo_url: string;
  url: string | null;
}

export default function SponsorBanner() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
    
    // Real-time subscription for changes
    const channel = supabase
      .channel('partners_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('Site settings updated:', payload);
          loadPartners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("partners")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        // Kolon yoksa veya başka bir hata varsa sessizce devam et
        if (error.message && (
          error.message.includes("partners") ||
          error.message.includes("column") ||
          error.message.includes("schema cache")
        )) {
          console.warn("partners kolonu bulunamadı. Migration dosyasını çalıştırın.");
          setPartners([]);
          return;
        }
        console.error("Partner verisi yüklenirken hata:", error);
        setPartners([]);
        return;
      }

      if ((data as any)?.partners) {
        try {
          const parsedPartners = typeof (data as any).partners === 'string' 
            ? JSON.parse((data as any).partners)
            : (data as any).partners;
          setPartners(Array.isArray(parsedPartners) ? parsedPartners : []);
        } catch (e) {
          console.error("Partner parse hatası:", e);
          setPartners([]);
        }
      } else {
        setPartners([]);
      }
    } catch (error: any) {
      // Beklenmeyen hatalar için console'a yaz ama uygulamayı bozma
      if (error?.message && (
        error.message.includes("partners") ||
        error.message.includes("column") ||
        error.message.includes("schema")
      )) {
        console.warn("partners kolonu henüz oluşturulmamış.");
        setPartners([]);
      } else {
        console.error("Partner verisi yüklenirken hata:", error);
        setPartners([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Yüklenirken hiçbir şey gösterme
  }

  if (partners.length === 0) {
    return null; // Partner yoksa hiçbir şey gösterme
  }

  return (
    <section className="relative w-full py-4 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">Partnerlerimiz</h3>
        </div>
        <div className="flex items-center justify-center gap-6 md:gap-8 lg:gap-10 flex-wrap">
          {partners.map((partner, index) => {
            const content = (
              <div
                key={index}
                className="relative opacity-30 hover:opacity-60 transition-opacity duration-300 grayscale hover:grayscale-0"
                style={{ maxWidth: '70px', maxHeight: '30px' }}
              >
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt="Partner Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>
            );

            return partner.url ? (
              <Link
                key={index}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </div>
      </div>
    </section>
  );
}
