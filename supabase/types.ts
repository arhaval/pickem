export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          steam_id: string | null
          total_points: number
          is_admin: boolean | null
          created_at: string
          updated_at: string
          username_changed_at: string | null
          instagram_url: string | null
          twitter_url: string | null
          youtube_url: string | null
          twitch_url: string | null
          tiktok_url: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          steam_id?: string | null
          total_points?: number
          is_admin?: boolean | null
          created_at?: string
          updated_at?: string
          username_changed_at?: string | null
          instagram_url?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
          twitch_url?: string | null
          tiktok_url?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          steam_id?: string | null
          total_points?: number
          is_admin?: boolean | null
          created_at?: string
          updated_at?: string
          username_changed_at?: string | null
          instagram_url?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
          twitch_url?: string | null
          tiktok_url?: string | null
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      live_lobbies: {
        Row: {
          id: string
          name: string
          unique_code: string
          is_active: boolean
          hero_image_url: string | null
          event_title: string | null
          primary_color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          unique_code: string
          is_active?: boolean
          hero_image_url?: string | null
          event_title?: string | null
          primary_color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          unique_code?: string
          is_active?: boolean
          hero_image_url?: string | null
          event_title?: string | null
          primary_color?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          team_a_id: string | number // Foreign key to teams.id
          team_b_id: string | number // Foreign key to teams.id
          match_time: string
          match_date?: string | null
          winner: string | null
          difficulty_score_a: number
          difficulty_score_b: number
          season_id: string | number | null // BIGINT veya UUID
          live_lobby_id: string | null
          prediction_type: 'winner' | 'over_under' | 'custom'
          option_a_label: string
          option_b_label: string
          question_text: string | null
          analysis_note: string | null
          tournament_name: string | null
          tournament_stage?: string | null
          match_format?: string | null
          is_archived: boolean | null
          is_display_match?: boolean | null
          score_a: number | null
          score_b: number | null
          hltv_ranking_a?: number | null
          hltv_ranking_b?: number | null
          hltv_url?: string | null
          stream_links?: Json | null
          prediction_lock_minutes_before_match?: number | null
          created_at: string
          // Nested team objects (when joined via Supabase select)
          team_a?: {
            id: string | number
            name: string
            short_code: string | null
            logo_url: string | null
          } | null
          team_b?: {
            id: string | number
            name: string
            short_code: string | null
            logo_url: string | null
          } | null
        }
        Insert: {
          id?: string
          team_a_id: string | number
          team_b_id: string | number
          match_time: string
          match_date?: string | null
          winner?: string | null
          difficulty_score_a?: number
          difficulty_score_b?: number
          season_id?: string | number | null
          live_lobby_id?: string | null
          prediction_type?: 'winner' | 'over_under' | 'custom'
          option_a_label: string
          option_b_label: string
          question_text?: string | null
          analysis_note?: string | null
          tournament_name?: string | null
          tournament_stage?: string | null
          match_format?: string | null
          is_archived?: boolean | null
          is_display_match?: boolean | null
          score_a?: number | null
          score_b?: number | null
          hltv_ranking_a?: number | null
          hltv_ranking_b?: number | null
          hltv_url?: string | null
          stream_links?: Json | null
          prediction_lock_minutes_before_match?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          team_a_id?: string | number
          team_b_id?: string | number
          match_time?: string
          match_date?: string | null
          winner?: string | null
          difficulty_score_a?: number
          difficulty_score_b?: number
          season_id?: string | number | null
          live_lobby_id?: string | null
          prediction_type?: 'winner' | 'over_under' | 'custom'
          option_a_label?: string
          option_b_label?: string
          question_text?: string | null
          analysis_note?: string | null
          tournament_name?: string | null
          tournament_stage?: string | null
          match_format?: string | null
          is_archived?: boolean | null
          is_display_match?: boolean | null
          score_a?: number | null
          score_b?: number | null
          hltv_ranking_a?: number | null
          hltv_ranking_b?: number | null
          hltv_url?: string | null
          stream_links?: Json | null
          prediction_lock_minutes_before_match?: number | null
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          season_id: string | null
          selected_team: string
          points_earned: number | null
          status: 'pending' | 'correct' | 'incorrect'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          season_id?: string | null
          selected_team: string
          points_earned?: number | null
          status?: 'pending' | 'correct' | 'incorrect'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          season_id?: string | null
          selected_team?: string
          points_earned?: number | null
          status?: 'pending' | 'correct' | 'incorrect'
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string | number // UUID veya BIGINT olabilir
          name: string
          short_code: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string | number
          name: string
          short_code?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string | number
          name?: string
          short_code?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: number
          hero_title: string | null
          hero_description: string | null
          hero_image_url: string | null
          hero_button_text: string | null
          hero_button_link: string | null
          matches_banner_url: string | null
          matches_banner_button_text: string | null
          matches_banner_button_link: string | null
          predictions_banner_url: string | null
          predictions_banner_button_text: string | null
          predictions_banner_button_link: string | null
          notification_text: string | null
          is_notification_active: boolean
          notification_color: string | null
          is_maintenance_mode: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          hero_title?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_button_text?: string | null
          hero_button_link?: string | null
          matches_banner_url?: string | null
          matches_banner_button_text?: string | null
          matches_banner_button_link?: string | null
          predictions_banner_url?: string | null
          predictions_banner_button_text?: string | null
          predictions_banner_button_link?: string | null
          notification_text?: string | null
          is_notification_active?: boolean
          notification_color?: string | null
          is_maintenance_mode?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          hero_title?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_button_text?: string | null
          hero_button_link?: string | null
          matches_banner_url?: string | null
          matches_banner_button_text?: string | null
          matches_banner_button_link?: string | null
          predictions_banner_url?: string | null
          predictions_banner_button_text?: string | null
          predictions_banner_button_link?: string | null
          notification_text?: string | null
          is_notification_active?: boolean
          notification_color?: string | null
          is_maintenance_mode?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

