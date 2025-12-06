"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Users, Calendar, TrendingUp, Lock, Eye, User, Sparkles } from "lucide-react";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRankingVisibility } from "@/hooks/use-ranking-visibility";

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface SeasonPoints {
  user_id: string;
  season_id: string;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
  seasons: {
    name: string;
  };
}

// Fake kullanıcı verileri - Test için
const fakeLeaderboard: SeasonPoints[] = [
  {
    user_id: "fake-1",
    season_id: "fake-season",
    total_points: 15240,
    correct_predictions: 45,
    total_predictions: 60,
    profiles: {
      username: "ArhavalMaster",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-2",
    season_id: "fake-season",
    total_points: 14890,
    correct_predictions: 42,
    total_predictions: 58,
    profiles: {
      username: "TahminKralı",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-3",
    season_id: "fake-season",
    total_points: 14120,
    correct_predictions: 38,
    total_predictions: 55,
    profiles: {
      username: "TahminCı",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-4",
    season_id: "fake-season",
    total_points: 13850,
    correct_predictions: 40,
    total_predictions: 62,
    profiles: {
      username: "ProGamer",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-5",
    season_id: "fake-season",
    total_points: 13210,
    correct_predictions: 35,
    total_predictions: 50,
    profiles: {
      username: "SkinHunter",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-6",
    season_id: "fake-season",
    total_points: 12800,
    correct_predictions: 33,
    total_predictions: 48,
    profiles: {
      username: "AcePlayer",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-7",
    season_id: "fake-season",
    total_points: 12450,
    correct_predictions: 30,
    total_predictions: 45,
    profiles: {
      username: "HeadshotPro",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-8",
    season_id: "fake-season",
    total_points: 12000,
    correct_predictions: 28,
    total_predictions: 42,
    profiles: {
      username: "ClutchKing",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-9",
    season_id: "fake-season",
    total_points: 11500,
    correct_predictions: 25,
    total_predictions: 40,
    profiles: {
      username: "RifleMaster",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
  {
    user_id: "fake-10",
    season_id: "fake-season",
    total_points: 11000,
    correct_predictions: 22,
    total_predictions: 38,
    profiles: {
      username: "TacticalMind",
      avatar_url: null,
    },
    seasons: {
      name: "Test Sezonu",
    },
  },
];

export default function LeaderboardPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<SeasonPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFakeData, setUseFakeData] = useState(true); // Varsayılan olarak fake data kullan (test için)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isRankingVisible, loading: rankingVisibilityLoading } = useRankingVisibility();

  useEffect(() => {
    loadSeasons();
    // Mevcut kullanıcıyı al
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      } else if (useFakeData) {
        // Fake data kullanılıyorsa test için fake kullanıcı ID'si
        setCurrentUserId("fake-1");
      }
    });
  }, []);

  useEffect(() => {
    if (useFakeData) {
      setLeaderboard(fakeLeaderboard);
      setLoading(false);
      // Test için fake kullanıcı ID'si ekle (ilk kullanıcıyı mevcut kullanıcı olarak işaretle)
      if (!currentUserId) {
        setCurrentUserId("fake-1");
      }
    } else if (selectedSeasonId) {
      loadLeaderboard(selectedSeasonId);
    }
  }, [selectedSeasonId, useFakeData]);

  const loadSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sezonlar yüklenirken hata:", error);
        return;
      }

      setSeasons(data || []);
      
      // Aktif sezonu varsayılan olarak seç
      const activeSeason = (data as any)?.find((s: any) => s.is_active);
      if (activeSeason) {
        setSelectedSeasonId(activeSeason.id);
      } else if (data && data.length > 0) {
        // Aktif sezon yoksa en son sezonu seç
        setSelectedSeasonId((data as any)[0].id);
      }
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (seasonId: string) => {
    try {
      setLoading(true);
      
      // Fake data kullanılıyorsa direkt göster
      if (useFakeData) {
        setLeaderboard(fakeLeaderboard);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("season_points")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          ),
          seasons:season_id (
            name
          )
        `)
        .eq("season_id", seasonId)
        .order("total_points", { ascending: false })
        .order("correct_predictions", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Liderlik tablosu yüklenirken hata:", error);
        return;
      }

      // Type assertion için düzeltme
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles || { username: null, avatar_url: null },
        seasons: item.seasons || { name: "" },
      }));

      // Debug: İlk 3 kullanıcıyı console'a yazdır
      if (formattedData.length > 0) {
        console.log("Leaderboard ilk 3:", formattedData.slice(0, 3).map((item: any) => ({
          username: item.profiles?.username,
          points: item.total_points,
          user_id: item.user_id
        })));
      }

      setLeaderboard(formattedData);
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcının kendi sırasını bul
  const getUserRank = (userId: string | null) => {
    if (!userId) return null;
    const userIndex = leaderboard.findIndex((entry) => entry.user_id === userId);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  // Tabloda gösterilecek verileri hazırla
  const getDisplayLeaderboard = () => {
    const userRank = getUserRank(currentUserId);
    const userEntry = currentUserId 
      ? leaderboard.find((entry) => entry.user_id === currentUserId)
      : null;

    // İlk 3'ü atla, 4'ten başla
    let displayData = leaderboard.slice(3);
    
    // Kullanıcının kendi sırası varsa en başa ekle (ilk 3'te olsa bile)
    if (userEntry && userRank) {
      // Kullanıcının kendi kaydını listeden çıkar (eğer varsa)
      displayData = displayData.filter((entry) => entry.user_id !== currentUserId);
      // En başa ekle
      displayData.unshift(userEntry);
    }

    return displayData;
  };

  const getAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  // Sıralama kapalıysa mesaj göster
  if (!rankingVisibilityLoading && !isRankingVisible) {
    return (
      <div className="min-h-screen bg-[#0a0e1a]">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            {/* Ana Kart */}
            <div className="relative w-full max-w-2xl rounded-2xl border border-[#B84DC7]/30 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] overflow-hidden shadow-2xl shadow-[#B84DC7]/10">
              {/* Arka Plan Efektleri */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#B84DC7]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B84DC7]/5 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 p-12 md:p-16">
                {/* İkon */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#B84DC7]/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-[#B84DC7]/30 to-[#D69ADE]/30 rounded-full p-6 border-2 border-[#B84DC7]/50">
                      <Lock className="h-12 w-12 md:h-16 md:w-16 text-[#B84DC7]" />
                    </div>
                  </div>
                </div>

                {/* Başlık */}
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-white via-[#D69ADE] to-white bg-clip-text text-transparent">
                  Sıralama Kapalı
                </h2>

                {/* Mesaj */}
                <div className="space-y-4 text-center mb-8">
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Rekabeti korumak amacı ile sıralama son gün açılacaktır.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[#B84DC7]">
                    <Sparkles className="h-5 w-5" />
                    <p className="text-base md:text-lg font-medium">
                      Merak etme, puanlar sürekli güncelleniyor.
                    </p>
                  </div>
                  <p className="text-base md:text-lg text-gray-400">
                    Puanınızı <span className="text-[#B84DC7] font-semibold">Profilinizden</span> görebilirsiniz.
                  </p>
                </div>

                {/* Profil Link Butonu */}
                <div className="flex justify-center">
                  <Link
                    href="/profile"
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] hover:from-[#D69ADE] hover:to-[#B84DC7] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#B84DC7]/30 hover:shadow-[#B84DC7]/50 hover:scale-105"
                  >
                    <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Profilime Git
                  </Link>
                </div>

                {/* Alt Mesaj */}
                <div className="mt-10 pt-8 border-t border-white/10 text-center">
                  <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#B84DC7] via-[#D69ADE] to-[#B84DC7] bg-clip-text text-transparent">
                    Bol şans! 🍀
                  </p>
                </div>
              </div>

              {/* Alt Çizgi Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/10 via-[#B84DC7]/50 to-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Üst Kontrol Paneli - Birleşik Tasarım */}
        <div className="mb-6">
          <div className="relative rounded-2xl border border-[#B84DC7]/30 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] p-6 overflow-hidden">
            {/* Arka plan efekti */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#B84DC7]/5 via-transparent to-[#D69ADE]/5"></div>
            
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol: Sezon Seçimi */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#B84DC7]/20 to-[#D69ADE]/20 border border-[#B84DC7]/30">
                  <Calendar className="h-6 w-6 text-[#B84DC7]" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Sezon
                  </label>
                  <select
                    value={selectedSeasonId || ""}
                    onChange={(e) => setSelectedSeasonId(e.target.value)}
                    disabled={useFakeData}
                    className="w-full h-10 rounded-lg border border-[#B84DC7]/30 bg-black/40 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#B84DC7]/50 focus:border-[#B84DC7] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {seasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.name} {season.is_active && "(Aktif)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sağ: Test Modu & Tarih */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  {selectedSeason && !useFakeData && (
                    <>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Tarih Aralığı
                      </label>
                      <div className="text-sm font-medium text-gray-300 bg-black/40 rounded-lg px-4 py-2 border border-white/10">
                        {formatDate(selectedSeason.start_date)} - {formatDate(selectedSeason.end_date)}
                      </div>
                    </>
                  )}
                  {useFakeData && (
                    <>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Mod
                      </label>
                      <div className="text-sm font-bold text-[#B84DC7] bg-[#B84DC7]/10 rounded-lg px-4 py-2 border border-[#B84DC7]/30">
                        Test Sezonu (Fake Data)
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setUseFakeData(!useFakeData);
                    if (!useFakeData && selectedSeasonId) {
                      loadLeaderboard(selectedSeasonId);
                    }
                  }}
                  className={cn(
                    "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                    useFakeData
                      ? "bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] text-white hover:from-[#D69ADE] hover:to-[#B84DC7] shadow-lg shadow-[#B84DC7]/30"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10"
                  )}
                >
                  {useFakeData ? "🧪 Test Açık" : "Test Modu"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liderlik Tablosu */}
        {loading ? (
          <div className="relative rounded-2xl border border-[#B84DC7]/30 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] overflow-hidden">
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#B84DC7]/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative h-12 w-12 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-6"></div>
              </div>
              <p className="text-gray-300 font-medium">Yükleniyor...</p>
              <p className="text-gray-500 text-sm mt-2">Liderlik tablosu hazırlanıyor</p>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="relative rounded-2xl border border-[#B84DC7]/30 bg-gradient-to-br from-[#131720] via-[#0f172a] to-[#131720] overflow-hidden">
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[#B84DC7]/10 rounded-full blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-[#B84DC7]/20 to-[#D69ADE]/20 rounded-full p-6 border border-[#B84DC7]/30">
                  <Trophy className="h-16 w-16 text-[#B84DC7] mx-auto" />
                </div>
              </div>
              <p className="text-gray-300 text-lg font-semibold mb-2">
                Bu sezon için henüz puan kaydı yok
              </p>
              <p className="text-gray-500 text-sm">
                Maç sonuçları girildikçe liderlik tablosu güncellenecek
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* İlk 3 - Kare Kutu Podyum */}
            {leaderboard.length >= 3 && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 2. Sıra */}
                {leaderboard[1] && (
                  <Link
                    href={`/profile?user=${leaderboard[1].user_id}`}
                    className="group relative bg-[#131720] rounded-xl border border-white/10 p-5 hover:border-gray-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gray-400/20"
                  >
                    {/* Sıra Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-gray-500/20 rounded-lg px-2.5 py-1 border border-gray-400/30">
                        <span className="text-base font-bold text-gray-300">2</span>
                      </div>
                    </div>

                    {/* İçerik - Yatay Düzen */}
                    <div className="flex items-center gap-4">
                      {/* Profil Avatar - Sol */}
                      <div className="flex-shrink-0">
                        {leaderboard[1].profiles.avatar_url ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gray-400/20 rounded-xl blur-md"></div>
                            <img
                              src={leaderboard[1].profiles.avatar_url}
                              alt={leaderboard[1].profiles.username || "Kullanıcı"}
                              className="relative w-20 h-20 rounded-xl object-cover border-2 border-gray-400/50 shadow-lg"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gray-400/20 rounded-xl blur-md"></div>
                            <div className="relative w-20 h-20 rounded-xl bg-gray-500/30 border-2 border-gray-400/50 flex items-center justify-center shadow-lg">
                              <Users className="h-10 w-10 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bilgiler - Sağ */}
                      <div className="flex-1 min-w-0">
                        {/* Kullanıcı Adı */}
                        <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors mb-2 truncate">
                          {leaderboard[1].profiles.username || "İsimsiz"}
                        </h3>

                        {/* Puan */}
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-gray-200">
                            {leaderboard[1].total_points.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 ml-1">puan</span>
                        </div>

                        {/* Başarı Oranı */}
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4 text-gray-400 opacity-70" />
                          <span className="text-xs text-gray-400">
                            {getAccuracy(leaderboard[1].correct_predictions, leaderboard[1].total_predictions)}% başarı
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* 1. Sıra - Şampiyon */}
                {leaderboard[0] && (
                  <Link
                    href={`/profile?user=${leaderboard[0].user_id}`}
                    className="group relative bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-600/10 rounded-xl border-2 border-yellow-400/50 p-5 hover:border-yellow-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/30"
                  >
                    {/* Sıra Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-400/30 rounded-lg px-2.5 py-1 border border-yellow-400/50">
                        <span className="text-lg font-black text-yellow-200">1</span>
                      </div>
                    </div>

                    {/* Taç İkonu */}
                    <div className="absolute top-3 left-3">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                    </div>

                    {/* İçerik - Yatay Düzen */}
                    <div className="flex items-center gap-4 mt-1">
                      {/* Profil Avatar - Sol */}
                      <div className="flex-shrink-0">
                        {leaderboard[0].profiles.avatar_url ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/30 rounded-xl blur-lg"></div>
                            <img
                              src={leaderboard[0].profiles.avatar_url}
                              alt={leaderboard[0].profiles.username || "Kullanıcı"}
                              className="relative w-24 h-24 rounded-xl object-cover border-2 border-yellow-400 shadow-2xl ring-2 ring-yellow-400/30"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/30 rounded-xl blur-lg"></div>
                            <div className="relative w-24 h-24 rounded-xl bg-yellow-500/30 border-2 border-yellow-400 flex items-center justify-center shadow-2xl ring-2 ring-yellow-400/30">
                              <Users className="h-12 w-12 text-yellow-200" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bilgiler - Sağ */}
                      <div className="flex-1 min-w-0">
                        {/* Kullanıcı Adı */}
                        <h3 className="text-xl font-black text-white group-hover:text-yellow-100 transition-colors mb-2 truncate">
                          {leaderboard[0].profiles.username || "İsimsiz"}
                        </h3>

                        {/* Puan */}
                        <div className="mb-2">
                          <span className="text-3xl font-black text-yellow-200">
                            {leaderboard[0].total_points.toLocaleString()}
                          </span>
                          <span className="text-sm text-yellow-200/80 ml-1">puan</span>
                        </div>

                        {/* Başarı Oranı */}
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                          <span className="text-xs text-yellow-200/90 font-semibold">
                            {getAccuracy(leaderboard[0].correct_predictions, leaderboard[0].total_predictions)}% başarı
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* 3. Sıra */}
                {leaderboard[2] && (
                  <Link
                    href={`/profile?user=${leaderboard[2].user_id}`}
                    className="group relative bg-[#131720] rounded-xl border border-white/10 p-5 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20"
                  >
                    {/* Sıra Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-amber-600/20 rounded-lg px-2.5 py-1 border border-amber-500/30">
                        <span className="text-base font-bold text-amber-400">3</span>
                      </div>
                    </div>

                    {/* İçerik - Yatay Düzen */}
                    <div className="flex items-center gap-4">
                      {/* Profil Avatar - Sol */}
                      <div className="flex-shrink-0">
                        {leaderboard[2].profiles.avatar_url ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md"></div>
                            <img
                              src={leaderboard[2].profiles.avatar_url}
                              alt={leaderboard[2].profiles.username || "Kullanıcı"}
                              className="relative w-20 h-20 rounded-xl object-cover border-2 border-amber-500/50 shadow-lg"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md"></div>
                            <div className="relative w-20 h-20 rounded-xl bg-amber-600/30 border-2 border-amber-500/50 flex items-center justify-center shadow-lg">
                              <Users className="h-10 w-10 text-amber-500" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bilgiler - Sağ */}
                      <div className="flex-1 min-w-0">
                        {/* Kullanıcı Adı */}
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-2 truncate">
                          {leaderboard[2].profiles.username || "İsimsiz"}
                        </h3>

                        {/* Puan */}
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-amber-400">
                            {leaderboard[2].total_points.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 ml-1">puan</span>
                        </div>

                        {/* Başarı Oranı */}
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-500 opacity-70" />
                          <span className="text-xs text-gray-400">
                            {getAccuracy(leaderboard[2].correct_predictions, leaderboard[2].total_predictions)}% başarı
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* Normal Sıralama Tablosu */}
            <div className="bg-[#131720] rounded-lg border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">Sıra</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">Kullanıcı</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-300">Puan</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-300">Doğru</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-300">Toplam</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-300">Başarı</th>
                    </tr>
                  </thead>
                  <tbody>
                  {getDisplayLeaderboard().map((entry, index) => {
                    // Gerçek sırayı hesapla (ilk 3 atlandığı için +3, kullanıcı en başta ise kendi sırası)
                    const userRank = getUserRank(currentUserId);
                    const isUserRow = currentUserId && entry.user_id === currentUserId;
                    const rank = isUserRow && userRank ? userRank : index + 4; // 4'ten başla
                    const accuracy = getAccuracy(
                      entry.correct_predictions,
                      entry.total_predictions
                    );

                    return (
                      <tr
                        key={entry.user_id}
                        className={cn(
                          "border-b border-white/5 hover:bg-white/5 transition-colors",
                          isUserRow && "bg-[#B84DC7]/10 border-l-4 border-[#B84DC7]"
                        )}
                      >
                        <td className="p-4">
                          <span className={cn(
                            "text-sm font-medium",
                            isUserRow ? "text-[#B84DC7] font-bold" : "text-gray-400"
                          )}>
                            {rank}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {entry.profiles.avatar_url ? (
                              <img
                                src={entry.profiles.avatar_url}
                                alt={entry.profiles.username || "Kullanıcı"}
                                className={cn(
                                  "rounded-full border",
                                  isUserRow 
                                    ? "w-10 h-10 border-2 border-[#B84DC7]" 
                                    : "w-8 h-8 border border-white/10"
                                )}
                              />
                            ) : (
                              <div className={cn(
                                "rounded-full border flex items-center justify-center",
                                isUserRow 
                                  ? "w-10 h-10 border-2 border-[#B84DC7] bg-[#B84DC7]/20" 
                                  : "w-8 h-8 border border-white/10 bg-white/10"
                              )}>
                                <Users className={cn(
                                  isUserRow ? "h-5 w-5 text-[#B84DC7]" : "h-4 w-4 text-gray-400"
                                )} />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/profile?user=${entry.user_id}`}
                                className={cn(
                                  "font-medium hover:underline",
                                  isUserRow 
                                    ? "text-[#B84DC7] font-bold" 
                                    : "text-white hover:text-[#B84DC7]"
                                )}
                              >
                                {entry.profiles.username || "İsimsiz Kullanıcı"}
                              </Link>
                              {isUserRow && (
                                <span className="px-2 py-0.5 rounded bg-[#B84DC7] text-white text-xs font-bold">
                                  SEN
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className={cn(
                            "font-bold",
                            isUserRow ? "text-[#B84DC7] text-lg" : "text-[#B84DC7]"
                          )}>
                            {entry.total_points.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-gray-300">
                            {entry.correct_predictions}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-gray-300">
                            {entry.total_predictions}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  accuracy >= 70
                                    ? "bg-green-500"
                                    : accuracy >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                )}
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                            <span className={cn(
                              "text-sm font-medium w-12 text-right",
                              accuracy >= 70
                                ? "text-green-400"
                                : accuracy >= 50
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}>
                              {accuracy}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
