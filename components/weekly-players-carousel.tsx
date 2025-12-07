"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Target, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Player {
  id: string;
  username: string;
  avatar_url?: string | null;
  rank: number;
  points: number;
  correct_predictions: number;
  total_predictions: number;
  accuracy: number;
  change: number; // Sıralama değişimi (+3, -1, vs.)
}

interface WeeklyPlayersCarouselProps {
  players: Player[];
}

export default function WeeklyPlayersCarousel({ players }: WeeklyPlayersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Otomatik geçiş
  useEffect(() => {
    if (!isAutoPlaying || players.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % players.length);
    }, 5000); // 5 saniyede bir geçiş

    return () => clearInterval(interval);
  }, [isAutoPlaying, players.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % players.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + players.length) % players.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Varsayılan oyuncular (eğer veri yoksa)
  const defaultPlayers: Player[] = [
    {
      id: "1",
      username: "ArhavalMaster",
      avatar_url: null,
      rank: 1,
      points: 15240,
      correct_predictions: 45,
      total_predictions: 60,
      accuracy: 75,
      change: 3,
    },
    {
      id: "2",
      username: "TahminKralı",
      avatar_url: null,
      rank: 2,
      points: 14890,
      correct_predictions: 42,
      total_predictions: 58,
      accuracy: 72,
      change: 1,
    },
    {
      id: "3",
      username: "ProGamer",
      avatar_url: null,
      rank: 3,
      points: 13850,
      correct_predictions: 40,
      total_predictions: 62,
      accuracy: 65,
      change: -2,
    },
  ];

  const displayPlayers = players.length > 0 ? players : defaultPlayers;

  if (displayPlayers.length === 0) return null;

  const currentPlayer = displayPlayers[currentIndex];

  return (
    <div className="relative w-full">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] flex items-center justify-center">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">TRCS Haftanın Oyuncuları</h2>
            <p className="text-sm text-gray-400">En iyi performans gösteren oyuncular</p>
          </div>
        </div>
        
        {/* Navigasyon Butonları */}
        {displayPlayers.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrev}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={goToNext}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Ana Kart */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] shadow-2xl">
        {/* Arka Plan Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B84DC7]/10 via-[#D69ADE]/5 to-transparent"></div>
        
        {/* Animasyonlu Arka Plan Efektleri */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B84DC7]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D69ADE]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* İçerik */}
        <div className="relative z-10 h-full flex flex-col p-8">
          {/* Üst Kısım - Rank Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4",
                currentPlayer.rank === 1 && "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 text-yellow-900",
                currentPlayer.rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-500 border-gray-200 text-gray-900",
                currentPlayer.rank === 3 && "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 text-orange-900",
                currentPlayer.rank > 3 && "bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] border-[#B84DC7]/50 text-white"
              )}>
                #{currentPlayer.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                    {currentPlayer.username}
                  </h3>
                  {currentPlayer.change > 0 && (
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                      +{currentPlayer.change}
                    </span>
                  )}
                  {currentPlayer.change < 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                      {currentPlayer.change}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">Haftanın En İyi Performansı</p>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] border-4 border-white/20 overflow-hidden">
                {currentPlayer.avatar_url ? (
                  <Image
                    src={currentPlayer.avatar_url}
                    alt={currentPlayer.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-black text-white uppercase">
                      {currentPlayer.username.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#B84DC7] border-2 border-[#131720] flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* İstatistikler Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Toplam Puan */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#B84DC7]/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Toplam Puan</p>
                  <p className="text-3xl font-black text-white mt-1">
                    {currentPlayer.points.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((currentPlayer.points / 20000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Başarı Oranı */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#B84DC7]/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Başarı Oranı</p>
                  <p className="text-3xl font-black text-white mt-1">
                    %{currentPlayer.accuracy}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#B84DC7] to-[#D69ADE] rounded-full transition-all duration-1000"
                  style={{ width: `${currentPlayer.accuracy}%` }}
                ></div>
              </div>
            </div>

            {/* Doğru Tahmin */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#B84DC7]/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Doğru Tahmin</p>
                  <p className="text-3xl font-black text-white mt-1">
                    {currentPlayer.correct_predictions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    / {currentPlayer.total_predictions} toplam
                  </p>
                </div>
              </div>
            </div>

            {/* Haftalık Değişim */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#B84DC7]/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Sıralama Değişimi</p>
                  <p className={cn(
                    "text-3xl font-black mt-1",
                    currentPlayer.change > 0 && "text-green-400",
                    currentPlayer.change < 0 && "text-red-400",
                    currentPlayer.change === 0 && "text-white"
                  )}>
                    {currentPlayer.change > 0 ? `+${currentPlayer.change}` : currentPlayer.change}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Bu hafta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alt Kısım - Progress Dots */}
          {displayPlayers.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {displayPlayers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-gradient-to-r from-[#B84DC7] to-[#D69ADE]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}











