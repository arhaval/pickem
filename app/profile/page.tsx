"use client";

import { useState, useEffect } from "react";
import { Trophy, Target, TrendingUp, Calendar, Award, Users, Edit, Clock, CheckCircle2, XCircle, Zap, Star, Flame, Crown, Medal, History, ExternalLink, Instagram, Twitter, Youtube, Twitch, Music, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/page-header";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  seasons: {
    name: string;
  };
}

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  total_points?: number;
  steam_id?: string | null;
  created_at?: string;
  instagram_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  twitch_url?: string | null;
  tiktok_url?: string | null;
}

interface SeasonHistory {
  season_id: string;
  season_name: string;
  total_points: number;
  rank: number;
  total_players: number;
  correct_predictions: number;
  total_predictions: number;
}

interface UserPrediction {
  id: string;
  match_id: string;
  selected_team: string;
  points_earned: number | null;
  created_at: string;
  match: {
    id: string;
    team_a: string;
    team_b: string;
    match_date: string | null;
    match_time: string;
    winner: string | null;
    tournament_name: string | null;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [seasonPoints, setSeasonPoints] = useState<SeasonPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [showFakePredictions, setShowFakePredictions] = useState(false); // Test modu
  const [isPredictionsSectionOpen, setIsPredictionsSectionOpen] = useState(false); // Tahminler bölümü açık/kapalı
  const [achievements, setAchievements] = useState<any[]>([]);
  const [seasonHistory, setSeasonHistory] = useState<SeasonHistory[]>([]);
  const [totalAccuracy, setTotalAccuracy] = useState<number | null>(null);
  const { isRankingVisible } = useRankingVisibility();
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [pointsChange, setPointsChange] = useState<number | null>(null);

  useEffect(() => {
    // URL'den user parametresini al
    const userIdParam = searchParams.get('user');
    if (userIdParam) {
      setViewingUserId(userIdParam);
      setIsOwnProfile(false);
      
      // Fake kullanıcı kontrolü
      if (userIdParam.startsWith('fake-')) {
        loadFakeUserData(userIdParam);
      } else {
        loadUserData(userIdParam);
      }
    } else {
      loadUserData();
    }
  }, [searchParams]);

  // Aktif sezon puanını yükle ve real-time güncellemeleri dinle
  useEffect(() => {
    // Profil veya kullanıcı ID'si yoksa bekle
    if (!profile?.id && !user?.id && !viewingUserId) return;

    const userId = viewingUserId || user?.id || profile?.id;
    if (!userId || userId === 'guest') return;

    let subscription: any = null;
    let initialPoints = 0;

    const loadAndSubscribePoints = async () => {
      try {
        // Aktif sezonu bul
        const { data: activeSeason, error: seasonError } = await supabase
          .from("seasons")
          .select("id")
          .eq("is_active", true)
          .maybeSingle();

        if (seasonError || !activeSeason) {
          console.log("Aktif sezon bulunamadı veya hata:", seasonError);
          setCurrentPoints(0);
          return;
        }

        // İlk puanı yükle
        const { data: pointsData, error: pointsError } = await supabase
          .from("season_points")
          .select("total_points")
          .eq("user_id", userId)
          .eq("season_id", (activeSeason as any).id)
          .maybeSingle();

        if (pointsError && pointsError.code !== 'PGRST116') {
          console.error("Puan yüklenirken hata:", pointsError);
        }

        initialPoints = (pointsData as any)?.total_points || 0;
        setCurrentPoints(initialPoints);

        // Real-time subscription - season_points tablosundaki değişiklikleri dinle
        const channelName = `season_points_${userId}_${(activeSeason as any).id}`;
        subscription = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'season_points',
              filter: `user_id=eq.${userId} AND season_id=eq.${(activeSeason as any).id}`,
            },
            (payload: any) => {
              console.log('Puan güncellemesi:', payload);
              
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const newPoints = payload.new?.total_points || 0;
                const oldPoints = payload.old?.total_points ?? initialPoints;
                
                // Puan değişikliğini hesapla ve animasyon için göster
                const change = newPoints - oldPoints;
                if (change !== 0) {
                  setPointsChange(change);
                  // 3 saniye sonra değişiklik göstergesini kaldır
                  setTimeout(() => setPointsChange(null), 3000);
                }
                
                setCurrentPoints(newPoints);
                initialPoints = newPoints; // Güncel puanı sakla
              } else if (payload.eventType === 'DELETE') {
                setCurrentPoints(0);
                initialPoints = 0;
              }
            }
          )
          .subscribe((status: string) => {
            console.log('Subscription status:', status);
          });

      } catch (error) {
        console.error("Puan yüklenirken hata:", error);
      }
    };

