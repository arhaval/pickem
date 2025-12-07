"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Şifre güncellenemedi!");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // 2 saniye sonra admin login sayfasına yönlendir
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu!");
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-white mb-2">Şifre Sıfırlama</h1>
          <p className="text-gray-400">Yeni şifrenizi belirleyin</p>
        </div>

        {/* Reset Form */}
        <div className="bg-[#131720] rounded-xl border border-white/10 p-8 shadow-2xl">
          {success ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Şifre Başarıyla Güncellendi!</h2>
              <p className="text-gray-400 mb-6">
                Yeni şifreniz kaydedildi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Yeni Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 h-12"
                />
                <p className="text-xs text-gray-500">En az 6 karakter olmalıdır</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Yeni Şifre (Tekrar)
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
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
                    Güncelleniyor...
                  </>
                ) : (
                  "Şifreyi Güncelle"
                )}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <a
              href="/admin/login"
              className="text-sm text-gray-400 hover:text-white transition-colors block text-center"
            >
              ← Giriş Sayfasına Dön
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}











