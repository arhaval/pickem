"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Trophy, Upload, Image as ImageIcon, X } from "lucide-react";
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
import TeamLogo from "@/components/team-logo";

interface TeamRanking {
  id?: number;
  rank: number;
  team_name: string;
  hltv_rank: number;
  vrs_rank?: number | null;
  change: number; // +1, -2, 0 gibi
  points?: number;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function AdminTurkishTeams() {
  const [teams, setTeams] = useState<TeamRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<TeamRanking>({
    rank: 1,
    team_name: "",
    hltv_rank: 0,
    vrs_rank: null,
    change: 0,
    points: 0,
    logo_url: null,
  });

  // Takımları yükle
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("turkish_teams_ranking")
        .select("*")
        .order("rank", { ascending: true });

      if (error) {
        // Tablo yoksa oluştur
        if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
          console.warn("turkish_teams_ranking tablosu bulunamadı. Lütfen Supabase'de tabloyu oluşturun.");
          setTeams([]);
        } else {
          throw error;
        }
      } else {
        setTeams(data || []);
      }
    } catch (error) {
      console.error("Takımlar yüklenirken hata:", error);
      alert("Takımlar yüklenirken bir hata oluştu. Lütfen konsolu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Dosya boyutu 2MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `turkish-team-${Date.now()}.${fileExt}`;
      const filePath = `teams/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teams')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Logo yüklenirken hata:", JSON.stringify(uploadError, null, 2));
        
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("not found")) {
          alert(
            "Teams bucket bulunamadı!\n\n" +
            "Lütfen Supabase Dashboard'dan bucket oluşturun:\n" +
            "1. Storage sekmesine gidin\n" +
            "2. 'Create a new bucket' butonuna tıklayın\n" +
            "3. Name: 'teams'\n" +
            "4. Public bucket: Evet\n" +
            "5. Create bucket\n\n" +
            "Veya logo URL'i ile devam edebilirsiniz."
          );
        } else {
          alert(uploadError.message || "Logo yüklenirken bir hata oluştu.");
        }
        return;
      }

      const { data } = supabase.storage
        .from('teams')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setFormData({ ...formData, logo_url: data.publicUrl });
        alert("Logo başarıyla yüklendi!");
      }
    } catch (error: any) {
      console.error("Logo yüklenirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Logo yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo_url: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (formData.id) {
        // Güncelle
        const { error } = await (supabase as any)
          .from("turkish_teams_ranking")
          .update({
            rank: formData.rank,
            team_name: formData.team_name,
            hltv_rank: formData.hltv_rank,
            vrs_rank: formData.vrs_rank || null,
            change: formData.change,
            points: formData.points || 0,
            logo_url: formData.logo_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", formData.id);

        if (error) throw error;
      } else {
        // Yeni ekle
        const { error } = await (supabase as any)
          .from("turkish_teams_ranking")
          .insert({
            rank: formData.rank,
            team_name: formData.team_name,
            hltv_rank: formData.hltv_rank,
            vrs_rank: formData.vrs_rank || null,
            change: formData.change,
            points: formData.points || 0,
            logo_url: formData.logo_url || null,
          });

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setFormData({
        rank: 1,
        team_name: "",
        hltv_rank: 0,
        vrs_rank: null,
        change: 0,
        points: 0,
        logo_url: null,
      });
      loadTeams();
      alert("Takım başarıyla kaydedildi!");
    } catch (error: any) {
      console.error("Takım kaydedilirken hata:", error);
      alert(error?.message || "Takım kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu takımı silmek istediğinize emin misiniz?")) return;

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from("turkish_teams_ranking")
        .delete()
        .eq("id", id);

      if (error) throw error;
      loadTeams();
      alert("Takım başarıyla silindi!");
    } catch (error: any) {
      console.error("Takım silinirken hata:", error);
      alert(error?.message || "Takım silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (team: TeamRanking) => {
    setFormData(team);
    setIsDialogOpen(true);
  };

  const moveRank = async (id: number, direction: "up" | "down") => {
    const team = teams.find((t) => t.id === id);
    if (!team) return;

    const newRank = direction === "up" ? team.rank - 1 : team.rank + 1;
    const otherTeam = teams.find((t) => t.rank === newRank);

    if (!otherTeam) return;

    try {
      // İki takımın sıralamasını değiştir
      const { error: error1 } = await (supabase as any)
        .from("turkish_teams_ranking")
        .update({ rank: newRank, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error1) throw error1;

      const { error: error2 } = await (supabase as any)
        .from("turkish_teams_ranking")
        .update({ rank: team.rank, updated_at: new Date().toISOString() })
        .eq("id", otherTeam.id);

      if (error2) throw error2;

      loadTeams();
    } catch (error: any) {
      console.error("Sıralama değiştirilirken hata:", error);
      alert(error?.message || "Sıralama değiştirilirken bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Türk Takımları Sıralaması</h1>
            <p className="text-gray-400">Türk takımlarının sıralamasını düzenleyin</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setFormData({
                    rank: teams.length > 0 ? Math.max(...teams.map((t) => t.rank)) + 1 : 1,
                    team_name: "",
                    hltv_rank: 0,
                    vrs_rank: null,
                    change: 0,
                    points: 0,
                    logo_url: null,
                  });
                }}
                className="bg-[#B84DC7] hover:bg-[#A03DB7] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Takım Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#131720] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Takım Ekle/Düzenle</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Türk takımı bilgilerini girin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Sıralama
                    </label>
                    <Input
                      type="number"
                      value={formData.rank}
                      onChange={(e) =>
                        setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })
                      }
                      className="bg-[#1a1f2e] border-white/20 text-white"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Takım Adı
                    </label>
                    <Input
                      type="text"
                      value={formData.team_name}
                      onChange={(e) =>
                        setFormData({ ...formData, team_name: e.target.value })
                      }
                      className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                      placeholder="EF"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      HLTV Sıralaması
                    </label>
                    <Input
                      type="number"
                      value={formData.hltv_rank}
                      onChange={(e) =>
                        setFormData({ ...formData, hltv_rank: parseInt(e.target.value) || 0 })
                      }
                      className="bg-[#1a1f2e] border-white/20 text-white"
                      placeholder="8"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      VRS Sıralaması (Opsiyonel)
                    </label>
                    <Input
                      type="number"
                      value={formData.vrs_rank || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, vrs_rank: e.target.value ? parseInt(e.target.value) : null })
                      }
                      className="bg-[#1a1f2e] border-white/20 text-white"
                      placeholder="12"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Değişim (+/-)
                    </label>
                    <Input
                      type="number"
                      value={formData.change}
                      onChange={(e) =>
                        setFormData({ ...formData, change: parseInt(e.target.value) || 0 })
                      }
                      className="bg-[#1a1f2e] border-white/20 text-white"
                      placeholder="+2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Puan (Opsiyonel)
                    </label>
                    <Input
                      type="number"
                      value={formData.points || 0}
                      onChange={(e) =>
                        setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
                      }
                      className="bg-[#1a1f2e] border-white/20 text-white"
                      placeholder="680"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Takım Logosu
                    </label>
                    {formData.logo_url ? (
                      <div className="space-y-2">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20">
                          <img
                            src={formData.logo_url}
                            alt={formData.team_name || "Logo"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {uploading ? (
                              <>
                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                Yükleniyor...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Değiştir
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveLogo}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Kaldır
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                          {uploading ? (
                            <>
                              <Upload className="h-4 w-4 mr-2 animate-spin" />
                              Yükleniyor...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Logo Yükle
                            </>
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Veya logo URL'i girebilirsiniz
                        </p>
                        <Input
                          type="url"
                          value={formData.logo_url || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, logo_url: e.target.value || null })
                          }
                          className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400 mt-2"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#B84DC7] hover:bg-[#A03DB7] text-white"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-[#131720] rounded-lg border border-white/10 p-6">
          {teams.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>Henüz takım eklenmemiş.</p>
              <p className="text-sm mt-2">
                Not: Önce Supabase'de <code className="bg-black/30 px-2 py-1 rounded">turkish_teams_ranking</code> tablosunu oluşturmanız gerekiyor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/5 bg-black/30 hover:bg-black/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveRank(team.id!, "up")}
                      disabled={team.rank === 1}
                      className="h-8 w-8 p-0 text-white hover:bg-white/10"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveRank(team.id!, "down")}
                      disabled={team.rank === teams.length}
                      className="h-8 w-8 p-0 text-white hover:bg-white/10"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                    {team.rank === 1 ? (
                      <Trophy className="h-6 w-6 text-[#B84DC7]" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">#{team.rank}</span>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <TeamLogo teamName={team.team_name} logoUrl={team.logo_url} size={48} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{team.team_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">HLTV #{team.hltv_rank}</span>
                      {team.vrs_rank && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-400">VRS #{team.vrs_rank}</span>
                        </>
                      )}
                      {team.points && team.points > 0 && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-400">{team.points} puan</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold ${
                      team.change > 0
                        ? "bg-green-500/10 text-green-400"
                        : team.change < 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {team.change > 0 ? `+${team.change}` : team.change === 0 ? "-" : team.change}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(team)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(team.id!)}
                      disabled={isDeleting === team.id}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      {isDeleting === team.id ? "Siliniyor..." : "Sil"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400">
            <strong>Not:</strong> Bu sayfayı kullanmak için Supabase'de <code className="bg-black/30 px-2 py-1 rounded">turkish_teams_ranking</code> tablosunu oluşturmanız gerekiyor.
          </p>
          <p className="text-xs text-yellow-300/70 mt-2">
            Tablo yapısı: <code className="bg-black/30 px-2 py-1 rounded">id (serial), rank (integer), team_name (text), hltv_rank (integer), change (integer), points (integer, nullable), created_at (timestamp), updated_at (timestamp)</code>
          </p>
        </div>
      </div>
    </div>
  );
}

