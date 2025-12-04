"use client";

import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamLogo from "./team-logo";

interface RecentResult {
  id: number;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
  isCorrect?: boolean;
}

const recentResults: RecentResult[] = [
  {
    id: 1,
    teamA: "NAVI",
    teamB: "FaZe",
    scoreA: 16,
    scoreB: 12,
    date: "14 Kasım",
    isCorrect: true,
  },
  {
    id: 2,
    teamA: "Vitality",
    teamB: "G2",
    scoreA: 14,
    scoreB: 16,
    date: "14 Kasım",
    isCorrect: false,
  },
  {
    id: 3,
    teamA: "Liquid",
    teamB: "Cloud9",
    scoreA: 16,
    scoreB: 8,
    date: "13 Kasım",
    isCorrect: true,
  },
];

export default function RecentResults() {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-lg font-bold text-white">Son Sonuçlar</h3>
        <Link
          href="/results"
          className="text-xs font-semibold text-[#D69ADE] hover:text-[#C97AE0] transition-colors"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-3">
        {recentResults.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/30 hover:bg-black/50 transition-all duration-200"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <TeamLogo teamName={result.teamA} size={32} />
                <span className="text-xs font-semibold text-white truncate">
                  {result.teamA}
                </span>
              </div>
              <div className="text-xs font-bold text-white px-2">
                {result.scoreA} - {result.scoreB}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {result.teamB}
                </span>
                <TeamLogo teamName={result.teamB} size={32} />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {result.isCorrect ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-[10px] text-gray-400">{result.date}</span>
            </div>
          </div>
        ))}
      </div>

      <Button
        asChild
        variant="outline"
        className="mt-4 w-full border-white/10 text-white text-xs hover:bg-white/5"
      >
        <Link href="/results" className="flex items-center justify-center gap-2 py-2">
          Tüm Sonuçları Gör
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}