    loadAndSubscribePoints();

    // Cleanup: subscription'ı kapat
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user?.id, viewingUserId, profile?.id]);

  const loadUserData = async (targetUserId?: string) => {
    // Agresif timeout - 2 saniye sonra loading'i kapat
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    let userIdToLoad: string = targetUserId || '';

    try {
      setLoading(true);

      if (targetUserId) {
        // Başka bir kullanıcının profilini görüntüle
        userIdToLoad = targetUserId;
        setIsOwnProfile(false);
      } else {
        // Kendi profilini görüntüle - Timeout ile ama yönlendirme yapma
        const getUserPromise = supabase.auth.getUser();
        const getUserTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null }, error: { message: 'Timeout' } }), 3000));
        const getUserResult = await Promise.race([getUserPromise, getUserTimeout]) as any;
        
        // Timeout durumunda yönlendirme yapma, sadece gerçek hata varsa yönlendir
        if (getUserResult?.error && getUserResult.error.message !== 'Timeout') {
          // Gerçek bir auth hatası varsa yönlendir
          if (getUserResult.error.message?.includes('JWT') || getUserResult.error.message?.includes('session')) {
            clearTimeout(timeoutId);
            setLoading(false);
            router.push("/");
            return;
          }
        }
        
        // Timeout veya kullanıcı yoksa bile devam et, boş profil göster
        if (!getUserResult?.data?.user) {
          // Kullanıcı yoksa veya timeout olduysa, profil sayfasını göster ama boş
          setUser(null);
          setProfile({
            id: 'guest',
            username: null,
            avatar_url: null,
          });
          setIsOwnProfile(false);
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        setUser(getUserResult.data.user);
        userIdToLoad = getUserResult.data.user.id;
        setIsOwnProfile(true);
      }

      // Profil bilgilerini yükle - Çok kısa timeout
      const profilePromise = supabase
        .from("profiles")
        .select("id, username, avatar_url, steam_id, total_points, is_admin, created_at, updated_at, instagram_url, twitter_url, youtube_url, twitch_url, tiktok_url")
        .eq("id", userIdToLoad)
        .maybeSingle();
      
      const profileTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 1500));
      const profileResult = await Promise.race([profilePromise, profileTimeout]) as any;
      
      if (profileResult?.error && profileResult.error.code !== 'PGRST116') {
        console.error("Profil yüklenirken hata:", profileResult.error);
      }
      
      if (profileResult?.data) {
        setProfile(profileResult.data as Profile);
      } else {
        // Profil yoksa boş profil set et
        setProfile({
          id: userIdToLoad,
          username: null,
          avatar_url: null,
        });
      }

      // Kullanıcının tahminlerini yükle (sadece kendi profili görüntüleniyorsa)
      if (isOwnProfile && userIdToLoad) {
        await loadUserPredictions(userIdToLoad);
      }

      // Gereksiz sorgular kaldırıldı - sadece temel profil bilgileri yükleniyor
      // Sezon, tahminler, rozetler gibi şeyler opsiyonel ve yavaş yüklenebilir
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
      // Hata olsa bile profil göster
      if (!profile && userIdToLoad) {
        setProfile({
          id: userIdToLoad,
          username: null,
          avatar_url: null,
        });
      }
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const getAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  // Kullanıcının tahminlerini yükle
  const loadUserPredictions = async (userId: string) => {
    try {
      setPredictionsLoading(true);
      console.log("[Profile] Tahminler yükleniyor, userId:", userId);
      
      // Kullanıcının tahminlerini çek (match bilgileri ile birlikte)
      // match_id text olabilir, bu yüzden join yapmak yerine ayrı ayrı çekelim
      const { data: predictionsData, error } = await supabase
        .from("predictions")
        .select(`
          id,
          match_id,
          selected_team,
          points_earned,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50); // Son 50 tahmin

      if (error) {
        console.error("[Profile] Tahminler yüklenirken hata:", error);
        setUserPredictions([]);
        return;
      }

      console.log("[Profile] Tahminler yüklendi, adet:", predictionsData?.length || 0);

      if (!predictionsData || predictionsData.length === 0) {
        setUserPredictions([]);
        return;
      }

      // Match bilgilerini ayrı ayrı çek
      const matchIds = predictionsData.map((p: any) => p.match_id).filter(Boolean);
      
      if (matchIds.length === 0) {
        setUserPredictions([]);
        return;
      }

      // Match'leri çek (match_id text olduğu için string olarak karşılaştırıyoruz)
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("id, team_a, team_b, match_date, match_time, winner, tournament_name")
        .in("id", matchIds);

      if (matchesError) {
        console.error("[Profile] Maçlar yüklenirken hata:", matchesError);
        setUserPredictions([]);
        return;
      }

      // Match'leri Map'e çevir (hızlı lookup için)
      const matchesMap = new Map<string | number, any>();
      if (matchesData) {
        matchesData.forEach((m: any) => {
          matchesMap.set(m.id.toString(), m);
        });
      }

      // Tahminleri match bilgileri ile birleştir
      const formattedPredictions: UserPrediction[] = predictionsData
        .map((p: any) => {
          const matchIdStr = p.match_id?.toString();
          const match = matchIdStr ? matchesMap.get(matchIdStr) : null;
          
          if (!match) {
            console.warn("[Profile] Match bulunamadı, match_id:", p.match_id);
            return null;
          }

          return {
            id: p.id,
            match_id: p.match_id,
            selected_team: p.selected_team,
            points_earned: p.points_earned,
            created_at: p.created_at,
            match: {
              id: match.id,
              team_a: match.team_a,
              team_b: match.team_b,
              match_date: match.match_date,
              match_time: match.match_time,
              winner: match.winner,
              tournament_name: match.tournament_name,
            },
          };
        })
        .filter((p): p is UserPrediction => p !== null);
      
      console.log("[Profile] Formatlanmış tahminler, adet:", formattedPredictions.length);
      
      setUserPredictions(formattedPredictions);
    } catch (error) {
      console.error("[Profile] Tahminler yüklenirken beklenmeyen hata:", error);
      setUserPredictions([]);
    } finally {
      setPredictionsLoading(false);
    }
  };

  // Fake kullanıcı verileri (leaderboard'dan)
  const fakeUsers: Record<string, any> = {
    "fake-1": {
      id: "fake-1",
      username: "ArhavalMaster",
      avatar_url: null,
      total_points: 15240,
      correct_predictions: 45,
      total_predictions: 60,
      season_name: "Test Sezonu",
      rank: 1,
    },
    "fake-2": {
      id: "fake-2",
      username: "TahminKralı",
      avatar_url: null,
      total_points: 14890,
      correct_predictions: 42,
      total_predictions: 58,
      season_name: "Test Sezonu",
      rank: 2,
    },
    "fake-3": {
      id: "fake-3",
      username: "TahminCı",
      avatar_url: null,
      total_points: 14120,
      correct_predictions: 38,
      total_predictions: 55,
      season_name: "Test Sezonu",
      rank: 3,
    },
    "fake-4": {
      id: "fake-4",
      username: "ProGamer",
      avatar_url: null,
      total_points: 13850,
      correct_predictions: 40,
      total_predictions: 62,
      season_name: "Test Sezonu",
      rank: 4,
    },
    "fake-5": {
      id: "fake-5",
      username: "SkinHunter",
      avatar_url: null,
      total_points: 13210,
      correct_predictions: 35,
      total_predictions: 50,
      season_name: "Test Sezonu",
      rank: 5,
    },
    "fake-6": {
      id: "fake-6",
      username: "AcePlayer",
      avatar_url: null,
      total_points: 12800,
      correct_predictions: 33,
      total_predictions: 48,
      season_name: "Test Sezonu",
      rank: 6,
    },
    "fake-7": {
      id: "fake-7",
      username: "HeadshotPro",
      avatar_url: null,
      total_points: 12450,
      correct_predictions: 30,
      total_predictions: 45,
      season_name: "Test Sezonu",
      rank: 7,
    },
    "fake-8": {
      id: "fake-8",
      username: "ClutchKing",
      avatar_url: null,
      total_points: 12000,
      correct_predictions: 28,
      total_predictions: 42,
      season_name: "Test Sezonu",
      rank: 8,
    },
    "fake-9": {
      id: "fake-9",
      username: "RifleMaster",
      avatar_url: null,
      total_points: 11500,
      correct_predictions: 25,
      total_predictions: 40,
      season_name: "Test Sezonu",
      rank: 9,
    },
    "fake-10": {
      id: "fake-10",
      username: "TacticalMind",
      avatar_url: null,
      total_points: 11000,
      correct_predictions: 22,
      total_predictions: 38,
      season_name: "Test Sezonu",
      rank: 10,
    },
  };

  const loadFakeUserData = async (fakeUserId: string) => {
    try {
      setLoading(true);
      const fakeUser = fakeUsers[fakeUserId];
      
      if (!fakeUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fake kullanıcı profilini set et
      setProfile({
        id: fakeUser.id,
        username: fakeUser.username,
        avatar_url: fakeUser.avatar_url,
        total_points: fakeUser.total_points,
        created_at: new Date().toISOString(), // Fake tarih
      });

      // Fake sezon bilgisi
      setActiveSeason({
        id: "fake-season",
        name: fakeUser.season_name,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        is_active: true,
      });

      // Fake sezon puanları
      setSeasonPoints({
        total_points: fakeUser.total_points,
        correct_predictions: fakeUser.correct_predictions,
        total_predictions: fakeUser.total_predictions,
        seasons: {
          name: fakeUser.season_name,
        },
      });

      // Sıralama
      setUserRank(fakeUser.rank);
      setTotalPlayers(10); // Fake leaderboard'da 10 kullanıcı var

      // Başarı rozetlerini hesapla
      const newAchievements: any[] = [];
      if (fakeUser.total_predictions >= 1) {
        newAchievements.push({
          id: 'first_prediction',
          name: 'İlk Adım',
          description: 'İlk tahminini yaptın!',
          icon: Star,
          color: 'from-blue-500 to-blue-600',
          unlocked: true
        });
      }
      if (fakeUser.correct_predictions >= 10) {
        newAchievements.push({
          id: 'ten_correct',
          name: 'Onluk',
          description: '10 doğru tahmin yaptın!',
          icon: Target,
          color: 'from-green-500 to-green-600',
          unlocked: true
        });
      }
      const accuracy = getAccuracy(fakeUser.correct_predictions, fakeUser.total_predictions);
      if (accuracy >= 70 && fakeUser.total_predictions >= 10) {
        newAchievements.push({
          id: 'high_accuracy',
          name: 'Keskin Nişancı',
          description: '%70+ başarı oranı!',
          icon: Zap,
          color: 'from-orange-500 to-red-600',
          unlocked: true
        });
      }
      setAchievements(newAchievements);

      // Total başarı yüzdesi
      setTotalAccuracy(accuracy);

      // Son tahminler (fake için boş)
      // setRecentPredictions([]); // Removed - not needed
    } catch (error) {
      console.error("Fake kullanıcı yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number | null) => {
    if (!rank) return null;
    if (rank === 1) {
      return <Trophy className="h-6 w-6 text-yellow-400" />;
    } else if (rank === 2) {
      return <Award className="h-6 w-6 text-gray-300" />;
    } else if (rank === 3) {
      return <Award className="h-6 w-6 text-amber-600" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Profil bulunamadı.</p>
          <p className="text-gray-500 text-sm">Bu kullanıcı henüz kayıt olmamış olabilir.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null; // Loading durumunda
  }

  // Kendi profili görüntüleniyorsa giriş kontrolü
  if (isOwnProfile && !user) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <PageHeader
        type="profile"
        title={isOwnProfile ? "Profilim" : `${profile?.username || "Kullanıcı"} Profili`}
        description={isOwnProfile ? "Sezon puanlarınız ve istatistikleriniz" : "Kullanıcı istatistikleri"}
      />

      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Profil Kartı - Yatay Düzen */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#131720] via-[#1a1f2e] to-[#0f172a] rounded-xl border border-white/10 p-5 md:p-6 mb-4 shadow-xl">
          {/* Arka plan efekti */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#B84DC7]/5 via-transparent to-[#D69ADE]/5"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#B84DC7]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D69ADE]/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-start gap-5 md:gap-6">
            {/* Avatar - Sol */}
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || "Kullanıcı"}
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover border-2 border-[#B84DC7] shadow-xl shadow-[#B84DC7]/40 ring-2 ring-[#B84DC7]/20 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] border-2 border-[#B84DC7] flex items-center justify-center shadow-xl shadow-[#B84DC7]/40 ring-2 ring-[#B84DC7]/20 transition-transform group-hover:scale-105">
                  <Users className="h-12 w-12 md:h-14 md:w-14 text-white" />
                </div>
              )}
            </div>
            
            {/* Bilgiler - Sağ */}
            <div className="flex-1 min-w-0">
              {/* Kullanıcı Adı ve Üyelik */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-black text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {profile.username || "İsimsiz Kullanıcı"}
                </h1>
                {profile.created_at && (
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Üyelik: {new Date(profile.created_at).toLocaleDateString('tr-TR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>

              {/* Sosyal Medya İkonları - Kompakt */}
              {(profile.instagram_url || profile.twitter_url || profile.youtube_url || profile.twitch_url || profile.tiktok_url || profile.steam_id) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {profile.youtube_url && (
                    <a
                      href={profile.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                  {profile.twitch_url && (
                    <a
                      href={profile.twitch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md"
                    >
                      <Twitch className="h-4 w-4" />
                    </a>
                  )}
                  {profile.tiktok_url && (
                    <a
                      href={profile.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-black hover:bg-gray-900 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md"
                    >
                      <Music className="h-4 w-4" />
                    </a>
                  )}
                  {profile.steam_id && (
                    <a
                      href={`https://steamcommunity.com/profiles/${profile.steam_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Düzenle Butonu */}
              {isOwnProfile && (
                <Button
                  onClick={() => router.push("/settings")}
                  variant="outline"
                  size="sm"
                  className="border-[#B84DC7]/50 text-[#B84DC7] hover:bg-[#B84DC7]/20 hover:border-[#B84DC7] hover:scale-105 transition-all shadow-md"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </div>

          {/* Aktif Sezon Puanları - Profil Kartının Altında */}
          {(isOwnProfile || viewingUserId) && (
            <div className="mt-4">
              <div className="relative overflow-hidden rounded-xl border border-[#B84DC7]/30 bg-gradient-to-br from-[#B84DC7]/10 to-[#D69ADE]/5 p-4">
                {/* Arka plan efekti */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#B84DC7]/5 via-transparent to-[#D69ADE]/5"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#B84DC7]/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D69ADE]/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-[#B84DC7]" />
                      <span className="text-sm font-semibold text-gray-300">Sezon Puanı</span>
                    </div>
                    {pointsChange !== null && pointsChange !== 0 && (
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full animate-pulse",
                          pointsChange > 0
                            ? "text-green-400 bg-green-500/20"
                            : "text-red-400 bg-red-500/20"
                        )}
                      >
                        {pointsChange > 0 ? "+" : ""}{pointsChange.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        {currentPoints.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400">puan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kullanıcının Tahminleri - Sadece kendi profili görüntüleniyorsa göster */}
        {isOwnProfile && (
          <div className="bg-gradient-to-br from-[#131720] to-[#0f172a] rounded-xl border border-white/10 shadow-lg mb-4 overflow-hidden">
            {/* Accordion Başlığı - Tıklanabilir */}
            <button
              onClick={() => setIsPredictionsSectionOpen(!isPredictionsSectionOpen)}
              className="w-full p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Tahminlerim</h2>
                {userPredictions.length > 0 && (
                  <span className="text-sm text-gray-400">({userPredictions.length})</span>
                )}
              </div>
              {isPredictionsSectionOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {/* Accordion İçeriği */}
            {isPredictionsSectionOpen && (
              <div className="px-4 pb-4 pt-0">
                {predictionsLoading ? (
                  <div className="text-center py-8">
                    <div className="h-6 w-6 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Tahminler yükleniyor...</p>
                  </div>
                ) : userPredictions.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Henüz tahmin yapmadınız.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                  <Link href="/predictions">
                    <Button className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-semibold hover:opacity-90">
                      Tahmin Yapmaya Başla
                    </Button>
                  </Link>
                  {/* Test Modu: Fake Tahminler Göster */}
                  <Button
                    onClick={() => {
                      const fakePredictions: UserPrediction[] = [
                        {
                          id: "fake-1",
                          match_id: "test-1",
                          selected_team: "A",
                          points_earned: 50,
                          created_at: new Date().toISOString(),
                          match: {
                            id: "test-1",
                            team_a: "NAVI",
                            team_b: "FaZe",
                            match_date: "2025-01-15",
                            match_time: "20:00",
                            winner: "A",
                            tournament_name: "BLAST Premier",
                          },
                        },
                        {
                          id: "fake-2",
                          match_id: "test-2",
                          selected_team: "B",
                          points_earned: null,
                          created_at: new Date(Date.now() - 86400000).toISOString(),
                          match: {
                            id: "test-2",
                            team_a: "Eternal Fire",
                            team_b: "Vitality",
                            match_date: "2025-01-16",
                            match_time: "19:00",
                            winner: null,
                            tournament_name: "IEM Katowice",
                          },
                        },
                        {
                          id: "fake-3",
                          match_id: "test-3",
                          selected_team: "A",
                          points_earned: 0,
                          created_at: new Date(Date.now() - 172800000).toISOString(),
                          match: {
                            id: "test-3",
                            team_a: "G2",
                            team_b: "MOUZ",
                            match_date: "2025-01-14",
                            match_time: "21:00",
                            winner: "B",
                            tournament_name: "ESL Pro League",
                          },
                        },
                      ];
                      setUserPredictions(fakePredictions);
                      setShowFakePredictions(true);
                    }}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500"
                  >
                    🧪 Test Tahminleri Göster
                  </Button>
                </div>
                {showFakePredictions && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ Test modu aktif - Bu fake tahminlerdir
                  </p>
                )}
              </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {userPredictions.map((prediction) => {
                      // Doğru/yanlış kontrolü: winner varsa ve selected_team ile eşleşiyorsa doğru
                      const isCorrect = prediction.match.winner 
                        ? prediction.selected_team === prediction.match.winner
                        : null; // Henüz sonuçlanmamış
                      
                      const matchDate = prediction.match.match_date
                        ? new Date(prediction.match.match_date).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Tarih yok';
                      
                      return (
                        <div
                          key={prediction.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            isCorrect === true
                              ? "bg-green-500/10 border-green-500/30"
                              : isCorrect === false
                              ? "bg-red-500/10 border-red-500/30"
                              : "bg-white/5 border-white/10"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-white uppercase truncate">
                                  {prediction.match.team_a}
                                </span>
                                <span className="text-xs text-gray-500 font-bold">VS</span>
                                <span className="text-sm font-bold text-white uppercase truncate">
                                  {prediction.match.team_b}
                                </span>
                              </div>
                              {prediction.match.tournament_name && (
                                <p className="text-xs text-[#B84DC7] mb-1">
                                  {prediction.match.tournament_name}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {matchDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {prediction.match.match_time}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-400">Tahmininiz:</span>
                                <span className="text-sm font-semibold text-[#B84DC7]">
                                  {prediction.selected_team === "A" 
                                    ? prediction.match.team_a 
                                    : prediction.match.team_b}
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                              {isCorrect === true && (
                                <div className="flex items-center gap-1 text-green-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="text-xs font-bold">Kazandı</span>
                                </div>
                              )}
                              {isCorrect === false && (
                                <div className="flex items-center gap-1 text-red-400">
                                  <XCircle className="h-4 w-4" />
                                  <span className="text-xs font-bold">Kaybetti</span>
                                </div>
                              )}
                              {isCorrect === null && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-xs font-bold">Beklemede</span>
                                </div>
                              )}
                              {prediction.points_earned !== null && prediction.points_earned > 0 && (
                                <div className="flex items-center gap-1 text-[#B84DC7]">
                                  <Trophy className="h-4 w-4" />
                                  <span className="text-xs font-bold">+{prediction.points_earned} puan</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sezon Geçmişi - Sadece sıralama açıksa göster */}
        {isRankingVisible && (
          <div className="bg-gradient-to-br from-[#131720] to-[#0f172a] rounded-xl border border-white/10 p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <History className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Sezon Geçmişi</h2>
            </div>
            
            {seasonHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonHistory.map((history, index) => {
                  const accuracy = history.total_predictions > 0 
                    ? Math.round((history.correct_predictions / history.total_predictions) * 100)
                    : 0;
                  
                  // Sıralama ikonunu belirle
                  const getRankIcon = () => {
                    if (history.rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
                    if (history.rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
                    if (history.rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
                    return null;
                  };
                  
                  return (
                    <div
                      key={history.season_id}
                      className={cn(
                        "relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg hover:shadow-purple-500/10",
                        history.rank === 1
                          ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30"
                          : history.rank === 2
                          ? "bg-gradient-to-br from-gray-500/10 to-slate-500/5 border-gray-500/30"
                          : history.rank === 3
                          ? "bg-gradient-to-br from-amber-600/10 to-orange-500/5 border-amber-600/30"
                          : "bg-gradient-to-br from-white/5 to-white/2 border-white/10"
                      )}
                    >
                      {/* Arka plan efekti */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(184,77,199,0.3) 0%, transparent 70%)`,
                        }}></div>
                      </div>
                      
                      <div className="relative z-10">
                        {/* Sezon Adı */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">{history.season_name}</h3>
                          {getRankIcon()}
                        </div>
                        
                        {/* Sıralama Badge */}
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B84DC7]/20 border border-[#B84DC7]/30">
                            {history.rank > 0 ? (
                              <>
                                <Crown className="h-4 w-4 text-[#B84DC7]" />
                                <span className="text-sm font-bold text-[#B84DC7]">
                                  #{history.rank} Sıralama
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-400">
                                Sıralama yok
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* İstatistikler */}
                        {history.total_predictions > 0 && (
                          <div className="space-y-3">
                            {/* Doğru Tahmin Yüzdesi */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Doğru Tahmin Oranı</span>
                                <span className="text-sm font-bold text-green-400">%{accuracy}</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    accuracy >= 70
                                      ? "bg-gradient-to-r from-green-500 to-emerald-400"
                                      : accuracy >= 50
                                      ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                                      : "bg-gradient-to-r from-red-500 to-orange-400"
                                  )}
                                  style={{ width: `${accuracy}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* İstatistik Detayları */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Toplam Tahmin</p>
                                <p className="text-base font-bold text-white">{history.total_predictions}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Doğru Tahmin</p>
                                <p className="text-base font-bold text-green-400">{history.correct_predictions}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {history.total_predictions === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-400">Henüz tahmin yapılmamış</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Örnek: İstatistikler açılınca nasıl görünecek */}
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-5 opacity-60">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(184,77,199,0.3) 0%, transparent 70%)`,
                    }}></div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Sezon 1</h3>
                      <Trophy className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B84DC7]/20 border border-[#B84DC7]/30">
                        <Crown className="h-4 w-4 text-[#B84DC7]" />
                        <span className="text-sm font-bold text-[#B84DC7]">#5 Sıralama</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Doğru Tahmin Oranı</span>
                          <span className="text-sm font-bold text-green-400">%75</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: "75%" }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Toplam Tahmin</p>
                          <p className="text-base font-bold text-white">20</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Doğru Tahmin</p>
                          <p className="text-base font-bold text-green-400">15</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-5 opacity-60">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(184,77,199,0.3) 0%, transparent 70%)`,
                    }}></div>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Sezon 2</h3>
                    </div>
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B84DC7]/20 border border-[#B84DC7]/30">
                        <Crown className="h-4 w-4 text-[#B84DC7]" />
                        <span className="text-sm font-bold text-[#B84DC7]">#12 Sıralama</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Doğru Tahmin Oranı</span>
                          <span className="text-sm font-bold text-green-400">%68</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400" style={{ width: "68%" }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Toplam Tahmin</p>
                          <p className="text-base font-bold text-white">25</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Doğru Tahmin</p>
                          <p className="text-base font-bold text-green-400">17</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bilgilendirme Notu */}
            {seasonHistory.length === 0 && (
              <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-300 text-center">
                  ⚠️ İstatistikler açılınca güncellenecektir
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}


