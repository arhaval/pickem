"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Target, Trophy, UserPlus, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Verileri
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        router.push("/");
      }
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Giriş başarısız: " + error.message);
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center p-4 py-12">
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B84DC7]/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Sol Taraf - Bilgilendirme */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] mb-6 p-3">
                  <Image
                    src="/logo.png"
                    alt="Arhaval"
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                  Hoş <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D69ADE] to-[#B84DC7]">Geldin!</span>
                </h1>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Tahminler yap, canlı etkinliklere katıl ve sevdiğin takımların maçlarını takip et !
                </p>
              </div>
              
              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#D69ADE]/20 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-[#D69ADE]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Maç Tahminleri</p>
                    <p className="text-sm text-gray-400">Maçları tahmin et ve doğru tahminlerinle puan kazan</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#D69ADE]/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-[#D69ADE]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Liderlik Tablosu</p>
                    <p className="text-sm text-gray-400">Diğer oyuncularla yarış ve en üstte yerini al</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#D69ADE]/20 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-5 w-5 text-[#D69ADE]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white mb-1">Canlı Yarışmalar</p>
                    <p className="text-sm text-gray-400">Canlı maçlarda anlık sorulara cevap ver ve bonus puanlar kazan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Giriş Formu */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-8 backdrop-blur-md shadow-2xl">
              {/* Mobil Başlık */}
              <div className="text-center mb-8 lg:hidden">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] mb-4 p-3">
                  <Image
                    src="/logo.png"
                    alt="Arhaval"
                    width={32}
                    height={32}
                    className="object-contain w-full h-full"
                  />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">
                  Hoş <span className="text-[#D69ADE]">Geldin!</span>
                </h1>
                <p className="text-gray-400">Tahminler yap, canlı etkinliklere katıl ve sevdiğin takımların maçlarını takip et !</p>
              </div>

              {/* Desktop Başlık */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Giriş Yap</h2>
                <p className="text-gray-400">Hesabına giriş yap ve tahmin yapmaya devam et</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-5">
                {/* E-posta */}
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-semibold text-white">
                    E-posta
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="ornek@email.com" 
                      className="pl-10 h-12 bg-black/30 border-white/10 text-white focus:border-[#D69ADE] focus:ring-[#D69ADE]/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Şifre */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="login-password" className="text-sm font-semibold text-white">
                      Şifre
                    </Label>
                    <Link href="/forgot-password" className="text-xs text-[#D69ADE] hover:text-[#B84DC7] font-semibold transition-colors">
                      Şifremi unuttum?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 bg-black/30 border-white/10 text-white focus:border-[#D69ADE] focus:ring-[#D69ADE]/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] hover:opacity-90 text-white font-bold text-base shadow-lg shadow-[#D69ADE]/30" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      Giriş Yap
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Henüz hesabın yok mu?{" "}
                  <Link href="/register" className="text-[#D69ADE] hover:text-[#B84DC7] font-semibold transition-colors">
                    Kayıt Ol
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
