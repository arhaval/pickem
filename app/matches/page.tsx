"use client";

import { useState, useEffect } from "react";
import TeamLogo from "@/components/team-logo";
import PageHeader from "@/components/page-header";
import { Clock, Radio, Trophy, ExternalLink, CheckCircle2, Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/client";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  matchTime: string;
  matchDate: string;
  status: "upcoming" | "live" | "finished";
  scoreA?: number;
  scoreB?: number;
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
    // Agresif timeout - 2 saniye sonra loading'i kapat
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    try {
      setLoading(true);
      
      // matches tablosundan sadece görüntüleme maçlarını çek - Çok kısa timeout
      const matchesPromise = supabase
        .from("matches")
        .select("*")
        .eq("is_display_match", true)
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true });
      
      const matchesTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 1500));
      const matchesResult = await Promise.race([matchesPromise, matchesTimeout]) as any;

      if (matchesResult?.error) {
        console.error("Maçlar yüklenirken hata:", matchesResult.error);
        setMatches([]);
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }
      
      const matchesData = matchesResult?.data || [];
      

      // Veritabanı formatını Match formatına çevir
      const formattedMatches: Match[] = (matchesData || []).map((match: any) => {
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
          teamA: match.team_a,
          teamB: match.team_b,
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
          // Maps henüz eklenmedi, ileride eklenebilir
        };
      });

      setMatches(formattedMatches);
    } catch (error: any) {
      console.error("Maçlar yüklenirken hata:", error);
      setMatches([]);
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Filtreleme yok, sadece bugünün maçları gösteriliyor


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
            <p className="text-gray-400">Maç bulunamadı.</p>
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

                        <div className="relative z-10 p-6">
                          {/* Üst Kısım - Turnuva */}
                          <div className="mb-4 text-center">
                            {match.tournamentName && (
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-[#B84DC7]" />
                                <span className="text-sm font-semibold text-white">
                                  {match.tournamentName}
                                  {match.tournamentStage && ` - ${match.tournamentStage}`}
                                </span>
                              </div>
                            )}
                            {/* Saat, Format ve Haritalar */}
                            <div className="flex items-center justify-center gap-3 text-sm text-gray-400 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{match.matchDate} • {match.matchTime}</span>
                              </div>
                              {match.format && (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                    {match.format}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Ana Maç Bilgisi */}
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Takım A */}
                            <div className="col-span-4 flex items-center gap-2 justify-end">
                              {match.hltvRankingA && (
                                <span className="text-sm font-bold text-[#B84DC7]">#{match.hltvRankingA}</span>
                              )}
                              <TeamLogo 
                                teamName={match.teamA} 
                                size={64} 
                                className="ring-2 ring-white/10"
                              />
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">
                                  {match.teamA}
                                </h3>
                              </div>
                            </div>

                            {/* VS / Skor */}
                            <div className="col-span-4 flex flex-col items-center justify-center">
                              {match.status === "live" ? (
                                <div className="text-center">
                                  <div className="text-2xl font-black text-red-500">
                                    {match.scoreA || 0} - {match.scoreB || 0}
                                  </div>
                                </div>
                              ) : match.status === "finished" ? (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-white">
                                    {match.scoreA || 0} - {match.scoreB || 0}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="text-xl font-bold text-gray-500 mb-1">VS</div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span>{match.matchTime}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Takım B */}
                            <div className="col-span-4 flex items-center gap-2 justify-start">
                              <div className="flex-1 text-right">
                                <h3 className="text-lg font-bold text-white">
                                  {match.teamB}
                                </h3>
                              </div>
                              <TeamLogo 
                                teamName={match.teamB} 
                                size={64} 
                                className="ring-2 ring-white/10"
                              />
                              {match.hltvRankingB && (
                                <span className="text-sm font-bold text-[#B84DC7]">#{match.hltvRankingB}</span>
                              )}
                            </div>
                          </div>

                          {/* Alt Kısım - Yayın Platformları (Ortada) */}
                          {match.streamLinks && (
                            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10 flex-wrap">
                                {/* Twitch */}
                                {match.streamLinks.twitch && (
                                  <a
                                    href={match.streamLinks.twitch.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#9146FF]/20 border border-[#9146FF]/30 text-[#9146FF] hover:bg-[#9146FF]/30 transition-all text-sm font-semibold"
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
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000] hover:bg-[#FF0000]/30 transition-all text-sm font-semibold"
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
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#53FC18]/20 border border-[#53FC18]/30 text-[#53FC18] hover:bg-[#53FC18]/30 transition-all text-sm font-semibold"
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
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm font-semibold"
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
