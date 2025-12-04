"use client";

import { Trophy, Sparkles } from "lucide-react";

export default function PrizePoolCard() {
  const prizePool = {
    total: 12500,
    currency: "₺",
    season: "2025 Kış Sezonu",
  };

  return (
    <div className="rounded-xl border border-[#B84DC7]/30 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5 relative overflow-hidden">
      {/* Altın gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B84DC7]/10 via-transparent to-[#D69ADE]/10"></div>
      
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#B84DC7]" />
            <h3 className="text-lg font-bold text-white">Ödül Havuzu</h3>
          </div>
          <Sparkles className="h-4 w-4 text-[#B84DC7]" />
        </div>

        <div className="mb-3 p-3 rounded-lg bg-black/40 border border-[#B84DC7]/20">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
            {prizePool.season}
          </p>
          <p className="text-2xl font-black text-[#B84DC7]">
            {prizePool.currency}{prizePool.total.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-[10px] text-gray-400 mb-0.5">1.</p>
            <p className="text-xs font-bold text-[#B84DC7]">₺5,000</p>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-[10px] text-gray-400 mb-0.5">2.</p>
            <p className="text-xs font-bold text-[#C0C0C0]">₺3,000</p>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
            <p className="text-[10px] text-gray-400 mb-0.5">3.</p>
            <p className="text-xs font-bold text-[#CD7F32]">₺1,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}

