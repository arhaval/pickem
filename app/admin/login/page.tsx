"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, AlertCircle, Mail, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Giriş yap
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData?.user) {
        setError("Email veya şifre hatalı!");
        setLoading(false);
        return;
      }

      // Başarılı - admin sayfasına yönlendir (admin kontrolü layout'ta yapılacak)
      router.push("/admin");
      // Loading'i kapat (yönlendirme olabilir)
      setTimeout(() => setLoading(false), 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Bir hata oluştu!");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetLoading(true);
    setResetSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || "Şifre sıfırlama e-postası gönderilemedi.");
        setResetLoading(false);
        return;
      }

      setResetSuccess(true);
      setResetLoading(false);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu!");
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Paneli</h1>
          <p className="text-gray-400">Yönetim paneline giriş yapın</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#131720] rounded-xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="yönetici@arhaval.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 h-12"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 h-12"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] hover:from-[#B84DC7]/90 hover:to-[#D69ADE]/90 text-white h-12 font-semibold shadow-lg shadow-[#B84DC7]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          {/* Şifremi Unuttum */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="text-sm text-[#B84DC7] hover:text-[#D69ADE] transition-colors"
            >
              {showResetPassword ? "Giriş formuna dön" : "Şifremi unuttum"}
            </button>

            {showResetPassword && (
              <div className="mt-4 p-4 bg-[#1a1f2e] rounded-lg border border-white/10">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="resetEmail" className="text-gray-300 text-sm">
                      Email
                    </Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="admin@arhaval.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={resetLoading}
                      className="bg-[#0a0e1a] border-white/20 text-white placeholder-gray-500 h-10 mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white h-10"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Şifre Sıfırlama E-postası Gönder
                      </>
                    )}
                  </Button>
                  {resetSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">
                        Şifre sıfırlama e-postası gönderildi! E-posta kutunuzu kontrol edin.
                      </span>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Sadece admin yetkisine sahip hesaplar giriş yapabilir
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
