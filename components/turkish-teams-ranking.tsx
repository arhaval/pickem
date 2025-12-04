"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import TeamLogo from "./team-logo";
import { supabase } from "@/supabase/client";

interface TeamRanking {
  id?: number;
  rank: number;
  team_name: string;
  hltv_rank: number;
  vrs_rank?: number | null;
  change: number; // +1, -2, 0 gibi
  points?: number | null;
  logo_url?: string | null;
}

export default function TurkishTeamsRanking() {
  const [teams, setTeams] = useState<TeamRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();

    // Real-time subscription
    const channel = supabase
      .channel('turkish_teams_ranking_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'turkish_teams_ranking' }, () => {
        loadTeams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("turkish_teams_ranking")
        .select("*")
        .order("rank", { ascending: true });

      if (error) {
        // Tablo yoksa veya hata varsa boş array döndür
        console.warn("Türk takımları sıralaması yüklenirken hata:", error);
        setTeams([]);
      } else {
        setTeams(data || []);
      }
    } catch (error) {
      console.error("Türk takımları sıralaması yüklenirken hata:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#B84DC7]" />
            <h3 className="text-lg font-bold text-white">Türk Takımları</h3>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">HLTV Sıralaması</span>
        </div>
        <div className="text-center py-8 text-gray-400 text-sm">
          Henüz takım eklenmemiş.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#B84DC7]" />
          <h3 className="text-lg font-bold text-white">Türk Takımları</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">HLTV & VRS</span>
        </div>
      </div>

      <div className="space-y-2">
        {teams.map((team) => (
          <div
            key={team.id || team.rank}
            className="flex items-center gap-4 rounded-lg border border-white/5 bg-black/30 p-3 hover:bg-black/50 hover:border-[#D69ADE]/30 transition-all duration-200"
          >
            {/* HLTV Sıralaması - Sol */}
            <div className="w-24 flex-shrink-0 text-left">
              <span className="text-sm font-semibold text-gray-300">HLTV #{team.hltv_rank}</span>
            </div>

            {/* Logo ve Takım İsmi - Orta */}
            <div className="flex-1 flex items-center justify-center gap-3">
              <div className="flex-shrink-0 flex items-center justify-center">
                <TeamLogo teamName={team.team_name} logoUrl={team.logo_url} size={64} />
              </div>
              <div className="flex-shrink-0">
                <p className="font-semibold text-sm text-white whitespace-nowrap">{team.team_name}</p>
              </div>
            </div>

            {/* VRS Sıralaması - Sağ */}
            <div className="w-24 flex-shrink-0 text-right">
              {team.vrs_rank ? (
                <span className="text-sm font-semibold text-gray-300">VRS #{team.vrs_rank}</span>
              ) : (
                <span className="text-sm font-semibold text-gray-500">-</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-[10px] text-gray-500 text-center">
          HLTV.org ve VRS sıralamaları güncellenmektedir
        </p>
      </div>
    </div>
  );
}

