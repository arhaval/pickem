"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/supabase/client";

interface SiteSettings {
  notification_text: string | null;
  is_notification_active: boolean;
  notification_color: string | null;
}

export default function AnnouncementBar() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    
    // Real-time subscription for changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('Site settings updated:', payload);
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("notification_text, is_notification_active, notification_color")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Ayarlar yüklenirken hata:", JSON.stringify(error, null, 2));
        return;
      }

      setSettings(data);
    } catch (error: any) {
      console.error("Ayarlar yüklenirken hata:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Bildirim aktif değilse veya görünür değilse gösterme
  if (loading || !settings || !settings.is_notification_active || !isVisible) {
    return null;
  }

  // Renk seçimi
  const getColorClasses = (color: string | null) => {
    switch (color) {
      case "red":
        return "bg-red-500/20 border-red-500/30 text-red-300";
      case "yellow":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-300";
      case "blue":
        return "bg-blue-500/20 border-blue-500/30 text-blue-300";
      default:
        return "bg-[#B84DC7]/20 border-[#B84DC7]/30 text-[#B84DC7]";
    }
  };

  return (
    <div className={`relative w-full border-b ${getColorClasses(settings.notification_color)}`}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm font-medium text-center flex-1">
            {settings.notification_text || "Bildirim metni"}
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}














