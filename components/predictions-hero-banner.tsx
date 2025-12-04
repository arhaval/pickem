"use client";

import { Target, Zap, Trophy } from "lucide-react";

export default function PredictionsHeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0a0e1a] via-[#0f172a] to-[#0a0e1a]">
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* İçerik */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* İkon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Target className="h-16 w-16 md:h-20 md:w-20 text-[#D69ADE] animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Target className="h-16 w-16 md:h-20 md:w-20 text-[#D69ADE] opacity-30" />
              </div>
            </div>
          </div>

          {/* Başlık */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 bg-gradient-to-r from-[#B84DC7] via-[#E08AF0] to-[#D69ADE] bg-clip-text text-transparent">
            Maç Tahminleri
          </h1>

          {/* Alt Başlık */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Bilgini konuştur, tahminlerini yap ve büyük ödüller kazan. Her doğru tahmin sana puan kazandırır!
          </p>

          {/* Özellikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
              <Zap className="h-8 w-8 text-[#B84DC7]" />
              <h3 className="text-lg font-bold text-white">Hızlı Seçim</h3>
              <p className="text-sm text-gray-400 text-center">Maçları tek tıkla seç, puanları topla</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
              <Target className="h-8 w-8 text-[#D69ADE]" />
              <h3 className="text-lg font-bold text-white">Doğru Tahmin</h3>
              <p className="text-sm text-gray-400 text-center">İstatistikleri incele, bilinçli karar ver</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
              <Trophy className="h-8 w-8 text-[#B84DC7]" />
              <h3 className="text-lg font-bold text-white">Büyük Ödüller</h3>
              <p className="text-sm text-gray-400 text-center">Sıralamada yüksel, ödülleri kazan</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

