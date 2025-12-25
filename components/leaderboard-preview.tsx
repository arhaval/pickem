"use client";

import { Trophy, Medal, Award, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRankingVisibility } from "@/hooks/use-ranking-visibility";

const topPlayers = [
  { rank: 1, username: "ArhavalMaster", points: 15240, change: "+3" },
  { rank: 2, username: "TahminKralı", points: 14890, change: "+1" },
  { rank: 3, username: "TahminCı", points: 14120, change: "-2" },
  { rank: 4, username: "ProGamer", points: 13850, change: "+2" },
  { rank: 5, username: "SkinHunter", points: 13210, change: "-1" },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-[#C0C0C0] drop-shadow-[0_0_6px_rgba(192,192,192,0.5)]" />;
  if (rank === 3) return <Award className="h-5 w-5 text-[#CD7F32] drop-shadow-[0_0_6px_rgba(205,127,50,0.5)]" />;
  return null;
};

const getRankGradient = (rank: number) => {
  if (rank === 1) return "from-yellow-500/20 via-yellow-400/10 to-transparent";
  if (rank === 2) return "from-gray-400/20 via-gray-300/10 to-transparent";
  if (rank === 3) return "from-amber-600/20 via-amber-500/10 to-transparent";
  return "from-white/5 to-transparent";
};

const getRankBorder = (rank: number) => {
  if (rank === 1) return "border-yellow-400/30";
  if (rank === 2) return "border-gray-300/30";
  if (rank === 3) return "border-amber-500/30";
  return "border-white/10";
};

export default function LeaderboardPreview() {
  const { isRankingVisible, loading, isAdmin } = useRankingVisibility();

  // Sıralama kapalıysa hiçbir şey gösterme (admin hariç - admin her zaman görebilir)
  if (loading || (!isRankingVisible && !isAdmin)) {
    return null;
  }

  return (
    <div className="relative rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] p-6 overflow-hidden group">
      {/* Arka plan animasyon efekti */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B84DC7]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D69ADE]/5 rounded-full blur-2xl"></div>
      </div>

      {/* Başlık Bölümü */}
      <div className="relative mb-5 flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#B84DC7]/20 rounded-lg blur-md"></div>
            <div className="relative bg-gradient-to-br from-[#B84DC7]/30 to-[#D69ADE]/30 rounded-lg p-2 border border-[#B84DC7]/30">
              <Trophy className="h-5 w-5 text-[#B84DC7]" />
            </div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white via-[#D69ADE] to-white bg-clip-text text-transparent">
            Sıralama
          </h3>
        </div>
        <Link
          href="/leaderboard"
          className="group/link relative flex items-center gap-2 text-sm font-semibold text-[#D69ADE] hover:text-[#C97AE0] transition-all duration-300"
        >
          <span className="relative z-10">Tümünü Gör</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#B84DC7]/20 to-[#D69ADE]/20 rounded-lg opacity-0 group-hover/link:opacity-100 transition-opacity blur-sm"></div>
          <Sparkles className="h-4 w-4 relative z-10 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Oyuncu Listesi */}
      <div className="relative space-y-3">
        {topPlayers.map((player, index) => {
          const isTopThree = player.rank <= 3;
          const hasPositiveChange = player.change.startsWith("+");
          
          return (
            <div
              key={player.rank}
              className={cn(
                "relative group/item flex items-center gap-4 rounded-xl border backdrop-blur-sm p-4 transition-all duration-300",
                `bg-gradient-to-r ${getRankGradient(player.rank)}`,
                getRankBorder(player.rank),
                "hover:scale-[1.02] hover:shadow-xl hover:shadow-[#B84DC7]/20",
                isTopThree && "ring-1 ring-offset-1 ring-offset-[#0a0e1a]",
                player.rank === 1 && "ring-yellow-400/50",
                player.rank === 2 && "ring-gray-300/50",
                player.rank === 3 && "ring-amber-500/50"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Hover efekti */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#B84DC7]/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity rounded-xl"></div>
              
              {/* Sıra İkonu/Numarası */}
              <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                {isTopThree ? (
                  <div className="relative">
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-md opacity-50",
                      player.rank === 1 && "bg-yellow-400",
                      player.rank === 2 && "bg-gray-300",
                      player.rank === 3 && "bg-amber-500"
                    )}></div>
                    <div className="relative">
                      {getRankIcon(player.rank)}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-[#B84DC7]/30 transition-colors">
                    <span className="text-sm font-bold text-gray-300 group-hover/item:text-[#B84DC7] transition-colors">
                      #{player.rank}
                    </span>
                  </div>
                )}
              </div>

              {/* Kullanıcı Bilgileri */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-base text-white truncate group-hover/item:text-[#D69ADE] transition-colors">
                    {player.username}
                  </p>
                  {isTopThree && (
                    <Sparkles className="h-3 w-3 text-[#B84DC7] opacity-70" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#B84DC7]">
                    {player.points.toLocaleString()}
                  </p>
                  <span className="text-xs text-gray-400">puan</span>
                </div>
              </div>

              {/* Değişim Göstergesi */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {hasPositiveChange ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={cn(
                    "text-sm font-bold px-2 py-1 rounded-md backdrop-blur-sm",
                    hasPositiveChange
                      ? "text-green-400 bg-green-500/10 border border-green-500/20"
                      : "text-red-400 bg-red-500/10 border border-red-500/20"
                  )}
                >
                  {player.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alt Çizgi Efekti */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B84DC7]/50 to-transparent"></div>
    </div>
  );
}
