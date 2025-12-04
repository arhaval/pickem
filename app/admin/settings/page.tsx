"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Image as ImageIcon, Upload, X, Settings, Image, Radio, Plus, Trophy, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageNext from "next/image";
import { cn } from "@/lib/utils";

interface SiteSettings {
  id: number;
  hero_title: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  hero_button_text: string | null;
  hero_button_link: string | null;
  matches_banner_url: string | null;
  matches_banner_button_text: string | null;
  matches_banner_button_link: string | null;
  predictions_banner_url: string | null;
  predictions_banner_button_text: string | null;
  predictions_banner_button_link: string | null;
  ranking_banner_url: string | null;
  ranking_banner_button_text: string | null;
  ranking_banner_button_link: string | null;
  profile_banner_url: string | null;
  profile_banner_button_text: string | null;
  profile_banner_button_link: string | null;
  notification_text: string | null;
  is_notification_active: boolean;
  notification_color: string | null;
  is_maintenance_mode: boolean;
  is_ranking_visible: boolean;
  match_of_the_day_id: string | null;
  // Günün Maçı - Manuel Bilgiler (maçlara bağlı değil)
  match_of_the_day_team_a: string | null;
  match_of_the_day_team_b: string | null;
  match_of_the_day_team_a_logo: string | null;
  match_of_the_day_team_b_logo: string | null;
  match_of_the_day_date: string | null;
  match_of_the_day_time: string | null;
  match_of_the_day_tournament: string | null;
  // Yayın Bilgisi (JSON formatında: [{platform: "twitch", channel: "esl_cs2"}, ...])
  match_of_the_day_streams: string | null; // JSON string: Array<{platform: string, channel: string}>
  // Partnerler (JSON formatında: [{name: "Partner Adı", logo_url: "url", url: "link"}, ...])
  partners: string | null; // JSON string: Array<{name: string, logo_url: string, url: string | null}>
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "banners" | "partners">("general");
  const [uploadingBanner, setUploadingBanner] = useState<string | null>(null); // "hero" | "matches" | "predictions" | "ranking" | "profile" | "team_a_logo" | "team_b_logo"
  const [formData, setFormData] = useState<SiteSettings>({
    id: 1,
    hero_title: null,
    hero_description: null,
    hero_image_url: null,
    hero_button_text: null,
    hero_button_link: null,
    matches_banner_url: null,
    matches_banner_button_text: null,
    matches_banner_button_link: null,
    predictions_banner_url: null,
    predictions_banner_button_text: null,
    predictions_banner_button_link: null,
    ranking_banner_url: null,
    ranking_banner_button_text: null,
    ranking_banner_button_link: null,
    profile_banner_url: null,
    profile_banner_button_text: null,
    profile_banner_button_link: null,
    notification_text: null,
    is_notification_active: false,
    notification_color: null,
    is_maintenance_mode: false,
    is_ranking_visible: false,
    match_of_the_day_id: null,
    match_of_the_day_team_a: null,
    match_of_the_day_team_b: null,
    match_of_the_day_team_a_logo: null,
    match_of_the_day_team_b_logo: null,
    match_of_the_day_date: null,
    match_of_the_day_time: null,
    match_of_the_day_tournament: null,
    match_of_the_day_streams: null,
    partners: null,
  });
  const [streams, setStreams] = useState<Array<{platform: string, channel: string}>>([]);
  const [partners, setPartners] = useState<Array<{logo_url: string, url: string | null}>>([]);
  const teamALogoFileInputRef = useRef<HTMLInputElement>(null);
  const teamBLogoFileInputRef = useRef<HTMLInputElement>(null);

