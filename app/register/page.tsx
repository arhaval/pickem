"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth-modal";
import { supabase } from "@/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    const checkUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        router.push("/");
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Auth durum değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Giriş başarılı olduysa ana sayfaya yönlendir
        router.push("/");
      }
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Modal kapandığında ana sayfaya yönlendir (kullanıcı iptal ettiyse)
  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center p-4">
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* İçerik */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* Modal açık durumda render et - Kayıt modunda aç */}
        {isModalOpen && <AuthModal isOpen={isModalOpen} onClose={handleModalClose} defaultTab="register" />}
      </div>
    </div>
  );
}


