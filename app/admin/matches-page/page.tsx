"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Clock, Loader2, Trophy } from "lucide-react";
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

interface DisplayMatch {
  id: string;
  team_a: string;
  team_b: string;
  match_time: string;
  match_date: string | null;
  tournament_name: string | null;
  tournament_stage: string | null;
  match_format: string | null;
  hltv_ranking_a: number | null;
  hltv_ranking_b: number | null;
  hltv_url: string | null;
  stream_links: string | null;
  winner: string | null;
  score_a?: number | null;
  score_b?: number | null;
  created_at: string;
}

export default function AdminMatchesPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<DisplayMatch | null>(null);
  const [selectedResult, setSelectedResult] = useState<string>("");
  const [selectedScoreA, setSelectedScoreA] = useState<string>("");
  const [selectedScoreB, setSelectedScoreB] = useState<string>("");
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [formData, setFormData] = useState({
    team_a_id: "",
    team_b_id: "",
    match_date: "",
    match_time: "",
    tournament_name: "",
    tournament_stage: "",
    match_format: "",
    hltv_ranking_a: "",
    hltv_ranking_b: "",
    hltv_url: "",
    stream_twitch_url: "",
    stream_twitch_channel: "",
    stream_youtube_url: "",
    stream_youtube_channel: "",
    stream_kick_url: "",
    stream_kick_channel: "",
  });

  useEffect(() => {
    loadData();
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
        alert("Takımlar yüklenirken bir hata oluştu.");
        setLoading(false);
        return;
      }
      setTeams(teamsData || []);

      // Sadece görüntüleme maçlarını yükle
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("is_display_match", true)
        .order("match_date", { ascending: false })
        .order("match_time", { ascending: false });

      if (matchesError) {
        console.error("Maçlar yüklenirken hata:", matchesError);
        alert("Maçlar yüklenirken bir hata oluştu.");
        setLoading(false);
        return;
      }
      setMatches(matchesData || []);
    } catch (error: any) {
      console.error("Veri yüklenirken hata:", error);
      alert("Veri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getTeamById = (teamId: string) => {
    return teams.find((t) => t.id.toString() === teamId);
  };

  const resetForm = () => {
    setFormData({
      team_a_id: "",
      team_b_id: "",
      match_date: "",
      match_time: "",
      tournament_name: "",
      tournament_stage: "",
      match_format: "",
      hltv_ranking_a: "",
      hltv_ranking_b: "",
      hltv_url: "",
      stream_twitch_url: "",
      stream_twitch_channel: "",
      stream_youtube_url: "",
      stream_youtube_channel: "",
      stream_kick_url: "",
      stream_kick_channel: "",
    });
    setIsEditMode(false);
    setEditingMatchId(null);
  };

  const handleSaveMatch = async () => {
    if (!formData.team_a_id || !formData.team_b_id || !formData.match_date || !formData.match_time) {
      alert("Lütfen tüm zorunlu alanları doldurun.");
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
      // Stream links JSON oluştur
      const streamLinks: any = {};
      if (formData.stream_twitch_url && formData.stream_twitch_channel) {
        streamLinks.twitch = {
          url: formData.stream_twitch_url,
          channelName: formData.stream_twitch_channel,
        };
      }
      if (formData.stream_youtube_url && formData.stream_youtube_channel) {
        streamLinks.youtube = {
          url: formData.stream_youtube_url,
          channelName: formData.stream_youtube_channel,
        };
      }
      if (formData.stream_kick_url && formData.stream_kick_channel) {
        streamLinks.kick = {
          url: formData.stream_kick_url,
          channelName: formData.stream_kick_channel,
        };
      }

      const matchData: Record<string, any> = {
        team_a: teamA.name,
        team_b: teamB.name,
        match_date: formData.match_date,
        match_time: formData.match_time,
        tournament_name: formData.tournament_name || null,
        difficulty_score_a: 3,
        difficulty_score_b: 5,
        prediction_type: "winner",
        option_a_label: teamA.name,
        option_b_label: teamB.name,
        is_display_match: true,
        stream_links: Object.keys(streamLinks).length > 0 ? JSON.stringify(streamLinks) : null,
      };

      let data, error;
      if (isEditMode && editingMatchId) {
        const result = await (supabase as any)
          .from("matches")
          .update(matchData)
          .eq("id", editingMatchId);
        data = result.data;
        error = result.error;
      } else {
        const result = await (supabase as any).from("matches").insert(matchData);
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Maç kaydedilirken hata:", error);
        alert(error.message || "Maç kaydedilirken bir hata oluştu.");
        return;
      }

      alert(isEditMode ? "Maç başarıyla güncellendi!" : "Maç başarıyla eklendi!");
      resetForm();
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Maç kaydedilirken hata:", error);
      alert(error?.message || "Maç kaydedilirken bir hata oluştu.");
    }
  };

  const handleEditMatch = (match: DisplayMatch) => {
    const teamA = teams.find(t => t.name === match.team_a);
    const teamB = teams.find(t => t.name === match.team_b);
    
    let streamLinks: any = {};
    if (match.stream_links) {
      try {
        streamLinks = typeof match.stream_links === 'string' 
          ? JSON.parse(match.stream_links) 
          : match.stream_links;
      } catch (e) {
        console.error("Stream links parse hatası:", e);
      }
    }

    setFormData({
      team_a_id: teamA?.id.toString() || "",
      team_b_id: teamB?.id.toString() || "",
      match_date: match.match_date || "",
      match_time: match.match_time || "",
      tournament_name: match.tournament_name || "",
      tournament_stage: match.tournament_stage || "",
      match_format: match.match_format || "",
      hltv_ranking_a: match.hltv_ranking_a?.toString() || "",
      hltv_ranking_b: match.hltv_ranking_b?.toString() || "",
      hltv_url: match.hltv_url || "",
      stream_twitch_url: streamLinks.twitch?.url || "",
      stream_twitch_channel: streamLinks.twitch?.channelName || "",
      stream_youtube_url: streamLinks.youtube?.url || "",
      stream_youtube_channel: streamLinks.youtube?.channelName || "",
      stream_kick_url: streamLinks.kick?.url || "",
      stream_kick_channel: streamLinks.kick?.channelName || "",
    });
    
    setIsEditMode(true);
    setEditingMatchId(match.id);
    setIsDialogOpen(true);
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Bu maçı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Maç silinirken hata:", error);
        alert(error.message || "Maç silinirken bir hata oluştu.");
        return;
      }

      alert("Maç başarıyla silindi!");
      loadData();
    } catch (error: any) {
      console.error("Maç silinirken hata:", error);
      alert(error?.message || "Maç silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenResultDialog = (match: DisplayMatch) => {
    setSelectedMatch(match);
    setSelectedResult(match.winner || "");
    setSelectedScoreA(match.score_a?.toString() || "");
    setSelectedScoreB(match.score_b?.toString() || "");
    setIsResultDialogOpen(true);
  };

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
          alert("Maç güncellenirken hata: " + matchError.message);
          return;
        }

        alert("Maç iptal/berabere olarak işaretlendi.");
        setIsResultDialogOpen(false);
        setSelectedMatch(null);
        setSelectedResult("");
        setSelectedScoreA("");
        setSelectedScoreB("");
        await loadData();
        return;
      }

      // Skorları parse et
      const scoreA = selectedScoreA ? parseInt(selectedScoreA, 10) : null;
      const scoreB = selectedScoreB ? parseInt(selectedScoreB, 10) : null;

      // Maçı güncelle
      const updateData: any = {
        winner: selectedResult,
      };

      // Skorları ekle
      if (scoreA !== null) updateData.score_a = scoreA;
      if (scoreB !== null) updateData.score_b = scoreB;

      const { error: matchError } = await (supabase as any)
        .from("matches")
        .update(updateData)
        .eq("id", selectedMatch.id);

      if (matchError) {
        alert("Maç güncellenirken hata: " + matchError.message);
        return;
      }

      alert("Maç sonucu başarıyla kaydedildi!");
      setIsResultDialogOpen(false);
      setSelectedMatch(null);
      setSelectedResult("");
      setSelectedScoreA("");
      setSelectedScoreB("");
      await loadData();
    } catch (error: any) {
      console.error("Sonuç kaydedilirken hata:", error);
      alert(error?.message || "Sonuç kaydedilirken bir hata oluştu.");
    } finally {
      setIsSavingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Maçlar Sayfası Yönetimi</h1>
          <p className="text-gray-400">
            Maçlar sayfasında gösterilecek maçları buradan yönetebilirsiniz.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Maç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Maç Düzenle" : "Yeni Maç Ekle"}</DialogTitle>
              <DialogDescription>
                Maç bilgilerini girin. Bu maçlar sadece maçlar sayfasında görüntülenir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Takım Seçimleri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım A *
                  </label>
                  <select
                    value={formData.team_a_id}
                    onChange={(e) => setFormData({ ...formData, team_a_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50"
                  >
                    <option value="">Takım seçin...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id.toString()}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım B *
                  </label>
                  <select
                    value={formData.team_b_id}
                    onChange={(e) => setFormData({ ...formData, team_b_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50"
                  >
                    <option value="">Takım seçin...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id.toString()}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tarih ve Saat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Tarih *
                  </label>
                  <Input
                    type="date"
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Saat *
                  </label>
                  <Input
                    type="time"
                    value={formData.match_time}
                    onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Turnuva Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Turnuva İsmi
                  </label>
                  <Input
                    type="text"
                    value={formData.tournament_name}
                    onChange={(e) => setFormData({ ...formData, tournament_name: e.target.value })}
                    placeholder="Örn: BLAST Premier"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Turnuva Aşaması
                  </label>
                  <Input
                    type="text"
                    value={formData.tournament_stage}
                    onChange={(e) => setFormData({ ...formData, tournament_stage: e.target.value })}
                    placeholder="Örn: Büyük Final"
                  />
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Maç Formatı
                </label>
                <select
                  value={formData.match_format}
                  onChange={(e) => setFormData({ ...formData, match_format: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D69ADE]/50"
                >
                  <option value="">Format seçin...</option>
                  <option value="BO1">BO1</option>
                  <option value="BO3">BO3</option>
                  <option value="BO5">BO5</option>
                </select>
              </div>

              {/* HLTV Bilgileri */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım A HLTV Sıralaması
                  </label>
                  <Input
                    type="number"
                    value={formData.hltv_ranking_a}
                    onChange={(e) => setFormData({ ...formData, hltv_ranking_a: e.target.value })}
                    placeholder="Örn: 8"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Takım B HLTV Sıralaması
                  </label>
                  <Input
                    type="number"
                    value={formData.hltv_ranking_b}
                    onChange={(e) => setFormData({ ...formData, hltv_ranking_b: e.target.value })}
                    placeholder="Örn: 15"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    HLTV Linki
                  </label>
                  <Input
                    type="url"
                    value={formData.hltv_url}
                    onChange={(e) => setFormData({ ...formData, hltv_url: e.target.value })}
                    placeholder="https://www.hltv.org/..."
                  />
                </div>
              </div>

              {/* Yayın Linkleri */}
              <div className="space-y-4 border-t border-white/10 pt-4">
                <h3 className="text-md font-semibold text-white">Yayın Linkleri</h3>
                
                {/* Twitch */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Twitch URL
                    </label>
                    <Input
                      type="url"
                      value={formData.stream_twitch_url}
                      onChange={(e) => setFormData({ ...formData, stream_twitch_url: e.target.value })}
                      placeholder="https://www.twitch.tv/..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Twitch Kanal Adı
                    </label>
                    <Input
                      type="text"
                      value={formData.stream_twitch_channel}
                      onChange={(e) => setFormData({ ...formData, stream_twitch_channel: e.target.value })}
                      placeholder="Örn: esl_cs2"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      YouTube URL
                    </label>
                    <Input
                      type="url"
                      value={formData.stream_youtube_url}
                      onChange={(e) => setFormData({ ...formData, stream_youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      YouTube Kanal Adı
                    </label>
                    <Input
                      type="text"
                      value={formData.stream_youtube_channel}
                      onChange={(e) => setFormData({ ...formData, stream_youtube_channel: e.target.value })}
                      placeholder="Örn: ESL CS"
                    />
                  </div>
                </div>

                {/* Kick */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Kick URL
                    </label>
                    <Input
                      type="url"
                      value={formData.stream_kick_url}
                      onChange={(e) => setFormData({ ...formData, stream_kick_url: e.target.value })}
                      placeholder="https://kick.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Kick Kanal Adı
                    </label>
                    <Input
                      type="text"
                      value={formData.stream_kick_channel}
                      onChange={(e) => setFormData({ ...formData, stream_kick_channel: e.target.value })}
                      placeholder="Örn: eslcs"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button
                className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
                onClick={handleSaveMatch}
              >
                {isEditMode ? "Güncelle" : "Kaydet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Maçlar Listesi */}
      <div className="bg-[#131720] border border-white/10 rounded-lg overflow-hidden">
        {matches.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Henüz maç eklenmemiş. İlk maçı eklemek için yukarıdaki butona tıklayın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e1a] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Tarih/Saat</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Maç</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Turnuva</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">HLTV</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Yayın</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matches.map((match) => {
                  const teamA = teams.find(t => t.name === match.team_a);
                  const teamB = teams.find(t => t.name === match.team_b);
                  let streamLinks: any = {};
                  if (match.stream_links) {
                    try {
                      streamLinks = typeof match.stream_links === 'string' 
                        ? JSON.parse(match.stream_links) 
                        : match.stream_links;
                    } catch (e) {}
                  }
                  
                  return (
                    <tr key={match.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{match.match_date || "-"}</div>
                        <div className="text-xs text-gray-500">{match.match_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {teamA && (
                            <div className="relative w-6 h-6 rounded overflow-hidden border border-white/10">
                              <Image src={teamA.logo_url} alt={teamA.name} fill className="object-contain p-0.5" unoptimized />
                            </div>
                          )}
                          <span className="text-sm text-white">{match.team_a}</span>
                          <span className="text-gray-500">vs</span>
                          <span className="text-sm text-white">{match.team_b}</span>
                          {teamB && (
                            <div className="relative w-6 h-6 rounded overflow-hidden border border-white/10">
                              <Image src={teamB.logo_url} alt={teamB.name} fill className="object-contain p-0.5" unoptimized />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{match.tournament_name || "-"}</div>
                        {match.tournament_stage && (
                          <div className="text-xs text-gray-500">{match.tournament_stage}</div>
                        )}
                        {match.match_format && (
                          <div className="text-xs text-[#B84DC7]">{match.match_format}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {match.hltv_ranking_a && match.hltv_ranking_b ? (
                          <div className="text-sm text-gray-300">
                            #{match.hltv_ranking_a} vs #{match.hltv_ranking_b}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {streamLinks.twitch && <span className="text-xs text-[#9146FF]">T</span>}
                          {streamLinks.youtube && <span className="text-xs text-[#FF0000]">Y</span>}
                          {streamLinks.kick && <span className="text-xs text-[#53FC18]">K</span>}
                          {!streamLinks.twitch && !streamLinks.youtube && !streamLinks.kick && (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleDeleteMatch(match.id)}
                            disabled={isDeleting === match.id}
                          >
                            {isDeleting === match.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
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
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMatch && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Kazanan Takım
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedResult("A");
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
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResult("B");
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
                    </button>
                  </div>
                </div>

                {/* Skor Girişi */}
                {selectedResult && selectedResult !== "CANCELLED" && (
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
