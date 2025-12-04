"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Trophy, CheckCircle2, XCircle, Award, RotateCcw, Medal } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [isEndSeasonDialogOpen, setIsEndSeasonDialogOpen] = useState(false);
  const [endingSeason, setEndingSeason] = useState<Season | null>(null);
  const [seasonLeaderboard, setSeasonLeaderboard] = useState<any[]>([]);
  const [isEndingSeason, setIsEndingSeason] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sezonlar yüklenirken hata:", error);
        alert(error.message || "Sezonlar yüklenirken bir hata oluştu.");
        return;
      }

      setSeasons(data || []);
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
      alert("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
      is_active: false,
    });
    setIsEditMode(false);
    setEditingSeasonId(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditSeason = (season: Season) => {
    setFormData({
      name: season.name,
      start_date: season.start_date.split('T')[0], // YYYY-MM-DD formatına çevir
      end_date: season.end_date.split('T')[0],
      is_active: season.is_active,
    });
    setIsEditMode(true);
    setEditingSeasonId(season.id);
    setIsDialogOpen(true);
  };

  const handleSaveSeason = async () => {
    // Validasyon
    if (!formData.name.trim()) {
      alert("Sezon adı gereklidir.");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      alert("Başlangıç ve bitiş tarihleri gereklidir.");
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      alert("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
      return;
    }

    try {
      if (isEditMode && editingSeasonId) {
        // Güncelleme
        // Eğer bu sezon aktif yapılıyorsa, diğer sezonları pasif yap
        if (formData.is_active) {
          await (supabase as any)
            .from("seasons")
            .update({ is_active: false })
            .neq("id", editingSeasonId);
        }

        const { error } = await (supabase as any)
          .from("seasons")
          .update({
            name: formData.name.trim(),
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_active: formData.is_active,
          })
          .eq("id", editingSeasonId);

        if (error) throw error;
        alert("Sezon başarıyla güncellendi!");
      } else {
        // Yeni sezon ekleme
        // Eğer bu sezon aktif yapılıyorsa, diğer sezonları pasif yap
        if (formData.is_active) {
          await (supabase as any)
            .from("seasons")
            .update({ is_active: false });
        }

        const { error } = await (supabase as any).from("seasons").insert({
          name: formData.name.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: formData.is_active,
        });

        if (error) throw error;
        alert("Sezon başarıyla eklendi!");
      }

      setIsDialogOpen(false);
      resetForm();
      await loadSeasons();
    } catch (error: any) {
      console.error("Sezon kaydedilirken hata:", error);
      alert(error.message || "Sezon kaydedilirken bir hata oluştu.");
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    if (!confirm("Bu sezonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    try {
      // Sezona ait maç var mı kontrol et
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("id")
        .eq("season_id", seasonId)
        .limit(1);

      if (matchesError) {
        throw matchesError;
      }

      if (matches && matches.length > 0) {
        alert("Bu sezona ait maçlar bulunmaktadır. Önce maçları silmeniz veya başka bir sezona taşımanız gerekmektedir.");
        return;
      }

      const { error } = await supabase
        .from("seasons")
        .delete()
        .eq("id", seasonId);

      if (error) throw error;
      alert("Sezon başarıyla silindi!");
      await loadSeasons();
    } catch (error: any) {
      console.error("Sezon silinirken hata:", error);
      alert(error.message || "Sezon silinirken bir hata oluştu.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getActiveSeason = () => {
    return seasons.find((s) => s.is_active);
  };

  const handleEndSeason = async (season: Season) => {
    setEndingSeason(season);
    setIsEndSeasonDialogOpen(true);

    // Sezon liderlik tablosunu yükle
    try {
      const { data, error } = await supabase
        .from("season_points")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("season_id", season.id)
        .order("total_points", { ascending: false })
        .order("correct_predictions", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Liderlik tablosu yüklenirken hata:", error);
        alert("Liderlik tablosu yüklenirken bir hata oluştu.");
        return;
      }

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles || { username: null, avatar_url: null },
      }));

      setSeasonLeaderboard(formattedData);
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
    }
  };

  const confirmEndSeason = async () => {
    if (!endingSeason) return;

    if (!confirm(
      `DİKKAT: "${endingSeason.name}" sezonunu bitirmek üzeresiniz!\n\n` +
      `Bu işlem:\n` +
      `- Sezonu pasif yapacak\n` +
      `- Tüm sezon puanlarını sıfırlayacak (season_points tablosu)\n` +
      `- Yeni sezon için hazır hale getirecek\n\n` +
      `Bu işlem geri alınamaz! Devam etmek istiyor musunuz?`
    )) {
      return;
    }

    try {
      setIsEndingSeason(true);

      // 1. Sezonu pasif yap
      await (supabase as any)
        .from("seasons")
        .update({ is_active: false })
        .eq("id", endingSeason.id);

      // 2. Tüm sezon puanlarını sıfırla (season_points tablosundan bu sezona ait tüm kayıtları sil)
      const { error: deleteError } = await supabase
        .from("season_points")
        .delete()
        .eq("season_id", endingSeason.id);

      if (deleteError) {
        throw deleteError;
      }

      alert(
        `"${endingSeason.name}" sezonu başarıyla bitirildi!\n\n` +
        `- Sezon pasif yapıldı\n` +
        `- Tüm puanlar sıfırlandı\n` +
        `- Yeni sezon oluşturup aktif yapabilirsiniz`
      );

      setIsEndSeasonDialogOpen(false);
      setEndingSeason(null);
      setSeasonLeaderboard([]);
      await loadSeasons();
    } catch (error: any) {
      console.error("Sezon bitirilirken hata:", error);
      alert(error.message || "Sezon bitirilirken bir hata oluştu.");
    } finally {
      setIsEndingSeason(false);
    }
  };

  const activeSeason = getActiveSeason();

  return (
    <div className="space-y-6 p-6">
      {/* Başlık ve İstatistikler */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sezon Yönetimi</h1>
          <p className="text-gray-400 mt-1">Sezonları oluşturun, düzenleyin ve yönetin</p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-gradient-to-r from-[#D69ADE] to-[#B84DC7]">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sezon
        </Button>
      </div>

      {/* Aktif Sezon Bilgisi */}
      {activeSeason && (
        <div className="bg-gradient-to-r from-[#D69ADE]/20 to-[#B84DC7]/20 border border-[#D69ADE]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#B84DC7]" />
            <div>
              <p className="text-sm text-gray-400">Aktif Sezon</p>
              <p className="text-lg font-bold text-white">{activeSeason.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(activeSeason.start_date)} - {formatDate(activeSeason.end_date)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sezonlar Listesi */}
      <div className="bg-[#131720] rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : seasons.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Henüz sezon eklenmemiş. İlk sezonu oluşturmak için "Yeni Sezon" butonuna tıklayın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Sezon Adı</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Başlangıç</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Bitiş</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Durum</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((season) => (
                  <tr
                    key={season.id}
                    className={cn(
                      "border-b border-white/5 hover:bg-white/5 transition-colors",
                      season.is_active && "bg-[#D69ADE]/5"
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {season.is_active && (
                          <Trophy className="h-4 w-4 text-[#B84DC7]" />
                        )}
                        <span className="font-medium text-white">{season.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(season.start_date)}</td>
                    <td className="p-4 text-gray-300">{formatDate(season.end_date)}</td>
                    <td className="p-4">
                      {season.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {season.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEndSeason(season)}
                            className="text-orange-400 hover:text-orange-300"
                            title="Sezonu Bitir (Ödül dağıtımı ve puan sıfırlama)"
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSeason(season)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSeason(season.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sezon Ekleme/Düzenleme Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-[#131720] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isEditMode ? "Sezon Düzenle" : "Yeni Sezon Ekle"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditMode
                ? "Sezon bilgilerini güncelleyin."
                : "Yeni bir sezon oluşturun. Sezon adı, başlangıç ve bitiş tarihlerini belirleyin."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sezon Adı <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: 2024 Kış Sezonu"
                className="bg-[#0a0e1a] border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Başlangıç Tarihi <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-[#0a0e1a] border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bitiş Tarihi <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-[#0a0e1a] border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#0a0e1a] text-[#B84DC7] focus:ring-[#B84DC7]"
              />
              <label htmlFor="is_active" className="text-sm text-gray-300">
                Bu sezonu aktif olarak işaretle (Aktif sezon yapıldığında diğer sezonlar otomatik pasif olur)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/10 text-gray-300"
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveSeason}
              className="bg-gradient-to-r from-[#D69ADE] to-[#B84DC7]"
            >
              {isEditMode ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sezon Bitirme Dialog */}
      <Dialog open={isEndSeasonDialogOpen} onOpenChange={setIsEndSeasonDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[#131720] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#B84DC7]" />
              Sezonu Bitir: {endingSeason?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Sezon bitişinde ödül dağıtımı yapılacak ve puanlar sıfırlanacak. Liderlik tablosu aşağıda gösterilmektedir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* İlk 3 Özel Gösterim */}
            {seasonLeaderboard.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-b from-[#D69ADE]/10 to-transparent border border-white/10 rounded-lg">
                {/* 2. Sıra */}
                {seasonLeaderboard[1] && (
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-400/30">
                    <Medal className="h-10 w-10 text-gray-300 mb-2" />
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-white mb-1">
                        {seasonLeaderboard[1].profiles.username || "İsimsiz"}
                      </h3>
                      <p className="text-xl font-bold text-gray-300">
                        {seasonLeaderboard[1].total_points} puan
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {seasonLeaderboard[1].correct_predictions} / {seasonLeaderboard[1].total_predictions} doğru
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Sıra */}
                {seasonLeaderboard[0] && (
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border-2 border-yellow-400/50 transform scale-105">
                    <Trophy className="h-12 w-12 text-yellow-400 mb-2" />
                    <div className="text-center">
                      <h3 className="text-base font-bold text-white mb-1">
                        {seasonLeaderboard[0].profiles.username || "İsimsiz"}
                      </h3>
                      <p className="text-2xl font-bold text-yellow-400">
                        {seasonLeaderboard[0].total_points} puan
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {seasonLeaderboard[0].correct_predictions} / {seasonLeaderboard[0].total_predictions} doğru
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Sıra */}
                {seasonLeaderboard[2] && (
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/30">
                    <Award className="h-10 w-10 text-amber-600 mb-2" />
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-white mb-1">
                        {seasonLeaderboard[2].profiles.username || "İsimsiz"}
                      </h3>
                      <p className="text-xl font-bold text-amber-500">
                        {seasonLeaderboard[2].total_points} puan
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {seasonLeaderboard[2].correct_predictions} / {seasonLeaderboard[2].total_predictions} doğru
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Liderlik Tablosu */}
            {seasonLeaderboard.length > 0 ? (
              <div className="bg-[#0a0e1a] rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold text-gray-300">Sıra</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-300">Kullanıcı</th>
                        <th className="text-right p-3 text-xs font-semibold text-gray-300">Puan</th>
                        <th className="text-right p-3 text-xs font-semibold text-gray-300">Doğru</th>
                        <th className="text-right p-3 text-xs font-semibold text-gray-300">Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonLeaderboard.slice(0, 10).map((entry, index) => {
                        const rank = index + 1;
                        return (
                          <tr
                            key={entry.user_id}
                            className={cn(
                              "border-b border-white/5 hover:bg-white/5 transition-colors",
                              rank <= 3 && "bg-gradient-to-r from-[#D69ADE]/5 to-transparent"
                            )}
                          >
                            <td className="p-3">
                              <span className="text-sm font-medium text-gray-400">#{rank}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium text-white">
                                {entry.profiles.username || "İsimsiz"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-sm font-bold text-[#B84DC7]">
                                {entry.total_points}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-xs text-gray-300">
                                {entry.correct_predictions}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-xs text-gray-300">
                                {entry.total_predictions}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Bu sezon için henüz puan kaydı yok.
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-400 font-medium mb-2">
                ⚠️ Önemli Uyarı
              </p>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                <li>Sezon bitirildiğinde tüm puanlar kalıcı olarak silinecek</li>
                <li>Bu işlem geri alınamaz</li>
                <li>Ödül dağıtımını manuel olarak yapmanız gerekmektedir</li>
                <li>Yeni sezon oluşturup aktif yaparak devam edebilirsiniz</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEndSeasonDialogOpen(false)}
              className="border-white/10 text-gray-300"
              disabled={isEndingSeason}
            >
              İptal
            </Button>
            <Button
              onClick={confirmEndSeason}
              disabled={isEndingSeason}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isEndingSeason ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Sezonu Bitir ve Puanları Sıfırla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

