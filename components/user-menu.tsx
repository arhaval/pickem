"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, LogOut, Trophy, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/client";
import Image from "next/image";
import { useRankingVisibility } from "@/hooks/use-ranking-visibility";

interface UserMenuProps {
  user: {
    id: string;
    email?: string;
    avatar_url?: string | null;
    username?: string | null;
    total_points?: number; // Artık kullanılmıyor, geriye dönük uyumluluk için
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      // Sayfa yenileme veya yönlendirme yapılabilir
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [seasonPoints, setSeasonPoints] = useState<number | null>(null);
  const { isRankingVisible } = useRankingVisibility();

  useEffect(() => {
    // Aktif sezon puanını yükle
    const loadSeasonPoints = async () => {
      try {
        // Aktif sezonu bul
        const { data: activeSeason } = await supabase
          .from("seasons")
          .select("id")
          .eq("is_active", true)
          .single();

        if (activeSeason) {
          // Kullanıcının aktif sezon puanını bul - maybeSingle kullan (hata vermez)
          const { data: points, error } = await supabase
            .from("season_points")
            .select("total_points")
            .eq("user_id", user.id)
            .eq("season_id", (activeSeason as any).id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            // Gerçek bir hata varsa logla
            console.error("Sezon puanı yüklenirken hata:", error);
            setSeasonPoints(0);
          } else if (points) {
            setSeasonPoints((points as any).total_points);
          } else {
            setSeasonPoints(0);
          }
        } else {
          setSeasonPoints(null);
        }
      } catch (error) {
        console.error("Sezon puanı yüklenirken hata:", error);
        setSeasonPoints(null);
      }
    };

    if (user.id) {
      loadSeasonPoints();
    }
  }, [user.id]);

  const displayName = user.username || user.email?.split("@")[0] || "Kullanıcı";
  const points = seasonPoints !== null ? seasonPoints : 0;

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
          isOpen
            ? "border-[#D69ADE]/50 bg-white/5"
            : "border-white/10 hover:border-[#D69ADE]/30 hover:bg-white/5"
        )}
      >
        {/* Avatar */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#D69ADE]/30 to-[#B84DC7]/30 border-2 border-white/10 overflow-hidden">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold text-white uppercase">
                {displayName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Puan - Her zaman göster */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs text-gray-400 leading-none">Puan</span>
          <span className="text-sm font-bold text-[#B84DC7] leading-none">
            {points.toLocaleString()}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#131720]/95 backdrop-blur-xl shadow-lg shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#D69ADE]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#D69ADE]/30 to-[#B84DC7]/30 border-2 border-white/10 overflow-hidden">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white uppercase">
                      {displayName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Trophy className="h-3 w-3 text-[#B84DC7]" />
                  <span className="text-xs font-semibold text-[#B84DC7]">
                    {points.toLocaleString()} P
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profilim</span>
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Trophy className="h-4 w-4" />
              <span>Sıralama</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Ayarlar</span>
            </Link>

            <div className="h-px bg-white/10 my-2"></div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


