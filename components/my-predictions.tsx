"use client";

import { Target, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import TeamLogo from "./team-logo";

interface MyPrediction {
  id: number;
  teamA: string;
  teamB: string;
  selectedTeam: string;
  matchTime: string;
  matchDate: string;
  status: "pending" | "correct" | "incorrect";
  points?: number;
}

const myPredictions: MyPrediction[] = [
  {
    id: 1,
    teamA: "EF",
    teamB: "MANA",
    selectedTeam: "EF",
    matchTime: "21:00",
    matchDate: "24.11.2025",
    status: "pending",
  },
  {
    id: 2,
    teamA: "Vitality",
    teamB: "G2",
    selectedTeam: "Vitality",
    matchTime: "22:00",
    matchDate: "15 Ocak",
    status: "pending",
  },
];

export default function MyPredictions() {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#D69ADE]" />
          <h3 className="text-lg font-bold text-white">Aktif Tahminlerim</h3>
        </div>
        <span className="rounded-full bg-[#D69ADE]/20 px-2 py-0.5 text-[10px] font-semibold text-[#D69ADE]">
          {myPredictions.length}
        </span>
      </div>

      <div className="space-y-3">
        {myPredictions.map((prediction) => (
          <div
            key={prediction.id}
            className="p-3 rounded-lg border border-white/5 bg-black/30 hover:bg-black/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">
                  {prediction.matchDate} {prediction.matchTime}
                </span>
              </div>
              {prediction.status === "pending" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  Beklemede
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TeamLogo teamName={prediction.teamA} size={28} />
                <span className="text-xs font-semibold text-white">
                  {prediction.teamA}
                </span>
              </div>
              <span className="text-xs text-gray-400">VS</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {prediction.teamB}
                </span>
                <TeamLogo teamName={prediction.teamB} size={28} />
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Tahminin:</span>
                <span className="text-xs font-semibold text-[#B84DC7]">
                  {prediction.selectedTeam} Kazanır
                </span>
              </div>
              {prediction.points && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">Kazanacağın Puan:</span>
                  <span className="text-xs font-bold text-green-400">
                    +{prediction.points}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {myPredictions.length === 0 && (
        <div className="text-center py-6">
          <Target className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-400">
            Henüz tahmin yapmadınız
          </p>
        </div>
      )}
    </div>
  );
}

