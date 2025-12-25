"use client";

import { useState } from "react";
import { Download, Database, FileText, Calendar, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [backupData, setBackupData] = useState<any>(null);

  // CSV Export Fonksiyonu
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("Export edilecek veri bulunamadı.");
      return;
    }

    // CSV başlıkları
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");

    // CSV satırları
    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          // Değeri string'e çevir ve virgül/tırnak işaretlerini escape et
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // JSON objelerini string'e çevir
          if (typeof value === "object") {
            return JSON.stringify(value).replace(/"/g, '""');
          }
          // Virgül veya tırnak içeriyorsa tırnak içine al
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",");
    });

    // CSV içeriği
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    // BOM ekle (Excel için Türkçe karakter desteği)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    // İndirme
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export Fonksiyonu
  const exportToJSON = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("Export edilecek veri bulunamadı.");
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tüm Sonuçlanan Maçları Export Et
  const exportCompletedMatches = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);
      setExportStatus("Maçlar yükleniyor...");

      // Sonuçlanan maçları yükle (arşivlenmiş olsun veya olmasın)
      const { data: matches, error: matchesError } = await supabase
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
        .not("winner", "is", null)
        .order("match_date", { ascending: false })
        .order("match_time", { ascending: false });

      if (matchesError) {
        throw new Error("Maçlar yüklenirken hata: " + matchesError.message);
      }

      if (!matches || matches.length === 0) {
        alert("Sonuçlanan maç bulunamadı.");
        setIsExporting(false);
        return;
      }

      setExportStatus("Tahminler yükleniyor...");

      // Her maç için tahminleri yükle
      const matchesWithPredictions = await Promise.all(
        (matches || []).map(async (match: any) => {
          const { data: predictions } = await supabase
            .from("predictions")
            .select(`
              *,
              user:profiles!predictions_user_id_fkey (
                id,
                username,
                total_points
              )
            `)
            .eq("match_id", match.id);

          return {
            ...match,
            predictions: predictions || [],
            prediction_count: predictions?.length || 0,
          };
        })
      );

      setExportStatus("Export ediliyor...");

      if (format === "csv") {
        exportToCSV(matchesWithPredictions, "sonuclanan_maclar");
      } else {
        exportToJSON(matchesWithPredictions, "sonuclanan_maclar");
      }

      setExportStatus(`✅ ${matchesWithPredictions.length} maç başarıyla export edildi!`);
      setTimeout(() => setExportStatus(""), 5000);
    } catch (error: any) {
      setExportStatus(`❌ Hata: ${error.message}`);
      alert("Export sırasında hata: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Tüm Tahminleri Export Et
  const exportAllPredictions = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);
      setExportStatus("Tahminler yükleniyor...");

      const { data: predictions, error } = await supabase
        .from("predictions")
        .select(`
          *,
          match:matches!predictions_match_id_fkey (
            id,
            team_a_id,
            team_b_id,
            match_date,
            match_time,
            winner,
            difficulty_score_a,
            difficulty_score_b,
            tournament_name
          ),
          user:profiles!predictions_user_id_fkey (
            id,
            username,
            total_points
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Tahminler yüklenirken hata: " + error.message);
      }

      if (!predictions || predictions.length === 0) {
        alert("Tahmin bulunamadı.");
        setIsExporting(false);
        return;
      }

      setExportStatus("Export ediliyor...");

      if (format === "csv") {
        exportToCSV(predictions, "tum_tahminler");
      } else {
        exportToJSON(predictions, "tum_tahminler");
      }

      setExportStatus(`✅ ${predictions.length} tahmin başarıyla export edildi!`);
      setTimeout(() => setExportStatus(""), 5000);
    } catch (error: any) {
      setExportStatus(`❌ Hata: ${error.message}`);
      alert("Export sırasında hata: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Kullanıcı Puanlarını Export Et
  const exportUserPoints = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);
      setExportStatus("Kullanıcı puanları yükleniyor...");

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("total_points", { ascending: false });

      if (error) {
        throw new Error("Kullanıcılar yüklenirken hata: " + error.message);
      }

      if (!profiles || profiles.length === 0) {
        alert("Kullanıcı bulunamadı.");
        setIsExporting(false);
        return;
      }

      setExportStatus("Export ediliyor...");

      if (format === "csv") {
        exportToCSV(profiles, "kullanici_puanlari");
      } else {
        exportToJSON(profiles, "kullanici_puanlari");
      }

      setExportStatus(`✅ ${profiles.length} kullanıcı başarıyla export edildi!`);
      setTimeout(() => setExportStatus(""), 5000);
    } catch (error: any) {
      setExportStatus(`❌ Hata: ${error.message}`);
      alert("Export sırasında hata: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // TAM YEDEKLEME - Tüm Verileri Export Et
  const exportFullBackup = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);
      setExportStatus("Tam yedekleme başlatılıyor...");

      const backupData: any = {
        export_date: new Date().toISOString(),
        version: "1.0",
        data: {},
      };

      // 1. Üyeler (Profiles)
      setExportStatus("Üyeler yükleniyor...");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("total_points", { ascending: false });

      if (profilesError) {
        throw new Error("Üyeler yüklenirken hata: " + profilesError.message);
      }
      backupData.data.profiles = profiles || [];
      setExportStatus(`✅ ${profiles?.length || 0} üye yüklendi`);

      // 2. Maçlar
      setExportStatus("Maçlar yükleniyor...");
      const { data: matches, error: matchesError } = await supabase
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
        .order("match_date", { ascending: false })
        .order("match_time", { ascending: false });

      if (matchesError) {
        throw new Error("Maçlar yüklenirken hata: " + matchesError.message);
      }
      backupData.data.matches = matches || [];
      setExportStatus(`✅ ${matches?.length || 0} maç yüklendi`);

      // 3. Tahminler
      setExportStatus("Tahminler yükleniyor...");
      const { data: predictions, error: predictionsError } = await supabase
        .from("predictions")
        .select(`
          *,
          match:matches!predictions_match_id_fkey (
            id,
            team_a_id,
            team_b_id,
            match_date,
            match_time,
            winner,
            difficulty_score_a,
            difficulty_score_b
          ),
          user:profiles!predictions_user_id_fkey (
            id,
            username,
            total_points
          )
        `)
        .order("created_at", { ascending: false });

      if (predictionsError) {
        throw new Error("Tahminler yüklenirken hata: " + predictionsError.message);
      }
      backupData.data.predictions = predictions || [];
      setExportStatus(`✅ ${predictions?.length || 0} tahmin yüklendi`);

      // 4. Sezon Puanları (Season Points)
      setExportStatus("Sezon puanları yükleniyor...");
      const { data: seasonPoints, error: seasonPointsError } = await supabase
        .from("season_points")
        .select(`
          *,
          user:profiles!season_points_user_id_fkey (
            id,
            username
          ),
          season:seasons!season_points_season_id_fkey (
            id,
            name,
            start_date,
            end_date
          )
        `)
        .order("total_points", { ascending: false });

      if (seasonPointsError) {
        console.warn("Sezon puanları yüklenirken hata (devam ediliyor):", seasonPointsError);
        backupData.data.season_points = [];
      } else {
        backupData.data.season_points = seasonPoints || [];
        setExportStatus(`✅ ${seasonPoints?.length || 0} sezon puanı yüklendi`);
      }

      // 5. Sezonlar
      setExportStatus("Sezonlar yükleniyor...");
      const { data: seasons, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false });

      if (seasonsError) {
        console.warn("Sezonlar yüklenirken hata (devam ediliyor):", seasonsError);
        backupData.data.seasons = [];
      } else {
        backupData.data.seasons = seasons || [];
        setExportStatus(`✅ ${seasons?.length || 0} sezon yüklendi`);
      }

      // 6. Takımlar
      setExportStatus("Takımlar yükleniyor...");
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (teamsError) {
        console.warn("Takımlar yüklenirken hata (devam ediliyor):", teamsError);
        backupData.data.teams = [];
      } else {
        backupData.data.teams = teams || [];
        setExportStatus(`✅ ${teams?.length || 0} takım yüklendi`);
      }

      // 7. İstatistikler
      backupData.statistics = {
        total_users: profiles?.length || 0,
        total_matches: matches?.length || 0,
        total_predictions: predictions?.length || 0,
        total_season_points: seasonPoints?.length || 0,
        total_seasons: seasons?.length || 0,
        total_teams: teams?.length || 0,
        completed_matches: matches?.filter((m: any) => m.winner !== null).length || 0,
        archived_matches: matches?.filter((m: any) => m.is_archived === true).length || 0,
      };

      setExportStatus("Export ediliyor...");

      if (format === "json") {
        exportToJSON([backupData], "tam_yedekleme");
      } else {
        // CSV için her tabloyu ayrı dosya olarak export et
        alert("Tam yedekleme CSV formatında birden fazla dosya olarak indirilecek.");
        
        // Her tablo için ayrı CSV
        if (backupData.data.profiles.length > 0) {
          exportToCSV(backupData.data.profiles, "yedek_uyeler");
        }
        if (backupData.data.matches.length > 0) {
          exportToCSV(backupData.data.matches, "yedek_maclar");
        }
        if (backupData.data.predictions.length > 0) {
          exportToCSV(backupData.data.predictions, "yedek_tahminler");
        }
        if (backupData.data.season_points.length > 0) {
          exportToCSV(backupData.data.season_points, "yedek_sezon_puanlari");
        }
        if (backupData.data.seasons.length > 0) {
          exportToCSV(backupData.data.seasons, "yedek_sezonlar");
        }
        if (backupData.data.teams.length > 0) {
          exportToCSV(backupData.data.teams, "yedek_takimlar");
        }
        
        // İstatistikleri de export et
        exportToCSV([backupData.statistics], "yedek_istatistikler");
      }

      setBackupData(backupData);
      setExportStatus(
        `✅ Tam yedekleme tamamlandı! ${backupData.statistics.total_users} üye, ${backupData.statistics.total_matches} maç, ${backupData.statistics.total_predictions} tahmin yedeklendi.`
      );
      setTimeout(() => setExportStatus(""), 8000);
    } catch (error: any) {
      setExportStatus(`❌ Hata: ${error.message}`);
      alert("Tam yedekleme sırasında hata: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Yedekleme ve Export</h1>
        <p className="text-gray-400">
          Sonuçlanan maçları, tahminleri ve puanları yedekleyin. Tüm veriler kalıcı olarak saklanır.
        </p>
      </div>

      {/* Supabase Yedekleme Bilgisi */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Supabase Otomatik Yedekleme</h3>
            <p className="text-sm text-gray-300 mb-2">
              Supabase otomatik olarak veritabanınızı yedekler. Yedeklere erişmek için:
            </p>
            <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1">
              <li>Supabase Dashboard → Settings → Database → Backups</li>
              <li>Günlük yedekler otomatik oluşturulur</li>
              <li>Point-in-time recovery (PITR) mevcuttur</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div
          className={cn(
            "p-4 rounded-lg border flex items-center gap-3",
            exportStatus.includes("✅")
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : exportStatus.includes("❌")
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-blue-500/10 border-blue-500/30 text-blue-400"
          )}
        >
          {exportStatus.includes("✅") ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : exportStatus.includes("❌") ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          )}
          <span>{exportStatus}</span>
        </div>
      )}

      {/* Tam Yedekleme - Öne Çıkarılmış */}
      <div className="bg-gradient-to-r from-[#B84DC7]/20 to-purple-500/20 border-2 border-[#B84DC7]/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-[#B84DC7]/20">
            <Database className="h-8 w-8 text-[#B84DC7]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-xl">Tam Yedekleme (Full Backup)</h3>
            <p className="text-sm text-gray-300">
              Tüm verileri yedekle: Üyeler, Maçlar, Tahminler, Puanlar, Sıralamalar, Sezonlar, Takımlar
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            onClick={() => exportFullBackup("json")}
            disabled={isExporting}
            className="w-full bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white text-lg py-6"
            size="lg"
          >
            <Database className="h-5 w-5 mr-2" />
            {isExporting ? "Yedekleniyor..." : "TAM YEDEKLEME (JSON)"}
          </Button>
          <Button
            onClick={() => exportFullBackup("csv")}
            disabled={isExporting}
            variant="outline"
            className="w-full border-[#B84DC7]/50 text-[#B84DC7] hover:bg-[#B84DC7]/10 text-lg py-6"
            size="lg"
          >
            <FileText className="h-5 w-5 mr-2" />
            {isExporting ? "Yedekleniyor..." : "TAM YEDEKLEME (CSV - Çoklu Dosya)"}
          </Button>
        </div>
        <div className="mt-4 p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-gray-400">
            <strong className="text-white">İçerik:</strong> Üyeler ({backupData?.statistics?.total_users || "?"}), 
            Maçlar ({backupData?.statistics?.total_matches || "?"}), 
            Tahminler ({backupData?.statistics?.total_predictions || "?"}), 
            Sezon Puanları ({backupData?.statistics?.total_season_points || "?"}), 
            Sezonlar ({backupData?.statistics?.total_seasons || "?"}), 
            Takımlar ({backupData?.statistics?.total_teams || "?"})
          </p>
        </div>
      </div>

      {/* Export Seçenekleri */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Bölüm Bazlı Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sonuçlanan Maçlar */}
        <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#B84DC7]/10">
              <Calendar className="h-6 w-6 text-[#B84DC7]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Sonuçlanan Maçlar</h3>
              <p className="text-xs text-gray-400">Tüm sonuçlanan maçlar ve tahminleri</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => exportCompletedMatches("csv")}
              disabled={isExporting}
              className="w-full bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button
              onClick={() => exportCompletedMatches("json")}
              disabled={isExporting}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Export
            </Button>
          </div>
        </div>

        {/* Tüm Tahminler */}
        <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Tüm Tahminler</h3>
              <p className="text-xs text-gray-400">Tüm kullanıcı tahminleri</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => exportAllPredictions("csv")}
              disabled={isExporting}
              className="w-full bg-green-500 hover:bg-green-500/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button
              onClick={() => exportAllPredictions("json")}
              disabled={isExporting}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Export
            </Button>
          </div>
        </div>

        {/* Kullanıcı Puanları */}
        <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Kullanıcı Puanları</h3>
              <p className="text-xs text-gray-400">Tüm kullanıcı puanları ve istatistikleri</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => exportUserPoints("csv")}
              disabled={isExporting}
              className="w-full bg-blue-500 hover:bg-blue-500/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button
              onClick={() => exportUserPoints("json")}
              disabled={isExporting}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Export
            </Button>
          </div>
        </div>
      </div>

      {/* Önemli Notlar */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Önemli Notlar</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Sonuçlanan maçlar otomatik olarak arşivlenir (kalıcı saklama)</li>
              <li>Tüm tahminler ve puanlar veritabanında korunur</li>
              <li>Export dosyalarını güvenli bir yerde saklayın</li>
              <li>Düzenli yedekleme yapmanız önerilir</li>
              <li>Supabase otomatik yedekleme aktif (Dashboard'dan kontrol edin)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

