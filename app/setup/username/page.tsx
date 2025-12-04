"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function UsernameSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/register");
        return;
      }

      setUser(currentUser);

      // Check if user already has a username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .single();

      if ((profile as any)?.username) {
        router.push("/");
        return;
      }

      setIsChecking(false);
    };

    checkUser();
  }, [router]);

  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return "Kullanıcı adı boş olamaz";
    }

    if (username.length < 3) {
      return "Kullanıcı adı en az 3 karakter olmalıdır";
    }

    if (username.length > 20) {
      return "Kullanıcı adı en fazla 20 karakter olabilir";
    }

    // Only allow alphanumeric, underscore, and Turkish characters
    const usernameRegex = /^[a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]+$/;
    if (!usernameRegex.test(username)) {
      return "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError("Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.trim().toLowerCase())
        .single();

      if (existingUser) {
        setError("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin.");
        setIsLoading(false);
        return;
      }

      // Update or create profile with username
      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .upsert({
          id: user.id,
          username: username.trim().toLowerCase(),
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error("Profile update error:", updateError);
        setError("Kullanıcı adı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
        setIsLoading(false);
        return;
      }

      // Success - redirect to home
      router.push("/");
    } catch (error) {
      console.error("Error setting username:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#D69ADE]/30 border-t-[#D69ADE] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center p-4">
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* İçerik */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] backdrop-blur-xl p-8 shadow-2xl">
          {/* Icon ve Başlık */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-[#D69ADE]/20 to-[#B84DC7]/20 p-4 rounded-full border-2 border-[#D69ADE]/30">
                <Target className="h-10 w-10 text-[#B84DC7]" />
                <Sparkles className="h-5 w-5 text-[#D69ADE] absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
              Kullanıcı Adını Seç
            </h1>
            <p className="text-gray-400">
              Sıralamada görünecek kullanıcı adını belirle
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-gray-300 block">
                Kullanıcı Adı
              </label>
              <Input
                id="username"
                type="text"
                placeholder="ornek_kullanici_adi"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                required
                minLength={3}
                maxLength={20}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#D69ADE] focus:ring-[#D69ADE]"
                autoFocus
              />
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>• 3-20 karakter arası</p>
                  <p>• Sadece harf, rakam ve alt çizgi (_)</p>
                  <p>• Sıralamada bu isim görünecek</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full h-12 bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Devam Et</span>
                </div>
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#D69ADE]/10 to-[#B84DC7]/10 border border-[#D69ADE]/20">
            <p className="text-xs text-gray-300 text-center">
              💡 <span className="font-semibold">İpucu:</span> Kullanıcı adınızı daha sonra değiştirebilirsiniz, ancak sıralamada görünecek isim bu olacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

