"use client";

import { useState, useEffect } from "react";
import { Save, Youtube, Plus, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/client";

interface YouTubeVideo {
  title: string;
  thumbnailUrl: string;
  href: string;
}

export default function AdminVideos() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([
    { title: "", thumbnailUrl: "", href: "" },
    { title: "", thumbnailUrl: "", href: "" },
    { title: "", thumbnailUrl: "", href: "" },
  ]);

  useEffect(() => {
    let isMounted = true;
    
    const loadVideos = async () => {
      setLoading(true);
      
      // Kolon yoksa hata vermeden devam etmek için try-catch kullanıyoruz
      let data: any = null;
      let queryError: any = null;

      try {
          const { data: resultData, error: resultError } = await supabase
            .from("site_settings")
            .select("*")
            .eq("id", 1)
            .maybeSingle();
          
          if (!isMounted) return;
          
          data = resultData;
          queryError = resultError;

          // Kolon yoksa hatası (schema hatası)
          if (resultError && (
            resultError.message?.includes("homepage_videos") ||
            resultError.message?.includes("column") ||
            resultError.message?.includes("schema cache") ||
            resultError.code === "PGRST116"
          )) {
            console.warn("homepage_videos kolonu henüz oluşturulmamış. Lütfen migration dosyasını çalıştırın.");
            if (isMounted) {
              setVideos([
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
              ]);
            }
            return;
          }

          // Başka bir hata varsa
          if (resultError) {
            console.error("Videolar yüklenirken hata:", resultError);
            if (isMounted) {
              setVideos([
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
              ]);
            }
            return;
          }

          // Data yoksa boş array ile başla
          if (!data) {
            if (isMounted) {
              setVideos([
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
              ]);
            }
            return;
          }

          let videosData: YouTubeVideo[] = [];
          // homepage_videos kolonu varsa ve değeri varsa parse et
          if (data && 'homepage_videos' in data && data.homepage_videos) {
            if (typeof data.homepage_videos === 'string') {
              try {
                videosData = JSON.parse(data.homepage_videos);
              } catch (e) {
                console.error("Videolar parse hatası:", e);
                videosData = [];
              }
            } else if (Array.isArray(data.homepage_videos)) {
              videosData = data.homepage_videos;
            }
          }

          if (!isMounted) return;

          // Her zaman 3 slot göster (boş olsa bile)
          if (videosData.length === 0) {
            if (isMounted) {
              setVideos([
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
                { title: "", thumbnailUrl: "", href: "" },
              ]);
            }
          } else {
            // Thumbnail'leri otomatik doldur (eğer yoksa)
            const processedVideos = videosData.map((video: YouTubeVideo) => {
              if (!video.thumbnailUrl && video.href) {
                const thumbnail = extractYouTubeThumbnail(video.href);
                return { ...video, thumbnailUrl: thumbnail || video.thumbnailUrl };
              }
              return video;
            });
            
            // 3'e tamamla
            const paddedVideos = [...processedVideos];
            while (paddedVideos.length < 3) {
              paddedVideos.push({ title: "", thumbnailUrl: "", href: "" });
            }
            if (isMounted) {
              setVideos(paddedVideos.slice(0, 3));
            }
          }
      } catch (err: any) {
        // Schema hatası yakala
        if (err?.message && (
          err.message.includes("homepage_videos") ||
          err.message.includes("column") ||
          err.message.includes("schema")
        )) {
          console.warn("homepage_videos kolonu bulunamadı.");
          if (isMounted) {
            setVideos([
              { title: "", thumbnailUrl: "", href: "" },
              { title: "", thumbnailUrl: "", href: "" },
              { title: "", thumbnailUrl: "", href: "" },
            ]);
          }
          return;
        }
        // Diğer hatalar için
        console.error("Videolar yüklenirken hata:", err);
        if (isMounted) {
          setVideos([
            { title: "", thumbnailUrl: "", href: "" },
            { title: "", thumbnailUrl: "", href: "" },
            { title: "", thumbnailUrl: "", href: "" },
          ]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadVideos();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const updateVideo = (index: number, field: keyof YouTubeVideo, value: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Thumbnail'leri otomatik doldur (eğer yoksa)
      const videosWithThumbnails = videos.map((video, idx) => {
        if (!video.thumbnailUrl && video.href) {
          const thumbnail = extractYouTubeThumbnail(video.href);
          if (thumbnail) {
            console.log(`Auto-extracting thumbnail for video ${idx + 1}:`, thumbnail);
            return { ...video, thumbnailUrl: thumbnail };
          }
        }
        return video;
      });
      
      // Boş videoları filtrele (en az bir alan dolu olmalı)
      const filteredVideos = videosWithThumbnails.filter(
        (video) => video.title.trim() || video.thumbnailUrl.trim() || video.href.trim()
      );

      // Önce kolonun var olup olmadığını kontrol et, yoksa sadece updated_at güncelle
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // homepage_videos kolonu varsa ekle
      try {
        // Kolon var mı kontrol et - eğer hata verirse kolon yok demektir
        const { error: checkError } = await supabase
          .from("site_settings")
          .select("homepage_videos")
          .eq("id", 1)
          .single();

        if (!checkError) {
          // Kolon varsa update data'ya ekle
          updateData.homepage_videos = filteredVideos;
        } else {
          console.warn("homepage_videos kolonu bulunamadı. Lütfen migration dosyasını çalıştırın.");
          alert("homepage_videos kolonu henüz oluşturulmamış. Lütfen migration dosyasını çalıştırın: supabase/migrations/add_homepage_videos.sql");
          setSaving(false);
          return;
        }
      } catch (checkErr) {
        console.error("Kolon kontrolü hatası:", checkErr);
        alert("homepage_videos kolonu kontrol edilemedi. Lütfen migration dosyasını çalıştırın.");
        setSaving(false);
        return;
      }

      const { error } = await (supabase as any)
        .from("site_settings")
        .update(updateData)
        .eq("id", 1);

      if (error) {
        console.error("Videolar kaydedilirken hata:", error);
        alert(error.message || "Videolar kaydedilirken bir hata oluştu.");
        return;
      }

      alert("Videolar başarıyla kaydedildi!");
    } catch (error: any) {
      console.error("Videolar kaydedilirken hata:", error);
      alert(error?.message || "Videolar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const extractYouTubeThumbnail = (url: string): string => {
    // Boş veya geçersiz URL kontrolü
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return "";
    }
    
    // URL'yi temizle ve normalize et
    let cleanUrl = url.trim();
    
    // Farklı YouTube URL formatlarını destekle
    const patterns = [
      // https://www.youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      // https://youtu.be/VIDEO_ID
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      // https://www.youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      // https://www.youtube.com/v/VIDEO_ID
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      // https://m.youtube.com/watch?v=VIDEO_ID
      /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        // maxresdefault kullan, yoksa hqdefault'a düşer
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    return "";
  };

  const handleYouTubeUrlChange = (index: number, url: string) => {
    updateVideo(index, "href", url);
    // YouTube URL'sinden otomatik thumbnail çıkar (sadece URL varsa)
    if (url && url.trim().length > 0) {
      const thumbnail = extractYouTubeThumbnail(url);
      if (thumbnail) {
        updateVideo(index, "thumbnailUrl", thumbnail);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ana Sayfa Videoları</h1>
          <p className="text-gray-400">
            Ana sayfada "SON VIDEOLARIMIZ" bölümünde gösterilecek 3 videoyu buradan yönetebilirsiniz.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
        >
          {saving ? (
            "Kaydediliyor..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            className="bg-[#131720] border border-white/10 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Video {index + 1}</h3>
              {video.href && (
                <a
                  href={video.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D69ADE] hover:text-[#C97AE0] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Video Thumbnail Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-gray-900">
              {(() => {
                // Sadece href varsa thumbnail çıkar
                const thumbnailUrl = video.thumbnailUrl || (video.href ? extractYouTubeThumbnail(video.href) : "");
                return thumbnailUrl ? (
                  <img
                    key={thumbnailUrl}
                    src={thumbnailUrl}
                    alt={video.title || `Video ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src;
                      // İlk hata - hqdefault'u dene
                      if (currentSrc.includes("maxresdefault")) {
                        const videoId = currentSrc.match(/vi\/([^\/]+)\//)?.[1];
                        if (videoId) {
                          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          return;
                        }
                      }
                      // Hala yüklenemiyorsa placeholder göster
                      e.currentTarget.src = "https://via.placeholder.com/640x360/1a1a1a/ffffff?text=Video+Thumbnail";
                    }}
                    onLoad={() => {
                      console.log(`Thumbnail loaded successfully for video ${index + 1}:`, thumbnailUrl);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <Youtube className="h-16 w-16 text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500">Thumbnail yok</p>
                  </div>
                );
              })()}
            </div>

            {/* Video Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Video Başlığı
                </label>
                <Input
                  value={video.title}
                  onChange={(e) => updateVideo(index, "title", e.target.value)}
                  placeholder="Örn: CS2 Tahmin Rehberi"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  YouTube URL
                </label>
                <Input
                  value={video.href}
                  onChange={(e) => handleYouTubeUrlChange(index, e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  YouTube URL'si girildiğinde thumbnail otomatik yüklenir
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Thumbnail URL (Opsiyonel)
                </label>
                <Input
                  value={video.thumbnailUrl}
                  onChange={(e) => updateVideo(index, "thumbnailUrl", e.target.value)}
                  placeholder="https://img.youtube.com/vi/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Boş bırakılırsa YouTube URL'sinden otomatik alınır
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-[#131720] border border-[#D69ADE]/30 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Youtube className="h-5 w-5 text-[#D69ADE] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Bilgilendirme</h3>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Maksimum 3 video ekleyebilirsiniz.</li>
              <li>YouTube URL'si girildiğinde thumbnail otomatik olarak yüklenir.</li>
              <li>Boş videolar kaydedilmeyecektir (en az bir alan dolu olmalı).</li>
              <li>Video thumbnail'ı görünmüyorsa manuel olarak thumbnail URL'i ekleyebilirsiniz.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

