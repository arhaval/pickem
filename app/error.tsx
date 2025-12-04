"use client";

import { useEffect } from "react";
import { Home, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-4 opacity-50" />
          <h1 className="text-4xl font-black text-white mb-4">Bir Hata Oluştu</h1>
          <p className="text-gray-400 mb-2">
            Üzgünüz, beklenmeyen bir hata oluştu.
          </p>
          {error.message && (
            <p className="text-sm text-gray-500 mt-2">
              {error.message}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}






