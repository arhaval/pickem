"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Radio,
  Shield,
  Users,
  Menu,
  X,
  Settings,
  AlertCircle,
  FileText,
  Trophy,
  Youtube,
  LogOut,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase/client";

const navigation = [
  {
    name: "Genel Bakış",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sezon Yönetimi",
    href: "/admin/seasons",
    icon: Trophy,
  },
  {
    name: "Tahminler",
    href: "/admin/matches",
    icon: Calendar,
  },
  {
    name: "Maçlar Sayfası",
    href: "/admin/matches-page",
    icon: FileText,
  },
  {
    name: "Canlı Yayın Kumandası",
    href: "/admin/live",
    icon: Radio,
  },
  {
    name: "Takım Bankası",
    href: "/admin/teams",
    icon: Shield,
  },
  {
    name: "Kullanıcı Yönetimi",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Site Ayarları",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Ana Sayfa Videoları",
    href: "/admin/videos",
    icon: Youtube,
  },
  {
    name: "PICK EM Maç Seçimi",
    href: "/admin/picks",
    icon: Target,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const checkInProgressRef = useRef(false);

  // Login sayfasındaysa admin kontrolü yapma
  useEffect(() => {
    isMountedRef.current = true;

    if (pathname === "/admin/login") {
      setLoading(false);
      setIsAdmin(null);
      return;
    }

    // Admin kontrolü yap
    checkAdminAccess();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!isMountedRef.current) return;

      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        setLoading(false);
        router.push("/admin/login");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Yeni giriş yapıldıysa tekrar kontrol et
        if (pathname !== "/admin/login") {
          checkAdminAccess();
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const checkAdminAccess = async () => {
    // Zaten kontrol yapılıyorsa tekrar başlatma
    if (checkInProgressRef.current) return;
    
    checkInProgressRef.current = true;
    setLoading(true);

    try {
      // Kullanıcı kontrolü
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMountedRef.current) {
          setIsAdmin(false);
          setLoading(false);
          router.push("/admin/login");
        }
        return;
      }

      // Profil kontrolü - timeout ile
      const profilePromise = supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 5000)
      );

      const profileResult = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (isMountedRef.current) {
        if (profileResult?.data?.is_admin === true) {
          setIsAdmin(true);
          setLoading(false);
        } else {
          setIsAdmin(false);
          setLoading(false);
          router.push("/admin/login");
        }
      }
    } catch (error) {
      console.error("Admin check error:", error);
      if (isMountedRef.current) {
        setIsAdmin(false);
        setLoading(false);
        router.push("/admin/login");
      }
    } finally {
      checkInProgressRef.current = false;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Hata olsa bile yönlendir
      router.push("/admin/login");
    }
  };

  // Login sayfasındaysa direkt göster
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a]">
        <div className="text-center max-w-md p-8 bg-[#131720] border border-red-500/30 rounded-lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-400 mb-6">
            Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
            >
              Ana Sayfaya Dön
            </Button>
            <Button
              onClick={() => router.push("/admin/login")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Giriş Yap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#131720] border-r border-white/10 z-50 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold text-white">Yönetim Paneli</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-[#B84DC7]/20 text-[#B84DC7] border border-[#B84DC7]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#131720]">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Çıkış Yap</span>
          </Button>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2"
          >
            <span>← Ana Sayfaya Dön</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#131720]/80 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1 md:flex-none"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#B84DC7]/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#B84DC7]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-gray-400">Yönetici</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                title="Çıkış Yap"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen bg-[#0f1419] p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
