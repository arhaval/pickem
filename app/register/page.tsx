"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth-modal";
import { supabase } from "@/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Trophy, Target, UserPlus } from "lucide-react";

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B84DC7]/10 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* İçerik */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Sol Taraf - Bilgilendirme Kartı */}
        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[300px] -translate-x-[320px]">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 backdrop-blur-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Aramıza Katıl!</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  CS2 tahminlerinde uzmanlaş, puanlar kazan ve liderlik tablosunda yüksel!
                </p>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D69ADE]/20 flex items-center justify-center">
                    <Target className="h-4 w-4 text-[#D69ADE]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Maç Tahminleri</p>
                    <p className="text-xs text-gray-400">Tahminlerini yap, puanları topla</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D69ADE]/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-[#D69ADE]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Ödüller</p>
                    <p className="text-xs text-gray-400">Liderlik tablosunda yüksel</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D69ADE]/20 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-[#D69ADE]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Canlı Yarışma</p>
                    <p className="text-xs text-gray-400">Diğer kullanıcılarla rekabet et</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orta/Sağ Taraf - Kayıt Formu */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            {/* Logo ve Başlık - Mobil için üstte */}
            <div className="text-center mb-6 lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">
                Aramıza <span className="text-[#D69ADE]">Katıl</span>
              </h1>
              <p className="text-gray-400">CS2 tahminlerinde uzmanlaş ve ödüller kazan</p>
            </div>

            {/* Modal */}
            {isModalOpen && <AuthModal isOpen={isModalOpen} onClose={handleModalClose} defaultTab="register" hideHeader={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}


