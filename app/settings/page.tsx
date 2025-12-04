"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Lock, Bell, Shield, Save, Loader2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Instagram, Twitter, Youtube, Twitch, Music } from "lucide-react";
import PageHeader from "@/components/page-header";
import Image from "next/image";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profil düzenleme formu
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitchUrl, setTwitchUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [steamId, setSteamId] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Şifre değiştirme formu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Agresif timeout - 2 saniye sonra loading'i kapat
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    try {
      setLoading(true);
      
      // getUser - Timeout ile ama yönlendirme yapma
      const getUserPromise = supabase.auth.getUser();
      const getUserTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null }, error: { message: 'Timeout' } }), 3000));
      const getUserResult = await Promise.race([getUserPromise, getUserTimeout]) as any;
      
      // Timeout durumunda yönlendirme yapma, sadece gerçek auth hatası varsa yönlendir
      if (getUserResult?.error && getUserResult.error.message !== 'Timeout') {
        // Gerçek bir auth hatası varsa yönlendir
        if (getUserResult.error.message?.includes('JWT') || getUserResult.error.message?.includes('session')) {
          clearTimeout(timeoutId);
          setLoading(false);
          router.push("/");
          return;
        }
      }
      
      // Timeout veya kullanıcı yoksa bile devam et, hata mesajı göster
      if (!getUserResult?.data?.user) {
        clearTimeout(timeoutId);
        setLoading(false);
        // Kullanıcı yoksa sayfayı göster ama hata mesajı ile
        return;
      }

      setUser(getUserResult.data.user);

      // Profil bilgilerini yükle - Çok kısa timeout
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", getUserResult.data.user.id)
        .maybeSingle();
      
      const profileTimeout = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 1500));
      const profileResult = await Promise.race([profilePromise, profileTimeout]) as any;
      
      if (profileResult?.data) {
        setProfile(profileResult.data);
        // Form değerlerini yükle
        setUsername(profileResult.data.username || "");
        setAvatarPreview(profileResult.data.avatar_url);
        setInstagramUrl(profileResult.data.instagram_url || "");
        setTwitterUrl(profileResult.data.twitter_url || "");
        setYoutubeUrl(profileResult.data.youtube_url || "");
        setTwitchUrl(profileResult.data.twitch_url || "");
        setTiktokUrl(profileResult.data.tiktok_url || "");
        setSteamId(profileResult.data.steam_id || "");
        
        // Username değiştirme tarihini kontrol et ve göster
        if (profileResult.data.username_changed_at) {
          const lastChangeDate = new Date(profileResult.data.username_changed_at);
          const daysSinceChange = Math.floor((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
          const remainingDays = Math.max(0, 30 - daysSinceChange);
          // Bu bilgiyi UI'da gösterebiliriz
        }
      } else {
        // Profil yoksa boş profil oluştur
        setProfile({
          id: getUserResult.data.user.id,
          username: null,
          avatar_url: null,
        });
      }
    } catch (error) {
      console.error("Kullanıcı verileri yüklenirken hata:", error);
      // Hata olsa bile loading'i kapat
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingAvatar(true);
      
      // Dosya kontrolü
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Lütfen bir resim dosyası seçin.");
        setUploadingAvatar(false);
        return null;
      }

      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Dosya boyutu 2MB'dan küçük olmalıdır.");
        setUploadingAvatar(false);
        return null;
      }

      // Kullanıcı bilgisini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Giriş yapmanız gerekiyor.");
        setUploadingAvatar(false);
        return null;
      }

      // Eski avatar'ı sil (varsa)
      if (profile?.avatar_url) {
        try {
          const urlParts = profile.avatar_url.split('/');
          const fileNameIndex = urlParts.findIndex((part: string) => part === 'avatars');
          if (fileNameIndex !== -1 && fileNameIndex < urlParts.length - 1) {
            const oldFileName = urlParts[fileNameIndex + 1]?.split('?')[0];
            if (oldFileName) {
              await supabase.storage.from('avatars').remove([oldFileName]);
            }
          }
        } catch (deleteError) {
          console.warn("Eski avatar silinirken hata:", deleteError);
        }
      }

      // Dosyayı Supabase Storage'a yükle
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Avatar yüklenirken hata:", uploadError);
        setErrorMessage("Avatar yüklenirken bir hata oluştu: " + uploadError.message);
        setUploadingAvatar(false);
        return null;
      }

      // Public URL al
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        setErrorMessage("Avatar URL'si alınamadı. Lütfen tekrar deneyin.");
        setUploadingAvatar(false);
        return null;
      }

      setUploadingAvatar(false);
      return data.publicUrl;
    } catch (error: any) {
      console.error("Avatar yükleme hatası:", error);
      setErrorMessage("Avatar yüklenirken bir hata oluştu: " + error.message);
      setUploadingAvatar(false);
      return null;
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setErrorMessage("Giriş yapmanız gerekiyor.");
        setSaving(false);
        return;
      }

      let finalAvatarUrl = avatarPreview;

      // Avatar yüklendiyse
      if (avatarFile) {
        const uploadedUrl = await handleAvatarUpload(avatarFile);
        if (!uploadedUrl) {
          setSaving(false);
          return;
        }
        finalAvatarUrl = uploadedUrl;
      }

      // Username kontrolü
      if (username.trim().length < 3) {
        setErrorMessage("Kullanıcı adı en az 3 karakter olmalıdır!");
        setSaving(false);
        return;
      }

      if (username.trim().length > 20) {
        setErrorMessage("Kullanıcı adı en fazla 20 karakter olabilir!");
        setSaving(false);
        return;
      }

      const newUsername = username.trim();
      const currentUsername = profile?.username || "";

      // Username değişti mi kontrol et (case-insensitive)
      const usernameChanged = newUsername.toLowerCase() !== currentUsername.toLowerCase();
      
      if (usernameChanged) {
        // İlk kez username set ediliyorsa (null ise) veya boş ise kısıt yok
        const isFirstTimeSetting = !currentUsername || currentUsername.trim() === "";
        
        if (!isFirstTimeSetting) {
          // 30 günde 1 kere kısıtı kontrolü
          if (profile?.username_changed_at) {
            const lastChangeDate = new Date(profile.username_changed_at);
            const daysSinceChange = Math.floor((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceChange < 30) {
              const remainingDays = 30 - daysSinceChange;
              setErrorMessage(`Kullanıcı adınızı 30 günde bir değiştirebilirsiniz. ${remainingDays} gün sonra tekrar deneyebilirsiniz.`);
              setSaving(false);
              return;
            }
          }
        }

        // Case-insensitive username benzersizlik kontrolü (kendi username'i hariç)
        const { data: existingUsers } = await supabase
          .from("profiles")
          .select("id, username")
          .neq("id", currentUser.id)
          .ilike("username", newUsername);

        if (existingUsers && existingUsers.length > 0) {
          setErrorMessage("Bu kullanıcı adı zaten kullanılıyor!");
          setSaving(false);
          return;
        }
      }

      // URL formatlarını düzelt (https:// ekle)
      const formatUrl = (url: string) => {
        if (!url.trim()) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url.trim();
        }
        return `https://${url.trim()}`;
      };

      // Profil güncelle
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Username ve username_changed_at'i güncelle
      // newUsername ve currentUsername zaten yukarıda tanımlı
      updateData.username = newUsername;
      
      // Username değiştiyse (case-insensitive) username_changed_at'i güncelle
      if (usernameChanged) {
        updateData.username_changed_at = new Date().toISOString();
      }

      if (finalAvatarUrl) {
        updateData.avatar_url = finalAvatarUrl;
      }

      if (instagramUrl.trim()) {
        updateData.instagram_url = formatUrl(instagramUrl);
      } else {
        updateData.instagram_url = null;
      }

      if (twitterUrl.trim()) {
        updateData.twitter_url = formatUrl(twitterUrl);
      } else {
        updateData.twitter_url = null;
      }

      if (youtubeUrl.trim()) {
        updateData.youtube_url = formatUrl(youtubeUrl);
      } else {
        updateData.youtube_url = null;
      }

      if (twitchUrl.trim()) {
        updateData.twitch_url = formatUrl(twitchUrl);
      } else {
        updateData.twitch_url = null;
      }

      if (tiktokUrl.trim()) {
        updateData.tiktok_url = formatUrl(tiktokUrl);
      } else {
        updateData.tiktok_url = null;
      }

      if (steamId.trim()) {
        updateData.steam_id = steamId.trim();
      } else {
        updateData.steam_id = null;
      }

      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", currentUser.id);

      if (updateError) {
        console.error("Profil güncellenirken hata:", updateError);
        setErrorMessage("Profil güncellenirken bir hata oluştu: " + updateError.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Profil başarıyla güncellendi!");
      setAvatarFile(null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
      
      // Profil verilerini yeniden yükle
      await loadUserData();

      // Navbar'ı bilgilendir - profil güncellendi
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: {
          username: newUsername,
          avatar_url: finalAvatarUrl || profile?.avatar_url,
        }
      }));

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error("Profil kaydetme hatası:", error);
      setErrorMessage("Bir hata oluştu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Yeni şifreler eşleşmiyor!");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setSaving(true);

    try {
      // Şifre değiştirme
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setErrorMessage(updateError.message || "Şifre güncellenemedi!");
        setSaving(false);
        return;
      }

      setSuccessMessage("Şifre başarıyla güncellendi!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaving(false);

      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Bir hata oluştu!");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#B84DC7]/30 border-t-[#B84DC7] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı yoksa bile sayfayı göster, sadece uyarı ver
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
  //       <div className="text-center">
  //         <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
  //         <p className="text-gray-400 text-lg mb-2">Giriş yapmanız gerekiyor.</p>
  //         <Button onClick={() => router.push("/")} className="mt-4">
  //           Ana Sayfaya Dön
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <PageHeader
        type="profile"
        title="Ayarlar"
        description="Hesap ayarlarınızı yönetin"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Kullanıcı yoksa uyarı göster */}
        {!user && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400">Giriş yapmanız gerekiyor. Lütfen sayfayı yenileyin veya giriş yapın.</span>
          </div>
        )}

        {/* Başarı/Hata Mesajları */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-green-400">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profil Ayarları */}
          <div className="bg-gradient-to-br from-[#131720] to-[#0f172a] rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Profil Ayarları</h2>
                <p className="text-sm text-gray-400">Kullanıcı adı, avatar ve sosyal medya bilgilerinizi düzenleyin</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* Avatar */}
              <div>
                <Label className="text-gray-300 mb-2 block">Profil Fotoğrafı</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                        <Image
                          src={avatarPreview}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B84DC7] to-[#D69ADE] flex items-center justify-center border-2 border-white/20">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                      disabled={uploadingAvatar || saving}
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-[#1a1f2e] border-white/20 text-white hover:bg-[#1a1f2e]/80"
                        disabled={uploadingAvatar || saving}
                        asChild
                      >
                        <span>
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Yükleniyor...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Fotoğraf Yükle
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Maksimum 2MB, JPG, PNG veya GIF</p>
                  </div>
                </div>
              </div>

              {/* Kullanıcı Adı */}
              <div>
                <Label htmlFor="username" className="text-gray-300">
                  Kullanıcı Adı
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                />
                <div className="mt-1">
                  <p className="text-xs text-gray-500">3-20 karakter arası, benzersiz olmalı</p>
                  {profile?.username_changed_at && (() => {
                    const lastChangeDate = new Date(profile.username_changed_at);
                    const daysSinceChange = Math.floor((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
                    const remainingDays = Math.max(0, 30 - daysSinceChange);
                    
                    if (remainingDays > 0 && username.trim().toLowerCase() !== (profile?.username || "").toLowerCase()) {
                      return (
                        <p className="text-xs text-yellow-400 mt-1">
                          ⚠️ Kullanıcı adınızı {remainingDays} gün sonra tekrar değiştirebilirsiniz. (30 günde 1 kere)
                        </p>
                      );
                    } else if (remainingDays === 0) {
                      return (
                        <p className="text-xs text-green-400 mt-1">
                          ✅ Kullanıcı adınızı değiştirebilirsiniz.
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Sosyal Medya Hesapları */}
              <div className="space-y-4">
                <Label className="text-gray-300 block">Sosyal Medya Hesapları</Label>
                
                <div>
                  <Label htmlFor="instagram" className="text-gray-400 text-sm flex items-center gap-2 mb-1">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder="instagram.com/kullaniciadi"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    disabled={saving}
                    className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter" className="text-gray-400 text-sm flex items-center gap-2 mb-1">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    type="text"
                    placeholder="twitter.com/kullaniciadi"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    disabled={saving}
                    className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube" className="text-gray-400 text-sm flex items-center gap-2 mb-1">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    type="text"
                    placeholder="youtube.com/@kullaniciadi"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={saving}
                    className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="twitch" className="text-gray-400 text-sm flex items-center gap-2 mb-1">
                    <Twitch className="h-4 w-4" />
                    Twitch
                  </Label>
                  <Input
                    id="twitch"
                    type="text"
                    placeholder="twitch.tv/kullaniciadi"
                    value={twitchUrl}
                    onChange={(e) => setTwitchUrl(e.target.value)}
                    disabled={saving}
                    className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tiktok" className="text-gray-400 text-sm flex items-center gap-2 mb-1">
                    <Music className="h-4 w-4" />
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    type="text"
                    placeholder="tiktok.com/@kullaniciadi"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    disabled={saving}
                    className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving || uploadingAvatar}
                className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Profili Kaydet
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Şifre Değiştirme */}
          <div className="bg-gradient-to-br from-[#131720] to-[#0f172a] rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Lock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Şifre Değiştir</h2>
                <p className="text-sm text-gray-400">Hesap güvenliğiniz için düzenli olarak şifrenizi güncelleyin</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-gray-300">
                  Yeni Şifre
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Yeni Şifre (Tekrar)
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifreyi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={saving}
                  className="bg-[#1a1f2e] border-white/20 text-white placeholder-gray-500 mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Şifreyi Güncelle
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Hesap Bilgileri */}
          <div className="bg-gradient-to-br from-[#131720] to-[#0f172a] rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Hesap Bilgileri</h2>
                <p className="text-sm text-gray-400">Hesap bilgilerinizi görüntüleyin</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm">Email</Label>
                <p className="text-white font-medium mt-1">{user.email}</p>
              </div>

              <div>
                <Label className="text-gray-400 text-sm">Kullanıcı Adı</Label>
                <p className="text-white font-medium mt-1">{profile?.username || "Belirtilmemiş"}</p>
              </div>

              <div>
                <Label className="text-gray-400 text-sm">Üyelik Tarihi</Label>
                <p className="text-white font-medium mt-1">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Bilinmiyor"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

