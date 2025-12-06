"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/supabase/client";

interface PageHeaderProps {
  type: "matches" | "predictions" | "profile" | "ranking";
  title?: string;
  description?: string;
}

export default function PageHeader({ type, title, description }: PageHeaderProps) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState<string | null>(null);
  const [buttonLink, setButtonLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBannerData();
    
    // Real-time subscription for changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('Site settings updated:', payload);
          loadBannerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type]);

  const loadBannerData = async () => {
    try {
      setLoading(true);
      let fieldName: string;
      let buttonTextField: string;
      let buttonLinkField: string;
      
      if (type === "matches") {
        fieldName = "matches_banner_url";
        buttonTextField = "matches_banner_button_text";
        buttonLinkField = "matches_banner_button_link";
      } else if (type === "predictions") {
        fieldName = "predictions_banner_url";
        buttonTextField = "predictions_banner_button_text";
        buttonLinkField = "predictions_banner_button_link";
      } else if (type === "profile") {
        fieldName = "profile_banner_url";
        buttonTextField = "profile_banner_button_text";
        buttonLinkField = "profile_banner_button_link";
      } else { // ranking
        fieldName = "ranking_banner_url";
        buttonTextField = "ranking_banner_button_text";
        buttonLinkField = "ranking_banner_button_link";
      }

      const { data, error } = await supabase
        .from("site_settings")
        .select(`${fieldName}, ${buttonTextField}, ${buttonLinkField}`)
        .eq("id", 1)
        .single();

      if (error) {
        // Kolon yoksa sessizce devam et (banner gösterilmez)
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          console.warn(`Banner kolonu bulunamadı: ${fieldName}. Banner gösterilmeyecek.`);
          setBannerUrl(null);
          setButtonText(null);
          setButtonLink(null);
          return;
        }
        console.error("Banner verisi yüklenirken hata:", JSON.stringify(error, null, 2));
        return;
      }

      setBannerUrl(data?.[fieldName] || null);
      setButtonText(data?.[buttonTextField] || null);
      setButtonLink(data?.[buttonLinkField] || null);
    } catch (error: any) {
      console.error("Banner verisi yüklenirken hata:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <section className="relative w-full border-b border-white/5 overflow-hidden">
      {bannerUrl ? (
        <div className="relative w-full h-[300px]">
          <img
            src={bannerUrl}
            alt={`${type === "matches" ? "Maçlar" : type === "predictions" ? "Tahminler" : type === "profile" ? "Profil" : "Sıralama"} Banner`}
            className="w-full h-full object-cover"
          />
          {/* Action Button - Ortada */}
          {buttonText && buttonLink && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold text-sm md:text-base uppercase tracking-wide px-6 md:px-8 py-4 md:py-6 hover:scale-105 hover:shadow-2xl hover:shadow-[#D69ADE]/50 transition-all backdrop-blur-sm bg-opacity-90"
              >
                <Link href={buttonLink}>
                  {buttonText}
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Banner görseli yüklenmedi</p>
          </div>
        </div>
      )}
    </section>
  );
}








