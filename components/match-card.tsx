import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  id: number;
  team_a: string;
  team_b: string;
  team_a_logo?: string | null;
  team_b_logo?: string | null;
  match_date: string;
  match_time?: string;
  difficulty_score_a?: number;
  difficulty_score_b?: number;
}

export function MatchCard({
  id,
  team_a,
  team_b,
  team_a_logo,
  team_b_logo,
  match_date,
  difficulty_score_a,
  difficulty_score_b,
}: MatchCardProps) {
  // Tarihi formatla
  const formattedDate = new Date(match_date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

  // Logo yoksa kullanılacak varsayılan resim
  const fallbackLogo = "https://placehold.co/64x64/2a2a2a/FFF?text=?";

  return (
    <div className="relative overflow-hidden border border-white/10 rounded-xl bg-black/40 backdrop-blur-md transition-all hover:border-[#B84DC7]/50 group">
      {/* Arka Plan Efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B84DC7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* SOL TAKIM */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 text-center md:text-left">
          <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl bg-gray-900/50 flex items-center justify-center p-2 border border-white/5">
            <Image
              src={team_a_logo || fallbackLogo}
              alt={team_a}
              width={64}
              height={64}
              className="object-contain w-full h-full"
              unoptimized // Resim yükleme hatalarını önler
            />
          </div>
          <div>
            <h3 className="font-bold text-xl md:text-2xl uppercase tracking-wider text-white">
              {team_a}
            </h3>
            <span className="text-sm font-medium text-emerald-400">
              Oran: {difficulty_score_a || "1.0"}
            </span>
          </div>
        </div>

        {/* ORTA BÖLÜM (VS) */}
        <div className="flex flex-col items-center justify-center shrink-0 px-4">
          <span className="text-3xl font-black italic text-white/10 group-hover:text-primary/50 transition-colors">
            VS
          </span>
          <span className="text-xs text-muted-foreground mt-1 capitalize">
            {formattedDate}
          </span>
        </div>

        {/* SAĞ TAKIM */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-4 flex-1 text-center md:text-right">
          <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl bg-gray-900/50 flex items-center justify-center p-2 border border-white/5">
            <Image
              src={team_b_logo || fallbackLogo}
              alt={team_b}
              width={64}
              height={64}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>
          <div>
            <h3 className="font-bold text-xl md:text-2xl uppercase tracking-wider text-white">
              {team_b}
            </h3>
            <span className="text-sm font-medium text-amber-400">
              Oran: {difficulty_score_b || "1.0"}
            </span>
          </div>
        </div>
      </div>

      {/* SEÇİM BUTONLARI (MOBİLDE ALTTA) */}
      <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5">
        <Button 
          variant="ghost" 
          className="h-12 rounded-none hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors text-sm uppercase font-bold"
        >
          {team_a} Seç
        </Button>
        <Button 
          variant="ghost" 
          className="h-12 rounded-none hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase font-bold"
        >
          {team_b} Seç
        </Button>
      </div>
    </div>
  );
}