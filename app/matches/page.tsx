"use client";

import { useState, useEffect, useMemo } from "react";
import TeamLogo from "@/components/team-logo";
import PageHeader from "@/components/page-header";
import { Clock, Radio, Trophy, ExternalLink, CheckCircle2, Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/client";
import Image from "next/image";

interface Team {
  id: string | number;
  name: string;
  short_code: string | null;
  logo_url: string | null;
}

interface Match {
  id: string;
  team_a_id: string | number;
  team_b_id: string | number;
  team_a: Team | null;
  team_b: Team | null;
  matchTime: string;
  matchDate: string;
  status: "upcoming" | "live" | "finished";
  scoreA?: number;
  scoreB?: number;
  winner?: string | null; // "A" veya "B"
  tournamentName?: string;
  tournamentStage?: string;
  format?: string; // BO1, BO3, BO5
  streamChannelName?: string; // Yayıncı ismi
  hltvRankingA?: number; // Takım A'nın HLTV sıralaması
  hltvRankingB?: number; // Takım B'nin HLTV sıralaması
  streamLinks?: {
    twitch?: {
      url: string;
      channelName: string;
    };
    youtube?: {
      url: string;
      channelName: string;
    };
    kick?: {
      url: string;
      channelName: string;
    };
  };
  hltvUrl?: string;
  maps?: Array<{
    name: string;
    scoreA?: number;
    scoreB?: number;
  }>;
}

// Artık maçlar Supabase'den çekiliyor

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Supabase'den maçları yükle - Sadece bir kez
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      // matches tablosundan sadece görüntüleme maçlarını çek - Teams ile join ederek
      const { data: matchesData, error } = await supabase
        .from("matches")
        .select(`
          id,
          match_time,
          match_date,
          tournament_name,
          tournament_stage,
          match_format,
          hltv_ranking_a,
          hltv_ranking_b,
          hltv_url,
          stream_links,
          score_a,
          score_b,
          winner,
          team_a:teams!matches_team_a_id_fkey (
            id,
            name,
            short_code,
            logo_url
          ),
          team_b:teams!matches_team_b_id_fkey (
            id,
            name,
            short_code,
            logo_url
          )
        `)
        .eq("is_display_match", true)
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true });

      if (error) {
        console.error("Maçlar yüklenirken hata:", error);
        setMatches([]);
        return;
      }

      // Veritabanı formatını Match formatına çevir
      const formattedMatches: Match[] = (matchesData || []).map((match: any) => {
        // Join'den gelen team bilgileri zaten mevcut
        const teamAName = match.team_a?.name || '';
        const teamBName = match.team_b?.name || '';
        const teamALogo = match.team_a?.logo_url || null;
        const teamBLogo = match.team_b?.logo_url || null;
        // Tarih formatını düzenle (YYYY-MM-DD -> DD.MM.YYYY)
        let formattedDate = match.match_date || "";
        if (formattedDate) {
          const date = new Date(formattedDate);
          formattedDate = date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }

        // Status belirleme: winner varsa "finished", yoksa maç saati geçmişse "live", gelecekte ise "upcoming"
        let status: "upcoming" | "live" | "finished" = "upcoming";
        if (match.winner) {
          status = "finished";
        } else if (match.match_date && match.match_time) {
          const matchDateTime = new Date(`${match.match_date}T${match.match_time}`);
          const now = new Date();
          if (matchDateTime <= now) {
            status = "live";
          }
        }

        // Stream links parse et
        let streamLinks: any = undefined;
        if ((match as any).stream_links) {
          try {
            const parsed = typeof (match as any).stream_links === 'string' 
              ? JSON.parse((match as any).stream_links) 
              : (match as any).stream_links;
            if (parsed && Object.keys(parsed).length > 0) {
              streamLinks = parsed;
            }
          } catch (e) {
            // Parse hatası - sessizce devam et
          }
        }

        return {
          id: match.id,
          teamA: teamAName,
          teamB: teamBName,
          teamALogo: teamALogo,
          teamBLogo: teamBLogo,
          matchTime: match.match_time,
          matchDate: formattedDate,
          status: status,
          tournamentName: match.tournament_name || undefined,
          tournamentStage: (match as any).tournament_stage || undefined,
          format: (match as any).match_format || undefined,
          hltvRankingA: (match as any).hltv_ranking_a || undefined,
          hltvRankingB: (match as any).hltv_ranking_b || undefined,
          hltvUrl: (match as any).hltv_url || undefined,
          streamLinks: streamLinks,
          scoreA: (match as any).score_a || undefined,
          scoreB: (match as any).score_b || undefined,
          winner: match.winner || null,
          // Maps henüz eklenmedi, ileride eklenebilir
        };
      });

      setMatches(formattedMatches);
      console.log("Maçlar sayfası - Maçlar yüklendi:", formattedMatches.length);
    } catch (error: any) {
      console.error("Maçlar yüklenirken hata:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoize edilmiş maçlar - performans için
  const memoizedMatches = useMemo(() => matches, [matches]);

  return (
    <div className="min-h-screen relative bg-[#0a0e1a]">
      {/* Page Header Banner */}
      <PageHeader type="matches" />

      {/* Ana İçerik */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#B84DC7]" />
          </div>
        ) : (
          <>
            {/* Maçlar */}
        {matches.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#B84DC7]/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-[#B84DC7]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-2">Şu anda gösterilecek maç bulunmuyor</p>
                <p className="text-sm text-gray-400">Yakında yeni maçlar eklenecek. Lütfen daha sonra tekrar kontrol edin.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
                      <div
                        key={match.id}
                        className={cn(
                          "relative rounded-xl border bg-gradient-to-br from-[#131720] to-[#0f172a] overflow-hidden transition-all duration-300",
                          match.status === "live"
                            ? "border-red-500/50 shadow-lg shadow-red-500/20"
                            : match.status === "finished"
                            ? "border-gray-500/30 opacity-75"
                            : "border-white/10 hover:border-[#D69ADE]/50 hover:shadow-lg hover:shadow-[#D69ADE]/10"
                        )}
                      >
                        {/* Arka Plan Efektleri */}
                        <div className="absolute inset-0 overflow-hidden">
                          {match.status === "live" && (
                            <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                          )}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D69ADE]/5 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10 p-4">
                          {/* Üst Kısım - Turnuva */}
                          <div className="mb-3 text-center">
                            {/* Logo - Turnuva İsminin Üstünde */}
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#B84DC7]"></div>
                              <div className="relative h-4 w-4">
                                <Image
                                  src="/logo.png"
                                  alt="Arhaval"
                                  width={16}
                                  height={16}
                                  className="object-contain w-full h-full brightness-0 invert"
                                />
                              </div>
                              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#B84DC7]"></div>
                            </div>
                            
                            {match.tournamentName && (
                              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                <Trophy className="h-3.5 w-3.5 text-[#B84DC7]" />
                                <span className="text-xs font-semibold text-white">
                                  {match.tournamentName}
                                  {match.tournamentStage && ` - ${match.tournamentStage}`}
                                </span>
                              </div>
                            )}
                            {/* Saat, Format ve Haritalar */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>{match.matchDate} • {match.matchTime}</span>
                              </div>
                              {match.format && (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                    {match.format}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Ana Maç Bilgisi */}
                          <div className="grid grid-cols-12 gap-3 items-center">
                            {/* Takım A */}
                            <div className={cn(
                              "col-span-4 flex flex-col items-center gap-3 justify-center transition-all",
                              match.winner === "A" && match.status === "finished" && "bg-green-500/10 rounded-lg p-3 border border-green-500/30"
                            )}>
                              {match.hltvRankingA && (
                                <span className="text-xs font-bold text-[#B84DC7]">#{match.hltvRankingA}</span>
                              )}
                              <TeamLogo 
                                teamName={match.teamA} 
                                logoUrl={match.teamALogo}
                                size={48} 
                                className={cn(
                                  "ring-2 transition-all flex-shrink-0",
                                  match.winner === "A" ? "ring-green-500/50 shadow-lg shadow-green-500/30" : "ring-white/10"
                                )}
                              />
                              <div className="text-center">
                                <div className="flex items-center gap-1.5 justify-center">
                                  <h3 className={cn(
                                    "text-base font-bold transition-all",
                                    match.winner === "A" ? "text-green-400" : "text-white"
                                  )}>
                                    {match.teamA}
                                  </h3>
                                  {match.winner === "A" && (
                                    <Trophy className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* VS / Skor */}
                            <div className="col-span-4 flex flex-col items-center justify-center min-h-[60px]">
                              {match.status === "live" ? (
                                <div className="text-center">
                                  <div className="text-xl font-black text-red-500">
                                    {match.scoreA || 0} - {match.scoreB || 0}
                                  </div>
                                </div>
                              ) : match.status === "finished" ? (
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <div className={cn(
                                      "text-2xl font-black transition-all min-w-[24px] text-center",
                                      match.winner === "A" ? "text-green-400" : match.winner === "B" ? "text-green-400" : "text-white"
                                    )}>
                                      {match.scoreA || 0}
                                    </div>
                                    <span className="text-xl font-bold text-gray-500">-</span>
                                    <div className={cn(
                                      "text-2xl font-black transition-all min-w-[24px] text-center",
                                      match.winner === "B" ? "text-green-400" : match.winner === "A" ? "text-green-400" : "text-white"
                                    )}>
                                      {match.scoreB || 0}
                                    </div>
                                  </div>
                                  {match.winner && (
                                    <div className="text-[10px] text-green-400 font-semibold">
                                      {match.winner === "A" ? match.teamA : match.teamB} Kazandı
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-500">VS</div>
                                </div>
                              )}
                            </div>

                            {/* Takım B */}
                            <div className={cn(
                              "col-span-4 flex flex-col items-center gap-3 justify-center transition-all",
                              match.winner === "B" && match.status === "finished" && "bg-green-500/10 rounded-lg p-3 border border-green-500/30"
                            )}>
                              {match.hltvRankingB && (
                                <span className="text-xs font-bold text-[#B84DC7]">#{match.hltvRankingB}</span>
                              )}
                              <TeamLogo 
                                teamName={match.teamB} 
                                logoUrl={match.teamBLogo}
                                size={48} 
                                className={cn(
                                  "ring-2 transition-all flex-shrink-0",
                                  match.winner === "B" ? "ring-green-500/50 shadow-lg shadow-green-500/30" : "ring-white/10"
                                )}
                              />
                              <div className="text-center">
                                <div className="flex items-center gap-1.5 justify-center">
                                  <h3 className={cn(
                                    "text-base font-bold transition-all",
                                    match.winner === "B" ? "text-green-400" : "text-white"
                                  )}>
                                    {match.teamB}
                                  </h3>
                                  {match.winner === "B" && (
                                    <Trophy className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Alt Kısım - Yayın Platformları (Ortada) */}
                          {match.streamLinks && (
                            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10 flex-wrap">
                                {/* Twitch */}
                                {match.streamLinks.twitch && (
                                  <a
                                    href={match.streamLinks.twitch.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9146FF]/20 border border-[#9146FF]/30 text-[#9146FF] hover:bg-[#9146FF]/30 transition-all text-xs font-semibold"
                                  >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428H12l-3 3v-3H4.714V1.714h15.857Z" />
                                    </svg>
                                    <span>{match.streamLinks.twitch.channelName}</span>
                                  </a>
                                )}
                                
                                {/* YouTube */}
                                {match.streamLinks.youtube && (
                                  <a
                                    href={match.streamLinks.youtube.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000] hover:bg-[#FF0000]/30 transition-all text-xs font-semibold"
                                  >
                                    <Youtube className="h-4 w-4" />
                                    <span>{match.streamLinks.youtube.channelName}</span>
                                  </a>
                                )}
                                
                                {/* Kick */}
                                {match.streamLinks.kick && (
                                  <a
                                    href={match.streamLinks.kick.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#53FC18]/20 border border-[#53FC18]/30 text-[#53FC18] hover:bg-[#53FC18]/30 transition-all text-xs font-semibold"
                                  >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-1 4v12h2V6h-2zm4 0v12h2V6h-2z"/>
                                    </svg>
                                    <span>{match.streamLinks.kick.channelName}</span>
                                  </a>
                                )}
                                
                              {/* HLTV Link */}
                              {match.hltvUrl && (
                                <a
                                  href={match.hltvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-xs font-semibold"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span>HLTV</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
