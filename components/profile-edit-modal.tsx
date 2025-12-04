"use client";

import { useState, useRef, useEffect } from "react";
import { X, User, Upload, Image as ImageIcon, Instagram, Twitter, Youtube, Twitch, Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/supabase/client";
import Image from "next/image";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string | null;
  currentAvatarUrl: string | null;
  onUpdate: () => void;
  currentInstagramUrl?: string | null;
  currentTwitterUrl?: string | null;
  currentYoutubeUrl?: string | null;
  currentTwitchUrl?: string | null;
  currentTiktokUrl?: string | null;
  currentSteamId?: string | null;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  currentUsername,
  currentAvatarUrl,
  onUpdate,
  currentInstagramUrl,
  currentTwitterUrl,
  currentYoutubeUrl,
  currentTwitchUrl,
  currentTiktokUrl,
  currentSteamId,
}: ProfileEditModalProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState(currentInstagramUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(currentTwitterUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(currentYoutubeUrl || "");
  const [twitchUrl, setTwitchUrl] = useState(currentTwitchUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(currentTiktokUrl || "");
  const [steamId, setSteamId] = useState(currentSteamId || "");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Modal açıldığında mevcut değerleri yükle
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || "");
      setAvatarPreview(currentAvatarUrl);
      setAvatarFile(null);
      setError(null);
      setSuccess(null);
      setInstagramUrl(currentInstagramUrl || "");
      setTwitterUrl(currentTwitterUrl || "");
      setYoutubeUrl(currentYoutubeUrl || "");
      setTwitchUrl(currentTwitchUrl || "");
      setTiktokUrl(currentTiktokUrl || "");
      setSteamId(currentSteamId || "");
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  }, [isOpen, currentUsername, currentAvatarUrl, currentInstagramUrl, currentTwitterUrl, currentYoutubeUrl, currentTwitchUrl, currentTiktokUrl, currentSteamId]);

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingAvatar(true);
      
      // Dosya kontrolü
      if (!file.type.startsWith('image/')) {
        setError("Lütfen bir resim dosyası seçin.");
        return null;
      }

      if (file.size > 2 * 1024 * 1024) {
        setError("Dosya boyutu 2MB'dan küçük olmalıdır.");
        return null;
      }

      // Kullanıcı bilgisini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Giriş yapmanız gerekiyor.");
        return null;
      }

      // Eski avatar'ı sil (varsa) - Supabase Storage URL'inden dosya adını çıkar
      if (currentAvatarUrl) {
        try {
          // URL formatı: https://[project].supabase.co/storage/v1/object/public/avatars/[filename]
          const urlParts = currentAvatarUrl.split('/');
          const fileNameIndex = urlParts.findIndex(part => part === 'avatars');
          if (fileNameIndex !== -1 && fileNameIndex < urlParts.length - 1) {
            const oldFileName = urlParts[fileNameIndex + 1]?.split('?')[0]; // Query string'i kaldır
            if (oldFileName) {
              await supabase.storage.from('avatars').remove([oldFileName]);
            }
          }
        } catch (deleteError) {
          // Eski avatar silinirken hata olsa bile devam et
          console.warn("Eski avatar silinirken hata:", deleteError);
        }
      }

      // Dosyayı Supabase Storage'a yükle
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Bucket zaten 'avatars', dosya yolu sadece dosya adı

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Avatar yüklenirken hata:", uploadError);
        if (uploadError.message?.includes("Bucket not found")) {
          setError("Avatar bucket bulunamadı. Lütfen Supabase Dashboard'dan 'avatars' bucket'ını oluşturun.");
        } else {
          setError("Avatar yüklenirken bir hata oluştu: " + uploadError.message);
        }
        return null;
      }

      // Public URL al
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        setError("Avatar URL'si alınamadı. Lütfen tekrar deneyin.");
        return null;
      }

      return data.publicUrl;
    } catch (error: any) {
      console.error("Avatar yüklenirken hata:", error);
      setError(error?.message || "Avatar yüklenirken bir hata oluştu.");
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
      return "Kullanıcı adı boş olamaz";
    }

    if (username.length < 3) {
      return "Kullanıcı adı en az 3 karakter olmalıdır";
    }

    if (username.length > 20) {
      return "Kullanıcı adı en fazla 20 karakter olabilir";
    }

    // Only allow alphanumeric, underscore, and Turkish characters
    const usernameRegex = /^[a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]+$/;
    if (!usernameRegex.test(username)) {
      return "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir";
    }

    return null;
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      // Kullanıcı bilgisini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Giriş yapmanız gerekiyor.");
        setSaving(false);
        return;
      }

      // Username validasyonu
      const trimmedUsername = username.trim();
      const validationError = validateUsername(trimmedUsername);
      if (validationError) {
        setError(validationError);
        setSaving(false);
        return;
      }

      // Username değiştiyse benzersizlik kontrolü yap
      if (trimmedUsername.toLowerCase() !== (currentUsername || "").toLowerCase()) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", trimmedUsername.toLowerCase())
          .neq("id", user.id) // Kendi profilini hariç tut
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = no rows, yani kullanıcı adı müsait
          console.error("Kullanıcı adı kontrolü hatası:", checkError);
          setError("Kullanıcı adı kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.");
          setSaving(false);
          return;
        }

        if (existingUser) {
          setError("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin.");
          setSaving(false);
          return;
        }
      }

      // Avatar yükle (varsa)
      let avatarUrl: string | null = currentAvatarUrl;
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload(avatarFile);
        if (!avatarUrl && avatarFile) {
          setSaving(false);
          return; // Hata mesajı zaten setError ile gösterildi
        }
      }

      // URL formatını otomatik düzelt (kullanıcı adı veya URL kabul eder)
      const formatSocialUrl = (input: string, platform: 'instagram' | 'twitter' | 'youtube' | 'twitch' | 'tiktok'): string | null => {
        const trimmed = input.trim();
        if (!trimmed) return null;
        
        // Zaten tam URL ise olduğu gibi döndür
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        
        // Kullanıcı adı formatına göre URL oluştur
        const username = trimmed.replace(/^@/, ''); // @ işaretini kaldır
        const usernamePattern = /^[a-zA-Z0-9._-]+$/;
        if (!usernamePattern.test(username)) {
          return null; // Geçersiz kullanıcı adı
        }
        
        switch (platform) {
          case 'instagram':
            return `https://instagram.com/${username}`;
          case 'twitter':
            return `https://twitter.com/${username}`;
          case 'youtube':
            // YouTube için @ işareti varsa koru
            if (trimmed.startsWith('@')) {
              return `https://youtube.com/${trimmed}`;
            }
            return `https://youtube.com/@${username}`;
          case 'twitch':
            return `https://twitch.tv/${username}`;
          case 'tiktok':
            return `https://tiktok.com/@${username}`;
          default:
            return trimmed;
        }
      };

      // Steam ID formatını düzelt
      const formatSteamId = (input: string): string | null => {
        const trimmed = input.trim();
        if (!trimmed) return null;
        
        // Zaten URL ise ID'yi çıkar
        if (trimmed.includes('steamcommunity.com')) {
          const match = trimmed.match(/\/profiles\/(\d+)/);
          if (match) return match[1];
        }
        
        // Sadece sayı ise (Steam ID)
        if (/^\d+$/.test(trimmed)) {
          return trimmed;
        }
        
        // Kullanıcı adı gibi bir şey ise olduğu gibi döndür
        return trimmed;
      };

      // Sosyal medya URL'lerini formatla
      const formattedInstagram = formatSocialUrl(instagramUrl, 'instagram');
      const formattedTwitter = formatSocialUrl(twitterUrl, 'twitter');
      const formattedYoutube = formatSocialUrl(youtubeUrl, 'youtube');
      const formattedTwitch = formatSocialUrl(twitchUrl, 'twitch');
      const formattedTiktok = formatSocialUrl(tiktokUrl, 'tiktok');
      const formattedSteam = formatSteamId(steamId);

      // Profili güncelle - önce temel alanları güncelle
      const updateData: any = {
        username: trimmedUsername,
        avatar_url: avatarUrl,
        steam_id: formattedSteam,
        updated_at: new Date().toISOString(),
      };

      // Sosyal medya kolonlarını ekle (varsa)
      try {
        // Önce kolonların var olup olmadığını kontrol et
        const { error: testError } = await supabase
          .from("profiles")
          .select("instagram_url")
          .eq("id", user.id)
          .limit(1);
        
        // Eğer hata yoksa (kolonlar varsa), sosyal medya alanlarını ekle
        if (!testError || testError.code !== '42703') { // 42703 = column does not exist
          updateData.instagram_url = formattedInstagram;
          updateData.twitter_url = formattedTwitter;
          updateData.youtube_url = formattedYoutube;
          updateData.twitch_url = formattedTwitch;
          updateData.tiktok_url = formattedTiktok;
        }
      } catch (e) {
        // Kolonlar yoksa sadece temel alanları güncelle
        console.warn("Sosyal medya kolonları henüz eklenmemiş, sadece temel alanlar güncelleniyor");
      }

      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        console.error("Profil güncellenirken hata:", updateError);
        
        // Daha anlaşılır hata mesajları
        if (updateError.code === '23505') {
          setError("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin.");
        } else if (updateError.code === '42501') {
          setError("Bu işlemi yapmak için yetkiniz yok. Lütfen giriş yaptığınızdan emin olun.");
        } else {
          setError(updateError.message || "Profil güncellenirken bir hata oluştu.");
        }
        setSaving(false);
        return;
      }

      // Başarılı
      setSuccess("Profil başarıyla güncellendi!");
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("Profil güncellenirken hata:", error);
      setError(error?.message || "Profil güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#0a0e1a] via-[#131720] to-[#0f172a] backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">
            Profili Düzenle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Avatar */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil Resmi
            </label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#B84DC7]">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(currentAvatarUrl);
                      if (avatarInputRef.current) {
                        avatarInputRef.current.value = '';
                      }
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                disabled={saving || uploadingAvatar}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {uploadingAvatar ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarPreview ? "Değiştir" : "Resim Seç"}
                  </>
                )}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
                disabled={saving || uploadingAvatar}
              />
            </div>
            <p className="text-xs text-gray-400">Maksimum 2MB, JPG, PNG veya GIF</p>
          </div>

          {/* Kullanıcı Adı */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Kullanıcı Adı
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={saving}
              minLength={3}
              maxLength={20}
              className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">3-20 karakter arası, sadece harf, rakam ve alt çizgi</p>
          </div>

          {/* Sosyal Medya */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h3 className="text-sm font-semibold text-gray-300">Sosyal Medya (Opsiyonel)</h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="instagram" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Instagram
                </label>
                <Input
                  id="instagram"
                  type="text"
                  placeholder="kullaniciadi veya @kullaniciadi"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">Sadece kullanıcı adını yazın (örn: kullaniciadi)</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="twitter" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  Twitter
                </label>
                <Input
                  id="twitter"
                  type="text"
                  placeholder="kullaniciadi veya @kullaniciadi"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">Sadece kullanıcı adını yazın (örn: kullaniciadi)</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="youtube" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  YouTube
                </label>
                <Input
                  id="youtube"
                  type="text"
                  placeholder="@kanaladi veya kanaladi"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">Kanal adını yazın (örn: @kanaladi)</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="twitch" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Twitch className="h-4 w-4 text-purple-500" />
                  Twitch
                </label>
                <Input
                  id="twitch"
                  type="text"
                  placeholder="kullaniciadi"
                  value={twitchUrl}
                  onChange={(e) => setTwitchUrl(e.target.value)}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">Sadece kullanıcı adını yazın (örn: kullaniciadi)</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="tiktok" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Music className="h-4 w-4 text-gray-400" />
                  TikTok
                </label>
                <Input
                  id="tiktok"
                  type="text"
                  placeholder="@kullaniciadi veya kullaniciadi"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">Sadece kullanıcı adını yazın (örn: kullaniciadi)</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="steam" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                  Steam ID
                </label>
                <Input
                  id="steam"
                  type="text"
                  placeholder="Steam ID (sayı) veya profil URL'si"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">Steam ID (sayı) veya profil URL'si girebilirsiniz</p>
              </div>
            </div>
          </div>

          {/* Başarı Mesajı */}
          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingAvatar}
              className="flex-1 bg-gradient-to-r from-[#D69ADE] to-[#C97AE0] text-white font-bold hover:opacity-90"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


