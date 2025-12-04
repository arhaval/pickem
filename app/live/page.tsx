"use client";

import { Radio, Users, ArrowRight, Zap, Trophy, Clock, Sparkles, Play, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Örnek aktif yayın - Gerçek veri veritabanından gelecek
const activeLiveLobby = {
  id: 1,
  name: "NAVI vs FaZe - Final",
  code: "NAVIFAZE",
  viewers: 1247,
  isActive: true,
  questions: 5,
  hero_image_url: null,
  event_title: "Eternal Fire vs NAVI Büyük Final",
  primary_color: "#D69ADE",
};

const liveLobbies = [
  {
    id: 1,
    name: "NAVI vs FaZe - Final",
    code: "NAVIFAZE",
    viewers: 1247,
    isActive: true,
    questions: 5,
  },
  {
    id: 2,
    name: "Vitality vs G2 - Yarı Final",
    code: "VITG2",
    viewers: 892,
    isActive: true,
    questions: 3,
  },
  {
    id: 3,
    name: "MOUZ vs Heroic",
    code: "MOUZHER",
    viewers: 520,
    isActive: true,
    questions: 2,
  },
];

const features = [
  {
    icon: Zap,
    title: "Anlık Sorular",
    description: "Maç sırasında anlık sorular sorulur",
  },
  {
    icon: Trophy,
    title: "Canlı Puanlama",
    description: "Doğru cevaplar anında puan kazandırır",
  },
  {
    icon: TrendingUp,
    title: "Gerçek Zamanlı",
    description: "Diğer oyuncularla canlı yarış",
  },
];

export default function LivePage() {
  const primaryColor = activeLiveLobby.primary_color || "#D69ADE";

  return (
    <div className="min-h-screen relative bg-[#0a0e1a]">
      {/* Hero Section - Dinamik ve Çekici */}
      <section
        className="relative overflow-hidden h-[500px] md:h-[600px] border-b border-white/5"
        style={{
          backgroundColor: activeLiveLobby.primary_color
            ? `${activeLiveLobby.primary_color}10`
            : "#0a0e1a",
        }}
      >
        {/* Arka Plan Görseli */}
        {activeLiveLobby.hero_image_url ? (
          <div className="absolute inset-0">
            <Image
              src={activeLiveLobby.hero_image_url}
              alt={activeLiveLobby.event_title || activeLiveLobby.name}
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>
        ) : (
          <div className="absolute inset-0">
            {/* Animated Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D69ADE]/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B84DC7]/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#D69ADE]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}></div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(10, 14, 26, 0.7) 0%, rgba(10, 14, 26, 0.95) 100%)`,
          }}
        ></div>

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

        {/* İçerik */}
        <div className="container relative z-10 mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center max-w-5xl">
            {/* Live Badge - Büyük ve Çekici */}
            <div className="mb-8 flex justify-center">
              <div className="group relative flex items-center gap-4 rounded-full bg-gradient-to-r from-[#D69ADE]/20 to-[#C97AE0]/20 px-8 py-4 border-2 border-[#D69ADE]/50 backdrop-blur-sm shadow-lg shadow-[#D69ADE]/30">
                <div className="relative">
                  <Radio className="h-8 w-8 text-white" />
                  <span className="absolute inset-0 animate-ping">
                    <Radio className="h-8 w-8 text-white opacity-50" />
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-2xl font-black uppercase tracking-wider text-white leading-tight">
                    CANLI YAYIN
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {activeLiveLobby.viewers} kişi izliyor
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D69ADE]/0 via-[#D69ADE]/20 to-[#D69ADE]/0 animate-shimmer"></div>
              </div>
            </div>

            {/* Event Title - Büyük ve Etkileyici */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-6 leading-tight"
              style={{
                color: activeLiveLobby.primary_color || "#B84DC7",
                textShadow: `0 0 30px ${primaryColor}40, 0 0 60px ${primaryColor}20`,
              }}
            >
              {activeLiveLobby.event_title || activeLiveLobby.name}
            </h1>

            {/* Alt Başlık */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Maç içindeki anlık soruları yanıtla, puanları topla ve diğer oyuncularla{" "}
              <span className="text-[#B84DC7] font-bold">canlı yarış</span>
            </p>

            {/* Özellikler - Kısa ve Öz */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <Icon className="h-4 w-4 text-[#B84DC7]" />
                    <span className="text-sm text-gray-300">{feature.title}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Butonları - Büyük ve Çekici */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="group relative bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold text-lg uppercase tracking-wide px-10 py-7 hover:scale-105 transition-all shadow-2xl shadow-[#D69ADE]/50 hover:shadow-[#D69ADE]/70"
              >
                <Link href={`/live/${activeLiveLobby.code}`} className="flex items-center gap-3">
                  <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>Hemen Katıl</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/20 text-white font-semibold text-lg px-10 py-7 hover:bg-white/10 hover:border-[#B84DC7]/50 transition-all backdrop-blur-sm"
              >
                <Link href={`/live/${activeLiveLobby.code}`} className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Yayını İzle</span>
                </Link>
              </Button>
            </div>

            {/* Canlı İstatistikler */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{activeLiveLobby.viewers.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Canlı İzleyici</p>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#B84DC7] to-[#E08AF0] flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{activeLiveLobby.questions}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Aktif Soru</p>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#B84DC7] flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">Canlı</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Şu An Devam Ediyor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ana İçerik */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Diğer Canlı Yayın Kartları */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Radio className="h-6 w-6 text-[#D69ADE]" />
            <h2 className="text-3xl font-bold text-white">Diğer Canlı Yayınlar</h2>
            <span className="rounded-full bg-[#D69ADE]/20 px-3 py-1 text-xs font-semibold text-[#D69ADE]">
              {liveLobbies.length} Aktif
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveLobbies.map((lobby) => (
              <Link
                key={lobby.id}
                href={`/live/${lobby.code}`}
                className="group relative overflow-hidden rounded-xl border border-[#D69ADE]/30 bg-gradient-to-br from-[#131720] to-[#0f172a] p-6 transition-all duration-300 hover:border-[#D69ADE] hover:scale-105 hover:shadow-2xl hover:shadow-[#D69ADE]/20"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D69ADE]/0 via-[#D69ADE]/0 to-[#D69ADE]/0 group-hover:from-[#D69ADE]/5 group-hover:via-[#D69ADE]/10 group-hover:to-[#D69ADE]/5 transition-all duration-300"></div>

                {/* Live Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#D69ADE]/20 px-3 py-1.5 border border-[#D69ADE]/50">
                    <div className="relative">
                      <Radio className="h-3.5 w-3.5 text-white" />
                      <span className="absolute inset-0 animate-ping">
                        <Radio className="h-3.5 w-3.5 text-white opacity-50" />
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#D69ADE] uppercase">CANLI</span>
                  </div>
                </div>

                {/* İçerik */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 pr-16 group-hover:text-[#B84DC7] transition-colors">
                    {lobby.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{lobby.viewers}</span>
                      <span>izleyici</span>
                    </div>
                    <span className="text-[#D69ADE]">•</span>
                    <span>{lobby.questions} soru aktif</span>
                  </div>

                  {/* Kod */}
                  <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
                    <p className="text-xs text-gray-400 mb-1">Lobi Kodu</p>
                    <p className="text-xl font-mono font-black text-[#B84DC7]">{lobby.code}</p>
                  </div>

                  {/* Buton */}
                  <div className="flex items-center gap-2 text-[#D69ADE] group-hover:text-[#B84DC7] transition-colors font-semibold">
                    <span className="text-sm">Lobisine Katıl</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bilgi Kartı - Genişletilmiş */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] flex items-center justify-center">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Canlı Yayın Nedir?</h3>
              </div>
              <p className="text-base text-gray-300 leading-relaxed mb-4">
                Canlı yayın modunda, maç sırasında anlık sorular sorulur. Doğru cevaplar vererek
                puanlar kazanır ve diğer izleyicilerle yarışırsın. Maç bitince hemen sonuçlar
                açıklanır ve puanlar hesabına eklenir.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D69ADE]"></div>
                  Maç sırasında anlık sorular sorulur
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D69ADE]"></div>
                  Doğru cevaplar anında puan kazandırır
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D69ADE]"></div>
                  Diğer oyuncularla canlı yarış
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D69ADE]"></div>
                  Sonuçlar maç bitince hemen açıklanır
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border border-white/10 bg-black/30 text-center">
                <Trophy className="h-8 w-8 text-[#B84DC7] mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-1">500+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Toplam Puan</p>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-black/30 text-center">
                <Users className="h-8 w-8 text-[#D69ADE] mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-1">2,500+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Aktif Kullanıcı</p>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-black/30 text-center">
                <Zap className="h-8 w-8 text-[#B84DC7] mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-1">50+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Yayın Sayısı</p>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-black/30 text-center">
                <Clock className="h-8 w-8 text-[#D69ADE] mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-1">24/7</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Canlı Destek</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
