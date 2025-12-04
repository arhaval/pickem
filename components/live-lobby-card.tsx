"use client";

import Link from "next/link";
import { Radio, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveLobbyCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D69ADE]/30 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5 transition-all duration-200 hover:border-[#D69ADE]/50 hover:shadow-lg hover:shadow-[#D69ADE]/10">
      {/* Arka plan deseni */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,85,0,0.3) 0%, transparent 70%)`,
        }}></div>
      </div>

      {/* İçerik */}
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <Radio className="h-4 w-4 text-[#D69ADE]" />
            <span className="absolute inset-0 animate-ping">
              <Radio className="h-4 w-4 text-[#D69ADE] opacity-50" />
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#D69ADE]">
            Canlı Yayın
          </span>
        </div>

        <h3 className="mb-2 text-base font-bold text-white">
          Canlı Yayın Lobisine Katıl
        </h3>
        <p className="mb-4 text-xs text-gray-400 leading-relaxed">
          Maç içindeki anlık soruları yanıtla, puanları topla!
        </p>

        <Button
          asChild
          className="w-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white text-xs font-semibold hover:opacity-90 transition-opacity py-2.5"
        >
          <Link href="/live" className="flex items-center justify-center gap-2">
            Hemen Katıl
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
