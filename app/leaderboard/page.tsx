"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Users, Calendar, TrendingUp, Lock, Eye, User, Sparkles } from "lucide-react";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
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

export default function LeaderboardPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<SeasonPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isRankingVisible, loading: rankingVisibilityLoading } = useRankingVisibility();

  useEffect(() => {
    loadSeasons();
    // Mevcut kullanıcıyı al
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSeasonId) {
      loadLeaderboard(selectedSeasonId);
    }
  }, [selectedSeasonId]);

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
      
      // Aktif sezonu varsayılan olarak seç (her zaman)
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
        {/* Başlık Bölümü */}
        <div className="mb-8 text-center">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-3">
            <span className="bg-gradient-to-r from-white via-[#B84DC7] to-white bg-clip-text text-transparent">
              LİDERLİK TABLOSU
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
            En İyi Tahminciler
          </p>
        </div>

        {/* Sezon Seçici - Basit Tasarım */}
        {selectedSeason && (
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#B84DC7]" />
              <select
                value={selectedSeasonId || ""}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                className="bg-gradient-to-br from-[#131720] to-[#0f172a] border-2 border-[#B84DC7]/40 rounded-lg px-4 py-2 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#B84DC7]/50 focus:border-[#B84DC7] transition-all hover:border-[#B84DC7]/60 min-w-[200px]"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.is_active && "⭐"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

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
            {/* İlk 3 - 3D Podyum Tasarımı */}
            {leaderboard.length >= 3 && (
              <div className="mb-8 relative">
                {/* Podyum Base */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#B84DC7]/20 via-[#B84DC7]/10 to-transparent rounded-t-3xl blur-2xl"></div>
                
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {/* 2. Sıra - Sol */}
                {leaderboard[1] && (
                  <Link
                    href={`/profile?user=${leaderboard[1].user_id}`}
                      className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                    >
                      {/* Kart */}
                      <div className="relative bg-gradient-to-br from-[#131720] via-[#1a1f2e] to-[#131720] rounded-2xl border-2 border-gray-500/30 p-6 shadow-2xl overflow-hidden">
                        {/* Glow Efekti */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Sıra Badge - Üstte */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gray-500/30 rounded-full blur-md"></div>
                            <div className="relative bg-gradient-to-br from-gray-500 to-gray-600 rounded-full w-12 h-12 flex items-center justify-center border-2 border-gray-400/50 shadow-xl">
                              <span className="text-2xl font-black text-white">2</span>
                            </div>
                          </div>
                        </div>

                        {/* İçerik */}
                        <div className="relative z-10 pt-4">
                          {/* Avatar - Merkez */}
                          <div className="flex justify-center mb-4">
                            {leaderboard[1].profiles.avatar_url ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-gray-400/30 rounded-full blur-xl animate-pulse"></div>
                                <img
                                  src={leaderboard[1].profiles.avatar_url}
                                  alt={leaderboard[1].profiles.username || "Kullanıcı"}
                                  className="relative w-24 h-24 rounded-full object-cover border-4 border-gray-400/50 shadow-2xl ring-4 ring-gray-400/20"
                                />
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-0 bg-gray-400/30 rounded-full blur-xl"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 border-4 border-gray-400/50 flex items-center justify-center shadow-2xl ring-4 ring-gray-400/20">
                                  <Users className="h-12 w-12 text-gray-300" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Kullanıcı Adı */}
                          <h3 className="text-xl font-black text-white text-center mb-3 group-hover:text-gray-200 transition-colors">
                            {leaderboard[1].profiles.username || "İsimsiz"}
                          </h3>

                          {/* Puan - Büyük */}
                          <div className="text-center mb-3">
                            <div className="text-4xl font-black text-gray-200 mb-1">
                              {leaderboard[1].total_points.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Puan</div>
                          </div>

                          {/* İstatistikler */}
                          <div className="space-y-2 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Başarı</span>
                              <span className="font-bold text-gray-300">
                                {getAccuracy(leaderboard[1].correct_predictions, leaderboard[1].total_predictions)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Doğru</span>
                              <span className="font-bold text-gray-300">{leaderboard[1].correct_predictions}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* 1. Sıra - Şampiyon - Merkez (Daha Yüksek) */}
                  {leaderboard[0] && (
                    <Link
                      href={`/profile?user=${leaderboard[0].user_id}`}
                      className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 md:scale-110 md:-translate-y-8"
                    >
                      {/* Kart - Daha Büyük ve Özel */}
                      <div className="relative bg-gradient-to-br from-yellow-500/30 via-yellow-400/20 to-yellow-600/10 rounded-2xl border-2 border-yellow-400/60 p-8 shadow-2xl overflow-hidden">
                        {/* Altın Glow Efekti */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/50 via-yellow-500/50 to-yellow-400/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                        
                        {/* Taç İkonu - Üstte */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center border-4 border-yellow-300/50 shadow-2xl">
                              <Trophy className="h-8 w-8 text-yellow-100" />
                            </div>
                          </div>
                        </div>

                        {/* Sıra Badge */}
                        <div className="absolute top-4 right-4 z-20">
                          <div className="bg-yellow-400/30 rounded-lg px-3 py-1.5 border-2 border-yellow-400/60">
                            <span className="text-xl font-black text-yellow-100">1</span>
                          </div>
                        </div>

                        {/* İçerik */}
                        <div className="relative z-10 pt-6">
                          {/* Avatar - Merkez - Daha Büyük */}
                          <div className="flex justify-center mb-5">
                            {leaderboard[0].profiles.avatar_url ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-2xl animate-pulse"></div>
                                <img
                                  src={leaderboard[0].profiles.avatar_url}
                                  alt={leaderboard[0].profiles.username || "Kullanıcı"}
                                  className="relative w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-400/40"
                                />
                                {/* Altın Halo */}
                                <div className="absolute -inset-2 border-4 border-yellow-400/30 rounded-full animate-ping"></div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-2xl"></div>
                                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border-4 border-yellow-300 flex items-center justify-center shadow-2xl ring-4 ring-yellow-400/40">
                                  <Users className="h-16 w-16 text-yellow-100" />
                                </div>
                                <div className="absolute -inset-2 border-4 border-yellow-400/30 rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>

                          {/* Kullanıcı Adı */}
                          <h3 className="text-2xl font-black text-white text-center mb-4 group-hover:text-yellow-100 transition-colors">
                            {leaderboard[0].profiles.username || "İsimsiz"}
                          </h3>

                          {/* Puan - Çok Büyük */}
                          <div className="text-center mb-4">
                            <div className="text-5xl font-black text-yellow-200 mb-1">
                              {leaderboard[0].total_points.toLocaleString()}
                            </div>
                            <div className="text-xs text-yellow-200/80 uppercase tracking-wider font-semibold">Puan</div>
                          </div>

                          {/* İstatistikler */}
                          <div className="space-y-2 pt-4 border-t border-yellow-400/30">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-yellow-200/80">Başarı</span>
                              <span className="font-black text-yellow-200 text-lg">
                                {getAccuracy(leaderboard[0].correct_predictions, leaderboard[0].total_predictions)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-yellow-200/80">Doğru</span>
                              <span className="font-black text-yellow-200 text-lg">{leaderboard[0].correct_predictions}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* 3. Sıra - Sağ */}
                  {leaderboard[2] && (
                    <Link
                      href={`/profile?user=${leaderboard[2].user_id}`}
                      className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                    >
                      {/* Kart */}
                      <div className="relative bg-gradient-to-br from-[#131720] via-[#1a1f2e] to-[#131720] rounded-2xl border-2 border-amber-500/30 p-6 shadow-2xl overflow-hidden">
                        {/* Glow Efekti */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Sıra Badge - Üstte */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-md"></div>
                            <div className="relative bg-gradient-to-br from-amber-600 to-amber-700 rounded-full w-12 h-12 flex items-center justify-center border-2 border-amber-400/50 shadow-xl">
                              <span className="text-2xl font-black text-white">3</span>
                            </div>
                          </div>
                        </div>

                        {/* İçerik */}
                        <div className="relative z-10 pt-4">
                          {/* Avatar - Merkez */}
                          <div className="flex justify-center mb-4">
                            {leaderboard[2].profiles.avatar_url ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse"></div>
                                <img
                                  src={leaderboard[2].profiles.avatar_url}
                                  alt={leaderboard[2].profiles.username || "Kullanıcı"}
                                  className="relative w-24 h-24 rounded-full object-cover border-4 border-amber-500/50 shadow-2xl ring-4 ring-amber-500/20"
                                />
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 border-4 border-amber-500/50 flex items-center justify-center shadow-2xl ring-4 ring-amber-500/20">
                                  <Users className="h-12 w-12 text-amber-200" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Kullanıcı Adı */}
                          <h3 className="text-xl font-black text-white text-center mb-3 group-hover:text-amber-300 transition-colors">
                            {leaderboard[2].profiles.username || "İsimsiz"}
                          </h3>

                          {/* Puan - Büyük */}
                          <div className="text-center mb-3">
                            <div className="text-4xl font-black text-amber-400 mb-1">
                              {leaderboard[2].total_points.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Puan</div>
                          </div>

                          {/* İstatistikler */}
                          <div className="space-y-2 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Başarı</span>
                              <span className="font-bold text-amber-400">
                                {getAccuracy(leaderboard[2].correct_predictions, leaderboard[2].total_predictions)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Doğru</span>
                              <span className="font-bold text-amber-400">{leaderboard[2].correct_predictions}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Normal Sıralama - Modern Kart Tasarımı */}
            <div className="space-y-3">
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
                  <Link
                    key={entry.user_id}
                    href={`/profile?user=${entry.user_id}`}
                    className={cn(
                      "group relative block rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden",
                      isUserRow
                        ? "bg-gradient-to-r from-[#B84DC7]/20 via-[#B84DC7]/10 to-transparent border-2 border-[#B84DC7]/50 shadow-lg shadow-[#B84DC7]/20"
                        : "bg-gradient-to-br from-[#131720] to-[#0f172a] border border-white/10 hover:border-[#B84DC7]/30"
                    )}
                  >
                    {/* Glow Efekti */}
                    {isUserRow && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#B84DC7]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}

                    <div className="relative p-4">
                      <div className="flex items-center gap-4">
                        {/* Sıra Numarası */}
                        <div className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 transition-all",
                          isUserRow
                            ? "bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] text-white border-[#B84DC7] shadow-lg shadow-[#B84DC7]/30"
                            : rank <= 10
                            ? "bg-gradient-to-br from-white/10 to-white/5 text-white border-white/20"
                            : "bg-white/5 text-gray-400 border-white/10"
                        )}>
                          {rank}
                        </div>

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {entry.profiles.avatar_url ? (
                            <div className="relative">
                              <div className={cn(
                                "absolute inset-0 rounded-full blur-md transition-all",
                                isUserRow ? "bg-[#B84DC7]/30" : "bg-white/10"
                              )}></div>
                              <img
                                src={entry.profiles.avatar_url}
                                alt={entry.profiles.username || "Kullanıcı"}
                                className={cn(
                                  "relative rounded-full border-2 transition-all",
                                  isUserRow
                                    ? "w-14 h-14 border-2 border-[#B84DC7] ring-2 ring-[#B84DC7]/30"
                                    : "w-12 h-12 border border-white/20"
                                )}
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "relative rounded-full border-2 flex items-center justify-center transition-all",
                              isUserRow
                                ? "w-14 h-14 bg-[#B84DC7]/20 border-2 border-[#B84DC7] ring-2 ring-[#B84DC7]/30"
                                : "w-12 h-12 bg-white/10 border border-white/20"
                            )}>
                              <Users className={cn(
                                isUserRow ? "h-7 w-7 text-[#B84DC7]" : "h-6 w-6 text-gray-400"
                              )} />
                            </div>
                          )}
                        </div>

                        {/* Kullanıcı Bilgileri */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/profile?user=${entry.user_id}`}
                              className={cn(
                                "font-bold truncate transition-colors",
                                isUserRow
                                  ? "text-[#B84DC7] text-lg"
                                  : "text-white group-hover:text-[#B84DC7]"
                              )}
                            >
                              {entry.profiles.username || "İsimsiz Kullanıcı"}
                            </Link>
                            {isUserRow && (
                              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] text-white text-xs font-black shadow-lg">
                                SEN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Medal className="h-3 w-3" />
                              {entry.correct_predictions}/{entry.total_predictions}
                            </span>
                            <span className={cn(
                              "font-semibold",
                              accuracy >= 70
                                ? "text-green-400"
                                : accuracy >= 50
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}>
                              {accuracy}% başarı
                            </span>
                          </div>
                        </div>

                        {/* Puan - Sağ */}
                        <div className="flex-shrink-0 text-right">
                          <div className={cn(
                            "font-black transition-all",
                            isUserRow
                              ? "text-2xl text-[#B84DC7]"
                              : "text-xl text-[#B84DC7] group-hover:text-[#D69ADE]"
                          )}>
                            {entry.total_points.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Puan</div>
                        </div>

                        {/* Başarı Bar - Sağ Alt */}
                        <div className="flex-shrink-0 w-24">
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                accuracy >= 70
                                  ? "bg-gradient-to-r from-green-500 to-green-400"
                                  : accuracy >= 50
                                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                  : "bg-gradient-to-r from-red-500 to-red-400"
                              )}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
