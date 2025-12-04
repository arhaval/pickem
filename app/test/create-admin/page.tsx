"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    credentials?: {
      email: string;
      password: string;
      username: string;
    };
  } | null>(null);

  const handleCreateAdmin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/create-admin-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          credentials: data.credentials,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Bir hata oluştu",
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Beklenmeyen bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#131720] rounded-xl border border-white/10 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-[#B84DC7]" />
          <h1 className="text-2xl font-bold text-white">Admin Kullanıcısı Oluştur</h1>
        </div>

        <p className="text-gray-400 mb-6">
          Bu sayfa özel bir admin kullanıcısı oluşturur. Bu kullanıcı admin paneline erişebilir.
        </p>

        <Button
          onClick={handleCreateAdmin}
          disabled={loading}
          className="w-full bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Admin Kullanıcısı Oluştur
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    result.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.message}
                </p>
                {result.success && result.credentials && (
                  <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
                    <p className="text-sm font-semibold text-white mb-2">
                      Giriş Bilgileri:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white ml-2 font-mono">
                          {result.credentials.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Şifre:</span>
                        <span className="text-white ml-2 font-mono">
                          {result.credentials.password}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Kullanıcı Adı:</span>
                        <span className="text-white ml-2 font-mono">
                          {result.credentials.username}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-400 mt-3">
                      ⚠️ Bu bilgileri güvenli bir yerde saklayın ve ilk girişte şifreyi değiştirin!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-300">
            <strong>Not:</strong> Bu sayfa sadece development için. Production'da kaldırılmalı veya korumalı yapılmalı.
          </p>
        </div>
      </div>
    </div>
  );
}






