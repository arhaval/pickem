"use client";

import { Trophy, Award, Medal, Sparkles } from "lucide-react";

interface Prize {
  rank: number;
  title: string;
  prize: string;
  icon: React.ReactNode;
  gradient: string;
}

const prizes: Prize[] = [
  {
    rank: 1,
    title: "Birincilik",
    prize: "10.000₺ + Özel Rozet",
    icon: <Trophy className="h-12 w-12 text-[#B84DC7]" />,
    gradient: "from-yellow-500/20 via-yellow-600/20 to-yellow-700/20",
  },
  {
    rank: 2,
    title: "İkincilik",
    prize: "5.000₺ + Özel Rozet",
    icon: <Medal className="h-12 w-12 text-gray-300" />,
    gradient: "from-gray-400/20 via-gray-500/20 to-gray-600/20",
  },
  {
    rank: 3,
    title: "Üçüncülük",
    prize: "2.500₺ + Özel Rozet",
    icon: <Award className="h-12 w-12 text-[#CD7F32]" />,
    gradient: "from-amber-600/20 via-amber-700/20 to-amber-800/20",
  },
];

export default function PrizeBanner() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0a0e1a] via-[#0f172a] to-[#0a0e1a]">
      {/* Arka Plan Efektleri - Hero Style */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B84DC7]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>

        {/* Sparkle Efektleri */}
        <div className="absolute top-20 left-1/4 animate-pulse">
          <Sparkles className="h-6 w-6 text-[#B84DC7]/50" />
        </div>
        <div className="absolute top-40 right-1/3 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Sparkles className="h-8 w-8 text-[#D69ADE]/50" />
        </div>
        <div className="absolute bottom-32 left-1/3 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <Sparkles className="h-6 w-6 text-[#B84DC7]/50" />
        </div>
      </div>

      {/* İçerik */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        {/* Başlık - Büyük ve Görsel */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-[#B84DC7] mr-4 animate-pulse" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight bg-gradient-to-r from-[#B84DC7] via-[#E08AF0] to-[#D69ADE] bg-clip-text text-transparent">
              Sezon Ödülleri
            </h1>
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-[#B84DC7] ml-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Bu sezonun en iyileri büyük ödüller kazanacak! Tahminlerini yap, sıralamada yüksel.
          </p>
        </div>

        {/* Ödül Kartları - Büyük ve Premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto mb-8">
          {prizes.map((prize, index) => (
            <div
              key={prize.rank}
              className={`relative rounded-2xl border-2 bg-gradient-to-br ${prize.gradient} p-8 md:p-10 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                index === 0
                  ? "border-[#B84DC7]/50 shadow-2xl shadow-[#B84DC7]/30 md:order-2"
                  : index === 1
                  ? "border-gray-400/50 shadow-xl shadow-gray-400/20 md:order-1"
                  : "border-amber-600/50 shadow-xl shadow-amber-600/20 md:order-3"
              }`}
            >
              {/* Sıra Numarası - Büyük */}
              <div
                className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl font-black border-4 border-[#0a0e1a] shadow-lg ${
                  index === 0
                    ? "bg-gradient-to-r from-[#B84DC7] to-[#E08AF0] text-black"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-300 to-gray-400 text-black"
                    : "bg-gradient-to-r from-[#CD7F32] to-[#8B4513] text-white"
                }`}
              >
                {prize.rank}
              </div>

              {/* İkon - Büyük */}
              <div className="flex justify-center mb-6 mt-4">{prize.icon}</div>

              {/* Başlık */}
              <h3 className="text-2xl md:text-3xl font-black text-white text-center mb-4">{prize.title}</h3>

              {/* Ödül - Büyük */}
              <p className="text-xl md:text-2xl font-bold text-center text-[#B84DC7] mb-2">
                {prize.prize.split('+')[0]}
              </p>
              <p className="text-base md:text-lg font-semibold text-center text-[#B84DC7]/80">
                + {prize.prize.split('+')[1]}
              </p>
            </div>
          ))}
        </div>

        {/* Alt Not */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm md:text-base text-gray-400">
            Ödüller sezon sonunda otomatik olarak hesaplanacak ve dağıtılacaktır.
          </p>
        </div>
      </div>
    </section>
  );
}

