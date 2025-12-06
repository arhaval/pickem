import Link from "next/link";
import { Home, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Target className="h-24 w-24 text-[#B84DC7] mx-auto mb-4 opacity-50" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mb-2">Sayfa Bulunamadı</h2>
          <p className="text-gray-400">
            Aradığın sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold hover:opacity-90"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            <Link href="/matches">
              <Target className="h-4 w-4 mr-2" />
              Maçları Gör
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}










