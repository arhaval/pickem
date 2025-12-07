"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/supabase/client";

interface LiveBannerProps {
  heroImageUrl: string | null;
  lobbyName?: string;
}

export default function LiveBanner({ heroImageUrl, lobbyName }: LiveBannerProps) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(heroImageUrl);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBannerUrl(heroImageUrl);
  }, [heroImageUrl]);

  if (loading) {
    return null; // Yüklenirken hiçbir şey gösterme
  }

  // Banner yoksa hiçbir şey gösterme
  if (!bannerUrl) {
    return null;
  }

  return (
    <section className="relative w-full border-b border-white/5 overflow-hidden">
      <div className="relative w-full h-[300px] md:h-[400px]">
        <img
          src={bannerUrl}
          alt={lobbyName || "Live Banner"}
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    </section>
  );
}



