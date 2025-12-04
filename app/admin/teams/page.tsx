"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/supabase/client";
import Image from "next/image";

interface Team {
  id: number;
  name: string;
  logo_url: string;
  short_code: string;
  created_at: string;
}

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    logo_url: "",
  });

  // Takımları yükle
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Takımlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logo yükleme
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Dosya boyutu 2MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `team-${Date.now()}.${fileExt}`;
      const filePath = `teams/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teams')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Logo yüklenirken hata:", JSON.stringify(uploadError, null, 2));
        
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("not found")) {
          alert(
            "Teams bucket bulunamadı!\n\n" +
            "Lütfen Supabase Dashboard'dan bucket oluşturun:\n" +
            "1. Storage sekmesine gidin\n" +
            "2. 'Create a new bucket' butonuna tıklayın\n" +
            "3. Name: 'teams'\n" +
            "4. Public bucket: Evet\n" +
            "5. Create bucket\n\n" +
            "Veya logo URL'i ile devam edebilirsiniz."
          );
        } else {
          alert(uploadError.message || "Logo yüklenirken bir hata oluştu.");
        }
        return;
      }

      const { data } = supabase.storage
        .from('teams')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setFormData({ ...formData, logo_url: data.publicUrl });
        alert("Logo başarıyla yüklendi!");
      }
    } catch (error: any) {
      console.error("Logo yüklenirken hata:", JSON.stringify(error, null, 2));
      alert(error?.message || "Logo yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Yeni takım ekle
  const handleAddTeam = async () => {
    if (!formData.name || !formData.short_code) {
      alert("Lütfen takım adı ve kısaltma alanlarını doldurun.");
      return;
    }

    if (!formData.logo_url) {
      alert("Lütfen logo yükleyin veya logo URL'i girin.");
      return;
    }

    try {
      const { error } = await (supabase as any).from("teams").insert([
        {
          name: formData.name,
          short_code: formData.short_code,
          logo_url: formData.logo_url,
        },
      ]);

      if (error) throw error;

      // Formu temizle ve dialog'u kapat
      setFormData({ name: "", short_code: "", logo_url: "" });
      setIsDialogOpen(false);
      loadTeams(); // Listeyi yenile
    } catch (error: any) {
      console.error("Takım eklenirken hata:", error);
      alert(error.message || "Takım eklenirken bir hata oluştu.");
    }
  };

  // Takım sil
  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Bu takımı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const { error } = await supabase.from("teams").delete().eq("id", id);

      if (error) throw error;

      loadTeams(); // Listeyi yenile
    } catch (error: any) {
      console.error("Takım silinirken hata:", error);
      alert(error.message || "Takım silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Takım Bankası</h1>
          <p className="text-gray-400">
            Takımları ekleyin, düzenleyin ve logolarını yönetin.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Takım Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Takım Ekle</DialogTitle>
              <DialogDescription>
                Takım bilgilerini girin ve kaydedin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Takım Adı
                </label>
                <Input
                  placeholder="Örn: Natus Vincere"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Kısaltma
                </label>
                <Input
                  placeholder="Örn: NAVI"
                  value={formData.short_code}
                  onChange={(e) =>
                    setFormData({ ...formData, short_code: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  <ImageIcon className="h-4 w-4 inline mr-1" />
                  Logo
                </label>
                <div className="space-y-3">
                  {formData.logo_url ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={formData.logo_url}
                          alt="Logo önizleme"
                          className="w-32 h-32 object-contain rounded-lg border border-white/10 bg-white/5 p-2"
                        />
                        <button
                          onClick={() => setFormData({ ...formData, logo_url: "" })}
                          className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                          title="Logoyu Kaldır"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                        <img
                          src={formData.logo_url}
                          alt="Logo thumbnail"
                          className="w-12 h-12 object-contain rounded border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 truncate">Yüklenen Logo</p>
                          <p className="text-xs text-gray-500 truncate">{formData.logo_url}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center bg-white/5">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-3">Logo yükleyin veya URL girin</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 mb-2"
                      >
                        {uploading ? (
                          "Yükleniyor..."
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Dosya Seç
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">veya</p>
                    </div>
                  )}
                  <Input
                    placeholder="Logo URL'i (Örn: /teams/navi.png veya https://...)"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Logo yükleyebilir veya direkt URL girebilirsiniz
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                className="bg-[#B84DC7] hover:bg-[#B84DC7]/90 text-white"
                onClick={handleAddTeam}
              >
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Table */}
      <div className="bg-[#131720] border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Henüz takım eklenmemiş. İlk takımı eklemek için yukarıdaki butona
            tıklayın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e1a] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Takım Adı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Kısaltma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Logo URL
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {team.logo_url ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                            <Image
                              src={team.logo_url}
                              alt={team.name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#B84DC7]/10 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-[#B84DC7]" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {team.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {team.short_code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400 max-w-xs truncate">
                        {team.logo_url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={isDeleting === team.id}
                      >
                        {isDeleting === team.id ? (
                          "Siliniyor..."
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
