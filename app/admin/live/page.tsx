"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
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
import { Plus, Trash2, Edit, Radio, Power, PowerOff, Image as ImageIcon, Upload, X, Copy, Check, ExternalLink, MessageSquare, Target, Play, Pause, Users, ChevronDown, ChevronUp, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

interface Team {
  id: number;
  name: string;
  logo_url: string | null;
}

export default function AdminLive() {
  const [lobbies, setLobbies] = useState<LiveLobby[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    unique_code: "",
    is_active: true,
    hero_image_url: "",
    event_title: "",
    primary_color: "#D69ADE",
    team_a: "",
    team_b: "",
    team_a_logo: "",
    team_b_logo: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLobbyId, setEditingLobbyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any[]>>({}); // question_id -> answers[]
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set()); // Açık sorular
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState<Record<string, boolean>>({});
  const [questionFormData, setQuestionFormData] = useState({
    question_text: "",
    question_type: "text" as "text" | "match_score" | "player_stats",
    expected_answer: "",
    player_image_url: "",
    player_name: "",
    banner_image_url: "",
  });
  const [isQuestionEditMode, setIsQuestionEditMode] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [uploadingPlayerImage, setUploadingPlayerImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    loadLobbies();
    loadTeams();
  }, []);

  useEffect(() => {
    // Her lobi için soruları yükle
    if (lobbies.length > 0) {
      loadAllQuestions();
    }
  }, [lobbies]);

  useEffect(() => {
    // Sorular değiştiğinde cevapları yükle
    if (Object.keys(questions).length > 0) {
      loadAllAnswers();
    }
  }, [questions]);

  const loadLobbies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("live_lobbies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lobiler yüklenirken hata:", error);
        setLobbies([]);
      } else {
        setLobbies(data || []);
      }
    } catch (error) {
      console.error("Lobiler yüklenirken hata:", error);
      setLobbies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, logo_url")
        .order("name", { ascending: true });

      if (error) {
        console.error("Takımlar yüklenirken hata:", error);
        setTeams([]);
      } else {
        setTeams(data || []);
      }
    } catch (error) {
      console.error("Takımlar yüklenirken hata:", error);
      setTeams([]);
    }
  };

  const loadAllQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("live_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sorular yüklenirken hata:", error);
        return;
      }

      // Soruları lobby_id'ye göre grupla
      const grouped: Record<string, any[]> = {};
      (data || []).forEach((question: any) => {
        if (!grouped[question.lobby_id]) {
          grouped[question.lobby_id] = [];
        }
        grouped[question.lobby_id].push(question);
      });
      setQuestions(grouped);
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
    }
  };

  const loadAllAnswers = async () => {
    try {
      // Tüm soruları al
      const allQuestions = Object.values(questions).flat();
      if (allQuestions.length === 0) return;

      const questionIds = allQuestions.map(q => q.id);

      // Tüm cevapları yükle
      const { data: answersData, error: answersError } = await supabase
        .from("live_question_answers")
        .select("id, question_id, user_id, answer, created_at")
        .in("question_id", questionIds)
        .order("created_at", { ascending: false });

      if (answersError) {
        // Tablo yoksa sessizce devam et
        if (answersError.code === '42P01' || answersError.message?.includes('does not exist')) {
          console.warn("live_question_answers tablosu bulunamadı.");
          setQuestionAnswers({});
          return;
        }
        console.error("Cevaplar yüklenirken hata:", answersError);
        return;
      }

      // Kullanıcı bilgilerini al
      if (answersData && answersData.length > 0) {
        const userIds = [...new Set((answersData as any[]).map((a: any) => a.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        // Profil bilgilerini cevaplara ekle
        const answersWithProfiles = (answersData as any[]).map((answer: any) => ({
          ...answer,
          profiles: profilesData?.find((p: any) => p.id === answer.user_id) || null,
        }));

        // Cevapları question_id'ye göre grupla
        const grouped: Record<string, any[]> = {};
        answersWithProfiles.forEach((answer: any) => {
          if (!grouped[answer.question_id]) {
            grouped[answer.question_id] = [];
          }
          grouped[answer.question_id].push(answer);
        });
        setQuestionAnswers(grouped);
      } else {
        setQuestionAnswers({});
      }
    } catch (error) {
      console.error("Cevaplar yüklenirken hata:", error);
    }
  };

  const handleToggleWinner = async (answerId: string, questionId: string, currentWinnerStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("live_question_answers")
        .update({ is_winner: !currentWinnerStatus })
        .eq("id", answerId);

      if (error) {
        console.error("Kazanan durumu güncellenirken hata:", error);
        alert("Kazanan durumu güncellenirken bir hata oluştu: " + error.message);
        return;
      }

      // Cevapları yeniden yükle
      await loadAnswersForQuestion(questionId);
      alert(!currentWinnerStatus ? "Kazanan olarak işaretlendi!" : "Kazanan işareti kaldırıldı!");
    } catch (error: any) {
      console.error("Kazanan durumu güncellenirken hata:", error);
      alert("Kazanan durumu güncellenirken bir hata oluştu.");
    }
  };

  const loadAnswersForQuestion = async (questionId: string) => {
    try {
      setLoadingAnswers(prev => ({ ...prev, [questionId]: true }));
      
      // Önce cevapları yükle
      const { data: answersData, error: answersError } = await supabase
        .from("live_question_answers")
        .select("id, question_id, user_id, answer, created_at, is_winner")
        .eq("question_id", questionId)
        .order("created_at", { ascending: false });

      if (answersError) {
        if (answersError.code === '42P01' || answersError.message?.includes('does not exist')) {
          setQuestionAnswers(prev => ({ ...prev, [questionId]: [] }));
          return;
        }
        console.error("Cevaplar yüklenirken hata:", answersError);
        return;
      }

      // Kullanıcı bilgilerini al
      if (answersData && answersData.length > 0) {
        const userIds = [...new Set((answersData as any[]).map((a: any) => a.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        // Profil bilgilerini cevaplara ekle
        const answersWithProfiles = (answersData as any[]).map((answer: any) => ({
          ...answer,
          profiles: profilesData?.find((p: any) => p.id === answer.user_id) || null,
        }));

        setQuestionAnswers(prev => ({ ...prev, [questionId]: answersWithProfiles }));
      } else {
        setQuestionAnswers(prev => ({ ...prev, [questionId]: [] }));
      }
    } catch (error) {
      console.error("Cevaplar yüklenirken hata:", error);
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const loadQuestionsForLobby = async (lobbyId: string) => {
    try {
      const { data, error } = await supabase
        .from("live_questions")
        .select("*")
        .eq("lobby_id", lobbyId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sorular yüklenirken hata:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      return [];
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      unique_code: "",
      is_active: true,
      hero_image_url: "",
      event_title: "",
      primary_color: "#D69ADE",
      team_a: "",
      team_b: "",
      team_a_logo: "",
      team_b_logo: "",
    });
    setIsEditMode(false);
    setEditingLobbyId(null);
  };

  const handleOpenDialog = (lobby?: LiveLobby) => {
    if (lobby) {
      setFormData({
        name: lobby.name,
        unique_code: lobby.unique_code,
        is_active: lobby.is_active,
        hero_image_url: lobby.hero_image_url || "",
        event_title: lobby.event_title || "",
        primary_color: lobby.primary_color || "#D69ADE",
        team_a: lobby.team_a || "",
        team_b: lobby.team_b || "",
        team_a_logo: lobby.team_a_logo || "",
        team_b_logo: lobby.team_b_logo || "",
      });
      setIsEditMode(true);
      setEditingLobbyId(lobby.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleTeamSelect = (teamSide: 'a' | 'b', teamId: string) => {
    const selectedTeam = teams.find(t => t.id.toString() === teamId);
    if (selectedTeam) {
      if (teamSide === 'a') {
        setFormData({
          ...formData,
          team_a: selectedTeam.name,
          team_a_logo: selectedTeam.logo_url || "",
        });
      } else {
        setFormData({
          ...formData,
          team_b: selectedTeam.name,
          team_b_logo: selectedTeam.logo_url || "",
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.unique_code) {
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
      }

      // Unique code kontrolü (düzenleme modunda kendisi hariç)
      const existingLobby = lobbies.find(
        (l) => l.unique_code.toLowerCase() === formData.unique_code.toLowerCase() && l.id !== editingLobbyId
      );
      if (existingLobby) {
        alert("Bu kod zaten kullanılıyor. Lütfen farklı bir kod seçin.");
        return;
      }

      if (isEditMode && editingLobbyId) {
        // Güncelle
        const { error } = await (supabase as any)
          .from("live_lobbies")
          .update({
            name: formData.name,
            unique_code: formData.unique_code.toUpperCase(),
            is_active: formData.is_active,
            hero_image_url: formData.hero_image_url || null,
            event_title: formData.event_title || null,
            primary_color: formData.primary_color || null,
            team_a: formData.team_a || null,
            team_b: formData.team_b || null,
            team_a_logo: formData.team_a_logo || null,
            team_b_logo: formData.team_b_logo || null,
          })
          .eq("id", editingLobbyId);

        if (error) {
          console.error("Lobi güncellenirken hata:", error);
          alert(error.message || "Lobi güncellenirken bir hata oluştu.");
          return;
        }
      } else {
        // Yeni ekle
        const { error } = await (supabase as any)
          .from("live_lobbies")
          .insert({
            name: formData.name,
            unique_code: formData.unique_code.toUpperCase(),
            is_active: formData.is_active,
            hero_image_url: formData.hero_image_url || null,
            event_title: formData.event_title || null,
            primary_color: formData.primary_color || null,
            team_a: formData.team_a || null,
            team_b: formData.team_b || null,
            team_a_logo: formData.team_a_logo || null,
            team_b_logo: formData.team_b_logo || null,
          });

        if (error) {
          console.error("Lobi eklenirken hata:", error);
          alert(error.message || "Lobi eklenirken bir hata oluştu.");
          return;
        }
      }

      resetForm();
      setIsDialogOpen(false);
      await loadLobbies();
      alert(isEditMode ? "Lobi başarıyla güncellendi!" : "Lobi başarıyla eklendi!");
    } catch (error: any) {
      console.error("Lobi kaydedilirken hata:", error);
      alert(error?.message || "Lobi kaydedilirken bir hata oluştu.");
    }
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: "",
      question_type: "text",
      expected_answer: "",
      player_image_url: "",
      player_name: "",
      banner_image_url: "",
    });
    setIsQuestionEditMode(false);
    setEditingQuestionId(null);
    // selectedLobbyId'yi burada sıfırlama - handleOpenQuestionDialog'da set ediliyor
  };

  const handleOpenQuestionDialog = (lobbyId: string, question?: any) => {
    // Önce selectedLobbyId'yi set et
    setSelectedLobbyId(lobbyId);
    
    if (question) {
      setQuestionFormData({
        question_text: question.question_text || "",
        question_type: question.question_type || "text",
        expected_answer: question.expected_answer?.toString() || "",
        player_image_url: question.player_image_url || "",
        player_name: question.player_name || "",
        banner_image_url: question.banner_image_url || "",
      });
      setIsQuestionEditMode(true);
      setEditingQuestionId(question.id);
    } else {
      // Yeni soru eklerken formu sıfırla ama selectedLobbyId'yi koru
      setQuestionFormData({
        question_text: "",
        question_type: "text",
        expected_answer: "",
        player_image_url: "",
        player_name: "",
        banner_image_url: "",
      });
      setIsQuestionEditMode(false);
      setEditingQuestionId(null);
    }
    setIsQuestionDialogOpen(true);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    // Dosya boyutu kontrolü (max 10MB - banner için daha büyük olabilir)
    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setUploadingBanner(true);

      // Dosya adını oluştur
      const fileExt = file.name.split(".").pop();
      const fileName = `question-banners/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Yükleme hatası:", uploadError);
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
          alert(
            "Storage bucket bulunamadı!\n\n" +
            "Lütfen Supabase Dashboard'dan 'uploads' adında bir bucket oluşturun:\n" +
            "1. Supabase Dashboard > Storage\n" +
            "2. 'New bucket' butonuna tıklayın\n" +
            "3. Bucket adı: 'uploads'\n" +
            "4. Public bucket: ✅ (işaretleyin)\n" +
            "5. 'Create bucket' butonuna tıklayın"
          );
        } else if (uploadError.message.includes("row-level security") || uploadError.message.includes("RLS")) {
          alert(
            "RLS Politikası Hatası!\n\n" +
            "Çözüm:\n" +
            "1. Supabase Dashboard > Storage > 'uploads' bucket\n" +
            "2. 'Settings' sekmesi > 'Public bucket' ✅ işaretli olmalı\n" +
            "3. 'Policies' sekmesi > 'New Policy' ekleyin:\n" +
            "   - Operation: INSERT\n" +
            "   - Target: authenticated\n" +
            "   - WITH CHECK: bucket_id = 'uploads'\n\n" +
            "VEYA bucket'ı silip tekrar oluşturun (Public bucket işaretli)"
          );
        } else {
          alert("Banner yüklenirken bir hata oluştu: " + uploadError.message);
        }
        return;
      }

      // Public URL'i al
      const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      
      console.log("Banner yüklendi, URL:", publicUrl);
      
      setQuestionFormData({
        ...questionFormData,
        banner_image_url: publicUrl,
      });

      alert("Banner başarıyla yüklendi! URL: " + publicUrl);
    } catch (error: any) {
      console.error("Banner yüklenirken hata:", error);
      alert("Banner yüklenirken bir hata oluştu: " + error?.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handlePlayerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setUploadingPlayerImage(true);

      // Dosya adını oluştur
      const fileExt = file.name.split(".").pop();
      const fileName = `player-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Yükleme hatası:", uploadError);
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
          alert(
            "Storage bucket bulunamadı!\n\n" +
            "Lütfen Supabase Dashboard'dan 'uploads' adında bir bucket oluşturun:\n" +
            "1. Supabase Dashboard > Storage\n" +
            "2. 'New bucket' butonuna tıklayın\n" +
            "3. Bucket adı: 'uploads'\n" +
            "4. Public bucket: ✅ (işaretleyin)\n" +
            "5. 'Create bucket' butonuna tıklayın"
          );
        } else if (uploadError.message.includes("row-level security") || uploadError.message.includes("RLS")) {
          alert(
            "RLS Politikası Hatası!\n\n" +
            "Çözüm:\n" +
            "1. Supabase Dashboard > Storage > 'uploads' bucket\n" +
            "2. 'Settings' sekmesi > 'Public bucket' ✅ işaretli olmalı\n" +
            "3. 'Policies' sekmesi > 'New Policy' ekleyin:\n" +
            "   - Operation: INSERT\n" +
            "   - Target: authenticated\n" +
            "   - WITH CHECK: bucket_id = 'uploads'\n\n" +
            "VEYA bucket'ı silip tekrar oluşturun (Public bucket işaretli)"
          );
        } else {
          alert("Resim yüklenirken bir hata oluştu: " + uploadError.message);
        }
        return;
      }

      // Public URL'i al
      const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
      setQuestionFormData({
        ...questionFormData,
        player_image_url: data.publicUrl,
      });

      alert("Resim başarıyla yüklendi!");
    } catch (error: any) {
      console.error("Resim yüklenirken hata:", error);
      alert("Resim yüklenirken bir hata oluştu: " + error?.message);
    } finally {
      setUploadingPlayerImage(false);
    }
  };

  const handleQuestionSave = async () => {
    if (!selectedLobbyId) {
      alert("Lütfen bir lobi seçin.");
      return;
    }

    if (!questionFormData.question_text) {
      alert("Lütfen soru metni girin.");
      return;
    }

    // Beklenen cevap (opsiyonel - metin olarak saklanır)
    const expectedAnswer = questionFormData.expected_answer?.trim() || null;

    try {
      if (isQuestionEditMode && editingQuestionId) {
        // Güncelle
        const updateData = {
          question_text: questionFormData.question_text,
          question_type: questionFormData.question_type,
          expected_answer: expectedAnswer,
          player_image_url: questionFormData.player_image_url || null,
          player_name: questionFormData.player_name || null,
          banner_image_url: questionFormData.banner_image_url && questionFormData.banner_image_url.trim() !== "" ? questionFormData.banner_image_url : null,
          option_a: "", // Şıklı cevap kullanılmıyor
          option_b: "", // Şıklı cevap kullanılmıyor
          option_c: null,
          option_d: null,
        };
        
        console.log("Soru güncelleniyor, banner_image_url:", updateData.banner_image_url);
        
        const { error } = await (supabase as any)
          .from("live_questions")
          .update(updateData)
          .eq("id", editingQuestionId);

        if (error) {
          console.error("Soru güncellenirken hata:", error);
          alert(error.message || "Soru güncellenirken bir hata oluştu.");
          return;
        }
      } else {
        // Yeni ekle
        const insertData = {
          lobby_id: selectedLobbyId,
          question_text: questionFormData.question_text,
          question_type: questionFormData.question_type,
          expected_answer: expectedAnswer,
          player_image_url: questionFormData.player_image_url || null,
          player_name: questionFormData.player_name || null,
          banner_image_url: questionFormData.banner_image_url && questionFormData.banner_image_url.trim() !== "" ? questionFormData.banner_image_url : null,
          option_a: "", // Şıklı cevap kullanılmıyor
          option_b: "", // Şıklı cevap kullanılmıyor
          option_c: null,
          option_d: null,
          is_active: false, // Yeni sorular varsayılan olarak pasif
        };
        
        console.log("Soru ekleniyor, banner_image_url:", insertData.banner_image_url);
        console.log("Tüm insert data:", insertData);
        
        const { error } = await (supabase as any)
          .from("live_questions")
          .insert(insertData);

        if (error) {
          console.error("Soru eklenirken hata:", error);
          alert(error.message || "Soru eklenirken bir hata oluştu.");
          return;
        }
      }

      resetQuestionForm();
      setSelectedLobbyId(null); // Kayıt sonrası sıfırla
      setIsQuestionDialogOpen(false);
      await loadAllQuestions();
      alert(isQuestionEditMode ? "Soru başarıyla güncellendi!" : "Soru başarıyla eklendi!");
    } catch (error: any) {
      console.error("Soru kaydedilirken hata:", error);
      alert(error?.message || "Soru kaydedilirken bir hata oluştu.");
    }
  };

  const handleQuestionDelete = async (questionId: string) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("live_questions")
        .delete()
        .eq("id", questionId);

      if (error) {
        console.error("Soru silinirken hata:", error);
        alert(error.message || "Soru silinirken bir hata oluştu.");
      } else {
        await loadAllQuestions();
        alert("Soru başarıyla silindi!");
      }
    } catch (error: any) {
      console.error("Soru silinirken hata:", error);
      alert(error?.message || "Soru silinirken bir hata oluştu.");
    }
  };

  const handleQuestionToggleActive = async (questionId: string, currentActive: boolean) => {
    try {
      // Eğer soruyu aktif yapıyorsak, aynı lobideki diğer aktif soruları pasif yap
      if (!currentActive) {
        const question = Object.values(questions).flat().find(q => q.id === questionId);
        if (question) {
          // Aynı lobideki diğer aktif soruları pasif yap
          const { error: updateError } = await (supabase as any)
            .from("live_questions")
            .update({ is_active: false })
            .eq("lobby_id", question.lobby_id)
            .eq("is_active", true)
            .neq("id", questionId);

          if (updateError) {
            console.error("Diğer sorular pasif yapılırken hata:", updateError);
          }
        }
      }

      const { error } = await (supabase as any)
        .from("live_questions")
        .update({ is_active: !currentActive })
        .eq("id", questionId);

      if (error) {
        console.error("Soru durumu güncellenirken hata:", error);
        alert(error.message || "Soru durumu güncellenirken bir hata oluştu.");
      } else {
        await loadAllQuestions();
      }
    } catch (error: any) {
      console.error("Soru durumu güncellenirken hata:", error);
      alert(error?.message || "Soru durumu güncellenirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu lobiyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const { error } = await supabase
        .from("live_lobbies")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Lobi silinirken hata:", error);
        alert(error.message || "Lobi silinirken bir hata oluştu.");
      } else {
        await loadLobbies();
        alert("Lobi başarıyla silindi!");
      }
    } catch (error: any) {
      console.error("Lobi silinirken hata:", error);
      alert(error?.message || "Lobi silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (lobby: LiveLobby) => {
    try {
      const { error } = await (supabase as any)
        .from("live_lobbies")
        .update({ is_active: !lobby.is_active })
        .eq("id", lobby.id);

      if (error) {
        console.error("Lobi durumu güncellenirken hata:", error);
        alert(error.message || "Lobi durumu güncellenirken bir hata oluştu.");
      } else {
        await loadLobbies();
      }
    } catch (error: any) {
      console.error("Lobi durumu güncellenirken hata:", error);
      alert(error?.message || "Lobi durumu güncellenirken bir hata oluştu.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `live-lobby-${Date.now()}.${fileExt}`;
      const filePath = `live-lobbies/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error("Resim yüklenirken hata:", uploadError);
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
          alert(
            "Storage bucket bulunamadı!\n\n" +
            "Lütfen Supabase Dashboard'dan 'uploads' adında bir bucket oluşturun:\n" +
            "1. Supabase Dashboard > Storage\n" +
            "2. 'New bucket' butonuna tıklayın\n" +
            "3. Bucket adı: 'uploads'\n" +
            "4. Public bucket: ✅ (işaretleyin)\n" +
            "5. 'Create bucket' butonuna tıklayın"
          );
        } else if (uploadError.message.includes("row-level security") || uploadError.message.includes("RLS")) {
          alert(
            "RLS Politikası Hatası!\n\n" +
            "Çözüm:\n" +
            "1. Supabase Dashboard > Storage > 'uploads' bucket\n" +
            "2. 'Settings' sekmesi > 'Public bucket' ✅ işaretli olmalı\n" +
            "3. 'Policies' sekmesi > 'New Policy' ekleyin:\n" +
            "   - Operation: INSERT\n" +
            "   - Target: authenticated\n" +
            "   - WITH CHECK: bucket_id = 'uploads'\n\n" +
            "VEYA bucket'ı silip tekrar oluşturun (Public bucket işaretli)"
          );
        } else {
          alert(uploadError.message || "Resim yüklenirken bir hata oluştu.");
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setFormData({ ...formData, hero_image_url: publicUrl });
      alert("Resim başarıyla yüklendi!");
    } catch (error: any) {
      console.error("Resim yüklenirken hata:", error);
      alert(error?.message || "Resim yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Canlı Yayın Kumandası
          </h1>
          <p className="text-gray-400">
            Yayınlarda kullanmak için lobi oluşturun. Link oluşturulur ve yayında paylaşılır. Sitede görünmez.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Lobi Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#131720] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {isEditMode ? "Lobi Düzenle" : "Yeni Lobi Ekle"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {isEditMode
                  ? "Lobi bilgilerini güncelleyin."
                  : "Yeni bir canlı yayın lobisi oluşturun."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Lobi Adı */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Lobi Adı <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: NAVI vs FaZe - Final"
                  className="bg-[#0a0e1a] border-white/10 text-white"
                />
              </div>

              {/* Unique Code */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Benzersiz Kod <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formData.unique_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unique_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                    })
                  }
                  placeholder="Örn: NAVIFAZE"
                  className="bg-[#0a0e1a] border-white/10 text-white font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sadece büyük harf ve rakam. Kullanıcılar bu kod ile lobiye katılır.
                </p>
              </div>

              {/* Event Title */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Etkinlik Başlığı
                </label>
                <Input
                  value={formData.event_title}
                  onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
                  placeholder="Örn: ESL Pro League Final"
                  className="bg-[#0a0e1a] border-white/10 text-white"
                />
              </div>

              {/* Hero Image */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Hero Görsel URL
                </label>
                <div className="space-y-2">
                  {formData.hero_image_url && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                      <Image
                        src={formData.hero_image_url}
                        alt="Hero"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, hero_image_url: "" })}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={formData.hero_image_url}
                      onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                      placeholder="Görsel URL'si veya yükle"
                      className="bg-[#0a0e1a] border-white/10 text-white"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById("hero-image-upload")?.click()}
                      disabled={uploading}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {uploading ? (
                        "Yükleniyor..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Yükle
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Ana Renk
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-20 h-10 bg-[#0a0e1a] border-white/10"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#D69ADE"
                    className="bg-[#0a0e1a] border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              {/* Maç Bilgisi Bölümü */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Maç Bilgisi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Takım A */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Takım A
                    </label>
                    <select
                      value={teams.find(t => t.name === formData.team_a)?.id.toString() || ""}
                      onChange={(e) => handleTeamSelect('a', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white focus:border-[#B84DC7] focus:outline-none"
                    >
                      <option value="">Takım Seçin</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id.toString()}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    {formData.team_a && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                        <span>Seçili: {formData.team_a}</span>
                      </div>
                    )}
                  </div>

                  {/* Takım B */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Takım B
                    </label>
                    <select
                      value={teams.find(t => t.name === formData.team_b)?.id.toString() || ""}
                      onChange={(e) => handleTeamSelect('b', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white focus:border-[#B84DC7] focus:outline-none"
                    >
                      <option value="">Takım Seçin</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id.toString()}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    {formData.team_b && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                        <span>Seçili: {formData.team_b}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Önizleme */}
                {(formData.team_a || formData.team_b) && (
                  <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Önizleme:</p>
                    <div className="flex items-center justify-center gap-4">
                      {formData.team_a && (
                        <div className="text-center">
                          {formData.team_a_logo && (
                            <Image
                              src={formData.team_a_logo}
                              alt={formData.team_a}
                              width={64}
                              height={64}
                              className="mx-auto mb-2 rounded-lg"
                            />
                          )}
                          <p className="text-sm font-semibold text-white">{formData.team_a}</p>
                        </div>
                      )}
                      {formData.team_a && formData.team_b && (
                        <span className="text-gray-500 font-bold">VS</span>
                      )}
                      {formData.team_b && (
                        <div className="text-center">
                          {formData.team_b_logo && (
                            <Image
                              src={formData.team_b_logo}
                              alt={formData.team_b}
                              width={64}
                              height={64}
                              className="mx-auto mb-2 rounded-lg"
                            />
                          )}
                          <p className="text-sm font-semibold text-white">{formData.team_b}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                <div>
                  <label className="text-sm font-medium text-gray-300">Aktif Durum</label>
                  <p className="text-xs text-gray-500 mt-1">
                    Lobinin aktif olup olmadığını belirler
                  </p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
              >
                {isEditMode ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lobbies List */}
      {lobbies.length === 0 ? (
        <div className="bg-[#131720] border border-white/10 rounded-lg p-12 text-center">
          <Radio className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Henüz lobi eklenmemiş</p>
          <p className="text-gray-500 text-sm">Yeni bir lobi eklemek için yukarıdaki butona tıklayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lobbies.map((lobby) => (
            <div
              key={lobby.id}
              className={cn(
                "bg-[#131720] border rounded-lg p-6 transition-all",
                lobby.is_active
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-white/10"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio
                      className={cn(
                        "h-5 w-5",
                        lobby.is_active ? "text-green-400" : "text-gray-500"
                      )}
                    />
                    <h3 className="text-lg font-bold text-white truncate">{lobby.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded bg-[#B84DC7]/20 text-[#B84DC7] font-mono text-xs">
                      {lobby.unique_code}
                    </span>
                    {lobby.is_active && (
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                        Aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              {lobby.hero_image_url && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 mb-4">
                  <Image
                    src={lobby.hero_image_url}
                    alt={lobby.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-2 mb-4">
                {lobby.event_title && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Etkinlik:</span> {lobby.event_title}
                  </p>
                )}
                {lobby.primary_color && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Renk:</span>
                    <div
                      className="w-6 h-6 rounded border border-white/10"
                      style={{ backgroundColor: lobby.primary_color }}
                    />
                    <span className="text-xs text-gray-400 font-mono">{lobby.primary_color}</span>
                  </div>
                )}
                
                {/* Lobi Linki - Önemli */}
                <div className="mt-4 p-3 rounded-lg bg-[#B84DC7]/10 border border-[#B84DC7]/30">
                  <p className="text-xs text-gray-400 mb-2 font-semibold">Yayın Linki:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/live/${lobby.unique_code}`}
                      className="flex-1 px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-xs font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      onClick={async () => {
                        const link = `${window.location.origin}/live/${lobby.unique_code}`;
                        try {
                          await navigator.clipboard.writeText(link);
                          setCopiedCode(lobby.id);
                          setTimeout(() => setCopiedCode(null), 2000);
                        } catch (err) {
                          console.error("Kopyalama hatası:", err);
                          alert("Link kopyalanamadı. Lütfen manuel olarak kopyalayın.");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="border-[#B84DC7]/50 text-[#B84DC7] hover:bg-[#B84DC7]/20 flex-shrink-0"
                    >
                      {copiedCode === lobby.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Kopyala
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        const link = `${window.location.origin}/live/${lobby.unique_code}`;
                        window.open(link, '_blank');
                      }}
                      variant="outline"
                      size="sm"
                      className="border-[#B84DC7]/50 text-[#B84DC7] hover:bg-[#B84DC7]/20 flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Bu linki yayında paylaşın. Kullanıcılar bu link ile lobiye katılabilir.
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  Oluşturulma: {new Date(lobby.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>

              {/* Sorular Bölümü */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <h4 className="text-sm font-semibold text-white">Sorular</h4>
                    <span className="text-xs text-gray-500">
                      ({(questions[lobby.id] || []).length})
                    </span>
                  </div>
                  <Button
                    onClick={() => handleOpenQuestionDialog(lobby.id)}
                    size="sm"
                    className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white h-7 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Soru Ekle
                  </Button>
                </div>

                {/* Soru Listesi */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(questions[lobby.id] || []).length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Henüz soru eklenmemiş
                    </p>
                  ) : (
                    (questions[lobby.id] || []).map((question) => {
                      const answers = questionAnswers[question.id] || [];
                      const isExpanded = expandedQuestions.has(question.id);
                      
                      return (
                        <div
                          key={question.id}
                          className={cn(
                            "rounded border text-xs overflow-hidden",
                            question.is_active
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-white/5 border-white/10"
                          )}
                        >
                          <div className="p-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate mb-1">
                                  {question.question_text}
                                </p>
                                {question.expected_answer !== null && (
                                  <p className="text-gray-400 text-xs mt-1">
                                    Beklenen Cevap: {question.expected_answer}
                                  </p>
                                )}
                                {question.player_name && (
                                  <p className="text-gray-500 mt-1 text-xs">
                                    Oyuncu: {question.player_name}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <Users className="h-3 w-3" />
                                    <span className="text-xs">
                                      {loadingAnswers[question.id] 
                                        ? "Yükleniyor..." 
                                        : `${answers.length} cevap`}
                                    </span>
                                  </div>
                                  {isExpanded && (
                                    <Button
                                      onClick={() => loadAnswersForQuestion(question.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 px-2 text-[10px] text-gray-400 hover:text-white"
                                      disabled={loadingAnswers[question.id]}
                                    >
                                      {loadingAnswers[question.id] ? "Yükleniyor..." : "Yenile"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  onClick={() => {
                                    if (!isExpanded) {
                                      loadAnswersForQuestion(question.id);
                                    }
                                    setExpandedQuestions(prev => {
                                      const newSet = new Set(prev);
                                      if (isExpanded) {
                                        newSet.delete(question.id);
                                      } else {
                                        newSet.add(question.id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  title="Cevapları Göster/Gizle"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-gray-400" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleQuestionToggleActive(question.id, question.is_active)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  title={question.is_active ? "Pasif Yap" : "Aktif Yap"}
                                >
                                  {question.is_active ? (
                                    <Pause className="h-3 w-3 text-green-400" />
                                  ) : (
                                    <Play className="h-3 w-3 text-gray-400" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleOpenQuestionDialog(lobby.id, question)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  title="Düzenle"
                                >
                                  <Edit className="h-3 w-3 text-gray-400" />
                                </Button>
                                <Button
                                  onClick={() => handleQuestionDelete(question.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  title="Sil"
                                >
                                  <Trash2 className="h-3 w-3 text-red-400" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Cevaplar Bölümü */}
                          {isExpanded && (
                            <div className="border-t border-white/10 bg-black/20 p-3 max-h-64 overflow-y-auto">
                              {loadingAnswers[question.id] ? (
                                <div className="text-center py-4">
                                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                                  <p className="text-xs text-gray-500">Cevaplar yükleniyor...</p>
                                </div>
                              ) : answers.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-2">
                                  Henüz cevap verilmemiş
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-gray-400 mb-2">
                                    Toplam {answers.length} Cevap
                                  </p>
                                  {answers.map((answer, idx) => (
                                    <div
                                      key={answer.id || idx}
                                      className={cn(
                                        "p-3 rounded-lg border transition-all",
                                        answer.is_winner
                                          ? "bg-yellow-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                                          : "bg-white/5 border-white/10 hover:border-white/20"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="text-white text-xs font-semibold">
                                              {answer.profiles?.username || `Kullanıcı ${answer.user_id?.substring(0, 8)}`}
                                            </p>
                                            {answer.is_winner && (
                                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/30 border border-yellow-500/50">
                                                <Trophy className="h-3 w-3 text-yellow-400" />
                                                <span className="text-[10px] font-bold text-yellow-400 uppercase">Kazanan</span>
                                              </div>
                                            )}
                                          </div>
                                          <p className={cn(
                                            "text-xs break-words mb-1",
                                            answer.is_winner ? "text-yellow-200" : "text-gray-300"
                                          )}>
                                            {answer.answer}
                                          </p>
                                          <p className="text-gray-500 text-[10px]">
                                            {new Date(answer.created_at).toLocaleString("tr-TR")}
                                          </p>
                                        </div>
                                        <Button
                                          onClick={() => handleToggleWinner(answer.id, question.id, answer.is_winner || false)}
                                          size="sm"
                                          variant="ghost"
                                          className={cn(
                                            "h-7 px-2 text-[10px] flex-shrink-0",
                                            answer.is_winner
                                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50"
                                              : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                                          )}
                                          title={answer.is_winner ? "Kazanan İşaretini Kaldır" : "Kazanan Olarak İşaretle"}
                                        >
                                          {answer.is_winner ? (
                                            <>
                                              <X className="h-3 w-3 mr-1" />
                                              Kaldır
                                            </>
                                          ) : (
                                            <>
                                              <Trophy className="h-3 w-3 mr-1" />
                                              Kazanan Seç
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleToggleActive(lobby)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1",
                    lobby.is_active
                      ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  )}
                >
                  {lobby.is_active ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-1" />
                      Pasif Yap
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-1" />
                      Aktif Yap
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleOpenDialog(lobby)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(lobby.id)}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting === lobby.id}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {isDeleting === lobby.id ? (
                    <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Soru Ekleme/Düzenleme Dialogu */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0e1a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isQuestionEditMode ? "Soru Düzenle" : "Yeni Soru Ekle"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isQuestionEditMode
                ? "Soruyu düzenleyin"
                : "Yayın sırasında kullanıcılara sorulacak soruyu hazırlayın"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Soru Tipi */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Soru Tipi
              </label>
              <select
                value={questionFormData.question_type}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    question_type: e.target.value as "text" | "match_score" | "player_stats",
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white focus:border-[#B84DC7] focus:outline-none"
              >
                <option value="text">Normal Soru</option>
                <option value="match_score">Maç Skoru</option>
                <option value="player_stats">Oyuncu İstatistiği</option>
              </select>
            </div>

            {/* Soru Metni */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Soru Metni <span className="text-red-400">*</span>
              </label>
              <textarea
                value={questionFormData.question_text}
                onChange={(e) =>
                  setQuestionFormData({ ...questionFormData, question_text: e.target.value })
                }
                placeholder="Örn: Bu oyuncu kaç kill alır?"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white focus:border-[#B84DC7] focus:outline-none min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Banner Görseli */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Banner Görseli
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Soru banner görseli. Önerilen boyut: 1920x500px (16:5 oran). Banner görseli üzerinde soru metni gösterilir.
              </p>
              <div className="space-y-2">
                {questionFormData.banner_image_url && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10 mb-2">
                    <Image
                      src={questionFormData.banner_image_url}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        setQuestionFormData({
                          ...questionFormData,
                          banner_image_url: "",
                        })
                      }
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      disabled={uploadingBanner}
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white hover:bg-white/5 cursor-pointer transition-colors">
                      {uploadingBanner ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm">Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {questionFormData.banner_image_url ? "Banner Değiştir" : "Banner Yükle"}
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  JPG, PNG veya GIF formatında, maksimum 10MB. Önerilen boyut: 1920x500px
                </p>
              </div>
            </div>

            {/* Oyuncu Bilgileri (player_stats için) */}
            {questionFormData.question_type === "player_stats" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Oyuncu Adı
                  </label>
                  <input
                    type="text"
                    value={questionFormData.player_name}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, player_name: e.target.value })
                    }
                    placeholder="Örn: XANTARES"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white focus:border-[#B84DC7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Oyuncu Fotoğrafı
                  </label>
                  <div className="space-y-2">
                    {questionFormData.player_image_url && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10 mb-2">
                        <Image
                          src={questionFormData.player_image_url}
                          alt="Oyuncu"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() =>
                            setQuestionFormData({
                              ...questionFormData,
                              player_image_url: "",
                            })
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePlayerImageUpload}
                          className="hidden"
                          disabled={uploadingPlayerImage}
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white hover:bg-white/5 cursor-pointer transition-colors">
                          {uploadingPlayerImage ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="text-sm">Yükleniyor...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">
                                {questionFormData.player_image_url ? "Değiştir" : "Fotoğraf Yükle"}
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Beklenen Cevap (Opsiyonel) */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Beklenen Cevap (Opsiyonel)
              </label>
              <input
                type="text"
                value={questionFormData.expected_answer}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    expected_answer: e.target.value,
                  })
                }
                placeholder="Örn: 18 kill veya Doğru cevap metni"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 text-white focus:border-[#B84DC7] focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Doğru cevap (opsiyonel). Kullanıcılar serbest cevap verecek.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsQuestionDialogOpen(false);
                resetQuestionForm();
                setSelectedLobbyId(null); // Dialog kapandığında sıfırla
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              İptal
            </Button>
            <Button
              onClick={handleQuestionSave}
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
            >
              {isQuestionEditMode ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
