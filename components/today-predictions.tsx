"use client";

import Link from "next/link";
import { MatchCard } from "@/components/match-card";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PredictionMatch {
  id: number;
  teamA: string;
  teamB: string;
  matchTime: string;
  matchDate?: string;
  pointsA: number;
  pointsB: number;
  difficultyA?: "easy" | "medium" | "hard";
  difficultyB?: "easy" | "medium" | "hard";
}

const predictionMatches: PredictionMatch[] = [
  {
    id: 1,
    teamA: "NAVI",
    teamB: "FaZe",
    matchTime: "20:00",
    matchDate: "15 Ocak",
    pointsA: 3,
    pointsB: 5,
    difficultyA: "easy",
    difficultyB: "hard",
  },
  {
    id: 2,
    teamA: "Vitality",
    teamB: "G2",
    matchTime: "22:00",
    matchDate: "15 Ocak",
    pointsA: 3,
    pointsB: 5,
    difficultyA: "easy",
    difficultyB: "hard",
  },
];

export default function TodayPredictions() {
  return (
    <div className="space-y-4">
      {/* Header - Kompakt */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-[#B84DC7]" />
            <h3 className="text-lg font-bold text-white">
              Günün Tahminleri
            </h3>
          </div>
          <p className="text-gray-500 text-xs ml-6">
            Bugünün popüler maçları ve tahminleri
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-[#D69ADE]/30 text-white hover:bg-[#D69ADE]/10 hover:border-[#D69ADE]"
        >
          <Link href="/predictions" className="flex items-center gap-2">
            Tümünü Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Match Cards */}
      <div className="space-y-3">
        {predictionMatches.map((match) => (
          <MatchCard
            key={match.id}
            id={match.id}
            team_a={match.teamA}
            team_b={match.teamB}
            match_date={match.matchDate || new Date().toISOString()}
            match_time={match.matchTime}
            difficulty_score_a={match.pointsA}
            difficulty_score_b={match.pointsB}
          />
        ))}
      </div>
    </div>
  );
}