  // Günün Maçı - Match ID ile ilişkilendirme
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedMatchForResult, setSelectedMatchForResult] = useState<any | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string>("");
  const [selectedScoreA, setSelectedScoreA] = useState<string>("");
  const [selectedScoreB, setSelectedScoreB] = useState<string>("");
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [matchMode, setMatchMode] = useState<"manual" | "from_match">("manual"); // "manual" veya "from_match"

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const matchesFileInputRef = useRef<HTMLInputElement>(null);
  const predictionsFileInputRef = useRef<HTMLInputElement>(null);
  const rankingFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const partnerFileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  useEffect(() => {
    loadSettings();
    loadMatchesAndTeams();
  }, []);

  // match_of_the_day_id değiştiğinde maç bilgilerini yükle
  useEffect(() => {
    if (formData.match_of_the_day_id) {
      loadMatchDetails(formData.match_of_the_day_id);
      setMatchMode("from_match");
    }
  }, [formData.match_of_the_day_id]);

  const loadMatchesAndTeams = async () => {
    try {
      // Tüm maçları yükle (arşivlenmemiş)
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .or("is_archived.eq.false,is_archived.is.null")
        .order("match_date", { ascending: false })
        .order("match_time", { ascending: false });

      if (matchesData) {
        setMatches(matchesData);
      }

      // Tüm takımları yükle
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (teamsData) {
        setTeams(teamsData);
      }
    } catch (error) {
      console.error("Maçlar ve takımlar yüklenirken hata:", error);
    }
  };

  const loadMatchDetails = async (matchId: string) => {
    try {
      const { data: match, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error || !match) {
        console.error("Maç detayları yüklenirken hata:", error);
        return;
      }

      // Takımlar yüklenmemişse yükle
      if (teams.length === 0) {
        const { data: teamsData } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true });
        
        if (teamsData) {
          setTeams(teamsData);
        }
      }

      // Takım logolarını bul (teams state'ini veya yeni yüklenen teamsData'yı kullan)
      const currentTeams = teams.length > 0 ? teams : await (async () => {
        const { data: teamsData } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true });
        return teamsData || [];
      })();

      const teamA = currentTeams.find((t: any) => t.name === (match as any).team_a);
      const teamB = currentTeams.find((t: any) => t.name === (match as any).team_b);

      // FormData'yı güncelle - match bilgileriyle
      setFormData((prev) => ({
        ...prev,
        match_of_the_day_team_a: (match as any).team_a,
        match_of_the_day_team_b: (match as any).team_b,
        match_of_the_day_team_a_logo: teamA?.logo_url || null,
        match_of_the_day_team_b_logo: teamB?.logo_url || null,
        match_of_the_day_date: (match as any).match_date || null,
        match_of_the_day_time: (match as any).match_time || null,
        match_of_the_day_tournament: (match as any).tournament_name || null,
      }));
    } catch (error) {
      console.error("Maç detayları yüklenirken hata:", error);
    }
  };


  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        // Kolon hatası varsa (partners, profile_banner vb. eksikse), sadece mevcut kolonları seç
        if (error.message && (error.message.includes("column") || error.code === "42703" || error.message.includes("schema cache"))) {
          try {
            // Sadece kesinlikle var olan kolonları seç
            const { data: dataSafe, error: errorSafe } = await supabase
              .from("site_settings")
              .select("id, hero_title, hero_description, hero_image_url, hero_button_text, hero_button_link, matches_banner_url, matches_banner_button_text, matches_banner_button_link, predictions_banner_url, predictions_banner_button_text, predictions_banner_button_link, ranking_banner_url, ranking_banner_button_text, ranking_banner_button_link, notification_text, is_notification_active, notification_color, is_maintenance_mode, is_ranking_visible, match_of_the_day_id, match_of_the_day_team_a, match_of_the_day_team_b, match_of_the_day_team_a_logo, match_of_the_day_team_b_logo, match_of_the_day_date, match_of_the_day_time, match_of_the_day_tournament, match_of_the_day_streams")
              .eq("id", 1)
              .single();
            
            if (errorSafe) {
              if (errorSafe.code === "PGRST116") {
                const { data: newData, error: insertError } = await (supabase as any)
                  .from("site_settings")
                  .insert([{
                    id: 1,
                    hero_title: "Arhaval",
                    hero_description: "Arhaval tahmin oyununa katıl ve büyük ödüller kazan!",
                    is_notification_active: false,
                    is_maintenance_mode: false,
                  }])
                  .select()
                  .single();

                if (insertError) {
                  console.error("Ayarlar oluşturulurken hata:", JSON.stringify(insertError, null, 2));
                  return;
                }
                setFormData({ ...newData, profile_banner_url: null, profile_banner_button_text: null, profile_banner_button_link: null, partners: null } as any);
                setPartners([]);
                return;
              }
              console.error("Ayarlar yüklenirken hata:", JSON.stringify(errorSafe, null, 2));
              return;
            }
            
            if (dataSafe) {
              const dataSafeAny = dataSafe as any;
              setFormData({ 
                ...dataSafeAny, 
                profile_banner_url: dataSafeAny.profile_banner_url || null,
                profile_banner_button_text: dataSafeAny.profile_banner_button_text || null,
                profile_banner_button_link: dataSafeAny.profile_banner_button_link || null,
                partners: dataSafeAny.partners || null
              } as any);
              // Partners'i parse et
              try {
                if ((dataSafe as any).partners) {
                  const parsedPartners = typeof (dataSafe as any).partners === 'string' 
                    ? JSON.parse((dataSafe as any).partners) 
                    : (dataSafe as any).partners;
                  setPartners(Array.isArray(parsedPartners) ? parsedPartners : []);
                } else {
                  setPartners([]);
                }
              } catch (e) {
                setPartners([]);
              }
              return;
            }
          } catch (retryError) {
            console.error("Ayarlar yüklenirken hata (retry):", JSON.stringify(retryError, null, 2));
            return;
          }
        }
        
        if (error.code === "PGRST116") {
          const { data: newData, error: insertError } = await (supabase as any)
            .from("site_settings")
            .insert([{
              id: 1,
              hero_title: "Arhaval",
              hero_description: "Arhaval tahmin oyununa katıl ve büyük ödüller kazan!",
              is_notification_active: false,
              is_maintenance_mode: false,
            }])
            .select()
            .single();

          if (insertError) {
            console.error("Ayarlar oluşturulurken hata:", JSON.stringify(insertError, null, 2));
            return;
          }
          setFormData({ ...newData, partners: null } as any);
          setPartners([]);
          return;
        } else {
          console.error("Ayarlar yüklenirken hata:", JSON.stringify(error, null, 2));
          return;
        }
      } else {
        setFormData({
          ...(data as any),
          // is_ranking_visible kolonu yoksa varsayılan değer kullan
          is_ranking_visible: (data as any).is_ranking_visible ?? true,
        });
        // Streams'i parse et
        if ((data as any).match_of_the_day_streams) {
          try {
            const parsedStreams = JSON.parse((data as any).match_of_the_day_streams);
            setStreams(Array.isArray(parsedStreams) ? parsedStreams : []);
          } catch (e) {
            setStreams([]);
          }
        } else {
          setStreams([]);
        }
        // Partners'i parse et (kolon yoksa sessizce devam et)
        try {
          if ((data as any).partners) {
            try {
              const parsedPartners = typeof (data as any).partners === 'string' 
                ? JSON.parse((data as any).partners) 
                : (data as any).partners;
              setPartners(Array.isArray(parsedPartners) ? parsedPartners : []);
            } catch (e) {
              setPartners([]);
            }
          } else {
            setPartners([]);
          }
        } catch (e) {
          // Partners kolonu yoksa veya başka bir hata varsa sessizce devam et
          setPartners([]);
        }
      }
    } catch (error: any) {
      console.error("Ayarlar yüklenirken hata:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const addStream = () => {
    setStreams([...streams, { platform: "twitch", channel: "" }]);
  };

  const removeStream = (index: number) => {
    setStreams(streams.filter((_, i) => i !== index));
  };

  const updateStream = (index: number, field: "platform" | "channel", value: string) => {
    const updated = [...streams];
    updated[index] = { ...updated[index], [field]: value };
    setStreams(updated);
  };


  const handleTeamLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    teamType: "team_a" | "team_b"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setUploadingBanner(teamType === "team_a" ? "team_a_logo" : "team_b_logo");
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `match-of-day-${teamType}-${Date.now()}.${fileExt}`;
      const filePath = `teams/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teams')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Logo yüklenirken hata:", JSON.stringify(uploadError, null, 2));
        alert(uploadError.message || "Logo yüklenirken bir hata oluştu.");
        return;
      }

      const { data } = supabase.storage
        .from('teams')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // FormData'yı güncelle
        const updatedFormData = { ...formData };
        if (teamType === "team_a") {
          updatedFormData.match_of_the_day_team_a_logo = data.publicUrl;
        } else {
          updatedFormData.match_of_the_day_team_b_logo = data.publicUrl;
        }
        setFormData(updatedFormData);

        // Otomatik olarak veritabanına kaydet
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (teamType === "team_a") {
          updateData.match_of_the_day_team_a_logo = data.publicUrl;
        } else {
          updateData.match_of_the_day_team_b_logo = data.publicUrl;
        }

        const { error: saveError } = await (supabase as any)
          .from("site_settings")
          .update(updateData)
          .eq("id", 1);

        if (saveError) {
          console.error("Logo kaydedilirken hata:", JSON.stringify(saveError, null, 2));
          alert("Logo yüklendi ancak kaydedilirken bir hata oluştu: " + saveError.message);
        } else {
          alert("Logo başarıyla yüklendi ve kaydedildi!");
        }
      }
    } catch (error: any) {
      console.error("Logo yüklenirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Logo yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
      setUploadingBanner(null);
      const ref = teamType === "team_a" ? teamALogoFileInputRef : teamBLogoFileInputRef;
      if (ref.current) {
        ref.current.value = '';
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    bannerType: "hero" | "matches" | "predictions" | "ranking" | "profile"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setUploadingBanner(bannerType);
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${bannerType}-banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Resim yüklenirken hata:", JSON.stringify(uploadError, null, 2));
        alert(uploadError.message || "Resim yüklenirken bir hata oluştu.");
        return;
      }

      const { data } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // FormData'yı güncelle
        const updatedFormData = { ...formData };
        if (bannerType === "hero") {
          updatedFormData.hero_image_url = data.publicUrl;
        } else if (bannerType === "matches") {
          updatedFormData.matches_banner_url = data.publicUrl;
        } else if (bannerType === "predictions") {
          updatedFormData.predictions_banner_url = data.publicUrl;
        } else if (bannerType === "ranking") {
          updatedFormData.ranking_banner_url = data.publicUrl;
        } else if (bannerType === "profile") {
          updatedFormData.profile_banner_url = data.publicUrl;
        }
        setFormData(updatedFormData);

        // Otomatik olarak veritabanına kaydet
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (bannerType === "hero") {
          updateData.hero_image_url = data.publicUrl;
        } else if (bannerType === "matches") {
          updateData.matches_banner_url = data.publicUrl;
        } else if (bannerType === "predictions") {
          updateData.predictions_banner_url = data.publicUrl;
        } else if (bannerType === "ranking") {
          updateData.ranking_banner_url = data.publicUrl;
        } else if (bannerType === "profile") {
          updateData.profile_banner_url = data.publicUrl;
        }

        const { error: saveError } = await (supabase as any)
          .from("site_settings")
          .update(updateData)
          .eq("id", 1);

        if (saveError) {
          console.error("Banner kaydedilirken hata:", JSON.stringify(saveError, null, 2));
          alert("Banner yüklendi ancak kaydedilirken bir hata oluştu: " + saveError.message);
        } else {
          alert("Banner başarıyla yüklendi ve kaydedildi!");
        }
      }
    } catch (error: any) {
      console.error("Resim yüklenirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Resim yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
      setUploadingBanner(null);
      const ref = bannerType === "hero" ? heroFileInputRef : bannerType === "matches" ? matchesFileInputRef : bannerType === "predictions" ? predictionsFileInputRef : bannerType === "ranking" ? rankingFileInputRef : profileFileInputRef;
      if (ref.current) {
        ref.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (bannerType: "hero" | "matches" | "predictions" | "ranking" | "profile") => {
    try {
      const updatedFormData = { ...formData };
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (bannerType === "hero") {
        updatedFormData.hero_image_url = null;
        updateData.hero_image_url = null;
      } else if (bannerType === "matches") {
        updatedFormData.matches_banner_url = null;
        updateData.matches_banner_url = null;
      } else if (bannerType === "predictions") {
        updatedFormData.predictions_banner_url = null;
        updateData.predictions_banner_url = null;
      } else if (bannerType === "ranking") {
        updatedFormData.ranking_banner_url = null;
        updateData.ranking_banner_url = null;
      } else if (bannerType === "profile") {
        updatedFormData.profile_banner_url = null;
        updateData.profile_banner_url = null;
      }

      setFormData(updatedFormData);

      // Otomatik olarak veritabanına kaydet
      const { error: saveError } = await (supabase as any)
        .from("site_settings")
        .update(updateData)
        .eq("id", 1);

      if (saveError) {
        console.error("Banner kaldırılırken hata:", JSON.stringify(saveError, null, 2));
        alert("Banner kaldırılırken bir hata oluştu: " + saveError.message);
        // Hata durumunda formData'yı geri yükle
        setFormData(formData);
      } else {
        alert("Banner başarıyla kaldırıldı!");
      }
    } catch (error: any) {
      console.error("Banner kaldırılırken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Banner kaldırılırken bir hata oluştu.");
    }
  };

  const handleSaveMatchResult = async () => {
    if (!selectedMatchForResult || !selectedResult) {
      alert("Lütfen bir sonuç seçin.");
      return;
    }

    try {
      setIsSavingResult(true);

      // Maçlar sayfasındaki sonuç kaydetme mantığını buraya kopyala
      // Önce CANCELLED kontrolü
      if (selectedResult === "CANCELLED") {
        const { error: matchError } = await (supabase as any)
          .from("matches")
          .update({
            winner: "CANCELLED",
          })
          .eq("id", selectedMatchForResult.id);

        if (matchError) {
          alert("Maç güncellenirken hata: " + matchError.message);
          return;
        }

        alert("Maç iptal/berabere olarak işaretlendi. Hiçbir kullanıcı puan kazanmadı.");
        setIsResultDialogOpen(false);
        setSelectedMatchForResult(null);
        setSelectedResult("");
        await loadMatchDetails(formData.match_of_the_day_id || "");
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
        .eq("id", selectedMatchForResult.id);

      if (matchError) {
        alert("Maç güncellenirken hata: " + matchError.message);
        return;
      }

      // 2. Tahminleri çek
      const { data: predictions, error: predictionsError } = await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", selectedMatchForResult.id);

      if (predictionsError) {
        console.error("Tahminler yüklenirken hata:", predictionsError);
      }

      if (predictions && predictions.length > 0) {
        // Puan hesaplama ve dağıtım
        const correctPredictions = predictions.filter(
          (p: any) => p.selected_team === selectedResult
        );
        const incorrectPredictions = predictions.filter(
          (p: any) => p.selected_team !== selectedResult
        );

        const seasonId = selectedMatchForResult.season_id;

        // Doğru bilenlere puan ver
        for (const prediction of correctPredictions) {
          let pointsToAdd = 0;
          if (selectedResult === "A" || selectedResult === "OVER") {
            pointsToAdd = selectedMatchForResult.difficulty_score_a;
          } else if (selectedResult === "B" || selectedResult === "UNDER") {
            pointsToAdd = selectedMatchForResult.difficulty_score_b;
          }

          if (!seasonId) continue;

          const { data: seasonPoints, error: seasonPointsError } = await supabase
            .from("season_points")
            .select("*")
            .eq("user_id", (prediction as any).user_id)
            .eq("season_id", seasonId)
            .single();

          if (seasonPointsError && seasonPointsError.code === 'PGRST116') {
            await (supabase as any)
              .from("season_points")
              .insert({
                user_id: (prediction as any).user_id,
                season_id: seasonId,
                total_points: pointsToAdd,
                correct_predictions: 1,
                total_predictions: 1,
              });
          } else if (seasonPoints) {
            await (supabase as any)
              .from("season_points")
              .update({
                total_points: ((seasonPoints as any).total_points || 0) + pointsToAdd,
                correct_predictions: ((seasonPoints as any).correct_predictions || 0) + 1,
                total_predictions: ((seasonPoints as any).total_predictions || 0) + 1,
              })
              .eq("user_id", (prediction as any).user_id)
              .eq("season_id", seasonId);
          }

            await (supabase as any)
              .from("predictions")
              .update({
              points_earned: pointsToAdd,
            })
            .eq("id", (prediction as any).id);
        }

        // Yanlış bilenleri işaretle
        for (const prediction of incorrectPredictions) {
          if (!seasonId) continue;

          const { data: seasonPoints, error: seasonPointsError } = await supabase
            .from("season_points")
            .select("*")
            .eq("user_id", (prediction as any).user_id)
            .eq("season_id", seasonId)
            .single();

          if (seasonPointsError && seasonPointsError.code === 'PGRST116') {
            await (supabase as any)
              .from("season_points")
              .insert({
                user_id: (prediction as any).user_id,
                season_id: seasonId,
                total_points: 0,
                correct_predictions: 0,
                total_predictions: 1,
              });
          } else if (seasonPoints) {
            await (supabase as any)
              .from("season_points")
              .update({
                total_predictions: ((seasonPoints as any).total_predictions || 0) + 1,
              })
              .eq("user_id", (prediction as any).user_id)
              .eq("season_id", seasonId);
          }

            await (supabase as any)
              .from("predictions")
              .update({
              points_earned: 0,
            })
            .eq("id", (prediction as any).id);
        }

        alert(
          `Sonuç kaydedildi! ${correctPredictions.length} kullanıcı doğru bildi ve puan kazandı. ${incorrectPredictions.length} kullanıcı yanlış bildi.\n\nKazanan tahminler sayfasında gösterilecek. Maçı istediğiniz zaman arşivleyebilirsiniz.`
        );
      } else {
        alert("Sonuç kaydedildi! Bu maça henüz tahmin yapılmamış.");
      }

      setIsResultDialogOpen(false);
      setSelectedMatchForResult(null);
      setSelectedResult("");
      setSelectedScoreA("");
      setSelectedScoreB("");
      
      // Maç bilgilerini yenile
      if (formData.match_of_the_day_id) {
        await loadMatchDetails(formData.match_of_the_day_id);
        await loadMatchesAndTeams();
      }
    } catch (error: any) {
      console.error("Sonuç kaydedilirken hata:", error);
      alert(error?.message || "Sonuç kaydedilirken bir hata oluştu.");
    } finally {
      setIsSavingResult(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update data - is_ranking_visible kolonu varsa ekle, yoksa ekleme
      const updateData: any = {
        hero_title: formData.hero_title || null,
        hero_description: formData.hero_description || null,
        hero_image_url: formData.hero_image_url || null,
        hero_button_text: formData.hero_button_text || null,
        hero_button_link: formData.hero_button_link || null,
        matches_banner_url: formData.matches_banner_url || null,
        matches_banner_button_text: formData.matches_banner_button_text || null,
        matches_banner_button_link: formData.matches_banner_button_link || null,
        predictions_banner_url: formData.predictions_banner_url || null,
        predictions_banner_button_text: formData.predictions_banner_button_text || null,
        predictions_banner_button_link: formData.predictions_banner_button_link || null,
        ranking_banner_url: formData.ranking_banner_url || null,
        ranking_banner_button_text: formData.ranking_banner_button_text || null,
        ranking_banner_button_link: formData.ranking_banner_button_link || null,
        notification_text: formData.notification_text || null,
        is_notification_active: formData.is_notification_active,
        notification_color: formData.notification_color || null,
        is_maintenance_mode: formData.is_maintenance_mode,
        match_of_the_day_id: formData.match_of_the_day_id || null,
        match_of_the_day_team_a: formData.match_of_the_day_team_a || null,
        match_of_the_day_team_b: formData.match_of_the_day_team_b || null,
        match_of_the_day_team_a_logo: formData.match_of_the_day_team_a_logo || null,
        match_of_the_day_team_b_logo: formData.match_of_the_day_team_b_logo || null,
        match_of_the_day_date: formData.match_of_the_day_date || null,
        match_of_the_day_time: formData.match_of_the_day_time || null,
        match_of_the_day_tournament: formData.match_of_the_day_tournament || null,
        match_of_the_day_streams: streams.length > 0 ? JSON.stringify(streams) : null,
        partners: partners.length > 0 ? JSON.stringify(partners) : null,
        updated_at: new Date().toISOString(),
      };

      // is_ranking_visible kolonu varsa ekle (opsiyonel)
      if (formData.hasOwnProperty('is_ranking_visible')) {
        updateData.is_ranking_visible = formData.is_ranking_visible;
      }

      // profile_banner kolonları varsa ekle (opsiyonel)
      if (formData.hasOwnProperty('profile_banner_url')) {
        updateData.profile_banner_url = formData.profile_banner_url || null;
      }
      if (formData.hasOwnProperty('profile_banner_button_text')) {
        updateData.profile_banner_button_text = formData.profile_banner_button_text || null;
      }
      if (formData.hasOwnProperty('profile_banner_button_link')) {
        updateData.profile_banner_button_link = formData.profile_banner_button_link || null;
      }

      const { error } = await (supabase as any)
        .from("site_settings")
        .update(updateData)
        .eq("id", 1);

      if (error) {
        console.error("Ayarlar kaydedilirken hata:", JSON.stringify(error, null, 2));
        alert(error.message || "Ayarlar kaydedilirken bir hata oluştu.");
        return;
      }

      alert("Ayarlar başarıyla kaydedildi!");
    } catch (error: any) {
      console.error("Ayarlar kaydedilirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const BannerUploadSection = ({
    title,
    bannerType,
    imageUrl,
    buttonText,
    buttonLink,
    recommendedSize,
    fileInputRef,
    onImageChange,
    onRemoveImage,
    onButtonTextChange,
    onButtonLinkChange,
  }: {
    title: string;
    bannerType: "hero" | "matches" | "predictions" | "ranking" | "profile";
    imageUrl: string | null;
    buttonText: string | null;
    buttonLink: string | null;
    recommendedSize: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onButtonTextChange: (value: string) => void;
    onButtonLinkChange: (value: string) => void;
  }) => (
    <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            <ImageIcon className="h-4 w-4 inline mr-1" />
            Banner Yükle
          </label>
          <div className="space-y-3">
            {imageUrl ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-auto rounded-lg border border-white/10 max-h-64 object-cover"
                  />
                  <button
                    onClick={onRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                    title="Banner'ı Kaldır"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Thumbnail Önizleme */}
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                  <img
                    src={imageUrl}
                    alt={`${title} önizleme`}
                    className="w-16 h-16 object-cover rounded border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">Yüklenen Banner</p>
                    <p className="text-xs text-gray-500 truncate">{imageUrl}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-2">Banner görseli yükleyin</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                  id={`${bannerType}-upload`}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading && uploadingBanner === bannerType}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {uploading && uploadingBanner === bannerType ? (
                    "Yükleniyor..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Dosya Seç
                    </>
                  )}
                </Button>
              </div>
            )}
            {!imageUrl && (
              <p className="text-xs text-gray-500">
                Önerilen Boyut: {recommendedSize}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Buton Metni
          </label>
          <Input
            value={buttonText || ""}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="Örn: Hemen Katıl"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Buton Linki
          </label>
          <Input
            value={buttonLink || ""}
            onChange={(e) => onButtonLinkChange(e.target.value)}
            placeholder="Örn: /matches"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Site Ayarları</h1>
          <p className="text-gray-400">
            Site genel ayarlarını buradan yönetebilirsiniz.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
        >
          {saving ? (
            "Kaydediliyor..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "general"
                ? "text-[#B84DC7] border-b-2 border-[#B84DC7]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Genel Ayarlar
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "banners"
                ? "text-[#B84DC7] border-b-2 border-[#B84DC7]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Image className="h-4 w-4 inline mr-2" />
            Banner Yönetimi
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "partners"
                ? "text-[#B84DC7] border-b-2 border-[#B84DC7]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="h-4 w-4 inline mr-2" />
            Partner Yönetimi
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Bildirim Çubuğu */}
          <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Bildirim Çubuğu</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Bildirim Metni
                </label>
                <Input
                  value={formData.notification_text || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notification_text: e.target.value })
                  }
                  placeholder="Örn: Yeni turnuva başladı! Hemen katıl!"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Bildirim Aktif mi?
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Bildirim çubuğunu göster/gizle
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      is_notification_active: !formData.is_notification_active,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_notification_active
                      ? "bg-[#B84DC7]"
                      : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_notification_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Renk Seçimi
                </label>
                <select
                  value={formData.notification_color || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notification_color: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50"
                >
                  <option value="">Varsayılan (Mor)</option>
                  <option value="red">Kırmızı</option>
                  <option value="yellow">Sarı</option>
                  <option value="blue">Mavi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sistem Ayarları */}
          <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Sistem Ayarları</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Bakım Modu
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Siteyi bakım moduna al (gelecekte kullanılacak)
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      is_maintenance_mode: !formData.is_maintenance_mode,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_maintenance_mode
                      ? "bg-red-500"
                      : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_maintenance_mode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Sıralama Görünürlüğü
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Sıralamayı aç/kapat. Kapalıyken kullanıcılar puan ve sıralama göremez.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      is_ranking_visible: !formData.is_ranking_visible,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_ranking_visible
                      ? "bg-green-500"
                      : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_ranking_visible ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Günün Maçı - Match ID ile veya Manuel */}
          <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Günün Maçı</h2>
              {formData.match_of_the_day_id && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border-blue-500/30"
                  onClick={() => {
                    const match = matches.find(m => m.id === formData.match_of_the_day_id);
                    if (match) {
                      setSelectedMatchForResult(match);
                      setSelectedResult(match.winner || "");
                      setSelectedScoreA(match.score_a?.toString() || "");
                      setSelectedScoreB(match.score_b?.toString() || "");
                      setIsResultDialogOpen(true);
                    }
                  }}
                  disabled={isSavingResult}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Maçı Sonuçlandır
                </Button>
              )}
            </div>
            
            {/* Mod Seçimi */}
            <div className="mb-4 p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="match_mode"
                    checked={matchMode === "from_match"}
                    onChange={() => {
                      setMatchMode("from_match");
                      if (!formData.match_of_the_day_id) {
                        setFormData({ ...formData, match_of_the_day_id: "" });
                      }
                    }}
                    className="w-4 h-4 text-[#B84DC7] focus:ring-[#B84DC7]"
                  />
                  <span className="text-sm text-white">Mevcut Maçlardan Seç</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="match_mode"
                    checked={matchMode === "manual"}
                    onChange={() => {
                      setMatchMode("manual");
                      setFormData({ ...formData, match_of_the_day_id: null });
                    }}
                    className="w-4 h-4 text-[#B84DC7] focus:ring-[#B84DC7]"
                  />
                  <span className="text-sm text-white">Manuel Bilgi Gir</span>
                </label>
              </div>
            </div>

            {/* Match Seçimi - Eğer from_match modundaysa */}
            {matchMode === "from_match" && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Maç Seç *
                </label>
                <select
                  value={formData.match_of_the_day_id || ""}
                  onChange={async (e) => {
                    const matchId = e.target.value || null;
                    setFormData({ ...formData, match_of_the_day_id: matchId });
                    if (matchId) {
                      await loadMatchDetails(matchId);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-white/20 bg-[#1a1f2e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50 focus:border-[#D69ADE]/50"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Maç seçin...</option>
                  {matches.map((match) => {
                    const matchDate = match.match_date ? new Date(match.match_date).toLocaleDateString("tr-TR") : "Tarih yok";
                    return (
                      <option key={match.id} value={match.id} className="bg-[#1a1f2e] text-white">
                        {match.team_a} vs {match.team_b} - {matchDate} {match.match_time} {match.tournament_name ? `(${match.tournament_name})` : ""}
                      </option>
                    );
                  })}
                </select>
                {formData.match_of_the_day_id && (
                  <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-xs text-green-400">
                      ✅ Seçilen maçın bilgileri otomatik olarak yüklendi. Maç sonucu girmek için yukarıdaki "Sonuç Gir" butonunu kullanın.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım A
                  </label>
                  <Input
                    value={formData.match_of_the_day_team_a || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, match_of_the_day_team_a: e.target.value || null })
                    }
                    placeholder="Örn: Eternal Fire"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım B
                  </label>
                  <Input
                    value={formData.match_of_the_day_team_b || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, match_of_the_day_team_b: e.target.value || null })
                    }
                    placeholder="Örn: NAVI"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Maç Tarihi
                  </label>
                  <Input
                    type="date"
                    value={formData.match_of_the_day_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, match_of_the_day_date: e.target.value || null })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Maç Saati
                  </label>
                  <Input
                    type="time"
                    value={formData.match_of_the_day_time || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, match_of_the_day_time: e.target.value || null })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Turnuva Adı
                </label>
                <Input
                  value={formData.match_of_the_day_tournament || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, match_of_the_day_tournament: e.target.value || null })
                  }
                  placeholder="Örn: ESL Pro League Season 19"
                />
              </div>
              
              {/* Logo Upload Bölümü */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım A Logo
                  </label>
                  {formData.match_of_the_day_team_a_logo ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={formData.match_of_the_day_team_a_logo}
                          alt="Takım A Logo"
                          className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-white/5 p-2"
                        />
                        <button
                          onClick={() => {
                            setFormData({ ...formData, match_of_the_day_team_a_logo: null });
                            if (teamALogoFileInputRef.current) {
                              teamALogoFileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                          title="Logoyu Kaldır"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <Input
                        value={formData.match_of_the_day_team_a_logo || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, match_of_the_day_team_a_logo: e.target.value || null })
                        }
                        placeholder="Logo URL veya yeni logo yükleyin"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center bg-white/5">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-2">Logo yükleyin veya URL girin</p>
                        <input
                          ref={teamALogoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTeamLogoUpload(e, "team_a")}
                          className="hidden"
                          id="team-a-logo-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => teamALogoFileInputRef.current?.click()}
                          disabled={uploading && uploadingBanner === "team_a_logo"}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10 text-xs"
                        >
                          {uploading && uploadingBanner === "team_a_logo" ? (
                            "Yükleniyor..."
                          ) : (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              Logo Yükle
                            </>
                          )}
                        </Button>
                      </div>
                      <Input
                        value={formData.match_of_the_day_team_a_logo || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, match_of_the_day_team_a_logo: e.target.value || null })
                        }
                        placeholder="Veya logo URL'si girin"
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım B Logo
                  </label>
                  {formData.match_of_the_day_team_b_logo ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={formData.match_of_the_day_team_b_logo}
                          alt="Takım B Logo"
                          className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-white/5 p-2"
                        />
                        <button
                          onClick={() => {
                            setFormData({ ...formData, match_of_the_day_team_b_logo: null });
                            if (teamBLogoFileInputRef.current) {
                              teamBLogoFileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                          title="Logoyu Kaldır"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <Input
                        value={formData.match_of_the_day_team_b_logo || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, match_of_the_day_team_b_logo: e.target.value || null })
                        }
                        placeholder="Logo URL veya yeni logo yükleyin"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center bg-white/5">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-2">Logo yükleyin veya URL girin</p>
                        <input
                          ref={teamBLogoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTeamLogoUpload(e, "team_b")}
                          className="hidden"
                          id="team-b-logo-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => teamBLogoFileInputRef.current?.click()}
                          disabled={uploading && uploadingBanner === "team_b_logo"}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10 text-xs"
                        >
                          {uploading && uploadingBanner === "team_b_logo" ? (
                            "Yükleniyor..."
                          ) : (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              Logo Yükle
                            </>
                          )}
                        </Button>
                      </div>
                      <Input
                        value={formData.match_of_the_day_team_b_logo || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, match_of_the_day_team_b_logo: e.target.value || null })
                        }
                        placeholder="Veya logo URL'si girin"
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Yayın Bilgileri - Dinamik */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Yayın Bilgileri</h3>
                  <Button
                    type="button"
                    onClick={addStream}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    <Radio className="h-3 w-3 mr-1" />
                    Yayın Ekle
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Twitch, YouTube veya Kick yayınlarını ekleyin. 0, 1 veya 3 yayın ekleyebilirsiniz.
                </p>
                
                {streams.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-lg bg-white/5">
                    <Radio className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Henüz yayın eklenmedi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {streams.map((stream, index) => {
                      const streamUrl = stream.channel 
                        ? (stream.platform === "twitch"
                            ? `https://twitch.tv/${stream.channel}`
                            : stream.platform === "youtube"
                            ? `https://youtube.com/@${stream.channel}`
                            : `https://kick.com/${stream.channel}`)
                        : "";
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Platform</label>
                              <select
                                value={stream.platform}
                                onChange={(e) => updateStream(index, "platform", e.target.value)}
                                className="flex h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50"
                              >
                                <option value="twitch">Twitch</option>
                                <option value="youtube">YouTube</option>
                                <option value="kick">Kick</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Kanal Adı</label>
                              <Input
                                value={stream.channel}
                                onChange={(e) => updateStream(index, "channel", e.target.value)}
                                placeholder="Örn: esl_cs2"
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              type="button"
                              onClick={() => removeStream(index)}
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {streamUrl && (
                              <div className="text-xs text-gray-400 max-w-[200px] text-right" title={streamUrl}>
                                <div className="text-gray-500 mb-1">Yönlendirilecek:</div>
                                <div className="text-[#B84DC7] font-medium break-all">{streamUrl}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "banners" && (
        <div className="space-y-6">
          <BannerUploadSection
            title="Ana Sayfa Hero"
            bannerType="hero"
            imageUrl={formData.hero_image_url}
            buttonText={formData.hero_button_text}
            buttonLink={formData.hero_button_link}
            recommendedSize="1920x600px"
            fileInputRef={heroFileInputRef}
            onImageChange={(e) => handleImageUpload(e, "hero")}
            onRemoveImage={() => handleRemoveImage("hero")}
            onButtonTextChange={(value) => setFormData({ ...formData, hero_button_text: value })}
            onButtonLinkChange={(value) => setFormData({ ...formData, hero_button_link: value })}
          />

          <BannerUploadSection
            title="Maçlar Sayfası Banner"
            bannerType="matches"
            imageUrl={formData.matches_banner_url}
            buttonText={formData.matches_banner_button_text}
            buttonLink={formData.matches_banner_button_link}
            recommendedSize="1920x300px"
            fileInputRef={matchesFileInputRef}
            onImageChange={(e) => handleImageUpload(e, "matches")}
            onRemoveImage={() => handleRemoveImage("matches")}
            onButtonTextChange={(value) => setFormData({ ...formData, matches_banner_button_text: value })}
            onButtonLinkChange={(value) => setFormData({ ...formData, matches_banner_button_link: value })}
          />

          <BannerUploadSection
            title="Tahminler Sayfası Banner"
            bannerType="predictions"
            imageUrl={formData.predictions_banner_url}
            buttonText={formData.predictions_banner_button_text}
            buttonLink={formData.predictions_banner_button_link}
            recommendedSize="1920x300px"
            fileInputRef={predictionsFileInputRef}
            onImageChange={(e) => handleImageUpload(e, "predictions")}
            onRemoveImage={() => handleRemoveImage("predictions")}
            onButtonTextChange={(value) => setFormData({ ...formData, predictions_banner_button_text: value })}
            onButtonLinkChange={(value) => setFormData({ ...formData, predictions_banner_button_link: value })}
          />

          <BannerUploadSection
            title="Sıralama Sayfası Banner"
            bannerType="ranking"
            imageUrl={formData.ranking_banner_url}
            buttonText={formData.ranking_banner_button_text}
            buttonLink={formData.ranking_banner_button_link}
            recommendedSize="1920x300px"
            fileInputRef={rankingFileInputRef}
            onImageChange={(e) => handleImageUpload(e, "ranking")}
            onRemoveImage={() => handleRemoveImage("ranking")}
            onButtonTextChange={(value) => setFormData({ ...formData, ranking_banner_button_text: value })}
            onButtonLinkChange={(value) => setFormData({ ...formData, ranking_banner_button_link: value })}
          />

          <BannerUploadSection
            title="Profil Sayfası Banner"
            bannerType="profile"
            imageUrl={formData.profile_banner_url}
            buttonText={formData.profile_banner_button_text}
            buttonLink={formData.profile_banner_button_link}
            recommendedSize="1920x300px"
            fileInputRef={profileFileInputRef}
            onImageChange={(e) => handleImageUpload(e, "profile")}
            onRemoveImage={() => handleRemoveImage("profile")}
            onButtonTextChange={(value) => setFormData({ ...formData, profile_banner_button_text: value })}
            onButtonLinkChange={(value) => setFormData({ ...formData, profile_banner_button_link: value })}
          />
        </div>
      )}

      {activeTab === "partners" && (
        <div className="space-y-6">
          <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Partnerlerimiz</h2>
              <Button
                onClick={() => {
                  setPartners([...partners, { logo_url: "", url: null }]);
                }}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Partner Ekle
              </Button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Ana sayfada gösterilecek partner logolarını buradan yönetebilirsiniz. Logo ve yönlendirme URL'si yeterlidir.
            </p>

            {partners.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg bg-white/5">
                <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Henüz partner eklenmedi</p>
                <Button
                  onClick={() => {
                    setPartners([{ logo_url: "", url: null }]);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Partneri Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {partners.map((partner, index) => {
                  const handlePartnerLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, partnerIndex: number) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith('image/')) {
                      alert("Lütfen bir resim dosyası seçin.");
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
                      return;
                    }

                    try {
                      setUploading(true);
                      setUploadingBanner(`partner_${partnerIndex}`);

                      const fileExt = file.name.split('.').pop();
                      const fileName = `partner-${Date.now()}-${partnerIndex}.${fileExt}`;
                      const filePath = `partners/${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('banners')
                        .upload(filePath, file, {
                          cacheControl: '3600',
                          upsert: false
                        });

                      if (uploadError) {
                        console.error("Logo yüklenirken hata:", uploadError);
                        alert(uploadError.message || "Logo yüklenirken bir hata oluştu.");
                        return;
                      }

                      const { data } = supabase.storage
                        .from('banners')
                        .getPublicUrl(filePath);

                      if (data?.publicUrl) {
                        const updatedPartners = [...partners];
                        updatedPartners[partnerIndex].logo_url = data.publicUrl;
                        setPartners(updatedPartners);
                        alert("Logo başarıyla yüklendi!");
                      }
                    } catch (error: any) {
                      console.error("Logo yüklenirken hata:", error);
                      alert(error?.message || "Logo yüklenirken bir hata oluştu.");
                    } finally {
                      setUploading(false);
                      setUploadingBanner(null);
                      const ref = partnerFileInputRefs.current.get(partnerIndex);
                      if (ref) {
                        ref.value = '';
                      }
                    }
                  };

                  return (
                    <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-start gap-4">
                        {/* Logo Preview/Upload */}
                        <div className="flex-shrink-0">
                          {partner.logo_url ? (
                            <div className="relative">
                              <img
                                src={partner.logo_url}
                                alt={`Partner ${index + 1}`}
                                className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-white/5 p-2"
                              />
                              <button
                                onClick={() => {
                                  const updatedPartners = [...partners];
                                  updatedPartners[index].logo_url = "";
                                  setPartners(updatedPartners);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                                title="Logoyu Kaldır"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center bg-white/5">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <input
                            ref={(el) => {
                              if (el) {
                                partnerFileInputRefs.current.set(index, el);
                              } else {
                                partnerFileInputRefs.current.delete(index);
                              }
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePartnerLogoUpload(e, index)}
                            className="hidden"
                            id={`partner-logo-${index}`}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const ref = partnerFileInputRefs.current.get(index);
                              ref?.click();
                            }}
                            disabled={uploading && uploadingBanner === `partner_${index}`}
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            {uploading && uploadingBanner === `partner_${index}` ? (
                              "Yükleniyor..."
                            ) : (
                              <>
                                <Upload className="h-3 w-3 mr-1" />
                                Logo Yükle
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Partner Bilgileri */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Partner URL (Opsiyonel)</label>
                            <Input
                              value={partner.url || ""}
                              onChange={(e) => {
                                const updatedPartners = [...partners];
                                updatedPartners[index].url = e.target.value || null;
                                setPartners(updatedPartners);
                              }}
                              placeholder="https://example.com"
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          {partner.logo_url && (
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Logo URL</label>
                              <Input
                                value={partner.logo_url}
                                onChange={(e) => {
                                  const updatedPartners = [...partners];
                                  updatedPartners[index].logo_url = e.target.value;
                                  setPartners(updatedPartners);
                                }}
                                placeholder="Logo URL'si"
                                className="bg-white/5 border-white/20 text-white text-xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* Sil Butonu */}
                        <Button
                          type="button"
                          onClick={() => {
                            setPartners(partners.filter((_, i) => i !== index));
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sonuç Girme Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-md bg-[#131720] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Günün Maçı - Sonuçlandır</DialogTitle>
            {selectedMatchForResult && (
              <DialogDescription asChild>
                <div className="mt-2">
                  <div className="text-sm text-white">
                    {selectedMatchForResult.team_a} vs {selectedMatchForResult.team_b}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Maç Tipi: {selectedMatchForResult.prediction_type === "winner" ? "Kazanan" : "Alt/Üst"}
                  </div>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMatchForResult && (
              <>
                {selectedMatchForResult.prediction_type === "winner" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Kazanan Takım
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedResult("A");
                          // Skorları sıfırla
                          if (!selectedMatchForResult.score_a && !selectedMatchForResult.score_b) {
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
                          {selectedMatchForResult.team_a}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatchForResult.difficulty_score_a}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedResult("B");
                          // Skorları sıfırla
                          if (!selectedMatchForResult.score_a && !selectedMatchForResult.score_b) {
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
                          {selectedMatchForResult.team_b}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatchForResult.difficulty_score_b}
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
                          ÜST ({selectedMatchForResult.option_a_label})
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatchForResult.difficulty_score_a}
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
                          ALT ({selectedMatchForResult.option_b_label})
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Puan: {selectedMatchForResult.difficulty_score_b}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Skor Girişi - Sadece winner maçları için göster */}
                {selectedMatchForResult.prediction_type === "winner" && selectedResult && selectedResult !== "CANCELLED" && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="text-sm font-medium text-white block">
                      Skor (Opsiyonel)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          {selectedMatchForResult.team_a} Skoru
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
                          {selectedMatchForResult.team_b} Skoru
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
              onClick={handleSaveMatchResult}
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
