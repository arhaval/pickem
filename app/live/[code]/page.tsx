"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/supabase/client";
import { Radio, Users, ArrowRight, Zap, Trophy, Clock, Sparkles, Play, TrendingUp, Loader2, MessageSquare, Send, CheckCircle2, XCircle, Target, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import TeamLogo from "@/components/team-logo";
import AuthModal from "@/components/auth-modal";

interface LiveLobby {
  id: string;
  name: string;
  unique_code: string;
  is_active: boolean;
  hero_image_url: string | null;
  event_title: string | null;
  primary_color: string | null;
  team_a?: string | null;
  team_b?: string | null;
  team_a_logo?: string | null;
  team_b_logo?: string | null;
  created_at: string;
}

interface LiveQuestion {
  id: string;
  lobby_id: string;
  question_text: string;
  question_type: 'text' | 'match_score' | 'player_stats';
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  is_active: boolean;
  is_answered: boolean;
  player_image_url?: string | null;
  player_name?: string | null;
  banner_image_url?: string | null;
  created_at: string;
}

export default function LiveLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;
  
  const [lobby, setLobby] = useState<LiveLobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<LiveQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [userAnswerText, setUserAnswerText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [viewers, setViewers] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(false);

  // Authentication kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        // Kullanıcı giriş yapmamış, auth modal'ı aç
        setIsAuthModalOpen(true);
        setCheckingAuth(false);
        return;
      }
      setUser(user);
      setCheckingAuth(false);
    };

    checkAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthModalOpen(false);
        setCheckingAuth(false);
        // Sayfayı yenile
        window.location.reload();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!code) {
      setError("Lobi kodu bulunamadı.");
      setLoading(false);
      return;
    }

    // Sadece kullanıcı giriş yapmışsa lobiyi yükle
    if (!checkingAuth && user) {
      loadLobby();
    }
  }, [code, checkingAuth, user]);

  useEffect(() => {
    if (lobby) {
      loadActiveQuestion();
      // Real-time subscription for questions (tablo varsa)
      try {
        const channel = supabase
          .channel(`lobby_${lobby.id}_questions`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'live_questions',
              filter: `lobby_id=eq.${lobby.id}`,
            },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                loadActiveQuestion();
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        // Tablo yoksa subscription hatası verme
        console.log("Real-time subscription kurulamadı (tablo henüz yok).");
      }
    }
  }, [lobby]);

  const loadLobby = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: lobbyError } = await supabase
        .from("live_lobbies")
        .select("*")
        .eq("unique_code", code.toUpperCase())
        .single();

      if (lobbyError || !data) {
        setError("Lobi bulunamadı veya aktif değil.");
        setLoading(false);
        return;
      }

      const lobbyData = data as LiveLobby;
      if (!lobbyData.is_active) {
        setError("Bu lobi şu anda aktif değil.");
        setLoading(false);
        return;
      }

      setLobby(lobbyData);
    } catch (err: any) {
      console.error("Lobi yüklenirken hata:", err);
      setError("Lobi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };


  const loadActiveQuestion = async () => {
    if (!lobby) return;

    try {
      // Tablo yoksa sessizce devam et (henüz oluşturulmamış)
      const { data, error } = await supabase
        .from("live_questions")
        .select("*")
        .eq("lobby_id", lobby.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        // Tablo yoksa veya başka bir hata varsa sessizce devam et
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        
        if (
          errorCode === '42P01' || 
          errorCode === 'PGRST116' ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('relation') ||
          errorMessage.includes('schema cache')
        ) {
          // Tablo henüz oluşturulmamış, sessizce devam et
          setActiveQuestion(null);
          return;
        }
        
        // Diğer hatalar için sadece development'ta log
        if (process.env.NODE_ENV === 'development') {
          console.warn("Soru yüklenirken hata (tablo yok olabilir):", errorCode, errorMessage);
        }
        setActiveQuestion(null);
        return;
      }

      const questionData = data as LiveQuestion | null;
      setActiveQuestion(questionData);
      
      // Debug: Banner URL'ini kontrol et
      if (questionData) {
        console.log('Active Question:', questionData);
        console.log('Banner Image URL:', questionData.banner_image_url);
        console.log('Banner Image URL type:', typeof questionData.banner_image_url);
        console.log('Banner Image URL length:', questionData.banner_image_url?.length);
        console.log('Lobby Hero Image URL:', lobby.hero_image_url);
        console.log('Will show banner?', (questionData.banner_image_url && questionData.banner_image_url.trim() !== "") || (lobby.hero_image_url && lobby.hero_image_url.trim() !== ""));
      }
      
      // Eğer soru cevaplandıysa, kazananları yükle
      if (questionData && questionData.is_answered) {
        loadWinners(questionData.id);
      } else {
        setWinners([]);
      }
      
      // Kullanıcının cevabını kontrol et
      if (questionData) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: answer, error: answerError } = await supabase
              .from("live_question_answers")
              .select("answer")
              .eq("question_id", questionData.id)
              .eq("user_id", user.id)
              .maybeSingle();
            
            if (!answerError && answer) {
              const answerData = answer as any;
              setSubmittedAnswer(answerData.answer);
              setUserAnswerText(answerData.answer); // Daha önce verilen cevabı göster
            } else if (answerError) {
              // Cevap tablosu yoksa sessizce devam et
              const answerErrorMessage = answerError.message || '';
              const answerErrorCode = answerError.code || '';
              
              if (
                answerErrorCode === '42P01' || 
                answerErrorCode === 'PGRST116' ||
                answerErrorMessage.includes('does not exist')
              ) {
                // Tablo yok, normal
              }
            }
          }
        } catch (err) {
          // Cevap tablosu yoksa sessizce devam et
          // Hata loglamaya gerek yok
        }
      }
    } catch (err: any) {
      // Genel hata yakalama - tablo yoksa normal
      const errorMessage = err?.message || '';
      if (
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('schema cache')
      ) {
        // Tablo henüz oluşturulmamış, normal
        setActiveQuestion(null);
        return;
      }
      
      // Gerçek bir hata varsa sadece development'ta log
      if (process.env.NODE_ENV === 'development') {
        console.warn("Soru yüklenirken beklenmeyen hata:", err);
      }
      setActiveQuestion(null);
    }
  };

  const loadWinners = async (questionId: string) => {
    try {
      setLoadingWinners(true);
      
      // Kazanan olarak işaretlenen kullanıcıları bul
      const { data: winnersData, error } = await supabase
        .from("live_question_answers")
        .select("user_id, answer, created_at, is_winner")
        .eq("question_id", questionId)
        .eq("is_winner", true)
        .order("created_at", { ascending: true });

      if (error) {
        // Kolon yoksa sessizce devam et
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('column')) {
          setWinners([]);
          return;
        }
        console.error("Kazananlar yüklenirken hata:", error);
        return;
      }

      // Kullanıcı bilgilerini al
      if (winnersData && winnersData.length > 0) {
        const userIds = [...new Set((winnersData as any[]).map((a: any) => a.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        // Profil bilgilerini cevaplara ekle
        const winnersWithProfiles = (winnersData as any[]).map((answer: any) => ({
          ...answer,
          profiles: profilesData?.find((p: any) => p.id === answer.user_id) || null,
        }));

        setWinners(winnersWithProfiles);
      } else {
        setWinners([]);
      }
    } catch (error) {
      console.error("Kazananlar yüklenirken hata:", error);
    } finally {
      setLoadingWinners(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !lobby) return;

    if (!userAnswerText.trim()) {
      alert("Lütfen bir cevap girin.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Cevap vermek için giriş yapmanız gerekiyor.");
      router.push("/");
      return;
    }

    setIsSubmitting(true);
    try {
      // Tablo yoksa uyarı ver
      const { data: existingAnswer, error: checkError } = await supabase
        .from("live_question_answers")
        .select("id")
        .eq("question_id", activeQuestion.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError && (checkError.code === '42P01' || checkError.message.includes('does not exist'))) {
        alert("Cevap sistemi henüz hazır değil. Lütfen admin panelinden tabloları oluşturun.");
        setIsSubmitting(false);
        return;
      }

      const answerText = userAnswerText.trim();

      if (existingAnswer) {
        // Cevap zaten verilmiş, güncelle
        const { error } = await (supabase as any)
          .from("live_question_answers")
          .update({ answer: answerText })
          .eq("id", (existingAnswer as any).id);

        if (error) throw error;
      } else {
        // Yeni cevap ekle
        const { error } = await (supabase as any)
          .from("live_question_answers")
          .insert({
            question_id: activeQuestion.id,
            user_id: user.id,
            answer: answerText,
          });

        if (error) throw error;
      }

      setUserAnswer(answerText);
      setSubmittedAnswer(answerText);
      setUserAnswerText(""); // Input'u temizle
      alert("Cevabınız kaydedildi! 🎉");
    } catch (err: any) {
      console.error("Cevap gönderilirken hata:", err);
      alert(err.message || "Cevap gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B84DC7] mx-auto mb-4" />
          <p className="text-gray-400">Lobi yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Üye olmayan kullanıcılar için auth modal göster
  if (!user && !checkingAuth) {
    return (
      <>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            router.push("/");
          }}
          defaultTab="login"
        />
        <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-black flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6">
              <Radio className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Giriş Gerekli</h1>
              <p className="text-gray-400 mb-4">
                Bu sayfaya erişmek için giriş yapmanız veya üye olmanız gerekiyor.
              </p>
              <p className="text-sm text-gray-500">
                Giriş penceresi açılıyor...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !lobby) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <Radio className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Lobi Bulunamadı</h1>
            <p className="text-gray-400">{error || "Lobi bulunamadı."}</p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = lobby.primary_color || "#D69ADE";

  return (
    <div className="min-h-screen relative bg-[#0a0e1a] overflow-hidden">
      {/* Arka Plan Animasyonları */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#D69ADE]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Üst Bar - Kompakt */}
      <div className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="h-5 w-5 text-red-400" />
                <span className="absolute inset-0 animate-ping">
                  <Radio className="h-5 w-5 text-red-400 opacity-50" />
                </span>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wide">CANLI YAYIN</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Users className="h-4 w-4" />
              <span>{viewers} izleyici</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="container mx-auto px-4 py-6 max-w-5xl relative z-10">
        <div className="space-y-6">
          {/* Maç Bilgisi Kartı */}
          {(lobby.team_a || lobby.team_b) ? (
            <div className="rounded-2xl border-2 border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 shadow-xl">
              <div className="text-center mb-6">
                {/* Logo - Etkinlik Başlığının Üstünde */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#B84DC7]"></div>
                  <div className="relative h-5 w-5">
                    <Image
                      src="/logo.png"
                      alt="Arhaval"
                      width={20}
                      height={20}
                      className="object-contain w-full h-full brightness-0 invert"
                    />
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#B84DC7]"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
                  {lobby.event_title || lobby.name}
                </h2>
              </div>

              {/* Takımlar */}
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Takım A */}
                {lobby.team_a && (
                  <div className="col-span-5 flex flex-col items-center gap-3">
                    <TeamLogo
                      teamName={lobby.team_a}
                      logoUrl={lobby.team_a_logo}
                      className="w-24 h-24 md:w-32 md:h-32 ring-2 ring-white/20"
                    />
                    <h3 className="text-xl md:text-2xl font-bold text-white text-center break-words">
                      {lobby.team_a}
                    </h3>
                  </div>
                )}

                {/* VS */}
                <div className="col-span-2 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500 mb-1">VS</div>
                  </div>
                </div>

                {/* Takım B */}
                {lobby.team_b && (
                  <div className="col-span-5 flex flex-col items-center gap-3">
                    <TeamLogo
                      teamName={lobby.team_b}
                      logoUrl={lobby.team_b_logo}
                      className="w-24 h-24 md:w-32 md:h-32 ring-2 ring-white/20"
                    />
                    <h3 className="text-xl md:text-2xl font-bold text-white text-center break-words">
                      {lobby.team_b}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Maç Yok - Sadece Lobi Bilgisi */
            <div className="rounded-2xl border-2 border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 shadow-xl text-center">
              {/* Logo - Etkinlik Başlığının Üstünde */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#B84DC7]"></div>
                <div className="relative h-5 w-5">
                  <Image
                    src="/logo.png"
                    alt="Arhaval"
                    width={20}
                    height={20}
                    className="object-contain w-full h-full brightness-0 invert"
                  />
                </div>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#B84DC7]"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                {lobby.event_title || lobby.name}
              </h2>
              <p className="text-gray-400 text-sm">Maç bilgisi eklenmemiş</p>
            </div>
          )}

          {/* Soru Kartı - Banner ile Birleştirilmiş */}
          {activeQuestion ? (
            <div className="relative rounded-2xl border-2 border-[#D69ADE]/50 overflow-hidden shadow-2xl shadow-[#D69ADE]/20">
              {/* Banner Görseli - Önce soru banner'ı, yoksa lobby banner'ı */}
              {((activeQuestion.banner_image_url && activeQuestion.banner_image_url.trim() !== "") || (lobby.hero_image_url && lobby.hero_image_url.trim() !== "")) ? (
                <div className="relative w-full h-[400px] md:h-[500px]">
                  <img
                    src={(activeQuestion.banner_image_url && activeQuestion.banner_image_url.trim() !== "") ? activeQuestion.banner_image_url : (lobby.hero_image_url || "")}
                    alt={lobby.name || "Live Banner"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Banner görseli yüklenemedi:", e);
                      // Fallback: Eğer soru banner'ı yüklenemezse ve lobby banner'ı varsa onu kullan
                      if (activeQuestion.banner_image_url && lobby.hero_image_url) {
                        const target = e.target as HTMLImageElement;
                        target.src = lobby.hero_image_url;
                      }
                    }}
                  />
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
                  
                  {/* Canlı İndikatör */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-sm z-10">
                    <div className="relative">
                      <Radio className="h-3 w-3 text-red-400" />
                      <span className="absolute inset-0 animate-ping">
                        <Radio className="h-3 w-3 text-red-400 opacity-50" />
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-400 uppercase">CANLI SORU</span>
                  </div>

                  {/* Soru İçeriği - Banner Üzerinde */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8 z-10">
                    {/* Oyuncu Fotoğrafı (Eğer varsa) */}
                    {activeQuestion.player_image_url && (
                      <div className="mb-6 flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#D69ADE]/30 to-[#B84DC7]/30 rounded-xl blur-xl"></div>
                          <Image
                            src={activeQuestion.player_image_url}
                            alt={activeQuestion.player_name || "Oyuncu"}
                            width={150}
                            height={150}
                            className="relative rounded-xl border-2 border-[#D69ADE]/50 object-cover"
                          />
                          {activeQuestion.player_name && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 rounded-b-xl">
                              <p className="text-white font-bold text-center text-sm">{activeQuestion.player_name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Soru Metni */}
                    <div className="mb-6 max-w-3xl">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Soru</h2>
                      </div>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-relaxed text-center drop-shadow-lg">
                        {activeQuestion.question_text}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Banner yoksa eski stil */
                <div className="relative bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 md:p-8">
                  {/* Canlı İndikatör */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50">
                    <div className="relative">
                      <Radio className="h-3 w-3 text-red-400" />
                      <span className="absolute inset-0 animate-ping">
                        <Radio className="h-3 w-3 text-red-400 opacity-50" />
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-400 uppercase">CANLI SORU</span>
                  </div>

                  {/* Soru Başlığı */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Soru</h2>
                  </div>

                  {/* Oyuncu Fotoğrafı (Eğer varsa) */}
                  {activeQuestion.player_image_url && (
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D69ADE]/30 to-[#B84DC7]/30 rounded-xl blur-xl"></div>
                        <Image
                          src={activeQuestion.player_image_url}
                          alt={activeQuestion.player_name || "Oyuncu"}
                          width={200}
                          height={200}
                          className="relative rounded-xl border-2 border-[#D69ADE]/50 object-cover"
                        />
                        {activeQuestion.player_name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 rounded-b-xl">
                            <p className="text-white font-bold text-center">{activeQuestion.player_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Soru Metni */}
                  <div className="mb-6">
                    <p className="text-lg md:text-xl font-bold text-white leading-relaxed text-center">
                      {activeQuestion.question_text}
                    </p>
                  </div>
                </div>
              )}

              {/* Cevap Girişi - Banner Altında */}
              <div className="bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 md:p-8">
                {/* Cevap Girişi */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Cevabınızı Girin
                  </label>
                  <div className="space-y-3">
                    <textarea
                      value={userAnswerText}
                      onChange={(e) => setUserAnswerText(e.target.value)}
                      disabled={isSubmitting || !!submittedAnswer}
                      placeholder="Cevabınızı buraya yazın..."
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-2 bg-white/5 text-white placeholder-gray-500 focus:outline-none transition-all",
                        submittedAnswer
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-white/10 focus:border-[#D69ADE]"
                      )}
                      rows={4}
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !!submittedAnswer || !userAnswerText.trim()}
                      className={cn(
                        "w-full py-6 text-lg font-bold transition-all",
                        submittedAnswer
                          ? "bg-green-500/20 border-2 border-green-500 text-green-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white hover:scale-105 hover:shadow-2xl hover:shadow-[#D69ADE]/50"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                          Gönderiliyor...
                        </>
                      ) : submittedAnswer ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2 inline" />
                          Cevabınız Kaydedildi
                        </>
                      ) : (
                        "Cevabı Gönder"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Cevap Verildi Mesajı */}
                {submittedAnswer && (
                  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Cevabınız kaydedildi! Sonuçlar yayın sonunda açıklanacak.</span>
                    </div>
                  </div>
                )}

                {/* Kazananlar (Eğer soru cevaplandıysa) */}
                {activeQuestion.is_answered && (
                  <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <Trophy className="h-8 w-8 text-yellow-400 relative z-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wide">
                          Kazananlar
                        </h3>
                        {activeQuestion.correct_answer && (
                          <p className="text-sm text-yellow-300/80 mt-1">
                            Doğru Cevap: {activeQuestion.correct_answer}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {loadingWinners ? (
                      <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Kazananlar yükleniyor...</span>
                      </div>
                    ) : winners.length > 0 ? (
                      <div>
                        <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                          <p className="text-lg font-bold text-yellow-300 text-center">
                            🎉 {winners.length} Kazanan Seçildi! 🎉
                          </p>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {winners.map((winner, idx) => (
                            <div
                              key={winner.user_id || idx}
                              className="relative p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50 shadow-lg hover:shadow-yellow-500/30 transition-all hover:scale-[1.02]"
                            >
                              {/* Arka plan efekti */}
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent rounded-xl"></div>
                              
                              <div className="relative flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Sıralama */}
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50"></div>
                                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-yellow-300">
                                      {idx + 1}
                                    </div>
                                  </div>
                                  
                                  {/* Kullanıcı Bilgisi */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-white font-bold text-base">
                                        {winner.profiles?.username || `Kullanıcı ${winner.user_id?.substring(0, 8)}`}
                                      </p>
                                      <Trophy className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                    </div>
                                    {winner.answer && (
                                      <p className="text-yellow-200/80 text-sm mb-1 break-words">
                                        "{winner.answer}"
                                      </p>
                                    )}
                                    <p className="text-yellow-300/60 text-xs">
                                      {new Date(winner.created_at).toLocaleString("tr-TR", {
                                        day: "numeric",
                                        month: "long",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Trophy İkonu */}
                                <div className="relative">
                                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                  <Trophy className="h-8 w-8 text-yellow-400 relative z-10" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-yellow-500/50 mx-auto mb-3" />
                        <p className="text-yellow-300/80 font-semibold">
                          Henüz kazanan seçilmedi
                        </p>
                        <p className="text-sm text-yellow-400/60 mt-1">
                          Admin panelinden kazananlar seçilecek
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
