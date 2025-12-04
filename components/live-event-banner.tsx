"use client";

import Link from "next/link";
import { Radio, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveLobby {
  id: number;
  name: string;
  unique_code: string;
  is_active: boolean;
  hero_image_url?: string | null;
  event_title?: string | null;
  primary_color?: string | null;
}

// Örnek aktif yayın - Gerçek veri veritabanından gelecek
const activeLiveLobby: LiveLobby | null = {
  id: 1,
  name: "Eternal Fire vs NAVI Büyük Final",
  unique_code: "EFNAVIFINAL",
  is_active: true,
  hero_image_url: null,
  event_title: "Eternal Fire vs NAVI Büyük Final",
  primary_color: "#D69ADE",
};

export default function LiveEventBanner() {
  // Aktif yayın yoksa hiçbir şey gösterme
  if (!activeLiveLobby || !activeLiveLobby.is_active) {
    return null;
  }

  const primaryColor = activeLiveLobby.primary_color || "#D69ADE";

  return (
    <Link
      href="/live"
      className="group relative block w-full overflow-hidden border-b border-[#D69ADE]/30 bg-gradient-to-r from-[#131720] via-[#0f172a] to-[#131720] transition-all duration-300 hover:border-[#D69ADE]/50"
    >
      {/* Arka Plan Görseli (varsa) */}
      {activeLiveLobby.hero_image_url && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={activeLiveLobby.hero_image_url}
            alt={activeLiveLobby.event_title || activeLiveLobby.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(90deg, ${primaryColor}00 0%, ${primaryColor}40 50%, ${primaryColor}00 100%)`,
        }}
      ></div>

      {/* İçerik */}
      <div className="container relative z-10 mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Sol Taraf - Live Badge ve Başlık */}
          <div className="flex items-center gap-4">
            {/* Live Badge */}
            <div className="flex items-center gap-2 rounded-full bg-[#D69ADE]/20 px-4 py-2 border border-[#D69ADE]/50">
              <div className="relative">
                <Radio className="h-5 w-5 text-[#D69ADE]" />
                <span className="absolute inset-0 animate-ping">
                  <Radio className="h-5 w-5 text-[#D69ADE] opacity-50" />
                </span>
              </div>
              <span className="text-sm font-black uppercase tracking-wider text-[#D69ADE]">
                CANLI
              </span>
            </div>

            {/* Başlık */}
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#B84DC7] transition-colors">
                {activeLiveLobby.event_title || activeLiveLobby.name}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Şu an canlı yayında!</p>
            </div>
          </div>

          {/* Sağ Taraf - Ok İkonu */}
          <div className="flex items-center gap-2 text-[#D69ADE] group-hover:translate-x-1 transition-transform">
            <span className="text-sm font-semibold uppercase tracking-wide hidden sm:inline">
              Katıl
            </span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Alt Çizgi - Animasyonlu */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] group-hover:scale-x-100 transition-transform duration-300"
      ></div>
    </Link>
  );
}

