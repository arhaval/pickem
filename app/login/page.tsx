"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth-modal";
import { supabase } from "@/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push("/");
      }
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        {isModalOpen && <AuthModal isOpen={isModalOpen} onClose={handleModalClose} defaultTab="login" />}
      </div>
    </div>
  );
}

