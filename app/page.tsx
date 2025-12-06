"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import TeamLogo from "@/components/team-logo";
import { Trophy, ArrowRight, Calendar, Clock, Youtube, Radio, ExternalLink, Target, Twitch, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import SponsorBanner from "@/components/sponsor-banner";

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_time: string;
  match_date: string | null;
  difficulty_score_a: number;
  difficulty_score_b: number;
  tournament_name: string | null;
  team_a_logo?: string | null;
  team_b_logo?: string | null;
}

interface MatchOfTheDay {
  team_a: string;
  team_b: string;
  team_a_logo?: string | null;
  team_b_logo?: string | null;
  match_date: string | null;
  match_time: string;
  tournament_name?: string | null;
  streams?: Array<{
    platform: string;
    channel: string;
  }>;
}

interface Team {
  id: number;
  name: string;
  logo_url: string;
  short_code: string;
}

// TODO: YouTube API veya backend'den gerçek video listesi bağlanacak
interface YouTubeVideo {
  title: string;
  thumbnailUrl: string;
  href: string;
}


export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchOfTheDay, setMatchOfTheDay] = useState<MatchOfTheDay | null>(null);
  const [homepagePicks, setHomepagePicks] = useState<Match[]>([]);
  const [picksLoading, setPicksLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadMatchOfTheDay();
    loadHomepagePicks();
    loadHomepageVideos();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Takımları yükle
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (teamsError) {
        console.error("Takımlar yüklenirken hata:", teamsError);
        setTeams([]);
      } else {
        setTeams(teamsData || []);
      }

    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchOfTheDay = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle() as any;

      if (error || !data) {
        console.error("Günün maçı yüklenirken hata:", error);
        // Maç bilgisi yok - null bırak
        setMatchOfTheDay(null);
        return;
      }

      // Streams'i parse et
      let parsedStreams: Array<{ platform: string; channel: string }> = [];
      if ((data as any).match_of_the_day_streams) {
        try {
          const streamsData = (data as any).match_of_the_day_streams;
          parsedStreams = typeof streamsData === "string" 
            ? JSON.parse(streamsData)
            : streamsData;
          if (!Array.isArray(parsedStreams)) {
            parsedStreams = [];
          }
        } catch (e) {
          parsedStreams = [];
        }
      }

      // Eğer match_of_the_day_id varsa, maç bilgilerini yükle
      if ((data as any).match_of_the_day_id) {
        try {
          const { data: matchData, error: matchError } = await supabase
            .from("matches")
            .select("*")
            .eq("id", (data as any).match_of_the_day_id)
            .single();

          if (!matchError && matchData) {
            const match = matchData as any;
            // Takım logolarını bul
            const teamA = teams.find((t) => t.name === match.team_a);
            const teamB = teams.find((t) => t.name === match.team_b);

            setMatchOfTheDay({
              team_a: match.team_a,
              team_b: match.team_b,
              team_a_logo: teamA?.logo_url || null,
              team_b_logo: teamB?.logo_url || null,
              match_date: match.match_date || null,
              match_time: match.match_time || "20:00",
              tournament_name: match.tournament_name || null,
              streams: parsedStreams,
            });
            return;
          }
        } catch (matchErr) {
          console.error("Match ID'den maç yüklenirken hata:", matchErr);
        }
      }

      // Match ID yoksa veya yüklenemediyse, manuel bilgileri kullan
      if ((data as any).match_of_the_day_team_a && (data as any).match_of_the_day_team_b) {
        setMatchOfTheDay({
          team_a: (data as any).match_of_the_day_team_a,
          team_b: (data as any).match_of_the_day_team_b,
          team_a_logo: (data as any).match_of_the_day_team_a_logo,
          team_b_logo: (data as any).match_of_the_day_team_b_logo,
          match_date: (data as any).match_of_the_day_date,
          match_time: (data as any).match_of_the_day_time || "20:00",
          tournament_name: (data as any).match_of_the_day_tournament,
          streams: parsedStreams,
        });
      } else {
        // Maç bilgisi yok - null bırak
        setMatchOfTheDay(null);
      }
    } catch (error) {
      console.error("Günün maçı yüklenirken hata:", error);
      // Hata durumunda da null bırak
      setMatchOfTheDay(null);
    }
  };

  const loadHomepagePicks = async () => {
    try {
      setPicksLoading(true);
      // TODO: Homepage pick match IDs bağlanacak
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle() as any;

      if (error || !data || !data?.homepage_pick_match_ids) {
        // Kolon yoksa veya hata varsa sessizce devam et
        if (error && error.message && (
          error.message.includes("homepage_pick_match_ids") ||
          error.message.includes("column") ||
          error.message.includes("schema cache")
        )) {
          console.warn("homepage_pick_match_ids kolonu bulunamadı. Migration dosyasını çalıştırın.");
        } else if (error) {
          console.error("Homepage picks yüklenirken hata:", error);
        }
        setHomepagePicks([]);
        return;
      }

      // JSON string ise parse et
      let matchIds: string[] = [];
      if (typeof data.homepage_pick_match_ids === 'string') {
        try {
          matchIds = JSON.parse(data.homepage_pick_match_ids);
        } catch (e) {
          console.error("Homepage pick match IDs parse hatası:", e);
          setHomepagePicks([]);
          return;
        }
      } else if (Array.isArray(data.homepage_pick_match_ids)) {
        matchIds = data.homepage_pick_match_ids;
      }

      if (!matchIds || matchIds.length === 0) {
        setHomepagePicks([]);
        return;
      }

      // Match IDs'den maçları çek
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .in("id", matchIds.slice(0, 3)); // Maksimum 3 maç

      if (matchesError) {
        console.error("Homepage pick maçları yüklenirken hata:", matchesError);
        setHomepagePicks([]);
      } else {
        setHomepagePicks(matchesData || []);
      }
    } catch (error) {
      console.error("Homepage picks yüklenirken hata:", error);
      setHomepagePicks([]);
    } finally {
      setPicksLoading(false);
    }
  };

  const loadHomepageVideos = async () => {
    try {
      setVideosLoading(true);
      
      // Kolon yoksa hata vermemek için try-catch içinde sorgu yapıyoruz
      let data: any = null;
      try {
        const { data: settingsData, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (error) {
          // Kolon yoksa veya başka bir hata varsa sessizce devam et
          if (error.message && error.message.includes("homepage_videos")) {
            console.warn("homepage_videos kolonu bulunamadı. Migration dosyasını çalıştırın.");
            setVideos([]);
            setVideosLoading(false);
            return;
          }
          throw error;
        }
        data = settingsData;
      } catch (queryError: any) {
        // Schema hatası (kolon yok) durumunda sessizce devam et
        if (queryError?.message && (
          queryError.message.includes("homepage_videos") ||
          queryError.message.includes("column") ||
          queryError.message.includes("schema")
        )) {
          console.warn("homepage_videos kolonu henüz oluşturulmamış.");
          setVideos([]);
          setVideosLoading(false);
          return;
        }
        throw queryError;
      }

      // Data yoksa veya kolon yoksa boş array döndür
      if (!data || !('homepage_videos' in data) || !data.homepage_videos) {
        setVideos([]);
        setVideosLoading(false);
        return;
      }

      // JSON string ise parse et
      let videosData: YouTubeVideo[] = [];
      if (typeof data.homepage_videos === 'string') {
        try {
          videosData = JSON.parse(data.homepage_videos);
        } catch (e) {
          console.error("Homepage videos parse hatası:", e);
          setVideos([]);
          setVideosLoading(false);
          return;
        }
      } else if (Array.isArray(data.homepage_videos)) {
        videosData = data.homepage_videos;
      }

      if (!videosData || videosData.length === 0) {
        setVideos([]);
      } else {
        // Maksimum 3 video göster ve thumbnail'leri otomatik çıkar
        const processedVideos = videosData.slice(0, 3).map((video: YouTubeVideo) => {
          // Eğer thumbnail yoksa ama href varsa, otomatik thumbnail çıkar
          if (!video.thumbnailUrl && video.href) {
            const thumbnail = extractYouTubeThumbnail(video.href);
            return { ...video, thumbnailUrl: thumbnail || video.thumbnailUrl };
          }
          return video;
        });
        setVideos(processedVideos);
      }
    } catch (error: any) {
      // Beklenmeyen hatalar için console'a yaz ama uygulamayı bozma
      console.error("Homepage videos yüklenirken hata:", error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const getTeamInfo = (teamName: string) => {
    return teams.find((t) => t.name === teamName);
  };

  // YouTube URL'sinden thumbnail URL'i çıkar
  const extractYouTubeThumbnail = (url: string): string => {
    // Boş veya geçersiz URL kontrolü
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return "";
    }
    
    // URL'yi temizle ve normalize et
    let cleanUrl = url.trim();
    
    // Farklı YouTube URL formatlarını destekle
    const patterns = [
      // https://www.youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      // https://youtu.be/VIDEO_ID
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      // https://www.youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      // https://www.youtube.com/v/VIDEO_ID
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      // https://m.youtube.com/watch?v=VIDEO_ID
      /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        // maxresdefault kullan, yoksa hqdefault'a düşer
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    return "";
  };


  const scrollToMatches = () => {
    const element = document.getElementById("tahminler");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative bg-[#0a0e1a]">
      {/* HERO BÖLÜMÜ */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Arka Plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#131720] to-[#0f172a]">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#D69ADE]/10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#B84DC7]/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* İçerik */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-6">
            CS2 Tahmin Arenasına
            <br />
            <span className="bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] bg-clip-text text-transparent">
              Hoş Geldin.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Maçları seç, tahminini yap, sezon sonunda ödülleri kap.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold text-lg px-8 py-6 hover:scale-105 hover:shadow-2xl hover:shadow-[#D69ADE]/50 transition-all"
            >
              <Link href="/predictions">
                Tahminlere Başla
              </Link>
            </Button>
            <button
              onClick={scrollToMatches}
              className="border-2 border-white/20 text-white font-bold text-lg px-8 py-6 rounded-md hover:bg-white/10 hover:border-white/40 transition-all"
            >
              PICK EM
            </button>
          </div>
        </div>
      </section>

      {/* PARTNERLERİMİZ BÖLÜMÜ */}
      <SponsorBanner />

      {/* GÜNÜN MAÇI BÖLÜMÜ */}
      {/* GÜNÜN MAÇI BÖLÜMÜ */}
      <section className="relative py-16 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#B84DC7]"></div>
              <div className="relative h-6 w-6">
                <Image
                  src="/logo.png"
                  alt="Arhaval"
                  width={24}
                  height={24}
                  className="object-contain w-full h-full brightness-0 invert"
                />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#B84DC7]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-3">
              <span className="bg-gradient-to-r from-[#B84DC7] via-[#D69ADE] to-[#B84DC7] bg-clip-text text-transparent">
                Günün Maçı
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Öne Çıkan Maç
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-1 w-24 bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] rounded-full"></div>
          </div>

          {matchOfTheDay ? (
            <div className="relative rounded-2xl border-2 border-[#B84DC7]/30 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] overflow-hidden">
              {/* Arka Plan Efektleri */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#B84DC7]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D69ADE]/10 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 p-8 md:p-10">
                {/* Turnuva Bilgisi */}
                {matchOfTheDay.tournament_name && (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B84DC7]/10 border border-[#B84DC7]/30">
                      <Trophy className="h-4 w-4 text-[#B84DC7]" />
                      <span className="text-sm font-bold text-[#B84DC7] uppercase tracking-wide">
                        {matchOfTheDay.tournament_name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tarih ve Saat */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {matchOfTheDay.match_date
                        ? (() => {
                            const date = new Date(matchOfTheDay.match_date);
                            const day = date.getDate();
                            const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                            const month = monthNames[date.getMonth()];
                            return `${day} ${month}`;
                          })()
                        : "Tarih yok"}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/10"></div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {matchOfTheDay.match_time?.split(':').slice(0, 2).join(':') || "00:00"}
                    </span>
                  </div>
                </div>

                {/* Yayın Bilgileri */}
                {matchOfTheDay.streams && matchOfTheDay.streams.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {matchOfTheDay.streams.map((stream, index) => (
                        <a
                          key={index}
                          href={
                            stream.platform === "twitch"
                              ? `https://twitch.tv/${stream.channel}`
                              : stream.platform === "youtube"
                              ? `https://youtube.com/@${stream.channel}`
                              : `https://kick.com/${stream.channel}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                          {stream.platform === "twitch" ? (
                            <Twitch className="h-4 w-4 text-[#9146FF] group-hover:scale-110 transition-transform" />
                          ) : stream.platform === "youtube" ? (
                            <Youtube className="h-4 w-4 text-[#FF0000] group-hover:scale-110 transition-transform" />
                          ) : (
                            <Radio className="h-4 w-4 text-[#53FC18] group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-sm font-bold text-white">{stream.channel}</span>
                          <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-white transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Takımlar */}
                <div className="grid grid-cols-5 gap-6 items-center">
                  {/* Takım A */}
                  <div className="col-span-2 flex flex-col items-center gap-4">
                    <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center shrink-0">
                      {matchOfTheDay.team_a_logo ? (
                        <img
                          src={matchOfTheDay.team_a_logo}
                          alt={matchOfTheDay.team_a}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <TeamLogo teamName={matchOfTheDay.team_a} size={128} className="w-full h-full" />
                      )}
                    </div>
                    <p className="text-xl md:text-2xl font-black uppercase tracking-wide text-white text-center break-words max-w-full">
                      {matchOfTheDay.team_a}
                    </p>
                  </div>

                  {/* VS */}
                  <div className="col-span-1 flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black text-white/20">VS</span>
                  </div>

                  {/* Takım B */}
                  <div className="col-span-2 flex flex-col items-center gap-4">
                    <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center shrink-0">
                      {matchOfTheDay.team_b_logo ? (
                        <img
                          src={matchOfTheDay.team_b_logo}
                          alt={matchOfTheDay.team_b}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <TeamLogo teamName={matchOfTheDay.team_b} size={128} className="w-full h-full" />
                      )}
                    </div>
                    <p className="text-xl md:text-2xl font-black uppercase tracking-wide text-white text-center break-words max-w-full">
                      {matchOfTheDay.team_b}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alt Çizgi */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B84DC7] via-[#D69ADE] to-[#B84DC7]"></div>
            </div>
          ) : (
            <div className="relative rounded-2xl border-2 border-white/10 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] overflow-hidden">
              {/* Arka Plan Efektleri */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 p-12 md:p-16 text-center">
                <p className="text-xl md:text-2xl text-gray-400 font-medium">
                  Bugün için bir maç bilgisi bulunmamaktadır.
                </p>
              </div>

              {/* Alt Çizgi */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10"></div>
            </div>
          )}
        </div>
      </section>

      {/* PICK EM BÖLÜMÜ */}
      <section id="tahminler" className="relative py-16 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D69ADE]"></div>
              <div className="relative h-6 w-6">
                <Image
                  src="/logo.png"
                  alt="Arhaval"
                  width={24}
                  height={24}
                  className="object-contain w-full h-full brightness-0 invert"
                />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D69ADE]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-3">
              <span className="bg-gradient-to-r from-white via-[#D69ADE] to-white bg-clip-text text-transparent">
                PICK EM
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Sezonluk tahminlerini yap, ödülleri kazan
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-1 w-24 bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] rounded-full"></div>
          </div>
          
          {picksLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          ) : homepagePicks.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a]">
              <p className="text-gray-400">Henüz maç seçilmedi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homepagePicks.map((match) => {
                const teamAInfo = match.team_a_logo 
                  ? { logo_url: match.team_a_logo, name: match.team_a }
                  : getTeamInfo(match.team_a);
                const teamBInfo = match.team_b_logo 
                  ? { logo_url: match.team_b_logo, name: match.team_b }
                  : getTeamInfo(match.team_b);

                return (
                  <div
                    key={match.id}
                    className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 hover:border-[#D69ADE]/50 hover:shadow-lg hover:shadow-[#D69ADE]/10 transition-all"
                  >
                    {/* Turnuva ve Tarih */}
                    <div className="mb-4 text-center">
                      {match.tournament_name && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B84DC7]/10 border border-[#B84DC7]/30 mb-2">
                          <Trophy className="h-3 w-3 text-[#B84DC7]" />
                          <span className="text-xs font-semibold text-[#B84DC7] uppercase">
                            {match.tournament_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{match.match_time}</span>
                      </div>
                    </div>

                    {/* Takımlar */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-6">
                      <div className="flex flex-col items-center gap-2">
                        {teamAInfo?.logo_url ? (
                          <img
                            src={teamAInfo.logo_url}
                            alt={match.team_a}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <TeamLogo teamName={match.team_a} size={64} />
                        )}
                        <span className="text-sm font-bold text-white text-center truncate w-full">
                          {match.team_a}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-black text-white/20">VS</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {teamBInfo?.logo_url ? (
                          <img
                            src={teamBInfo.logo_url}
                            alt={match.team_b}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <TeamLogo teamName={match.team_b} size={64} />
                        )}
                        <span className="text-sm font-bold text-white text-center truncate w-full">
                          {match.team_b}
                        </span>
                      </div>
                    </div>

                    {/* Tahmin Butonu */}
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Link href={`/predictions?match=${match.id}`}>
                        Tahmin Yap
                      </Link>
                    </Button>

                    {/* Puan Bilgisi */}
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Doğru tahmin: +50 sezon puanı
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* YOUTUBE / İÇERİK ŞERİDİ */}
      <section className="relative py-16 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D69ADE]"></div>
              <div className="relative h-6 w-6">
                <Image
                  src="/logo.png"
                  alt="Arhaval"
                  width={24}
                  height={24}
                  className="object-contain w-full h-full brightness-0 invert"
                />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D69ADE]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-3">
              <span className="bg-gradient-to-r from-white via-[#D69ADE] to-white bg-clip-text text-transparent">
                SON VIDEOLARIMIZ
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              İçeriklerimizi İzleyin
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-1 w-24 bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] rounded-full"></div>
          </div>
          
          {videosLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a]">
              <p className="text-gray-400">Henüz video eklenmedi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
              <a
                key={index}
                href={video.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] overflow-hidden hover:border-[#D69ADE]/50 hover:shadow-lg hover:shadow-[#D69ADE]/10 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                  {(() => {
                    const thumbnailUrl = video.thumbnailUrl || (video.href ? extractYouTubeThumbnail(video.href) : "");
                    return thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={video.title || "Video"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const currentSrc = e.currentTarget.src;
                          // İlk hata - hqdefault'u dene
                          if (currentSrc.includes("maxresdefault")) {
                            const videoId = currentSrc.match(/vi\/([^\/]+)\//)?.[1];
                            if (videoId) {
                              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              return;
                            }
                          }
                          // Hala yüklenemiyorsa placeholder göster
                          e.currentTarget.src = "https://via.placeholder.com/640x360/1a1a1a/ffffff?text=Video";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Youtube className="h-16 w-16 text-gray-600" />
                      </div>
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-semibold text-white">YouTube</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Bilgileri */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#D69ADE] transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">YouTube</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#D69ADE] hover:text-[#C97AE0] hover:bg-[#D69ADE]/10"
                    >
                      İzle
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SOSYAL MEDYA */}
      <section className="relative py-16 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D69ADE]"></div>
              <div className="relative h-6 w-6">
                <Image
                  src="/logo.png"
                  alt="Arhaval"
                  width={24}
                  height={24}
                  className="object-contain w-full h-full brightness-0 invert"
                />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D69ADE]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-3">
              <span className="bg-gradient-to-r from-[#D69ADE] via-white to-[#D69ADE] bg-clip-text text-transparent">
                Sosyal Medya
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 uppercase tracking-wider mb-2">
              İçerikler, canlı yayınlar ve turnuvalardan anında haberdar ol.
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-1 w-24 bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] rounded-full"></div>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* YouTube */}
              <a
                href="https://youtube.com/@arhaval"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-lg border border-white/10 bg-white/5 hover:border-[#D69ADE]/50 hover:bg-[#D69ADE]/10 transition-all"
              >
                <Youtube className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white">YouTube</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/arhavalcom"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-lg border border-white/10 bg-white/5 hover:border-[#D69ADE]/50 hover:bg-[#D69ADE]/10 transition-all"
              >
                <Instagram className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white">Instagram</span>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/arhavalcom"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-lg border border-white/10 bg-white/5 hover:border-[#D69ADE]/50 hover:bg-[#D69ADE]/10 transition-all"
              >
                <Twitter className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white">X</span>
              </a>

              {/* Twitch */}
              <a
                href="https://twitch.tv/arhavalcom"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-lg border border-white/10 bg-white/5 hover:border-[#D69ADE]/50 hover:bg-[#D69ADE]/10 transition-all"
              >
                <Twitch className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white">Twitch</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
