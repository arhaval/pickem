"use client";

import { Users, Calendar, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: "positive" | "negative";
}) {
  return (
    <div className="bg-[#131720] border border-white/10 rounded-lg p-6 hover:border-[#B84DC7]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-[#B84DC7]/10">
          <Icon className="h-6 w-6 text-[#B84DC7]" />
        </div>
        {change && (
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive"
                ? "text-green-400"
                : changeType === "negative"
                ? "text-red-400"
                : "text-gray-400"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
    </div>
  );
}

export default function AdminDashboard() {
  // Dummy data - şimdilik statik
  const stats = [
    {
      title: "Toplam Kullanıcı",
      value: "1,234",
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Aktif Maçlar",
      value: "8",
      icon: Calendar,
      change: "3 canlı",
      changeType: undefined,
    },
    {
      title: "Bugünkü Tahminler",
      value: "456",
      icon: Target,
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Toplam Puan Dağıtımı",
      value: "12,450",
      icon: TrendingUp,
      change: "+8%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Genel Bakış</h1>
        <p className="text-gray-400">
          Yönetim paneline hoş geldiniz. Sistem istatistiklerini buradan
          takip edebilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-[#131720] border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#0a0e1a] rounded-lg border border-white/5">
            <div className="p-2 rounded-lg bg-[#B84DC7]/10">
              <Users className="h-4 w-4 text-[#B84DC7]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">
                Yeni kullanıcı kaydı: <span className="font-semibold">user123</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">2 dakika önce</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[#0a0e1a] rounded-lg border border-white/5">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Calendar className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">
                Yeni maç eklendi: <span className="font-semibold">NAVI vs FaZe</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">15 dakika önce</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[#0a0e1a] rounded-lg border border-white/5">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">
                Toplu tahmin güncellemesi yapıldı
              </p>
              <p className="text-xs text-gray-400 mt-1">1 saat önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

