/**
 * Supabase ile Teams Join Örneği
 * 
 * Bu dosya, normalize edilmiş matches ve teams tablolarından
 * veri çekerken join işlemini nasıl yapacağınızı gösterir.
 */

import { supabase } from "@/supabase/client";

// ============================================================
// 1. Temel Join Örneği - Tüm Maçları Takım Bilgileriyle Çek
// ============================================================

interface Team {
  id: string;
  name: string;
  short_code: string | null;
  logo_url: string | null;
}

interface MatchWithTeams {
  id: string;
  match_date: string | null;
  match_time: string;
  tournament_name: string | null;
  winner: string | null;
  difficulty_score_a: number;
  difficulty_score_b: number;
  team_a_id: string;
  team_b_id: string;
  // Join edilmiş takım bilgileri
  team_a: Team | null;
  team_b: Team | null;
}

export async function fetchMatchesWithTeams(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      match_time,
      tournament_name,
      winner,
      difficulty_score_a,
      difficulty_score_b,
      team_a_id,
      team_b_id,
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
    .order("match_date", { ascending: true })
    .order("match_time", { ascending: true });

  if (error) {
    console.error("Maçlar yüklenirken hata:", error);
    throw error;
  }

  return data as MatchWithTeams[];
}

// ============================================================
// 2. Next.js Component Örneği - Tahminler Sayfası
// ============================================================

import { useState, useEffect } from "react";

interface MatchData {
  id: string;
  match_date: string | null;
  match_time: string;
  tournament_name: string | null;
  winner: string | null;
  difficulty_score_a: number;
  difficulty_score_b: number;
  team_a: {
    id: string;
    name: string;
    short_code: string | null;
    logo_url: string | null;
  };
  team_b: {
    id: string;
    name: string;
    short_code: string | null;
    logo_url: string | null;
  };
}

export function PredictionsPageExample() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);

      // Join ile maçları çek
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          match_date,
          match_time,
          tournament_name,
          winner,
          difficulty_score_a,
          difficulty_score_b,
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
        .is("is_display_match", null) // Tahminler sayfası için
        .or("is_display_match.eq.false")
        .order("match_date", { ascending: true })
        .order("match_time", { ascending: true });

      if (error) {
        console.error("Maçlar yüklenirken hata:", error);
        return;
      }

      setMatches(data as MatchData[]);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      {matches.map((match) => (
        <div key={match.id} className="border p-4 rounded-lg mb-4">
          <div className="flex items-center gap-4">
            {/* Takım A */}
            <div className="flex items-center gap-2">
              {match.team_a.logo_url && (
                <img 
                  src={match.team_a.logo_url} 
                  alt={match.team_a.name}
                  className="w-12 h-12"
                />
              )}
              <span>{match.team_a.name}</span>
              {match.team_a.short_code && (
                <span className="text-gray-400">({match.team_a.short_code})</span>
              )}
            </div>

            <span className="text-gray-400">VS</span>

            {/* Takım B */}
            <div className="flex items-center gap-2">
              {match.team_b.logo_url && (
                <img 
                  src={match.team_b.logo_url} 
                  alt={match.team_b.name}
                  className="w-12 h-12"
                />
              )}
              <span>{match.team_b.name}</span>
              {match.team_b.short_code && (
                <span className="text-gray-400">({match.team_b.short_code})</span>
              )}
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-400">
            {match.match_date} - {match.match_time}
          </div>
          {match.tournament_name && (
            <div className="text-sm text-gray-500">{match.tournament_name}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 3. Admin Panel Örneği - Maç Ekleme
// ============================================================

export async function createMatchWithTeams(matchData: {
  team_a_id: string;
  team_b_id: string;
  match_date: string;
  match_time: string;
  tournament_name?: string;
  difficulty_score_a?: number;
  difficulty_score_b?: number;
}) {
  const { data, error } = await (supabase.from("matches") as any)
    .insert({
      team_a_id: matchData.team_a_id,
      team_b_id: matchData.team_b_id,
      match_date: matchData.match_date,
      match_time: matchData.match_time,
      tournament_name: matchData.tournament_name || null,
      difficulty_score_a: matchData.difficulty_score_a || 3,
      difficulty_score_b: matchData.difficulty_score_b || 5,
      prediction_type: "winner",
      option_a_label: "", // Bu alanlar artık takım bilgilerinden alınabilir
      option_b_label: "",
    })
    .select(`
      id,
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
    .single();

  if (error) {
    console.error("Maç eklenirken hata:", error);
    throw error;
  }

  return data;
}

// ============================================================
// 4. Takımları Listeleme (Admin Panel için)
// ============================================================

export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, short_code, logo_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Takımlar yüklenirken hata:", error);
    throw error;
  }

  return data as Team[];
}

// ============================================================
// 5. Tek Bir Maçı Takım Bilgileriyle Çekme
// ============================================================

export async function fetchMatchById(matchId: string): Promise<MatchData | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      match_time,
      tournament_name,
      winner,
      difficulty_score_a,
      difficulty_score_b,
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
    .eq("id", matchId)
    .single();

  if (error) {
    console.error("Maç yüklenirken hata:", error);
    return null;
  }

  return data as MatchData;
}

// ============================================================
// 6. Maçları Filtreleme ile Çekme (Örneğin: Belirli Bir Turnuva)
// ============================================================

export async function fetchMatchesByTournament(tournamentName: string): Promise<MatchData[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      match_time,
      tournament_name,
      winner,
      difficulty_score_a,
      difficulty_score_b,
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
    .eq("tournament_name", tournamentName)
    .order("match_date", { ascending: true });

  if (error) {
    console.error("Maçlar yüklenirken hata:", error);
    throw error;
  }

  return data as MatchData[];
}


