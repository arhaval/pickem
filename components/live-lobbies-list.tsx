"use client";

import Link from "next/link";
import { Radio, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveLobby {
  id: number;
  name: string;
  code: string;
  viewers: number;
  isActive: boolean;
}

const liveLobbies: LiveLobby[] = [
  {
    id: 1,
    name: "NAVI vs FaZe - Final",
    code: "NAVIFAZE",
    viewers: 1247,
    isActive: true,
  },
  {
    id: 2,
    name: "Vitality vs G2 - Yarı Final",
    code: "VITG2",
    viewers: 892,
    isActive: true,
  },
];

export default function LiveLobbiesList() {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#131720] to-[#0f172a] p-5">
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-4 w-4 text-[#D69ADE]" />
            <span className="absolute inset-0 animate-ping">
              <Radio className="h-4 w-4 text-[#D69ADE] opacity-50" />
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Canlı Yayınlar
          </h3>
        </div>
        <span className="rounded-full bg-[#D69ADE]/20 px-2 py-0.5 text-[10px] font-semibold text-[#D69ADE] uppercase">
          {liveLobbies.length} Aktif
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {liveLobbies.map((lobby) => (
          <Link
            key={lobby.id}
            href={`/live/${lobby.code}`}
            className={cn(
              "group block rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-3 transition-all duration-200 hover:border-[#D69ADE]/50 hover:bg-black/50 hover:shadow-lg hover:shadow-[#D69ADE]/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white mb-1 truncate">{lobby.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Users className="h-3 w-3" />
                  <span>{lobby.viewers} izleyici</span>
                  <span className="text-[#D69ADE]">•</span>
                  <span className="font-mono text-[10px]">{lobby.code}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#D69ADE] flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full border-white/10 text-white text-xs hover:bg-white/5 hover:border-[#D69ADE]/30"
      >
        <Link href="/live" className="flex items-center justify-center gap-2 py-2">
          Tüm Yayınları Gör
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
