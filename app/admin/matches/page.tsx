"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Trophy, Calendar, Clock, Edit, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Team {
  id: number;
  name: string;
  logo_url: string;
  short_code: string;
}

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_time: string;
  match_date: string | null;
  winner: string | null;
  difficulty_score_a: number;
  difficulty_score_b: number;
  season_id: string | null;
  prediction_type: "winner" | "over_under" | "custom";
  option_a_label: string;
  option_b_label: string;
  tournament_name: string | null;
  question_text: string | null;
  analysis_note: string | null;
  tournament_stage?: string | null;
  match_format?: string | null;
  hltv_ranking_a?: number | null;
  hltv_ranking_b?: number | null;
  hltv_url?: string | null;
  stream_links?: string | null;
  score_a?: number | null;
  score_b?: number | null;
  prediction_lock_minutes_before_match?: number | null;
  created_at: string;
}

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedResult, setSelectedResult] = useState<string>("");
  const [selectedScoreA, setSelectedScoreA] = useState<string>("");
  const [selectedScoreB, setSelectedScoreB] = useState<string>("");
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState({
    team_a_id: "",
    team_b_id: "",
    match_date: "",
    match_time: "",
    tournament_name: "",
    season_id: "",
    difficulty_score_a: "3",
    difficulty_score_b: "5",
    prediction_type: "winner" as "winner" | "over_under",
    question_text: "",
    analysis_note: "",
    is_display_match: false, // Varsayılan olarak false (tahminler sayfasında göster)
    prediction_lock_minutes_before_match: null, // NULL = genel ayarı kullan
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // Verileri yükleyen fonksiyon
  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Maçlar yükleniyor...");
      
      // Takımları yükle
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (teamsError) {
        console.error("Takımlar yüklenirken hata:", JSON.stringify(teamsError, null, 2));
        setTeams([]);
      } else {
        setTeams(teamsData || []);
        console.log("Takımlar yüklendi:", teamsData?.length || 0);
      }

      // Sezonları yükle
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false });

      if (seasonsError) {
        console.error("Sezonlar yüklenirken hata:", seasonsError);
        setSeasons([]);
      } else {
        setSeasons((seasonsData as any) || []);
        const activeSeason = (seasonsData as any)?.find((s: any) => s.is_active);
        if (activeSeason && !formData.season_id) {
          setFormData((prev) => ({ ...prev, season_id: activeSeason.id }));
        }
      }

      // Maçları yükle
      let query = supabase
        .from("matches")
        .select("*");
      
      if (showArchived) {
        query = query.eq("is_archived", true);
      } else {
        query = query.or("is_archived.eq.false,is_archived.is.null");
      }
      
      const { data: matchesData, error: matchesError } = await query
        .order("match_date", { ascending: false, nullsFirst: false })
        .order("match_time", { ascending: false, nullsFirst: false });

      if (matchesError) {
        console.error("Maçlar yüklenirken hata:", JSON.stringify(matchesError, null, 2));
        setMatches([]);
      } else {
        setMatches(matchesData || []);
        console.log("Maçlar yüklendi:", matchesData?.length || 0);
      }
    } catch (error: any) {
      console.error("Beklenmeyen hata:", error);
      setMatches([]);
      setTeams([]);
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  // Takımları ve maçları yükle
  useEffect(() => {
    let isMounted = true;
    
    const loadDataWithCleanup = async () => {
      try {
        setLoading(true);
        console.log("Maçlar yükleniyor...");
        
        // Takımları yükle
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true });

        if (!isMounted) return;

        if (teamsError) {
          console.error("Takımlar yüklenirken hata:", JSON.stringify(teamsError, null, 2));
          if (isMounted) setTeams([]);
        } else {
          if (isMounted) {
            setTeams(teamsData || []);
            console.log("Takımlar yüklendi:", teamsData?.length || 0);
          }
        }

        // Sezonları yükle
        const { data: seasonsData, error: seasonsError } = await supabase
          .from("seasons")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (seasonsError) {
          console.error("Sezonlar yüklenirken hata:", seasonsError);
          if (isMounted) setSeasons([]);
        } else {
          if (isMounted) {
            setSeasons((seasonsData as any) || []);
            const activeSeason = (seasonsData as any)?.find((s: any) => s.is_active);
            if (activeSeason && !formData.season_id) {
              setFormData((prev) => ({ ...prev, season_id: activeSeason.id }));
            }
          }
        }

        // Maçları yükle
        let query = supabase
          .from("matches")
          .select("*");
        
        if (showArchived) {
          query = query.eq("is_archived", true);
        } else {
          query = query.or("is_archived.eq.false,is_archived.is.null");
        }
        
        const { data: matchesData, error: matchesError } = await query
          .order("match_date", { ascending: false, nullsFirst: false })
          .order("match_time", { ascending: false, nullsFirst: false });

        if (!isMounted) return;

        if (matchesError) {
          console.error("Maçlar yüklenirken hata:", JSON.stringify(matchesError, null, 2));
          if (isMounted) setMatches([]);
        } else {
          if (isMounted) {
            setMatches(matchesData || []);
            console.log("Maçlar yüklendi:", matchesData?.length || 0);
          }
        }
      } catch (error: any) {
        console.error("Beklenmeyen hata:", error);
        if (isMounted) {
          setMatches([]);
          setTeams([]);
          setSeasons([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadDataWithCleanup();
    
    return () => {
      isMounted = false;
    };
  }, [showArchived]);

  // Takım bilgilerini al
  const getTeamById = (teamId: string) => {
    return teams.find((t) => t.id.toString() === teamId);
  };

  // Formu sıfırla
  const resetForm = () => {
    const activeSeason = seasons.find((s) => s.is_active);
    setFormData({
      team_a_id: "",
      team_b_id: "",
      match_date: "",
      match_time: "",
      tournament_name: "",
      season_id: activeSeason?.id || "",
      difficulty_score_a: "3",
      difficulty_score_b: "5",
      prediction_type: "winner",
    question_text: "",
    analysis_note: "",
    is_display_match: false, // Varsayılan olarak false (tahminler sayfasında göster)
    prediction_lock_minutes_before_match: null, // NULL = genel ayarı kullan
  });
  };

  // Maç düzenle
  const handleEditMatch = (match: Match) => {
    const teamA = teams.find(t => t.name === match.team_a);
    const teamB = teams.find(t => t.name === match.team_b);

    setFormData({
      team_a_id: teamA?.id.toString() || "",
      team_b_id: teamB?.id.toString() || "",
      match_date: match.match_date ? match.match_date.split('T')[0] : "", // Tarih formatını düzelt (YYYY-MM-DD)
      match_time: match.match_time || "",
      tournament_name: match.tournament_name || "",
      season_id: match.season_id || "",
      difficulty_score_a: match.difficulty_score_a.toString(),
      difficulty_score_b: match.difficulty_score_b.toString(),
      prediction_type: match.prediction_type as "winner" | "over_under" | "custom",
      question_text: match.question_text || "",
      analysis_note: match.analysis_note || "",
      is_display_match: (match as any).is_display_match !== false, // false değilse true (null veya true)
      prediction_lock_minutes_before_match: (match as any).prediction_lock_minutes_before_match ?? null,
    } as any);
    
    setIsEditMode(true);
    setEditingMatchId(match.id);
    setIsDialogOpen(true);
  };

  // Yeni maç ekle
  const handleAddMatch = async () => {
    if (!formData.team_a_id || !formData.team_b_id || !formData.match_date || !formData.match_time) {
      alert("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    // Sezon seçimi sadece tahminler için olan maçlarda zorunlu (is_display_match = false/null)
    // Görüntüleme maçlarında (is_display_match = true) sezon opsiyonel
    if (!formData.is_display_match && !formData.season_id) {
      alert("Tahminler için olan maçlarda sezon seçimi zorunludur. Lütfen bir sezon seçin.");
      return;
    }

    if (formData.team_a_id === formData.team_b_id) {
      alert("Aynı takımı seçemezsiniz.");
      return;
    }

    const teamA = getTeamById(formData.team_a_id);
    const teamB = getTeamById(formData.team_b_id);

    if (!teamA || !teamB) {
      alert("Takım bilgileri bulunamadı.");
      return;
    }

    try {
      // Puanları parseFloat ile sayıya çevir
      const difficultyScoreA = parseFloat(formData.difficulty_score_a);
      const difficultyScoreB = parseFloat(formData.difficulty_score_b);

      if (isNaN(difficultyScoreA) || isNaN(difficultyScoreB)) {
        alert("Puanlar geçerli sayılar olmalıdır.");
        return;
      }

      // Tüm alanlar - Tahminler için olan maçlar (yayın ve HLTV bilgileri yok)
      const insertData: any = {
        team_a: teamA.name,
        team_b: teamB.name,
        match_date: formData.match_date,
        match_time: formData.match_time,
        tournament_name: formData.tournament_name || null,
        season_id: formData.season_id || null,
        difficulty_score_a: difficultyScoreA,
        difficulty_score_b: difficultyScoreB,
        prediction_type: formData.prediction_type,
        option_a_label: teamA.name,
        option_b_label: teamB.name,
        question_text: formData.question_text || null,
        analysis_note: formData.analysis_note || null,
        is_display_match: formData.is_display_match, // Form'dan gelen değer (varsayılan: true)
        prediction_lock_minutes_before_match: formData.prediction_lock_minutes_before_match !== null && formData.prediction_lock_minutes_before_match !== "" 
          ? (typeof formData.prediction_lock_minutes_before_match === 'number' 
              ? formData.prediction_lock_minutes_before_match 
              : parseInt(String(formData.prediction_lock_minutes_before_match)) || 0)
          : null,
      };
      
      console.log("=== MAÇ EKLEME/DÜZENLEME ===");
      console.log("Eklenecek veri:", JSON.stringify(insertData, null, 2));
      
      let data, error;
      if (isEditMode && editingMatchId) {
        // Düzenleme modu
        console.log("Düzenleme modu - Match ID:", editingMatchId);
        const result = await (supabase as any)
          .from("matches")
          .update(insertData)
          .eq("id", editingMatchId)
          .select();
        data = result.data;
        error = result.error;
      } else {
        // Yeni ekleme - select() ile eklenen maçı döndür
        console.log("Yeni ekleme modu");
        const result = await (supabase as any)
          .from("matches")
          .insert(insertData)
          .select();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Maç eklenirken Supabase hatası:", JSON.stringify(error, null, 2));
        alert(error.message || "Maç eklenirken bir hata oluştu.");
        return;
      }

      console.log("Maç başarıyla eklendi/güncellendi:", data);
      if (data && data.length > 0) {
        console.log("Eklenen/Güncellenen maç ID:", data[0].id);
        console.log("Eklenen/Güncellenen maç is_display_match:", data[0].is_display_match);
        console.log("Eklenen/Güncellenen maç match_date:", data[0].match_date);
      }

      // Formu temizle ve dialog'u kapat
      resetForm();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingMatchId(null);
      
      // Listeyi hemen yenile
      await loadData();
    } catch (error: any) {
      console.error("Maç eklenirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Maç eklenirken bir hata oluştu.");
    }
  };

  // Maç kalıcı olarak sil
  const handlePermanentDelete = async (id: string) => {
    const match = matches.find((m) => m.id === id);
    if (!match) return;

    // Tahmin kontrolü - Hata durumunda devam et (tahmin yokmuş gibi)
    let predictions: any[] = [];
    let hasPredictions = false;
    let hasPoints = false;
    
    try {
      const { data: predictionsData, error: predictionsError } = await supabase
        .from("predictions")
        .select("id, user_id, points_earned")
        .eq("match_id", id);

      if (predictionsError) {
        console.warn("Tahminler kontrol edilirken hata (devam ediliyor):", predictionsError);
        // Hata olsa bile devam et, tahmin yokmuş gibi işlem yap
      } else {
        predictions = predictionsData || [];
        hasPredictions = predictions.length > 0;
        hasPoints = predictions.some((p) => p.points_earned && p.points_earned > 0);
      }
    } catch (error: any) {
      console.warn("Tahmin kontrolü sırasında beklenmeyen hata (devam ediliyor):", error);
      // Hata olsa bile devam et
    }

    // Eğer puan dağıtılmışsa veya tahmin varsa uyarı ver
    if (hasPoints) {
      alert(`DİKKAT: Bu maça ${predictions.length} tahmin yapılmış ve puan dağıtılmış!\n\nKalıcı silme işlemi yapılamaz. Lütfen maçı arşivleyin.`);
      return;
    } else if (hasPredictions) {
      const confirmMessage = `DİKKAT: Bu maça ${predictions.length} tahmin yapılmış!\n\nKalıcı olarak silerseniz:\n` +
        `- Maç tamamen silinecek\n` +
        `- Tahminler de silinecek\n` +
        `- Bu işlem geri alınamaz!\n\n` +
        `Devam etmek istiyor musunuz?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    } else {
      if (!confirm("Bu maçı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
        return;
      }
    }

    try {
      setIsDeleting(id);
      
      // Önce tahminleri sil
      if (hasPredictions) {
        const { error: deletePredictionsError } = await supabase
          .from("predictions")
          .delete()
          .eq("match_id", id);

        if (deletePredictionsError) {
          console.error("Tahminler silinirken hata:", deletePredictionsError);
          alert("Tahminler silinirken bir hata oluştu.");
          setIsDeleting(null);
          return;
        }
      }

      // Maçı kalıcı olarak sil
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Maç silinirken Supabase hatası:", JSON.stringify(error, null, 2));
        alert(error.message || "Maç silinirken bir hata oluştu.");
        return;
      }

      console.log("Maç kalıcı olarak silindi, ID:", id);
      
      // State'i hemen güncelle - silinen maçı listeden çıkar
      setMatches(prevMatches => prevMatches.filter(m => m.id !== id));
      console.log("State güncellendi - maç listeden çıkarıldı");
      
      alert("Maç kalıcı olarak silindi!");
      
      // Arka planda veritabanını da güncelle
      setTimeout(async () => {
        await loadData();
      }, 100);
    } catch (error: any) {
      console.error("Maç silinirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Maç silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Maç sil (Arşivleme - Güvenli Silme)
  const handleDeleteMatch = async (id: string) => {
    const match = matches.find((m) => m.id === id);
    if (!match) return;

    // Tahmin kontrolü - Hata durumunda devam et (tahmin yokmuş gibi)
    let predictions: any[] = [];
    let hasPredictions = false;
    let hasPoints = false;
    
    try {
      const { data: predictionsData, error: predictionsError } = await supabase
        .from("predictions")
        .select("id, user_id, points_earned")
        .eq("match_id", id);

      if (predictionsError) {
        console.warn("Tahminler kontrol edilirken hata (devam ediliyor):", predictionsError);
        // Hata olsa bile devam et, tahmin yokmuş gibi işlem yap
      } else {
        predictions = predictionsData || [];
        hasPredictions = predictions.length > 0;
        hasPoints = predictions.some((p) => p.points_earned && p.points_earned > 0);
      }
    } catch (error: any) {
      console.warn("Tahmin kontrolü sırasında beklenmeyen hata (devam ediliyor):", error);
      // Hata olsa bile devam et
    }

    // Eğer puan dağıtılmışsa uyarı ver
    if (hasPoints) {
      const confirmMessage = `DİKKAT: Bu maça ${predictions.length} tahmin yapılmış ve puan dağıtılmış!\n\n` +
        `Maçı arşivlerseniz:\n` +
        `- Maç listeden gizlenecek\n` +
        `- Tahminler ve puanlar korunacak\n` +
        `- Puanlar geri alınmayacak\n\n` +
        `Devam etmek istiyor musunuz?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    } else if (hasPredictions) {
      const confirmMessage = `Bu maça ${predictions.length} tahmin yapılmış.\n\n` +
        `Maçı arşivlemek istediğinize emin misiniz?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    } else {
      if (!confirm("Bu maçı arşivlemek istediğinize emin misiniz?")) {
        return;
      }
    }

    try {
      setIsDeleting(id);
      
      // Soft delete: is_archived = true yap (silmek yerine arşivle)
      const { error } = await (supabase as any)
        .from("matches")
        .update({ is_archived: true })
        .eq("id", id);

      if (error) {
        console.error("Maç arşivlenirken Supabase hatası:", JSON.stringify(error, null, 2));
        alert(error.message || "Maç arşivlenirken bir hata oluştu.");
        setIsDeleting(null);
        return;
      }

      console.log("Maç arşivlendi, ID:", id);
      
      // State'i hemen güncelle - silinen maçı listeden çıkar
      setMatches(prevMatches => prevMatches.filter(m => m.id !== id));
      console.log("State güncellendi - maç listeden çıkarıldı");
      
      alert("Maç başarıyla arşivlendi. Tahminler ve puanlar korundu.");
      
      // Arka planda veritabanını da güncelle
      setTimeout(async () => {
        await loadData();
      }, 100);
    } catch (error: any) {
      console.error("Maç arşivlenirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Maç arşivlenirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Maç durumunu belirle
  const getMatchStatus = (match: Match) => {
    if (match.winner) return "Bitti";
    const matchDateTime = match.match_date
      ? new Date(`${match.match_date}T${match.match_time}`)
      : null;
    if (matchDateTime && matchDateTime < new Date()) return "Bitti";
    if (matchDateTime && matchDateTime > new Date()) return "Yakında";
    return "Bilinmiyor";
  };

  // Sonuç girme dialog'unu aç
  const handleOpenResultDialog = (match: Match) => {
    setSelectedMatch(match);
    setSelectedResult(match.winner || "");
    setSelectedScoreA(match.score_a?.toString() || "");
    setSelectedScoreB(match.score_b?.toString() || "");
    setIsResultDialogOpen(true);
  };

  // Sonucu kaydet ve puanları dağıt
  const handleSaveResult = async () => {
    if (!selectedMatch || !selectedResult) {
      alert("Lütfen bir sonuç seçin.");
      return;
    }

    try {
      setIsSavingResult(true);

      // İptal/Berabere durumu
      if (selectedResult === "CANCELLED") {
        const { error: matchError } = await (supabase as any)
          .from("matches")
          .update({
            winner: "CANCELLED",
          })
          .eq("id", selectedMatch.id);

        if (matchError) {
          console.error("Maç güncellenirken hata:", JSON.stringify(matchError, null, 2));
          alert(matchError.message || "Maç güncellenirken bir hata oluştu.");
          return;
        }

        // Tüm tahminleri incorrect olarak işaretle (puan verilmez)
        const { data: predictions } = await supabase
          .from("predictions")
          .select("*")
          .eq("match_id", selectedMatch.id);

        if (predictions && predictions.length > 0) {
          for (const prediction of (predictions as any)) {
            await (supabase as any)
              .from("predictions")
              .update({
                points_earned: 0,
              })
              .eq("id", prediction.id);
          }
        }

        alert("Maç iptal/berabere olarak işaretlendi. Hiçbir kullanıcı puan kazanmadı.\n\nMaç otomatik olarak arşivlendi.");
        setIsResultDialogOpen(false);
        await loadData();
        return;
      }

      // Skorları parse et
      const scoreA = selectedScoreA ? parseInt(selectedScoreA, 10) : null;
      const scoreB = selectedScoreB ? parseInt(selectedScoreB, 10) : null;

      // 1. Maçı güncelle (arşivleme MANUEL yapılacak)
      const updateData: any = {
        winner: selectedResult,
      };

      // Skorları ekle (sadece winner seçildiyse ve skor girildiyse)
      if (selectedResult && selectedResult !== "CANCELLED") {
        if (scoreA !== null) updateData.score_a = scoreA;
        if (scoreB !== null) updateData.score_b = scoreB;
      }

      const { error: matchError } = await (supabase as any)
        .from("matches")
        .update(updateData)
        .eq("id", selectedMatch.id);

      if (matchError) {
        console.error("Maç güncellenirken hata:", JSON.stringify(matchError, null, 2));
        alert(matchError.message || "Maç güncellenirken bir hata oluştu.");
        return;
      }

      // 2. Tahminleri çek
      const { data: predictions, error: predictionsError } = await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", selectedMatch.id);

      if (predictionsError) {
        console.error("Tahminler yüklenirken hata:", JSON.stringify(predictionsError, null, 2));
        alert(predictionsError.message || "Tahminler yüklenirken bir hata oluştu.");
        return;
      }

      if (!predictions || predictions.length === 0) {
        alert("Bu maça henüz tahmin yapılmamış.");
        setIsResultDialogOpen(false);
        await loadData();
        return;
      }

      // 3. Puan hesaplama ve dağıtım
      const correctPredictions = (predictions as any).filter(
        (p: any) => p.selected_team === selectedResult
      );
      const incorrectPredictions = (predictions as any).filter(
        (p: any) => p.selected_team !== selectedResult
      );

      // Maçın sezon ID'sini al
      const seasonId = selectedMatch.season_id;
      // Maçın lobi ID'sini kontrol et
      const liveLobbyId = (selectedMatch as any).live_lobby_id;

      // Doğru bilenlere puan ver
      for (const prediction of (correctPredictions as any)) {
        // Hangi seçeneğe göre puan verileceğini belirle
        let pointsToAdd = 0;
        if (selectedResult === "A" || selectedResult === "OVER") {
          pointsToAdd = selectedMatch.difficulty_score_a;
        } else if (selectedResult === "B" || selectedResult === "UNDER") {
          pointsToAdd = selectedMatch.difficulty_score_b;
        }

        // Eğer maç bir lobiye bağlıysa, sezon puanlarına ekleme
        if (liveLobbyId) {
          console.log(`Maç lobiye bağlı (live_lobby_id: ${liveLobbyId}). Sezon puanlarına eklenmeyecek.`);
          // Sadece tahmin kaydını güncelle, sezon puanlarına ekleme
          await (supabase as any)
            .from("predictions")
            .update({
              points_earned: pointsToAdd,
            })
            .eq("id", prediction.id);
          continue; // Sezon puanlarına ekleme, bir sonraki tahmine geç
        }

        // Sezon bazlı puanları güncelle (Sadece tahminler için olan maçlarda sezon zorunlu)
        // Eğer sezon yoksa ve bu maç tahminler için ise hata ver
        if (!seasonId) {
          // Maçın tahminler için olup olmadığını kontrol et
          if ((selectedMatch as any).is_display_match !== true) {
            console.error("Tahminler için olan maçın sezon ID'si yok! Puan dağıtılamıyor.");
            alert("Bu maç tahminler için olduğu halde sezon bilgisi yok. Lütfen maçı düzenleyip sezon seçin.");
            continue;
          } else {
            // Görüntüleme maçı, sezon olmadan devam et (puan dağıtma)
            console.warn("Görüntüleme maçı, sezon bilgisi yok. Puan dağıtılmıyor.");
            continue;
          }
        }

        // Sezon bazlı puanları güncelle
        {
          // Mevcut sezon puanını kontrol et
          const { data: seasonPoints, error: seasonPointsError } = await supabase
            .from("season_points")
            .select("*")
            .eq("user_id", prediction.user_id)
            .eq("season_id", seasonId)
            .single();

          if (seasonPointsError && seasonPointsError.code === 'PGRST116') {
            // Sezon puanı yoksa oluştur
            await (supabase as any)
              .from("season_points")
              .insert({
                user_id: prediction.user_id,
                season_id: seasonId,
                total_points: pointsToAdd,
                correct_predictions: 1,
                total_predictions: 1,
              });
          } else if (!seasonPointsError && seasonPoints) {
            // Sezon puanı varsa güncelle
            await (supabase as any)
              .from("season_points")
              .update({
                total_points: ((seasonPoints as any).total_points || 0) + pointsToAdd,
                correct_predictions: ((seasonPoints as any).correct_predictions || 0) + 1,
                total_predictions: ((seasonPoints as any).total_predictions || 0) + 1,
              })
              .eq("user_id", prediction.user_id)
              .eq("season_id", seasonId);
          }
        }

        // Tahmin kaydını güncelle (puan ekle)
        await (supabase as any)
          .from("predictions")
          .update({
            points_earned: pointsToAdd,
          })
          .eq("id", prediction.id);
      }

      // Yanlış bilenleri işaretle
      for (const prediction of (incorrectPredictions as any)) {
        // Eğer maç bir lobiye bağlıysa, sezon puanlarına ekleme
        if (liveLobbyId) {
          console.log(`Maç lobiye bağlı (live_lobby_id: ${liveLobbyId}). Sezon puanlarına eklenmeyecek.`);
          // Sadece tahmin kaydını güncelle, sezon puanlarına ekleme
          await (supabase as any)
            .from("predictions")
            .update({
              points_earned: 0,
            })
            .eq("id", prediction.id);
          continue; // Sezon puanlarına ekleme, bir sonraki tahmine geç
        }

        // Sezon bazlı puanları güncelle - sadece toplam tahmin sayısını artır
        // Sadece tahminler için olan maçlarda sezon kontrolü yap
        if (!seasonId) {
          // Görüntüleme maçı ise sezon olmadan devam et
          if ((selectedMatch as any).is_display_match === true) {
            continue;
          }
          console.error("Tahminler için olan maçın sezon ID'si yok! Tahmin sayısı güncellenemiyor.");
          continue;
        }

        const { data: seasonPoints, error: seasonPointsError } = await supabase
          .from("season_points")
          .select("*")
          .eq("user_id", prediction.user_id)
          .eq("season_id", seasonId)
          .single();

        if (seasonPointsError && seasonPointsError.code === 'PGRST116') {
          // Sezon puanı yoksa oluştur (yanlış tahmin, puan yok)
          await (supabase as any)
            .from("season_points")
            .insert({
              user_id: prediction.user_id,
              season_id: seasonId,
              total_points: 0,
              correct_predictions: 0,
              total_predictions: 1,
            });
        } else if (!seasonPointsError && seasonPoints) {
          // Sezon puanı varsa sadece toplam tahmin sayısını artır
          await (supabase as any)
            .from("season_points")
            .update({
              total_predictions: ((seasonPoints as any).total_predictions || 0) + 1,
            })
            .eq("user_id", prediction.user_id)
            .eq("season_id", seasonId);
        }

        await (supabase as any)
          .from("predictions")
          .update({
            points_earned: 0,
          })
          .eq("id", prediction.id);
      }

      // Alert mesajını hazırla
      let alertMessage = `Sonuç kaydedildi! ${correctPredictions.length} kullanıcı doğru bildi ve puan kazandı. ${incorrectPredictions.length} kullanıcı yanlış bildi.\n\n`;
      
      if (liveLobbyId) {
        alertMessage += `⚠️ Bu maç bir lobiye bağlı olduğu için kazanılan puanlar sezon puanlarına eklenmedi.\n\n`;
      }
      
      alertMessage += `Kazanan tahminler sayfasında gösterilecek. Maçı istediğiniz zaman arşivleyebilirsiniz.`;
      
      alert(alertMessage);

      setIsResultDialogOpen(false);
      setSelectedMatch(null);
      setSelectedResult("");
      setSelectedScoreA("");
      setSelectedScoreB("");
      await loadData(); // Listeyi yenile
    } catch (error: any) {
      console.error("Sonuç kaydedilirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Sonuç kaydedilirken bir hata oluştu.");
    } finally {
      setIsSavingResult(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tahminler
          </h1>
          <p className="text-gray-400">
            Tahmin maçlarını yönetin ve sonuçları güncelleyin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {showArchived ? "Aktif Maçlar" : "Arşivlenmiş Maçlar"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
              setIsEditMode(false);
              setEditingMatchId(null);
            }
          }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setEditingMatchId(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Maç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#131720] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{isEditMode ? "Maç Düzenle" : "Yeni Maç Ekle"}</DialogTitle>
              <DialogDescription className="text-gray-300">
                {isEditMode ? "Maç bilgilerini düzenleyin ve kaydedin." : "Maç bilgilerini girin ve kaydedin."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Takım A Seçimi */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Takım A *
                </label>
                <select
                  value={formData.team_a_id}
                  onChange={(e) =>
                    setFormData({ ...formData, team_a_id: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-white/20 bg-[#1a1f2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-[#1a1f2e] text-white">Takım seçin...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id.toString()} className="bg-[#1a1f2e] text-white">
                      {team.name} ({team.short_code})
                    </option>
                  ))}
                </select>
                {formData.team_a_id && (
                  <div className="mt-2 flex items-center gap-2">
                    {(() => {
                      const team = getTeamById(formData.team_a_id);
                      return team ? (
                        <>
                          <div className="relative w-8 h-8 rounded overflow-hidden border border-white/10">
                            <Image
                              src={team.logo_url}
                              alt={team.name}
                              fill
                              className="object-contain p-0.5"
                              unoptimized
                            />
                          </div>
                          <span className="text-sm text-white">
                            {team.name}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Takım B Seçimi */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Takım B *
                </label>
                <select
                  value={formData.team_b_id}
                  onChange={(e) =>
                    setFormData({ ...formData, team_b_id: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-white/20 bg-[#1a1f2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-[#1a1f2e] text-white">Takım seçin...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id.toString()} className="bg-[#1a1f2e] text-white">
                      {team.name} ({team.short_code})
                    </option>
                  ))}
                </select>
                {formData.team_b_id && (
                  <div className="mt-2 flex items-center gap-2">
                    {(() => {
                      const team = getTeamById(formData.team_b_id);
                      return team ? (
                        <>
                          <div className="relative w-8 h-8 rounded overflow-hidden border border-white/10">
                            <Image
                              src={team.logo_url}
                              alt={team.name}
                              fill
                              className="object-contain p-0.5"
                              unoptimized
                            />
                          </div>
                          <span className="text-sm text-white">
                            {team.name}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Tarih ve Saat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Tarih *
                  </label>
                  <Input
                    type="date"
                    value={formData.match_date}
                    onChange={(e) =>
                      setFormData({ ...formData, match_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Saat *
                  </label>
                  <Input
                    type="time"
                    value={formData.match_time}
                    onChange={(e) =>
                      setFormData({ ...formData, match_time: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Puanlar */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    <Trophy className="h-4 w-4 inline mr-1" />
                    A Takımı Puanı *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.difficulty_score_a}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty_score_a: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    <Trophy className="h-4 w-4 inline mr-1" />
                    B Takımı Puanı *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.difficulty_score_b}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty_score_b: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Sezon Seçimi - Sadece tahminler için olan maçlarda zorunlu */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Sezon {!formData.is_display_match && <span className="text-red-400">*</span>}
                  {formData.is_display_match && <span className="text-gray-400 text-xs">(Opsiyonel - Sadece tahminler için zorunlu)</span>}
                </label>
                <select
                  value={formData.season_id}
                  onChange={(e) =>
                    setFormData({ ...formData, season_id: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-white/20 bg-[#1a1f2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-[#1a1f2e] text-white">Sezon seçin {formData.is_display_match ? "(Opsiyonel)" : "(Zorunlu)"}</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id} className="bg-[#1a1f2e] text-white">
                      {season.name} {season.is_active && "(Aktif)"}
                    </option>
                  ))}
                </select>
                {!formData.is_display_match && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ Tahminler için olan maçlarda sezon seçimi zorunludur.
                  </p>
                )}
                {seasons.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Henüz sezon eklenmemiş.{" "}
                    <a
                      href="/admin/seasons"
                      className="text-[#B84DC7] hover:underline"
                      target="_blank"
                    >
                      Sezon Yönetimi
                    </a>
                    &apos;nden sezon ekleyebilirsiniz.
                  </p>
                )}
              </div>

              {/* Turnuva İsmi */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Turnuva İsmi (Opsiyonel)
                </label>
                <Input
                  type="text"
                  value={formData.tournament_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tournament_name: e.target.value })
                  }
                  placeholder="Örn: BLAST Premier, IEM Katowice, vs."
                />
              </div>

              {/* Maç Tipi */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Maç Tipi
                </label>
                <select
                  value={formData.prediction_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prediction_type: e.target.value as "winner" | "over_under",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-white/20 bg-[#1a1f2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="winner" className="bg-[#1a1f2e] text-white">Kazanan (Winner)</option>
                  <option value="over_under" className="bg-[#1a1f2e] text-white">Alt/Üst</option>
                </select>
              </div>

              {/* Soru Metni (Over/Under için) */}
              {formData.prediction_type === "over_under" && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Soru Metni (Örn: "Toplam Harita 2.5 Üstü mü?")
                  </label>
                  <Input
                    type="text"
                    value={formData.question_text}
                    onChange={(e) =>
                      setFormData({ ...formData, question_text: e.target.value })
                    }
                    placeholder="Örn: Toplam Harita 2.5 Üstü mü?"
                  />
                </div>
              )}

              {/* Maç Tipi - Görüntüleme mi Tahmin mi */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_display_match"
                    checked={formData.is_display_match}
                    onChange={(e) =>
                      setFormData({ ...formData, is_display_match: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#B84DC7] focus:ring-2 focus:ring-[#B84DC7]/50"
                  />
                  <label htmlFor="is_display_match" className="text-sm font-medium text-white cursor-pointer">
                    Sadece Görüntüleme Maçı (Ana sayfa ve maçlar sayfasında göster, tahminler sayfasında gösterilmez)
                  </label>
                </div>
                <div className="text-xs text-gray-400 ml-8">
                  {formData.is_display_match ? (
                    <span className="text-yellow-400">
                      ⚠️ Bu maç sadece görüntüleme için. Tahminler sayfasında görünmeyecek.
                    </span>
                  ) : (
                    <span className="text-green-400">
                      ✅ Bu maç tahminler sayfasında görünecek. Kullanıcılar bu maç için tahmin yapabilecek.
                    </span>
                  )}
                </div>
              </div>

              {/* Analiz Notu */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Analiz Notu (Opsiyonel)
                </label>
                <textarea
                  value={formData.analysis_note}
                  onChange={(e) =>
                    setFormData({ ...formData, analysis_note: e.target.value })
                  }
                  placeholder="Maç hakkında analiz, notlar veya bilgiler..."
                  rows={4}
                  className="flex w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu not kullanıcılara tahmin kartında gösterilir
                </p>
              </div>

              {/* Kilitleme Saati */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Tahmin Kilitleme Saati (Opsiyonel)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.prediction_lock_minutes_before_match ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prediction_lock_minutes_before_match: e.target.value === "" ? null : (parseInt(e.target.value) || 0) as number | null,
                    } as any)
                  }
                  placeholder="Boş bırak = Genel ayarı kullan"
                  className="bg-white/5 border-white/20 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.prediction_lock_minutes_before_match === null || formData.prediction_lock_minutes_before_match === ""
                    ? "Genel ayar kullanılacak (Ayarlar sayfasından belirlenir)"
                    : formData.prediction_lock_minutes_before_match === 0
                    ? "Tahminler maç saati kilitlenecek"
                    : formData.prediction_lock_minutes_before_match === 1
                    ? "Tahminler maçtan 1 dakika önce kilitlenecek"
                    : `Tahminler maçtan ${formData.prediction_lock_minutes_before_match} dakika önce kilitlenecek`}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                  setIsEditMode(false);
                  setEditingMatchId(null);
                }}
              >
                İptal
              </Button>
              <Button
                className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
                onClick={handleAddMatch}
              >
                {isEditMode ? "Güncelle" : "Kaydet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-[#131720] border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B84DC7]"></div>
              <span>Maçlar yükleniyor...</span>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              {showArchived 
                ? "Henüz arşivlenmiş maç bulunmuyor." 
                : "Henüz maç eklenmemiş."}
            </div>
            {!showArchived && (
              <p className="text-sm text-gray-500 mb-4">
                İlk maçı eklemek için yukarıdaki "Yeni Maç Ekle" butonuna tıklayın.
              </p>
            )}
            {showArchived && (
              <Button
                variant="outline"
                onClick={() => setShowArchived(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Aktif Maçlara Dön
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e1a] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Maç
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Puanlar
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matches.map((match) => {
                  const teamA = teams.find((t) => t.name === match.team_a);
                  const teamB = teams.find((t) => t.name === match.team_b);
                  const status = getMatchStatus(match);
                  
                  return (
                    <tr
                      key={match.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {match.match_date || "Tarih yok"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {match.match_time}
                        </div>
                        {match.tournament_name && (
                          <div className="text-xs text-[#B84DC7] mt-1 font-medium">
                            {match.tournament_name}
                          </div>
                        )}
                        {(match as any).prediction_lock_minutes_before_match !== null && (match as any).prediction_lock_minutes_before_match !== undefined && (
                          <div className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {(match as any).prediction_lock_minutes_before_match === 0
                              ? "Maç saati kilitlenir"
                              : `${(match as any).prediction_lock_minutes_before_match} dk önce kilitlenir`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Takım A */}
                          <div className="flex items-center gap-2">
                            {teamA && (
                              <div className="relative w-8 h-8 rounded overflow-hidden border border-white/10">
                                <Image
                                  src={teamA.logo_url}
                                  alt={teamA.name}
                                  fill
                                  className="object-contain p-0.5"
                                  unoptimized
                                />
                              </div>
                            )}
                            <span className="text-sm font-medium text-white">
                              {match.team_a}
                            </span>
                          </div>
                          <span className="text-gray-500">vs</span>
                          {/* Takım B */}
                          <div className="flex items-center gap-2">
                            {teamB && (
                              <div className="relative w-8 h-8 rounded overflow-hidden border border-white/10">
                                <Image
                                  src={teamB.logo_url}
                                  alt={teamB.name}
                                  fill
                                  className="object-contain p-0.5"
                                  unoptimized
                                />
                              </div>
                            )}
                            <span className="text-sm font-medium text-white">
                              {match.team_b}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                            status === "Bitti"
                              ? "bg-green-500/20 text-green-400"
                              : status === "Yakında"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          )}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {match.difficulty_score_a} - {match.difficulty_score_b}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#B84DC7] hover:text-[#D69ADE] hover:bg-[#B84DC7]/10"
                            onClick={() => handleEditMatch(match)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Düzenle
                          </Button>
                          {!match.winner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              onClick={() => handleOpenResultDialog(match)}
                            >
                              <Trophy className="h-4 w-4 mr-1" />
                              Maçı Sonuçlandır
                            </Button>
                          )}
                          {showArchived ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              onClick={async () => {
                                const { error } = await (supabase as any)
                                  .from("matches")
                                  .update({ is_archived: false })
                                  .eq("id", match.id);
                                if (error) {
                                  alert("Maç geri getirilirken hata: " + error.message);
                                } else {
                                  await loadData();
                                }
                              }}
                            >
                              Geri Getir
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                onClick={() => handleDeleteMatch(match.id)}
                                disabled={isDeleting === match.id}
                              >
                                {isDeleting === match.id ? (
                                  "Arşivleniyor..."
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Arşivle
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => handlePermanentDelete(match.id)}
                                disabled={isDeleting === match.id}
                                title="Kalıcı olarak sil (Geri alınamaz!)"
                              >
                                {isDeleting === match.id ? (
                                  "Siliniyor..."
                                ) : (
                                  <>
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Sil
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sonuç Girme Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-md bg-[#131720] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Maçı Sonuçlandır</DialogTitle>
            {selectedMatch && (
              <DialogDescription asChild>
                <div className="mt-2">
                  <div className="text-sm text-white">
                    {selectedMatch.team_a} vs {selectedMatch.team_b}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Maç Tipi: {selectedMatch.prediction_type === "winner" ? "Kazanan" : "Alt/Üst"}
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
                        onClick={() => {
                          setSelectedResult("A");
                          // Skorları sıfırla
                          if (!selectedMatch.score_a && !selectedMatch.score_b) {
                            setSelectedScoreA("");
                            setSelectedScoreB("");
                          }
                        }}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedResult === "A"
                            ? "border-[#B84DC7] bg-[#B84DC7]/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="font-semibold text-white">
                          {selectedMatch.team_a}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatch.difficulty_score_a}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedResult("B");
                          // Skorları sıfırla
                          if (!selectedMatch.score_a && !selectedMatch.score_b) {
                            setSelectedScoreA("");
                            setSelectedScoreB("");
                          }
                        }}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedResult === "B"
                            ? "border-[#B84DC7] bg-[#B84DC7]/10"
                            : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="font-semibold text-white">
                          {selectedMatch.team_b}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatch.difficulty_score_b}
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Sonuç
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedResult("OVER")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedResult === "OVER"
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
                        onClick={() => setSelectedResult("UNDER")}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 transition-all text-left",
                          selectedResult === "UNDER"
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
                
                {/* Skor Girişi - Sadece winner maçları için göster */}
                {selectedMatch.prediction_type === "winner" && selectedResult && selectedResult !== "CANCELLED" && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="text-sm font-medium text-white block">
                      Skor (Opsiyonel)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          {selectedMatch.team_a} Skoru
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="3"
                          value={selectedScoreA}
                          onChange={(e) => setSelectedScoreA(e.target.value)}
                          placeholder="0"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          {selectedMatch.team_b} Skoru
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="3"
                          value={selectedScoreB}
                          onChange={(e) => setSelectedScoreB(e.target.value)}
                          placeholder="0"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Örn: 2-0, 2-1, 1-0 gibi (BO3 formatında)
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedResult("CANCELLED");
                    setSelectedScoreA("");
                    setSelectedScoreB("");
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all text-left",
                    selectedResult === "CANCELLED"
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="font-semibold text-white">
                    İptal / Berabere
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Hiçbir kullanıcı puan kazanmaz
                  </div>
                </button>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResultDialogOpen(false)}
              disabled={isSavingResult}
            >
              İptal
            </Button>
            <Button
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
              onClick={handleSaveResult}
              disabled={!selectedResult || isSavingResult}
            >
              {isSavingResult ? "Kaydediliyor..." : "Maçı Sonuçlandır"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
