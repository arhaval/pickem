"use client";

import { useState, useEffect } from "react";
import { Save, Target, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase/client";
import TeamLogo from "@/components/team-logo";

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  match_time: string;
  match_date: string | null;
  tournament_name: string | null;
  team_a_logo?: string | null;
  team_b_logo?: string | null;
}

export default function AdminPicks() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Önce site_settings'ten seçili maç ID'lerini yükle
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("homepage_pick_match_ids")
        .eq("id", 1)
        .maybeSingle();

      if (!settingsError && (settingsData as any)?.homepage_pick_match_ids) {
        let matchIds: string[] = [];
        if (typeof (settingsData as any).homepage_pick_match_ids === 'string') {
          try {
            matchIds = JSON.parse((settingsData as any).homepage_pick_match_ids);
          } catch (e) {
            console.error("Homepage pick match IDs parse hatası:", e);
          }
        } else if (Array.isArray((settingsData as any).homepage_pick_match_ids)) {
          matchIds = (settingsData as any).homepage_pick_match_ids;
        }
        setSelectedMatchIds(matchIds.filter((id: any) => id)); // Boş değerleri filtrele
      }

      // Takımları yükle (logo için)
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });
      
      if (teamsData) {
        setTeams(teamsData);
      }

      // Tüm maçları yükle (sonuç girilmemiş olanlar)
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .is("winner", null)
        .eq("is_archived", false)
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true });

      if (matchesError) {
        console.error("Maçlar yüklenirken hata:", matchesError);
        alert("Maçlar yüklenirken bir hata oluştu: " + matchesError.message);
      } else {
        setMatches(matchesData || []);
      }
    } catch (error: any) {
      console.error("Veri yüklenirken hata:", error);
      alert("Veri yüklenirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTeamInfo = (teamName: string) => {
    return teams.find((t) => t.name === teamName);
  };

  const toggleMatch = (matchId: string) => {
    setSelectedMatchIds((prev) => {
      if (prev.includes(matchId)) {
        // Kaldır
        return prev.filter((id) => id !== matchId);
      } else {
        // Ekle (max 3)
        if (prev.length >= 3) {
          alert("Ana sayfada en fazla 3 maç gösterilebilir!");
          return prev;
        }
        return [...prev, matchId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Önce kolonun var olup olmadığını kontrol et
      const { data: testData, error: testError } = await supabase
        .from("site_settings")
        .select("homepage_pick_match_ids")
        .eq("id", 1)
        .maybeSingle();

      if (testError && testError.message && testError.message.includes("homepage_pick_match_ids")) {
        alert(
          "❌ Veritabanı hatası: 'homepage_pick_match_ids' kolonu bulunamadı!\n\n" +
          "Migration'ı uygulamanız gerekiyor:\n\n" +
          "1. Supabase Dashboard'a gidin\n" +
          "2. SQL Editor'a gidin\n" +
          "3. Aşağıdaki SQL'i çalıştırın:\n\n" +
          "ALTER TABLE site_settings\n" +
          "ADD COLUMN IF NOT EXISTS homepage_pick_match_ids JSONB DEFAULT '[]'::jsonb;\n\n" +
          "Veya migration dosyasını kontrol edin: supabase/migrations/add_homepage_pick_matches.sql"
        );
        return;
      }
      
      const { error } = await (supabase as any)
        .from("site_settings")
        .update({
          homepage_pick_match_ids: selectedMatchIds.length > 0 ? selectedMatchIds : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) {
        console.error("Ayarlar kaydedilirken hata:", error);
        
        if (error.message && error.message.includes("homepage_pick_match_ids")) {
          alert(
            "❌ Veritabanı hatası: 'homepage_pick_match_ids' kolonu bulunamadı!\n\n" +
            "Migration'ı uygulamanız gerekiyor:\n\n" +
            "1. Supabase Dashboard'a gidin\n" +
            "2. SQL Editor'a gidin\n" +
            "3. Aşağıdaki SQL'i çalıştırın:\n\n" +
            "ALTER TABLE site_settings\n" +
            "ADD COLUMN IF NOT EXISTS homepage_pick_match_ids JSONB DEFAULT '[]'::jsonb;\n\n" +
            "Veya migration dosyasını kontrol edin: supabase/migrations/add_homepage_pick_matches.sql"
          );
        } else {
          alert("Ayarlar kaydedilirken bir hata oluştu: " + error.message);
        }
        return;
      }

      alert("✅ PICK EM maçları başarıyla kaydedildi!");
    } catch (error: any) {
      console.error("Ayarlar kaydedilirken hata:", error);
      alert("Ayarlar kaydedilirken bir hata oluştu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-[#B84DC7] animate-spin" />
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
          <h1 className="text-3xl font-bold text-white mb-2">PICK EM Maç Seçimi</h1>
          <p className="text-gray-400">
            Ana sayfada gösterilecek 3 maçı seçin. PICK EM bölümünde görünecekler.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || selectedMatchIds.length === 0}
          className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Kaydet ({selectedMatchIds.length}/3)
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-[#131720] border border-[#B84DC7]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-[#B84DC7] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium mb-1">PICK EM Bölümü</p>
            <p className="text-xs text-gray-400">
              Ana sayfanın "PICK EM" bölümünde gösterilecek maçları seçin. En fazla 3 maç seçebilirsiniz.
              Seçilen maçlar ana sayfada kartlar halinde görünecek.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Matches Summary */}
      {selectedMatchIds.length > 0 && (
        <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Seçili Maçlar ({selectedMatchIds.length}/3)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedMatchIds.map((matchId) => {
              const match = matches.find((m) => m.id === matchId);
              if (!match) return null;

              const teamAInfo = match.team_a_logo 
                ? { logo_url: match.team_a_logo, name: match.team_a }
                : getTeamInfo(match.team_a);
              const teamBInfo = match.team_b_logo 
                ? { logo_url: match.team_b_logo, name: match.team_b }
                : getTeamInfo(match.team_b);

              return (
                <div
                  key={matchId}
                  className="bg-[#0a0e1a] border border-[#B84DC7]/30 rounded-lg p-4 relative"
                >
                  <button
                    onClick={() => toggleMatch(matchId)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-full text-red-400 transition-colors"
                    title="Kaldır"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  {match.tournament_name && (
                    <div className="text-xs text-[#B84DC7] font-semibold mb-2 truncate">
                      {match.tournament_name}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      {teamAInfo?.logo_url ? (
                        <img
                          src={teamAInfo.logo_url}
                          alt={match.team_a}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <TeamLogo teamName={match.team_a} size={24} />
                      )}
                      <span className="text-sm font-bold text-white truncate">
                        {match.team_a}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">VS</span>
                    <div className="flex-1 flex items-center gap-2">
                      {teamBInfo?.logo_url ? (
                        <img
                          src={teamBInfo.logo_url}
                          alt={match.team_b}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <TeamLogo teamName={match.team_b} size={24} />
                      )}
                      <span className="text-sm font-bold text-white truncate">
                        {match.team_b}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {match.match_date && new Date(match.match_date).toLocaleDateString("tr-TR")} • {match.match_time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Matches */}
      <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Mevcut Maçlar</h2>
        
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Henüz maç eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => {
              const isSelected = selectedMatchIds.includes(match.id);
              const teamAInfo = match.team_a_logo 
                ? { logo_url: match.team_a_logo, name: match.team_a }
                : getTeamInfo(match.team_a);
              const teamBInfo = match.team_b_logo 
                ? { logo_url: match.team_b_logo, name: match.team_b }
                : getTeamInfo(match.team_b);

              return (
                <button
                  key={match.id}
                  onClick={() => toggleMatch(match.id)}
                  disabled={!isSelected && selectedMatchIds.length >= 3}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-[#B84DC7] bg-[#B84DC7]/10"
                      : selectedMatchIds.length >= 3
                      ? "border-white/5 bg-[#0a0e1a] opacity-50 cursor-not-allowed"
                      : "border-white/10 bg-[#0a0e1a] hover:border-[#B84DC7]/50 hover:bg-[#B84DC7]/5"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1.5 bg-[#B84DC7] rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  {match.tournament_name && (
                    <div className="text-xs text-[#B84DC7] font-semibold mb-2 truncate">
                      {match.tournament_name}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      {teamAInfo?.logo_url ? (
                        <img
                          src={teamAInfo.logo_url}
                          alt={match.team_a}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <TeamLogo teamName={match.team_a} size={32} />
                      )}
                      <span className="text-sm font-bold text-white truncate">
                        {match.team_a}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">VS</span>
                    <div className="flex-1 flex items-center gap-2">
                      {teamBInfo?.logo_url ? (
                        <img
                          src={teamBInfo.logo_url}
                          alt={match.team_b}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <TeamLogo teamName={match.team_b} size={32} />
                      )}
                      <span className="text-sm font-bold text-white truncate">
                        {match.team_b}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {match.match_date && new Date(match.match_date).toLocaleDateString("tr-TR")} • {match.match_time}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

