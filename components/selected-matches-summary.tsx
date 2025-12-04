"use client";

import { X, CheckCircle2, Lock, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamLogo from "./team-logo";

interface SelectedMatch {
  id: number;
  teamA?: string;
  teamB?: string;
  teamALogo?: string | null;
  teamBLogo?: string | null;
  selectedTeam: "A" | "B";
  matchTime: string;
  matchDate: string;
  optionALabel?: string;
  optionBLabel?: string;
  predictionType?: 'winner' | 'over_under' | 'custom';
}

interface SelectedMatchesSummaryProps {
  selectedMatches: SelectedMatch[];
  onRemoveMatch: (matchId: number) => void;
  isLocked?: boolean;
  onScrollToTop?: () => void;
  onScrollToMatch?: (matchId: number) => void;
}

export default function SelectedMatchesSummary({
  selectedMatches,
  onRemoveMatch,
  isLocked = false,
  onScrollToTop,
  onScrollToMatch,
}: SelectedMatchesSummaryProps) {
  if (selectedMatches.length === 0) {
    return null;
  }

  const getSelectedLabel = (match: SelectedMatch) => {
    if (match.predictionType === 'winner') {
      return match.selectedTeam === "A" ? match.teamA : match.teamB;
    }
    return match.selectedTeam === "A" ? match.optionALabel : match.optionBLabel;
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0e1a]/95 backdrop-blur-md transition-all duration-300",
      isLocked ? "border-[#B84DC7]/50 bg-[#0a0e1a]" : ""
    )}>
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {isLocked ? (
              <>
                <Lock className="h-5 w-5 text-[#B84DC7]" />
                <h3 className="text-lg font-bold text-white">
                  Tahminler Kilitlendi
                </h3>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-[#D69ADE]" />
                <h3 className="text-lg font-bold text-white">
                  Seçilen Maçlar ({selectedMatches.length})
                </h3>
              </>
            )}
          </div>
          
          {/* Yukarı Scroll Butonu - Her zaman göster */}
          {onScrollToTop && (
            <button
              onClick={onScrollToTop}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:scale-105 transition-all shadow-lg",
                isLocked 
                  ? "bg-gradient-to-r from-[#B84DC7] to-[#E08AF0] shadow-[#B84DC7]/30 hover:opacity-90"
                  : "bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] shadow-[#D69ADE]/30 hover:opacity-90"
              )}
              aria-label="Tahminleri görmek için yukarı git"
            >
              <ArrowUp className="h-4 w-4" />
              <span>{isLocked ? "Tahminleri Gör" : "Yukarı Git"}</span>
            </button>
          )}
        </div>

        {/* Seçilen Maçlar Listesi */}
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {selectedMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => onScrollToMatch?.(match.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border bg-gradient-to-br from-[#131720] to-[#0f172a] min-w-[300px] max-w-[320px] flex-shrink-0 transition-all cursor-pointer",
                isLocked 
                  ? "border-[#B84DC7]/50 hover:border-[#B84DC7] hover:shadow-lg hover:shadow-[#B84DC7]/20" 
                  : "border-white/10 hover:border-[#D69ADE]/50 hover:shadow-lg hover:shadow-[#D69ADE]/10"
              )}
            >
              {/* Logo - Seçilen Takım/Seçenek Logosu */}
              <div className="flex-shrink-0">
                {match.predictionType === 'winner' && match.teamA && match.teamB ? (
                  (() => {
                    const selectedTeamName = match.selectedTeam === "A" ? match.teamA : match.teamB;
                    const selectedLogo = match.selectedTeam === "A" ? match.teamALogo : match.teamBLogo;
                    const validLogo = selectedLogo && selectedLogo.trim() !== "" ? selectedLogo : null;
                    
                    // Debug: Logo URL'lerini konsola yazdır (sadece development'ta)
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`[SelectedMatchesSummary] Match ${match.id} - Selected: ${selectedTeamName} (${match.selectedTeam})`);
                      console.log(`  match.teamALogo:`, match.teamALogo);
                      console.log(`  match.teamBLogo:`, match.teamBLogo);
                      console.log(`  selectedLogo (${match.selectedTeam === "A" ? "A" : "B"}):`, selectedLogo);
                      console.log(`  validLogo:`, validLogo);
                      console.log(`  validLogo type:`, typeof validLogo);
                      console.log(`  validLogo length:`, validLogo?.length);
                      if (!validLogo) {
                        console.error(`  ❌ LOGO URL EKSİK! Selected team: ${selectedTeamName}, Logo: ${selectedLogo}`);
                      }
                    }
                    
                    return (
                      <TeamLogo
                        teamName={selectedTeamName}
                        logoUrl={validLogo}
                        size={40}
                        className={cn(
                          "ring-2 transition-all",
                          isLocked ? "ring-[#B84DC7]" : "ring-[#D69ADE]"
                        )}
                      />
                    );
                  })()
                ) : match.predictionType === 'over_under' && match.teamA && match.teamB ? (
                  // Alt/Üst tipinde: Her iki takım logosu küçük + seçim badge'i
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      {match.teamA && (
                        <TeamLogo
                          teamName={match.teamA}
                          logoUrl={match.teamALogo && match.teamALogo.trim() !== "" ? match.teamALogo : null}
                          size={20}
                          className="ring-1 ring-white/20"
                        />
                      )}
                      {match.teamB && (
                        <TeamLogo
                          teamName={match.teamB}
                          logoUrl={match.teamBLogo && match.teamBLogo.trim() !== "" ? match.teamBLogo : null}
                          size={20}
                          className="ring-1 ring-white/20"
                        />
                      )}
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded bg-gradient-to-r flex items-center justify-center text-white text-[10px] font-bold",
                      isLocked 
                        ? "from-[#B84DC7] to-[#E08AF0]" 
                        : "from-[#D69ADE] to-[#C97AE0]"
                    )}>
                      {match.selectedTeam === "A" ? match.optionALabel?.charAt(0) || "A" : match.optionBLabel?.charAt(0) || "B"}
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-xs font-bold",
                    isLocked 
                      ? "from-[#B84DC7] to-[#E08AF0]" 
                      : "from-[#D69ADE] to-[#C97AE0]"
                  )}>
                    {match.selectedTeam === "A" ? match.optionALabel?.charAt(0) || "A" : match.optionBLabel?.charAt(0) || "B"}
                  </div>
                )}
              </div>

              {/* Bilgiler */}
              <div className="flex-1 min-w-0">
                {/* Maç Bilgisi - Her zaman göster */}
                <div className="flex items-center gap-2 mb-1">
                  {match.teamA && match.teamB && (
                    <>
                      <span className="text-xs font-bold text-white uppercase truncate max-w-[80px]">
                        {match.teamA}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">VS</span>
                      <span className="text-xs font-bold text-white uppercase truncate max-w-[80px]">
                        {match.teamB}
                      </span>
                    </>
                  )}
                  {!match.teamA && !match.teamB && (
                    <span className="text-xs text-gray-400">
                      {match.matchDate} {match.matchTime}
                    </span>
                  )}
                </div>
                
                {/* Tahmin - Kısa versiyon */}
                <p className="text-xs font-semibold text-[#B84DC7] truncate">
                  {match.predictionType === 'winner' 
                    ? `Tahmin: ${getSelectedLabel(match)}`
                    : `Tahmin: ${getSelectedLabel(match)}`
                  }
                </p>
                
                {/* Tarih/Saat - Çok küçük */}
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {match.matchDate} {match.matchTime}
                </p>
              </div>

              {/* Kaldır Butonu (Kilitli değilse) */}
              {!isLocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Kart tıklamasını engelle
                    onRemoveMatch(match.id);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  aria-label="Seçimi kaldır"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Kilitliyse değiştir ikonu */}
              {isLocked && (
                <div className="text-xs text-gray-500">
                  <span className="hidden sm:inline">Tıkla ve değiştir</span>
                  <span className="sm:hidden">Değiştir</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

