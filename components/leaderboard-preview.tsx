"use client";

import { Trophy, Medal, Award } from "lucide-react";
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
  if (rank === 1) return <Trophy className="h-4 w-4 text-[#B84DC7]" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-[#C0C0C0]" />;
  if (rank === 3) return <Award className="h-4 w-4 text-[#CD7F32]" />;
  return null;
};

export default function LeaderboardPreview() {
  const { isRankingVisible, loading } = useRankingVisibility();

  // Sıralama kapalıysa hiçbir şey gösterme
  if (loading || !isRankingVisible) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-lg font-bold text-white">
          Sıralama
        </h3>
        <Link
          href="/leaderboard"
          className="text-xs font-semibold text-[#D69ADE] hover:text-[#C97AE0] transition-colors"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-2">
        {topPlayers.map((player) => (
          <div
            key={player.rank}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-3 transition-all duration-200 hover:border-[#D69ADE]/50 hover:bg-black/50 hover:shadow-lg hover:shadow-[#D69ADE]/10"
            )}
          >
            <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
              {getRankIcon(player.rank) || (
                <span className="text-xs font-bold text-gray-400">
                  #{player.rank}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{player.username}</p>
              <p className="text-xs text-gray-400">
                {player.points.toLocaleString()} puan
              </p>
            </div>
            <span
              className={cn(
                "text-xs font-bold flex-shrink-0",
                player.change.startsWith("+")
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {player.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
