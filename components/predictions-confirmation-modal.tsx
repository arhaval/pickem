"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Loader2 } from "lucide-react";
import TeamLogo from "./team-logo";
import { cn } from "@/lib/utils";

interface ConfirmationMatch {
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

interface PredictionsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  matches: ConfirmationMatch[];
  isSubmitting?: boolean;
}

export default function PredictionsConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  matches,
  isSubmitting = false,
}: PredictionsConfirmationModalProps) {
  const getSelectedLabel = (match: ConfirmationMatch) => {
    if (match.predictionType === 'winner') {
      return match.selectedTeam === "A" ? match.teamA : match.teamB;
    }
    return match.selectedTeam === "A" ? match.optionALabel : match.optionBLabel;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#0f172a] border-white/10 text-white rounded-xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-[#B84DC7]" />
            Tahminleri Onayla
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Lütfen tahminlerinizi kontrol edin ve onaylayın. Onayladıktan sonra tahminlerinizi değiştiremezsiniz.
          </DialogDescription>
        </DialogHeader>

        {/* Tahmin Listesi - Scroll edilebilir */}
        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          <div className="space-y-3">
            {matches.map((match, index) => (
              <div
                key={match.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-br from-[#131720] to-[#0f172a]",
                  "border-white/10 hover:border-[#D69ADE]/30 transition-all"
                )}
              >
                {/* Sıra Numarası */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Logo veya Label */}
                <div className="flex-shrink-0">
                  {match.predictionType === 'winner' && match.teamA && match.teamB ? (
                    <TeamLogo
                      teamName={match.selectedTeam === "A" ? match.teamA : match.teamB}
                      logoUrl={
                        match.selectedTeam === "A" 
                          ? (match.teamALogo && match.teamALogo.trim() !== "" ? match.teamALogo : null)
                          : (match.teamBLogo && match.teamBLogo.trim() !== "" ? match.teamBLogo : null)
                      }
                      size={48}
                      className="ring-2 ring-[#D69ADE]"
                    />
                  ) : match.predictionType === 'over_under' && match.teamA && match.teamB ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        {match.teamA && (
                          <TeamLogo
                            teamName={match.teamA}
                            logoUrl={match.teamALogo && match.teamALogo.trim() !== "" ? match.teamALogo : null}
                            size={24}
                            className="ring-1 ring-white/20"
                          />
                        )}
                        {match.teamB && (
                          <TeamLogo
                            teamName={match.teamB}
                            logoUrl={match.teamBLogo && match.teamBLogo.trim() !== "" ? match.teamBLogo : null}
                            size={24}
                            className="ring-1 ring-white/20"
                          />
                        )}
                      </div>
                      <div className="w-6 h-6 rounded bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center text-white text-[10px] font-bold">
                        {match.selectedTeam === "A" ? match.optionALabel?.charAt(0) || "A" : match.optionBLabel?.charAt(0) || "B"}
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center text-white text-xs font-bold">
                      {match.selectedTeam === "A" ? match.optionALabel?.charAt(0) || "A" : match.optionBLabel?.charAt(0) || "B"}
                    </div>
                  )}
                </div>

                {/* Maç Bilgileri */}
                <div className="flex-1 min-w-0">
                  {/* Maç */}
                  {match.teamA && match.teamB ? (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white uppercase truncate max-w-[100px]">
                        {match.teamA}
                      </span>
                      <span className="text-xs text-gray-500 font-bold">VS</span>
                      <span className="text-sm font-bold text-white uppercase truncate max-w-[100px]">
                        {match.teamB}
                      </span>
                    </div>
                  ) : match.predictionType === 'over_under' && match.teamA && match.teamB ? (
                    <p className="text-sm font-semibold text-white mb-1">
                      {match.teamA} vs {match.teamB}
                    </p>
                  ) : null}

                  {/* Tahmin */}
                  <p className="text-sm font-semibold text-[#B84DC7] mb-1">
                    Tahmin: {getSelectedLabel(match)}
                  </p>

                  {/* Tarih/Saat */}
                  <p className="text-xs text-gray-400">
                    {match.matchDate} {match.matchTime}
                  </p>
                </div>

                {/* Onay İşareti */}
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-[#B84DC7]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toplam */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Toplam Tahmin</span>
            <span className="text-xl font-bold text-[#B84DC7]">{matches.length}</span>
          </div>
        </div>

        {/* Footer Butonları */}
        <DialogFooter className="border-t border-white/5 pt-4 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-white/10 text-white hover:bg-white/5"
          >
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Onayla ve Gönder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


