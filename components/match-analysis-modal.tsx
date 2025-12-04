"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BarChart3 } from "lucide-react";

interface MatchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisNote: string | null | undefined;
  questionText?: string | null;
}

export default function MatchAnalysisModal({
  isOpen,
  onClose,
  analysisNote,
  questionText,
}: MatchAnalysisModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-[#B84DC7]" />
            <DialogTitle>Maç Analizi</DialogTitle>
          </div>
          {questionText && (
            <DialogDescription className="text-left text-base text-gray-300 font-medium">
              {questionText}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">
          {analysisNote ? (
            <div className="prose prose-invert max-w-none">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 leading-relaxed whitespace-pre-wrap">
                {analysisNote}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Bu maç için analiz girilmedi</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

