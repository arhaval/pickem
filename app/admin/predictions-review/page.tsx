"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle2, XCircle, Users, TrendingUp, Calendar, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Team {
  id: string | number;
  name: string;
  logo_url: string | null;
  short_code: string | null;
}

interface Match {
  id: string;
  team_a_id: string | number;
  team_b_id: string | number;
  team_a: Team | null;
  team_b: Team | null;
  match_date: string | null;
  match_time: string;
  winner: string | null;
  difficulty_score_a: number;
  difficulty_score_b: number;
  season_id: string | null;
  prediction_type: "winner" | "over_under" | "custom";
  option_a_label: string;
  option_b_label: string;
}

interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  selected_team: string;
  points_earned: number | null;
  created_at: string;
  user?: {
    id: string;
    username: string | null;
    total_points: number;
  };
}

interface UserPoints {
  user_id: string;
  username: string | null;
  total_points: number;
  correct_count: number;
  incorrect_count: number;
}

export default function PredictionsReviewPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>({});
  const [userPoints, setUserPoints] = useState<Record<string, UserPoints>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWinner, setFilterWinner] = useState<string>("null"); // "all", "null", "not-null" - Varsayılan: sadece sonuçlanmamış maçlar

  // Verileri yükle
  useEffect(() => {
    loadData();
  }, [filterWinner]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Maçları yükle - SADECE TAHMİN İÇİN OLAN MAÇLAR (is_display_match = false veya NULL)
      let query = supabase
        .from("matches")
        .select(`
          *,
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
        .or("is_display_match.eq.false,is_display_match.is.null") // Sadece tahmin için olan maçlar
        .order("match_date", { ascending: false, nullsFirst: false })
        .order("match_time", { ascending: false, nullsFirst: false });

      // Filtreleme
      if (filterWinner === "null") {
        query = query.is("winner", null);
      } else if (filterWinner === "not-null") {
        query = query.not("winner", "is", null);
      }
      // "all" durumunda tüm maçlar gösterilir (filtre yok)

      const { data: matchesData, error: matchesError } = await query;

      if (matchesError) {
        console.error("Maçlar yüklenirken hata:", matchesError);
        setMatches([]);
      } else {
        setMatches(matchesData || []);

        // Her maç için tahminleri yükle
        const predictionsMap: Record<string, Prediction[]> = {};
        const userIds = new Set<string>();

        for (const match of (matchesData || []) as Match[]) {
          const matchId = String(match.id);
          const { data: predData, error: predError } = await supabase
            .from("predictions")
            .select(`
              *,
              user:profiles!predictions_user_id_fkey (
                id,
                username,
                total_points
              )
            `)
            .eq("match_id", matchId)
            .order("created_at", { ascending: false });

          if (!predError && predData) {
            predictionsMap[matchId] = predData.map((p: any) => ({
              ...p,
              user: p.user || null,
            }));

            // Kullanıcı ID'lerini topla
            predData.forEach((p: any) => {
              if (p.user_id) userIds.add(p.user_id);
            });
          }
        }

        setPredictions(predictionsMap);

        // Kullanıcı puanlarını hesapla
        const userPointsMap: Record<string, UserPoints> = {};
        for (const userId of userIds) {
          const userPreds = Object.values(predictionsMap)
            .flat()
            .filter((p) => p.user_id === userId);

          const correct = userPreds.filter(
            (p) => p.points_earned !== null && p.points_earned > 0
          ).length;
          const incorrect = userPreds.filter(
            (p) => p.points_earned === 0
          ).length;

          const user = userPreds[0]?.user;
          if (user) {
            userPointsMap[userId] = {
              user_id: userId,
              username: user.username,
              total_points: user.total_points || 0,
              correct_count: correct,
              incorrect_count: incorrect,
            };
          }
        }

        setUserPoints(userPointsMap);
      }
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Winner güncelle
  const handleUpdateWinner = async () => {
    if (!selectedMatch || !selectedWinner) {
      alert("Lütfen bir kazanan seçin.");
      return;
    }

    try {
      setIsSaving(true);

      if (!selectedMatch) return;
      
      const matchId = String(selectedMatch.id);
      const { error } = await (supabase
        .from("matches") as any)
        .update({ winner: selectedWinner })
        .eq("id", matchId);

      if (error) {
        alert("Hata: " + error.message);
        return;
      }

      alert("Maç kazananı güncellendi! Trigger otomatik olarak tahminleri puanlayacak.");
      setIsDialogOpen(false);
      await loadData(); // Verileri yenile
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrelenmiş maçlar
  const filteredMatches = matches.filter((match) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const teamAName = match.team_a?.name?.toLowerCase() || "";
      const teamBName = match.team_b?.name?.toLowerCase() || "";
      return teamAName.includes(searchLower) || teamBName.includes(searchLower);
    }
    return true;
  });

  // Tahmin istatistikleri
  const getMatchStats = (matchId: string) => {
    const matchPreds = predictions[matchId] || [];
    const total = matchPreds.length;
    const correct = matchPreds.filter(
      (p) => p.points_earned !== null && p.points_earned > 0
    ).length;
    const incorrect = matchPreds.filter((p) => p.points_earned === 0).length;
    const pending = matchPreds.filter((p) => p.points_earned === null).length;

    return { total, correct, incorrect, pending };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tahmin ve Puan Kontrolü
          </h1>
          <p className="text-gray-400">
            Maçları, tahminleri ve puanları kolayca kontrol edin.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <div className="bg-[#131720] border border-white/10 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Maç Ara
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Takım adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Durum Filtresi
            </label>
            <select
              value={filterWinner}
              onChange={(e) => setFilterWinner(e.target.value)}
              className="w-full h-10 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50"
            >
              <option value="all">Tüm Maçlar</option>
              <option value="null">Sonuçlanmamış</option>
              <option value="not-null">Sonuçlanmış</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full">
              <div className="text-sm text-gray-400 mb-2">Toplam İstatistikler</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Maçlar: </span>
                  <span className="text-white font-semibold">{matches.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Tahminler: </span>
                  <span className="text-white font-semibold">
                    {Object.values(predictions).flat().length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maçlar Listesi */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B84DC7]"></div>
            <span>Yükleniyor...</span>
          </div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          Maç bulunamadı.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const stats = getMatchStats(match.id);
            const matchPreds = predictions[match.id] || [];
            const isCompleted = match.winner !== null;

            return (
              <div
                key={match.id}
                className="bg-[#131720] border border-white/10 rounded-lg overflow-hidden"
              >
                {/* Maç Header */}
                <div className="p-4 bg-[#0a0e1a] border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Takım A */}
                      <div className="flex items-center gap-2">
                        {match.team_a && (
                          <div className="relative w-10 h-10 rounded overflow-hidden border border-white/10">
                            <Image
                              src={match.team_a.logo_url || "/teams/aurora.png"}
                              alt={match.team_a.name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="text-white font-semibold">
                          {match.team_a?.name || "Unknown"}
                        </span>
                      </div>

                      <span className="text-gray-500">vs</span>

                      {/* Takım B */}
                      <div className="flex items-center gap-2">
                        {match.team_b && (
                          <div className="relative w-10 h-10 rounded overflow-hidden border border-white/10">
                            <Image
                              src={match.team_b.logo_url || "/teams/aurora.png"}
                              alt={match.team_b.name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="text-white font-semibold">
                          {match.team_b?.name || "Unknown"}
                        </span>
                      </div>

                      {/* Tarih/Saat */}
                      <div className="ml-auto text-right">
                        <div className="text-sm text-gray-400">
                          {match.match_date || "Tarih yok"}
                        </div>
                        <div className="text-xs text-gray-500">{match.match_time}</div>
                      </div>
                    </div>
                  </div>

                  {/* Durum ve İstatistikler */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          isCompleted
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        )}
                      >
                        {isCompleted ? (
                          <>
                            <Trophy className="h-3 w-3 inline mr-1" />
                            Sonuçlandı: {match.winner}
                          </>
                        ) : (
                          "Sonuçlanmadı"
                        )}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          Toplam: <span className="text-white">{stats.total}</span>
                        </span>
                        <span className="text-green-400">
                          Doğru: <span className="font-semibold">{stats.correct}</span>
                        </span>
                        <span className="text-red-400">
                          Yanlış: <span className="font-semibold">{stats.incorrect}</span>
                        </span>
                        {stats.pending > 0 && (
                          <span className="text-yellow-400">
                            Bekleyen: <span className="font-semibold">{stats.pending}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedMatch(match);
                          setSelectedWinner("");
                          setIsDialogOpen(true);
                        }}
                        className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Sonuçlandır
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tahminler Listesi */}
                {matchPreds.length > 0 ? (
                  <div className="p-4">
                    <div className="space-y-2">
                      {matchPreds.map((pred) => {
                        const user = userPoints[pred.user_id];
                        const isCorrect = pred.points_earned !== null && pred.points_earned > 0;
                        const isIncorrect = pred.points_earned === 0;
                        const isPending = pred.points_earned === null;

                        return (
                          <div
                            key={pred.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              isCorrect
                                ? "bg-green-500/10 border-green-500/30"
                                : isIncorrect
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-white/5 border-white/10"
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              ) : isIncorrect ? (
                                <XCircle className="h-5 w-5 text-red-400" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-yellow-400" />
                              )}
                              <div>
                                <div className="text-white font-medium">
                                  {user?.username || "Kullanıcı"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Tahmin: <span className="text-white">{pred.selected_team}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isPending ? (
                                <span className="text-yellow-400 text-sm font-medium">
                                  Bekliyor
                                </span>
                              ) : (
                                <div>
                                  <div
                                    className={cn(
                                      "text-sm font-semibold",
                                      isCorrect ? "text-green-400" : "text-red-400"
                                    )}
                                  >
                                    {pred.points_earned === 0
                                      ? "0 puan"
                                      : `+${pred.points_earned} puan`}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Toplam: {user?.total_points || 0}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    Bu maça henüz tahmin yapılmamış.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Winner Güncelleme Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#131720] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Maçı Sonuçlandır</DialogTitle>
            {selectedMatch && (
              <DialogDescription asChild>
                <div className="mt-2 text-white">
                  <div className="text-sm">
                    {selectedMatch.team_a?.name || "Unknown"} vs{" "}
                    {selectedMatch.team_b?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Maç Tipi:{" "}
                    {selectedMatch.prediction_type === "winner"
                      ? "Kazanan"
                      : "Alt/Üst"}
                  </div>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMatch && (
              <>
                {selectedMatch.prediction_type === "winner" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Kazanan Takım
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedWinner("A")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedWinner === "A"
                            ? "border-[#B84DC7] bg-[#B84DC7]/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="font-semibold text-white">
                          {selectedMatch.team_a?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatch.difficulty_score_a}
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedWinner("B")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedWinner === "B"
                            ? "border-[#B84DC7] bg-[#B84DC7]/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="font-semibold text-white">
                          {selectedMatch.team_b?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatch.difficulty_score_b}
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Sonuç</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedWinner("OVER")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedWinner === "OVER"
                            ? "border-[#B84DC7] bg-[#B84DC7]/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="font-semibold text-white">
                          ÜST ({selectedMatch.option_a_label})
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatch.difficulty_score_a}
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedWinner("UNDER")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedWinner === "UNDER"
                            ? "border-[#B84DC7] bg-[#B84DC7]/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="font-semibold text-white">
                          ALT ({selectedMatch.option_b_label})
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatch.difficulty_score_b}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-400">
                    ⚡ Trigger otomatik olarak tahminleri puanlayacak. Puan düşme yok - kazanan
                    puan alıyor sürekli.
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
              onClick={handleUpdateWinner}
              disabled={!selectedWinner || isSaving}
            >
              {isSaving ? "Kaydediliyor..." : "Sonuçlandır"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

