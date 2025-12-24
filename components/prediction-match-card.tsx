"use client";

import { useState } from "react";
import { Clock, Trophy, TrendingUp, TrendingDown, CheckCircle2, BarChart3, XCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamLogo from "./team-logo";
import { Button } from "./ui/button";
import MatchAnalysisModal from "./match-analysis-modal";

type PredictionType = 'winner' | 'over_under' | 'custom';

interface PredictionMatchCardProps {
  id?: number;
  teamA?: string;
  teamB?: string;
  teamALogo?: string | null;
  teamBLogo?: string | null;
  matchTime: string;
  matchDate: string;
  tournamentName?: string | null;
  pointsA: number;
  pointsB: number;
  isSelected?: boolean;
  selectedTeam?: "A" | "B" | null;
  onSelectTeam?: (team: "A" | "B") => void;
  difficultyA?: "easy" | "medium" | "hard";
  difficultyB?: "easy" | "medium" | "hard";
  teamAForm?: string[]; // ["W", "L", "W"] gibi
  teamBForm?: string[];
  // Yeni: Tahmin türü ve esnek içerik
  predictionType?: PredictionType;
  optionALabel?: string;
  optionBLabel?: string;
  questionText?: string | null;
  analysisNote?: string | null;
  isLocked?: boolean;
  winner?: string | null;
  userPrediction?: string | null;
}


export default function PredictionMatchCard({
  id,
  teamA = "",
  teamB = "",
  teamALogo,
  teamBLogo,
  matchTime,
  matchDate,
  tournamentName,
  pointsA,
  pointsB,
  isSelected = false,
  selectedTeam = null,
  onSelectTeam,
  difficultyA = "medium",
  difficultyB = "medium",
  teamAForm = ["W", "W", "L"],
  teamBForm = ["L", "W", "W"],
  predictionType = 'winner',
  optionALabel,
  optionBLabel,
  questionText,
  analysisNote,
  isLocked = false,
  winner = null,
  userPrediction = null,
}: PredictionMatchCardProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Varsayılan label'ları belirle
  const labelA = optionALabel || teamA || "Seçenek A";
  const labelB = optionBLabel || teamB || "Seçenek B";
  const isWinnerType = predictionType === 'winner';
  
  // Kazanan takım kontrolü
  const isAWinner = winner === "A" || winner === "OVER";
  const isBWinner = winner === "B" || winner === "UNDER";
  const userWon = winner && userPrediction === winner;
  const userLost = winner && userPrediction && userPrediction !== winner;

  const handleSelect = (team: "A" | "B") => {
    if (isLocked) return;
    setIsAnimating(true);
    onSelectTeam?.(team);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Kilitlenme zamanını hesapla
  const getLockTime = () => {
    if (!matchDate || !matchTime) return null;
    try {
      const matchDateTime = new Date(`${matchDate}T${matchTime}:00`);
      const now = new Date();
      const diff = matchDateTime.getTime() - now.getTime();
      
      if (diff <= 0) return null; // Zaten kilitli
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} gün sonra`;
      } else if (hours > 0) {
        return `${hours} saat ${minutes} dakika sonra`;
      } else {
        return `${minutes} dakika sonra`;
      }
    } catch (error) {
      return null;
    }
  };

  const lockTimeText = getLockTime();
  
  return (
    <>
      <div className="group relative">
      {/* Ana Kart - Büyük ve Özenli */}
      <div
        className={cn(
          "relative rounded-xl border bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 transition-all duration-300",
          isLocked
            ? "border-white/5 opacity-50"
            : isSelected
            ? "border-[#D69ADE] shadow-lg shadow-[#D69ADE]/20"
            : "border-white/10 hover:border-[#D69ADE]/50 hover:shadow-lg hover:shadow-[#D69ADE]/10",
          isAnimating && selectedTeam && "animate-pulse scale-[1.02]"
        )}
      >
        {/* Arka Plan Gradient */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#D69ADE]/5 to-transparent"></div>

        {/* Üst Kısım - Tarih, Saat ve Analiz Butonu */}
        <div className="relative z-10 mb-6 pb-4 border-b border-white/5">
          <div className="flex flex-col items-center gap-2 text-center">
            {/* Turnuva İsmi */}
            {tournamentName && (
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-[#B84DC7]" />
                <span className="text-xs font-semibold text-white">
                  {tournamentName}
                </span>
              </div>
            )}
            {/* Tarih ve Saat */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{matchDate} • {matchTime}</span>
              </div>
            </div>
            {/* Kilitlenme Zamanı */}
            {!isLocked && lockTimeText && (
              <div className="flex items-center justify-center gap-1 text-xs text-orange-400 mt-1">
                <Lock className="h-3 w-3" />
                <span>Tahminler {lockTimeText} kilitlenecek</span>
              </div>
            )}
            {isLocked && (
              <div className="flex items-center justify-center gap-1 text-xs text-red-400 mt-1">
                <Lock className="h-3 w-3" />
                <span>Tahminler kilitlendi</span>
              </div>
            )}
            {/* Kazanan Bildirimi */}
            {winner && (
              <div className={cn(
                "flex items-center justify-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-sm font-bold",
                userWon && "bg-green-500/20 text-green-400 border border-green-500/30",
                userLost && "bg-red-500/20 text-red-400 border border-red-500/30",
                !userPrediction && "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              )}>
                {userWon && <CheckCircle2 className="h-4 w-4" />}
                {userLost && <XCircle className="h-4 w-4" />}
                {!userPrediction && <Trophy className="h-4 w-4" />}
                <span>
                  {userWon && "✅ Doğru Tahmin!"}
                  {userLost && "❌ Yanlış Tahmin"}
                  {!userPrediction && `🏆 Kazanan: ${isAWinner ? labelA : labelB}`}
                </span>
              </div>
            )}
          </div>
          
          {/* Analiz Butonu - Sağ üst köşede */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAnalysisOpen(true);
            }}
            className="absolute top-0 right-0 p-2 rounded-lg border border-white/10 text-gray-400 hover:text-[#B84DC7] hover:border-[#B84DC7]/30 hover:bg-[#B84DC7]/10 transition-all"
            aria-label="Analiz görüntüle"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>

        {/* Soru Metni ve Takım Logoları (Winner olmayan tipler için) */}
        {!isWinnerType && questionText && (
          <div className="relative z-10 mb-6">
            {/* Takım Logoları - Hangi Maç Olduğunu Göstermek İçin */}
            {(teamA || teamB) && (
              <div className="flex items-center justify-center gap-4 mb-4">
                {teamA && (
                  <div className="flex flex-col items-center gap-2">
                    <TeamLogo teamName={teamA} logoUrl={teamALogo} size={48} className="ring-2 ring-white/20" />
                    <span className="text-xs font-semibold text-gray-400 uppercase">{teamA}</span>
                  </div>
                )}
                <span className="text-lg font-bold text-white/50">VS</span>
                {teamB && (
                  <div className="flex flex-col items-center gap-2">
                    <TeamLogo teamName={teamB} logoUrl={teamBLogo} size={48} className="ring-2 ring-white/20" />
                    <span className="text-xs font-semibold text-gray-400 uppercase">{teamB}</span>
                  </div>
                )}
              </div>
            )}
            {/* Soru Metni */}
            <div className="p-4 rounded-lg bg-black/30 border border-white/5">
              <p className="text-base font-semibold text-white text-center">
                {questionText}
              </p>
            </div>
          </div>
        )}

        {/* Ana İçerik - Takımlar */}
        <div className="relative z-10 grid grid-cols-5 gap-6 items-center">
          {/* Seçenek A */}
          <div className="col-span-2 flex flex-col items-center gap-4">
            {isWinnerType ? (
              <button
                onClick={() => handleSelect("A")}
                disabled={isLocked}
                className={cn(
                  "relative flex flex-col items-center gap-3 group/logo transition-all",
                  isLocked && "cursor-not-allowed",
                  selectedTeam === "A" && "animate-bounce-subtle"
                )}
              >
                <TeamLogo 
                  teamName={teamA} 
                  logoUrl={teamALogo}
                  size={80} 
                  className={cn(
                    "ring-4 transition-all",
                    !isLocked && "cursor-pointer hover:scale-110",
                    selectedTeam === "A"
                      ? "ring-[#D69ADE] ring-4 shadow-lg shadow-[#D69ADE]/50 scale-110"
                      : isAWinner
                      ? "ring-green-500 ring-4 shadow-lg shadow-green-500/50"
                      : userPrediction === "A" && userLost
                      ? "ring-red-500/50 ring-4"
                      : "ring-white/10 hover:ring-[#D69ADE]/50"
                  )} 
                />
                
                <div className="text-center">
                  <p className="text-xl font-black uppercase tracking-wide text-white mb-3">
                    {teamA}
                  </p>
                  
                  {/* Puan */}
                  <div className={cn(
                    "rounded-lg px-3 py-1.5 border backdrop-blur-sm inline-flex items-center gap-1.5",
                    isAWinner 
                      ? "bg-gradient-to-r from-green-500/30 to-green-600/30 border-green-500/50"
                      : "bg-gradient-to-r from-[#D69ADE]/20 to-[#C97AE0]/20 border-[#D69ADE]/30"
                  )}>
                    {isAWinner ? (
                      <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <Trophy className="h-3.5 w-3.5 text-white" />
                    )}
                    <span className={cn(
                      "text-xs font-black",
                      isAWinner ? "text-yellow-400" : "text-white"
                    )}>
                      {pointsA} Puan {isAWinner && "🏆"}
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => handleSelect("A")}
                disabled={isLocked}
                className={cn(
                  "relative w-full px-8 py-6 rounded-lg border-2 transition-all text-center",
                  !isLocked && "cursor-pointer hover:scale-105",
                  isLocked && "cursor-not-allowed",
                  selectedTeam === "A"
                    ? "border-[#D69ADE] bg-[#D69ADE]/10 shadow-lg shadow-[#D69ADE]/50 scale-105 animate-bounce-subtle"
                    : "border-white/10 hover:border-[#D69ADE]/50"
                )}
              >
                <p className="text-2xl font-black uppercase tracking-wide text-white mb-3">
                  {labelA}
                </p>
                
                {/* Puan */}
                <div className="rounded-lg bg-gradient-to-r from-[#D69ADE]/20 to-[#C97AE0]/20 px-3 py-1.5 border border-[#D69ADE]/30 inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-black text-white">{pointsA} Puan</span>
                </div>
              </button>
            )}
          </div>

          {/* VS ve Bilgiler - Orta */}
          <div className="col-span-1 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-white/20">VS</span>
              <div className="h-px w-12 bg-white/10"></div>
            </div>
          </div>

          {/* Seçenek B */}
          <div className="col-span-2 flex flex-col items-center gap-4">
            {isWinnerType ? (
              <button
                onClick={() => handleSelect("B")}
                disabled={isLocked}
                className={cn(
                  "relative flex flex-col items-center gap-3 group/logo transition-all",
                  isLocked && "cursor-not-allowed",
                  selectedTeam === "B" && "animate-bounce-subtle"
                )}
              >
                <TeamLogo 
                  teamName={teamB} 
                  logoUrl={teamBLogo}
                  size={80} 
                  className={cn(
                    "ring-4 transition-all",
                    !isLocked && "cursor-pointer hover:scale-110",
                    selectedTeam === "B"
                      ? "ring-[#B84DC7] ring-4 shadow-lg shadow-[#B84DC7]/50 scale-110"
                      : isBWinner
                      ? "ring-green-500 ring-4 shadow-lg shadow-green-500/50"
                      : userPrediction === "B" && userLost
                      ? "ring-red-500/50 ring-4"
                      : "ring-white/10 hover:ring-[#B84DC7]/50"
                  )} 
                />
                
                <div className="text-center">
                  <p className="text-xl font-black uppercase tracking-wide text-white mb-3">
                    {teamB}
                  </p>
                  
                  {/* Puan */}
                  <div className={cn(
                    "rounded-lg px-3 py-1.5 border backdrop-blur-sm inline-flex items-center gap-1.5",
                    isBWinner 
                      ? "bg-gradient-to-r from-green-500/30 to-green-600/30 border-green-500/50"
                      : "bg-gradient-to-r from-[#B84DC7]/20 to-[#C97AE0]/20 border-[#B84DC7]/30"
                  )}>
                    {isBWinner ? (
                      <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <Trophy className="h-3.5 w-3.5 text-white" />
                    )}
                    <span className={cn(
                      "text-xs font-black",
                      isBWinner ? "text-yellow-400" : "text-white"
                    )}>
                      {pointsB} Puan {isBWinner && "🏆"}
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => handleSelect("B")}
                disabled={isLocked}
                className={cn(
                  "relative w-full px-8 py-6 rounded-lg border-2 transition-all text-center",
                  !isLocked && "cursor-pointer hover:scale-105",
                  isLocked && "cursor-not-allowed",
                  selectedTeam === "B"
                    ? "border-[#B84DC7] bg-[#B84DC7]/10 shadow-lg shadow-[#B84DC7]/50 scale-105 animate-bounce-subtle"
                    : "border-white/10 hover:border-[#B84DC7]/50"
                )}
              >
                <p className="text-2xl font-black uppercase tracking-wide text-white mb-3">
                  {labelB}
                </p>
                
                {/* Puan */}
                <div className="rounded-lg bg-gradient-to-r from-[#B84DC7]/20 to-[#C97AE0]/20 px-3 py-1.5 border border-[#B84DC7]/30 inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-black text-white">{pointsB} Puan</span>
                </div>
              </button>
            )}
          </div>
        </div>

          {/* Alt Çizgi - Seçili durumda */}
          {isSelected && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] rounded-b-xl"></div>
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      <MatchAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        analysisNote={analysisNote}
        questionText={questionText}
      />
    </>
  );
}

