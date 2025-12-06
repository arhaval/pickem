"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Target, Home, Trophy, User, LogIn, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/client";
import AuthModal from "@/components/auth-modal";
import UserMenu from "@/components/user-menu";
import AnnouncementBar from "@/components/announcement-bar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navigation = [
  {
    name: "Ana Sayfa",
    href: "/",
    icon: Home,
  },
  {
    name: "Maçlar",
    href: "/matches",
    icon: Calendar,
  },
  {
    name: "Tahminler",
    href: "/predictions",
    icon: Target,
  },
  {
    name: "Sıralama",
    href: "/leaderboard",
    icon: Trophy,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{
    username?: string | null;
    avatar_url?: string | null;
    total_points?: number;
  } | null>(null);

  // Kullanıcı durumunu kontrol et
  useEffect(() => {
    // Mevcut kullanıcıyı al
    const getInitialUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Kullanıcı profil bilgilerini al
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url, total_points")
          .eq("id", currentUser.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    };

    getInitialUser();

    // Auth durum değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Kullanıcı profil bilgilerini al
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url, total_points")
          .eq("id", session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
      
      // Giriş başarılı olduysa modal'ı kapat
      if (event === "SIGNED_IN") {
        setIsAuthModalOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Profil güncelleme event'ini dinle
  useEffect(() => {
    const handleProfileUpdate = async (event: CustomEvent) => {
      // Profil güncellendiğinde navbar'daki profil bilgilerini yenile
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url, total_points")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as unknown as EventListener);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as unknown as EventListener);
    };
  }, [user]);

  // Live lobiler sitede gözükmeyecek, sadece link ile erişilebilir

  return (
    <>
      <AnnouncementBar />
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo - Sol taraf */}
        <Link href="/" className="flex items-center gap-3 font-semibold text-lg group">
          <div className="relative h-8 w-24 md:h-10 md:w-32">
            <Image
              src="/logo.png"
              alt="Arhaval"
              width={128}
              height={40}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#D69ADE]/20 to-[#C97AE0]/20 text-[#B84DC7] border border-[#D69ADE]/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Sağ taraf - Kullanıcı Menüsü */}
        <div className="flex items-center gap-3">
          {/* Desktop - Giriş Yap / Profil */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <UserMenu
                user={{
                  id: user.id,
                  email: user.email,
                  avatar_url: userProfile?.avatar_url || user.user_metadata?.avatar_url,
                  username: userProfile?.username || user.user_metadata?.username,
                  total_points: userProfile?.total_points || 0,
                }}
              />
            ) : (
              <>
                <Button
                  onClick={() => {
                    setAuthModalTab("register");
                    setIsAuthModalOpen(true);
                  }}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/5 hover:border-[#D69ADE]/30"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Kayıt Ol
                </Button>
                <Button
                  onClick={() => {
                    setAuthModalTab("login");
                    setIsAuthModalOpen(true);
                  }}
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/5 hover:border-[#D69ADE]/30"
                >
                  <User className="h-4 w-4 mr-2" />
                  Giriş Yap
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:border-[#D69ADE]/30 transition-all"
            aria-label="Menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0e1a]/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-[#D69ADE]/20 to-[#C97AE0]/20 text-[#B84DC7] border border-[#D69ADE]/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-white/5 mt-3 space-y-2">
              {user ? (
                <UserMenu
                  user={{
                    id: user.id,
                    email: user.email,
                    avatar_url: userProfile?.avatar_url || user.user_metadata?.avatar_url,
                    username: userProfile?.username || user.user_metadata?.username,
                    total_points: userProfile?.total_points || 0,
                  }}
                />
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setAuthModalTab("register");
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-semibold hover:opacity-90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Kayıt Ol
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthModalTab("login");
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-white/10 text-gray-300 hover:bg-white/5 hover:border-[#D69ADE]/30"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Giriş Yap
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
      </nav>
    </>
  );
}
