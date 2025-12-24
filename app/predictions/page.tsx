"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/supabase/client";
import PredictionMatchCard from "@/components/prediction-match-card";
import PageHeader from "@/components/page-header";
import SelectedMatchesSummary from "@/components/selected-matches-summary";
import PredictionsConfirmationModal from "@/components/predictions-confirmation-modal";
import { Calendar, Loader2, CheckCircle2, Lock, LogIn, Trophy, XCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getActiveSeasonId } from "@/lib/season-utils";
import { isMatchLocked, getPredictionLockMinutes } from "@/lib/match-utils";

// Veritabanı Tipleri
interface Match {
  id: string | number;
  team_a: string;
  team_b: string;
  team_a_logo: string | null;
  team_b_logo: string | null;
  match_date: string | null;
  match_time: string;
  difficulty_score_a: number;
  difficulty_score_b: number;
  is_display_match: boolean | null;
  winner: string | null;
  is_archived: boolean | null;
  season_id: string | null;
  tournament_name: string | null;
  prediction_type?: "winner" | "over_under" | "custom";
  option_a_label?: string;
  option_b_label?: string;
  question_text?: string | null;
  analysis_note?: string | null;
  prediction_lock_minutes_before_match?: number | null;
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<Record<string | number, "A" | "B" | null>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMatches, setSubmittedMatches] = useState<Set<string | number>>(new Set());
  const [showLockAnimation, setShowLockAnimation] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userPredictions, setUserPredictions] = useState<Map<string | number, string>>(new Map()); // matchId -> selected_team

  // Verileri Çek
  const fetchMatches = useCallback(async () => {
    let isMounted = true;

    setLoading(true);
    setError(null);
    
    // Kilitleme dakikası cache'ini önceden yükle
    await getPredictionLockMinutes();

    try {
      // TÜM MAÇLARI ÇEK - Timeout kaldırıldı
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true });
      
      if (!isMounted) return;

      if (error) {
        console.error("Veritabanı hatası:", error);
        if (isMounted) {
          setMatches([]);
        }
        return;
      }

      // Aktif sezonu al
      const activeSeasonId = await getActiveSeasonId();

      // Kullanıcının tahminlerini çek (giriş yapmışsa)
      const predictionsMap = new Map<string | number, string>();
      if (user) {
        try {
          const { data: predictionsData } = await supabase
            .from("predictions")
            .select("match_id, selected_team")
            .eq("user_id", user.id);
          
          if (predictionsData) {
            predictionsData.forEach((pred: any) => {
              predictionsMap.set(pred.match_id.toString(), pred.selected_team);
            });
          }
        } catch (predError) {
          console.error("Tahminler yüklenirken hata:", predError);
        }
      }
      setUserPredictions(predictionsMap);

      // FİLTRELEME - TEMEL KONTROLLER + AKTİF SEZON
      const filteredMatches = (data || []).filter((match: any) => {
        // 1. Arşivlenmemiş
        const isArchived = match.is_archived === true;
        if (isArchived) {
          return false;
        }
        
        // 2. is_display_match != true (tahminler için)
        // is_display_match === true olan maçlar SADECE maçlar sayfasında gösterilir, tahminler sayfasında ASLA gösterilmez
        // Boolean kontrolü: true, "true", 1 gibi değerleri de kontrol et
        const isDisplayMatch = match.is_display_match === true || 
                                match.is_display_match === "true" || 
                                match.is_display_match === 1;
        
        if (isDisplayMatch) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Predictions Filter] Maç ${match.id} (${match.team_a} vs ${match.team_b}) filtrelendi - is_display_match: ${match.is_display_match}`);
          }
          return false; // Maçlar sayfası için olan maçlar tahminler sayfasında gösterilmez
        }
        
        // 3. Aktif sezona ait maçlar (season_id kontrolü)
        // Eğer aktif sezon varsa, sadece aktif sezona ait maçları göster
        let isInActiveSeason = false;
        if (activeSeasonId) {
          // Match'in season_id'si aktif sezon ile eşleşiyorsa göster
          if (match.season_id && match.season_id.toString() === activeSeasonId.toString()) {
            isInActiveSeason = true;
          }
          // Match'in season_id'si yoksa aktif sezona ait kabul et (backward compatibility)
          if (!match.season_id) {
            console.warn(`Match ${match.id} için season_id yok, aktif sezona ait kabul ediliyor.`);
            isInActiveSeason = true;
          }
        } else {
          // Aktif sezon yoksa, season_id olmayan maçları göster (backward compatibility)
          console.warn("Aktif sezon bulunamadı, season_id olmayan maçlar gösteriliyor.");
          isInActiveSeason = !match.season_id || match.season_id === null;
        }
        
        if (!isInActiveSeason) {
          return false;
        }
        
        // 4. Sonuç girilmişse ama arşivlenmemişse göster (kazananları göstermek için)
        // Sonuç girilmiş ve arşivlenmişse gösterme
        // Sonuç girilmemişse göster
        return true;
      });

      // Takım logolarını çek
      const teamNames = new Set<string>();
      filteredMatches.forEach((match: any) => {
        if (match.team_a) teamNames.add(match.team_a);
        if (match.team_b) teamNames.add(match.team_b);
      });

      let teamLogosMap: Record<string, string | null> = {};
      
      if (teamNames.size > 0) {
        // Önce maçlardaki takım isimleriyle sorgula (exact match)
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("name, logo_url");

        if (!teamsError && teamsData) {
          // Hem orijinal hem lowercase key'lerle map'le
          teamsData.forEach((team: any) => {
            if (team.name) {
              // Orijinal isimle
              teamLogosMap[team.name] = team.logo_url || null;
              // Lowercase ile (case-insensitive eşleştirme)
              const lowerName = team.name.toLowerCase().trim();
              if (lowerName && !teamLogosMap[lowerName]) {
                teamLogosMap[lowerName] = team.logo_url || null;
              }
            }
          });
        }
      }

      // Maçlara logo URL'lerini ekle - case-insensitive eşleştirme
      const matchesWithLogos = filteredMatches.map((match: any) => {
        const teamAKey = match.team_a?.toLowerCase().trim() || '';
        const teamBKey = match.team_b?.toLowerCase().trim() || '';
        
        const teamALogo = teamLogosMap[teamAKey] || teamLogosMap[match.team_a] || null;
        const teamBLogo = teamLogosMap[teamBKey] || teamLogosMap[match.team_b] || null;
        
        // Debug: Logo URL'leri yüklenemediyse uyarı ver
        if (process.env.NODE_ENV === 'development' && match.team_a && !teamALogo) {
          console.warn(`[Logo] ${match.team_a} için logo bulunamadı. Map'te var mı?`, {
            teamAKey,
            originalName: match.team_a,
            availableKeys: Object.keys(teamLogosMap).slice(0, 5)
          });
        }
        
        return {
          ...match,
          team_a_logo: teamALogo,
          team_b_logo: teamBLogo,
        };
      });

      // State'e Aktar
      if (isMounted) {
        setMatches(matchesWithLogos || []);
        console.log("Tahminler sayfası - Maçlar yüklendi:", matchesWithLogos?.length || 0);
      }

    } catch (err: any) {
      console.error("Hata:", err);
      if (isMounted) {
        setError(err.message || "Maçlar yüklenirken bir hata oluştu");
        setMatches([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Tarihe göre maçları grupla
  const groupedMatches = useMemo(() => {
    return matches.reduce((acc, match) => {
      // Tarihi formatla (DD.MM.YYYY)
      let formattedDate = match.match_date || "Tarih Yok";
      if (match.match_date) {
        try {
          const date = new Date(match.match_date);
          formattedDate = date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (e) {
          formattedDate = match.match_date;
        }
      }
      
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(match);
      return acc;
    }, {} as Record<string, Match[]>);
  }, [matches]);

  // Maç seçimi
  const handleSelectTeam = (matchId: string | number, team: "A" | "B") => {
    // Giriş yapmamış kullanıcılar tahmin yapamaz
    if (!user) {
      // Kayıt ol sayfasına yönlendir
      window.location.href = "/register";
      return;
    }

    // Match'i bul
    const match = matches.find((m) => m.id.toString() === matchId.toString());
    
    // Maç başladı mı kontrol et
    if (match && isMatchLocked(
      match.match_date, 
      match.match_time, 
      match.winner,
      match.prediction_lock_minutes_before_match ?? undefined
    )) {
      alert("Bu maç başladı! Artık tahmin yapamazsınız.");
      return;
    }

    // Kullanıcı daha önce bu maç için tahmin yaptı mı?
    if (userPredictions.has(matchId)) {
      alert("Bu maç için zaten tahmin yaptınız! Bir maç için sadece bir tahmin yapabilirsiniz.");
      return;
    }

    if (submittedMatches.has(matchId) || isLocked) return;

    setSelectedTeams((prev) => ({
      ...prev,
      [matchId]: prev[matchId] === team ? null : team,
    }));
  };

  // Maç kaldırma
  const handleRemoveMatch = (matchId: number) => {
    if (isLocked) return;
    setSelectedTeams((prev) => {
      const newState = { ...prev };
      delete newState[matchId];
      return newState;
    });
  };

  // Tahminleri gönderme butonuna tıklandığında
  const handleSubmitClick = () => {
    // Giriş yapmamış kullanıcılar tahmin gönderemez
    if (!user) {
      // Kayıt ol sayfasına yönlendir
      window.location.href = "/register";
      return;
    }

    if (Object.keys(selectedTeams).length === 0) {
      return;
    }
    setShowConfirmationModal(true);
  };

  // Confirmation modal'dan onaylandığında gerçek gönderme işlemi
  const handleSubmitPredictions = async () => {
    setIsSubmitting(true);

    try {
      // Kullanıcı bilgisini al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert("Tahmin göndermek için lütfen giriş yapın.");
        setIsSubmitting(false);
        return;
      }

      // Aktif sezonu al
      const activeSeasonId = await getActiveSeasonId();
      
      if (!activeSeasonId) {
        alert("Aktif sezon bulunamadı! Lütfen admin panelinden aktif bir sezon oluşturun.");
        setIsSubmitting(false);
        return;
      }

      // Önce duplicate kontrolü yap - client-side (userPredictions Map'inden)
      const existingPredictionsClient: string[] = [];
      for (const matchId of Object.keys(selectedTeams)) {
        if (userPredictions.has(matchId)) {
          existingPredictionsClient.push(matchId);
        }
      }

      if (existingPredictionsClient.length > 0) {
        alert(`Bu maçlar için zaten tahmin yapmışsınız! Lütfen sayfayı yenileyin.`);
        setIsSubmitting(false);
        // Tahminleri yeniden yükle
        fetchMatches();
        return;
      }

      // Veritabanından da duplicate kontrolü yap (RLS nedeniyle client-side kontrol yeterli olmayabilir)
      const matchIdsToCheck = Object.keys(selectedTeams).filter((id) => selectedTeams[id] !== null);
      if (matchIdsToCheck.length > 0) {
        const { data: existingPredictionsDb, error: checkError } = await supabase
          .from("predictions")
          .select("match_id")
          .eq("user_id", user.id)
          .in("match_id", matchIdsToCheck);

        if (checkError) {
          console.error("Duplicate kontrolü sırasında hata:", checkError);
          // Hata olsa bile devam et, çünkü insert'te zaten duplicate kontrolü yapılacak
        } else if (existingPredictionsDb && existingPredictionsDb.length > 0) {
          const duplicateMatchIds = existingPredictionsDb.map((p: any) => p.match_id);
          alert(`Bu maçlar için zaten tahmin yapmışsınız: ${duplicateMatchIds.join(", ")}. Lütfen sayfayı yenileyin.`);
          setIsSubmitting(false);
          await fetchMatches();
          return;
        }
      }

      // Tahminleri hazırla - her tahmin için match'ten season_id'yi al
      // Aynı zamanda duplicate kontrolü yap
      const predictions = Object.entries(selectedTeams)
        .filter(([_, team]) => team !== null)
        .map(([matchId, team]) => {
          // Match'i bul ve season_id'yi al
          const match = matches.find((m) => m.id.toString() === matchId.toString());
          
          // Maç başladı mı kontrol et
          if (match && isMatchLocked(
      match.match_date, 
      match.match_time, 
      match.winner,
      match.prediction_lock_minutes_before_match ?? undefined
    )) {
            console.warn(`Match ${matchId} başlamış, tahmin yapılamaz!`);
            return null;
          }
          
          // Kullanıcı bu maç için zaten tahmin yapmış mı? (double-check)
          if (userPredictions.has(matchId)) {
            console.warn(`Match ${matchId} için zaten tahmin var, atlanıyor.`);
            return null;
          }
          
          // Match'in season_id'si yoksa aktif sezonu kullan
          // Önce match'in season_id'sini kontrol et (eğer match'te varsa onu kullan)
          let seasonId = match?.season_id || activeSeasonId;
          
          // Match'te season_id yoksa ve aktif sezon da yoksa hata ver
          if (!seasonId) {
            console.error(`Match ${matchId} için sezon ID bulunamadı!`);
            return null;
          }

          return {
            match_id: matchId.toString(),
            selected_team: team === "A" ? "A" : "B",
            user_id: user.id,
            season_id: seasonId ? seasonId.toString() : null,
            points_earned: null,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      // Geçerli tahminleri filtrele ve duplicate olanları çıkar
      const validPredictions = predictions.filter((p) => {
        if (!p || !p.season_id) return false;
        // Son bir duplicate kontrolü daha - match_id'yi kontrol et
        if (userPredictions.has(p.match_id)) {
          console.warn(`[Final Check] Match ${p.match_id} için zaten tahmin var, filtreleme.`);
          return false;
        }
        return true;
      });

      if (validPredictions.length === 0) {
        alert("Lütfen en az bir tahmin seçin veya sezon bilgisi eksik olan maçları kaldırın.");
        setIsSubmitting(false);
        return;
      }

      // Debug: Tahminleri konsola yazdır
      if (process.env.NODE_ENV === 'development') {
        console.log("[Predictions] Kaydedilecek tahminler:", validPredictions);
      }

      // Supabase'e kaydet
      const { error: insertError, data: insertData } = await (supabase as any)
        .from("predictions")
        .insert(validPredictions)
        .select();

      if (insertError) {
        console.error("Tahminler kaydedilirken hata:", insertError);
        console.error("Hata detayları:", JSON.stringify(insertError, null, 2));
        console.error("Kaydedilmeye çalışılan tahminler:", validPredictions);
        
        // Duplicate key hatası kontrolü
        if (insertError.code === '23505' || 
            insertError.message?.includes('duplicate key') || 
            insertError.message?.includes('unique constraint') ||
            insertError.message?.includes('predictions_user_id_match_id_key') ||
            insertError.details?.includes('duplicate key') ||
            insertError.hint?.includes('duplicate')) {
          console.warn("Duplicate key hatası yakalandı, tahminleri yeniden yüklüyoruz...");
          alert("Bu maçlar için zaten tahmin yapmışsınız. Sayfa yenileniyor...");
          setIsSubmitting(false);
          setIsLocked(false);
          await fetchMatches(); // Tahminleri yeniden yükle
          setSelectedTeams({}); // Seçimleri temizle
          return;
        }
        
        alert(insertError.message || insertError.details || "Tahminler kaydedilirken bir hata oluştu.");
        setIsSubmitting(false);
        return;
      }

      // Gönderilen maçları işaretle
      const submitted = new Set(Object.keys(selectedTeams));
      setSubmittedMatches(submitted);

      // Modal'ı kapat
      setShowConfirmationModal(false);

      // Kilitlenme animasyonu göster
      setIsLocked(true);
      setShowLockAnimation(true);
      setTimeout(() => setShowLockAnimation(false), 3000);

      // Seçimleri temizle
      setSelectedTeams({});

      // Tahminleri yeniden yükle (kullanıcının yeni tahminlerini görmek için)
      await fetchMatches();

    } catch (error: any) {
      console.error("Error submitting predictions:", error);
      setIsSubmitting(false);
      setIsLocked(false);
      alert(error?.message || "Tahminler gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Seçilen maçlar için summary data
  const selectedMatchesData = useMemo(() => {
    const result = Object.entries(selectedTeams)
      .filter(([_, team]) => team !== null)
      .map(([matchId, team]) => {
        const match = matches.find((m) => m.id.toString() === matchId.toString());
        if (!match) return null;
        
        const data = {
          id: typeof matchId === 'string' ? parseInt(matchId) : matchId,
          teamA: match.team_a,
          teamB: match.team_b,
          teamALogo: (match.team_a_logo && match.team_a_logo.trim() !== "") ? match.team_a_logo : null,
          teamBLogo: (match.team_b_logo && match.team_b_logo.trim() !== "") ? match.team_b_logo : null,
          selectedTeam: team!,
          matchTime: match.match_time,
          matchDate: match.match_date ? (() => {
            try {
              const date = new Date(match.match_date);
              return date.toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            } catch (e) {
              return match.match_date;
            }
          })() : "",
          optionALabel: match.option_a_label || match.team_a,
          optionBLabel: match.option_b_label || match.team_b,
          predictionType: match.prediction_type || 'winner' as const,
        };
        
        // Debug: Logo URL'lerini konsola yazdır
        if (process.env.NODE_ENV === 'development') {
          console.log(`[selectedMatchesData] Match ${matchId} - ${match.team_a} vs ${match.team_b}`);
          console.log(`  teamALogo (from match):`, match.team_a_logo);
          console.log(`  teamBLogo (from match):`, match.team_b_logo);
          console.log(`  data.teamALogo:`, data.teamALogo);
          console.log(`  data.teamBLogo:`, data.teamBLogo);
          console.log(`  selectedTeam:`, team);
          if (!data.teamALogo || !data.teamBLogo) {
            console.warn(`  ⚠️ LOGO URL EKSİK! teamALogo: ${data.teamALogo}, teamBLogo: ${data.teamBLogo}`);
          }
        }
        
        return data;
      })
      .filter(Boolean) as Array<{
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
    }>;
    
    return result;
  }, [selectedTeams, matches]);

  const totalPredictions = Object.values(selectedTeams).filter(Boolean).length;

  // Sayfa yukarı scroll fonksiyonu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Belirli bir maça scroll et
  const scrollToMatch = (matchId: number) => {
    const element = document.getElementById(`match-card-${matchId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Geçici highlight efekti
      element.classList.add('ring-2', 'ring-[#D69ADE]', 'animate-pulse');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#D69ADE]', 'animate-pulse');
      }, 2000);
    } else {
      scrollToTop();
    }
  };

  // Kullanıcı authentication kontrolü
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);
    };

    checkUser();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Kullanıcı çıkış yaptığında tahminleri temizle
      if (!session?.user) {
        setUserPredictions(new Map());
      }
      // fetchMatches'i burada çağırma - useEffect'ler halledecek
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // İlk yükleme - sadece bir kez
  useEffect(() => {
    if (!checkingAuth) {
      fetchMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth]);

  // Kullanıcı değiştiğinde tahminleri yeniden yükle - sadece loading false ise
  useEffect(() => {
    if (user && !loading && !checkingAuth) {
      // Sadece user değiştiğinde ve loading bitmişse yeniden yükle
      const timer = setTimeout(() => {
        fetchMatches();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="min-h-screen relative bg-[#0a0e1a]">
      {/* Page Header Banner */}
      <PageHeader type="predictions" />

      {/* Kilit Animasyonu */}
      {showLockAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="mb-6">
              <Lock className="h-20 w-20 text-[#B84DC7] mx-auto animate-pulse" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 animate-pulse">
              Tahminler Kilitlendi!
            </h2>
            <p className="text-xl text-gray-300">
              Tahminleriniz başarıyla gönderildi
            </p>
          </div>
        </div>
      )}

      {/* Ana İçerik */}
      <div className={cn(
        "container mx-auto px-4 py-8 max-w-7xl",
        totalPredictions > 0 && !isLocked ? "pb-72" : totalPredictions > 0 ? "pb-56" : "pb-8"
      )}>
        {/* Giriş Yapmamış Kullanıcı Uyarısı */}
        {!checkingAuth && !user && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-yellow-400">Tahmin Yapmak İçin Giriş Yapın</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Tahmin yapabilmek ve ödülleri kazanabilmek için lütfen giriş yapın veya kayıt olun.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold hover:opacity-90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Kayıt Ol
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <LogIn className="h-4 w-4 mr-2" />
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a]">
            <Loader2 className="h-8 w-8 text-[#B84DC7] mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Maçlar yükleniyor...</p>
          </div>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#B84DC7]/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-[#B84DC7]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-2">Bu dönem için maç bulunmuyor</p>
                <p className="text-sm text-gray-400">Yakında yeni maçlar eklenecek. Lütfen daha sonra tekrar kontrol edin.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedMatches).map(([date, dateMatches]) => (
              <div key={date}>
                {/* Tarih Başlığı */}
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="h-5 w-5 text-[#B84DC7]" />
                  <h2 className="text-xl font-bold text-white">{date}</h2>
                  <span className="text-sm text-gray-400">({dateMatches.length} maç)</span>
                </div>

                {/* Maç Kartları */}
                <div className="space-y-6">
                  {dateMatches.map((match) => {
                    // Tarihi formatla
                    let formattedDate = match.match_date || "";
                    if (match.match_date) {
                      try {
                        const date = new Date(match.match_date);
                        formattedDate = date.toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        });
                      } catch (e) {
                        formattedDate = match.match_date;
                      }
                    }

                    const matchIdStr = match.id.toString();
                    const hasUserPrediction = userPredictions.has(match.id);
                    const userPrediction = hasUserPrediction ? userPredictions.get(match.id) : null;
                    const matchStarted = isMatchLocked(match.match_date, match.match_time, match.winner);
                    const isSubmitted = submittedMatches.has(matchIdStr) || hasUserPrediction;
                    const isDisabled = isLocked || isSubmitted || matchStarted;

                    return (
                      <div
                        id={`match-card-${match.id}`}
                        key={match.id}
                        className={cn(
                          "transition-all duration-300 scroll-mt-24",
                          isSubmitted && "opacity-75"
                        )}
                      >
                        {(isSubmitted || matchStarted) && (
                          <div className="mb-2 flex items-center gap-2 text-sm">
                            {matchStarted && !match.winner && (
                              <div className="flex items-center gap-2 text-orange-400">
                                <Lock className="h-4 w-4" />
                                <span>Maç başladı - tahmin yapılamaz</span>
                              </div>
                            )}
                            {isSubmitted && !matchStarted && (
                              <div className="flex items-center gap-2 text-[#B84DC7]">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Tahmin gönderildi</span>
                              </div>
                            )}
                            {match.winner && (
                              <div className="flex items-center gap-2 text-green-400">
                                <Trophy className="h-4 w-4" />
                                <span>Maç sonuçlandı</span>
                              </div>
                            )}
                          </div>
                        )}
                        <PredictionMatchCard
                          id={typeof match.id === 'string' ? parseInt(match.id) : match.id}
                          teamA={match.team_a}
                          teamB={match.team_b}
                          teamALogo={match.team_a_logo}
                          teamBLogo={match.team_b_logo}
                          matchTime={match.match_time}
                          matchDate={formattedDate}
                          tournamentName={match.tournament_name}
                          pointsA={match.difficulty_score_a}
                          pointsB={match.difficulty_score_b}
                          isSelected={!!selectedTeams[match.id]}
                          selectedTeam={(selectedTeams[match.id] || userPrediction || null) as "A" | "B" | null | undefined}
                          onSelectTeam={(team) => handleSelectTeam(match.id, team)}
                          predictionType={match.prediction_type || 'winner'}
                          optionALabel={match.option_a_label || match.team_a}
                          optionBLabel={match.option_b_label || match.team_b}
                          questionText={match.question_text}
                          analysisNote={match.analysis_note}
                          isLocked={isDisabled}
                          winner={match.winner}
                          userPrediction={userPrediction || null}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seçilen Maçlar Özeti - Alt Bar */}
      {totalPredictions > 0 && (
        <SelectedMatchesSummary
          selectedMatches={selectedMatchesData}
          onRemoveMatch={handleRemoveMatch}
          isLocked={isLocked}
          onScrollToTop={scrollToTop}
          onScrollToMatch={scrollToMatch}
        />
      )}

      {/* Onay Butonu - Fixed Bottom */}
      {totalPredictions > 0 && !isLocked && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/95 to-transparent backdrop-blur-md border-t border-[#D69ADE]/30 py-6">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="rounded-2xl border border-[#D69ADE]/30 bg-gradient-to-r from-[#D69ADE]/10 via-[#D69ADE]/5 to-transparent p-6 shadow-lg shadow-[#D69ADE]/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Tahminleri Gönder
                    </h3>
                    <p className="text-sm text-gray-400">
                      Toplam <span className="font-bold text-[#B84DC7]">{totalPredictions}</span> tahmin seçildi
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitClick}
                  disabled={isSubmitting || isLocked}
                  size="lg"
                  className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold text-base px-8 py-6 hover:opacity-90 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[#D69ADE]/50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Tahminleri Gönder
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tahmin Onay Modal'ı */}
      <PredictionsConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleSubmitPredictions}
        matches={selectedMatchesData}
        isSubmitting={isSubmitting}
      />

    </div>
  );
}