"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateTestUserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/create-test-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Bir hata oluştu");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-[#131720] to-[#0f172a] rounded-xl border border-white/10 p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Test Kullanıcısı Oluştur
        </h1>

        <div className="space-y-4">
          <p className="text-sm text-gray-400 text-center">
            Bu sayfa test kullanıcısı oluşturmak için kullanılır.
            <br />
            <span className="text-yellow-400">Sadece development için!</span>
          </p>

          <Button
            onClick={handleCreateUser}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold hover:opacity-90"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Oluşturuluyor...
              </>
            ) : (
              "Test Kullanıcısı Oluştur"
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {result.message || "Başarılı!"}
              </div>

              {result.credentials && (
                <div className="p-4 rounded-lg bg-[#1a1f2e] border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Giriş Bilgileri:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Email:</span>{" "}
                      <span className="text-white font-mono">
                        {result.credentials.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Şifre:</span>{" "}
                      <span className="text-white font-mono">
                        {result.credentials.password}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Kullanıcı Adı:</span>{" "}
                      <span className="text-white font-mono">
                        {result.credentials.username}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Bu sayfayı production'da kaldırmayı unutma!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}






