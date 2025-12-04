"use client";

import { User, Trophy, TrendingUp, LogIn, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UserProfileCard() {
  // Kullanıcı giriş yapmamış durumda - placeholder
  const isLoggedIn = false;
  const userStats = {
    rank: 42,
    points: 1520,
    predictions: 23,
    winRate: 65,
  };

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#D69ADE]/20 to-[#B84DC7]/20 p-4 border-2 border-white/10">
            <User className="h-8 w-8 text-[#B84DC7]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Giriş Yap
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Tahminlerini yap ve puanları topla!
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white text-xs font-semibold"
          >
            <Link href="/login" className="flex items-center justify-center gap-2">
              <LogIn className="h-3.5 w-3.5" />
              Giriş Yap
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
      <div className="mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-gradient-to-br from-[#D69ADE]/20 to-[#B84DC7]/20 p-2 border-2 border-[#D69ADE]/30">
            <User className="h-5 w-5 text-[#B84DC7]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-white">Kullanıcı Adı</p>
            <p className="text-xs text-gray-400">#{userStats.rank} Sıralama</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-black/30 border border-white/5">
          <Trophy className="h-4 w-4 text-[#B84DC7] mx-auto mb-1" />
          <p className="text-xs font-bold text-white">{userStats.points}</p>
          <p className="text-[10px] text-gray-400">Puan</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-black/30 border border-white/5">
          <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white">{userStats.winRate}%</p>
          <p className="text-[10px] text-gray-400">Başarı</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-black/30 border border-white/5">
          <Target className="h-4 w-4 text-[#D69ADE] mx-auto mb-1" />
          <p className="text-xs font-bold text-white">{userStats.predictions}</p>
          <p className="text-[10px] text-gray-400">Tahmin</p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full border-white/10 text-white text-xs hover:bg-white/5"
      >
        <Link href="/profile">Profili Gör</Link>
      </Button>
    </div>
  );
}

