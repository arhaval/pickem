"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail } from "lucide-react";

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: "login" | "register";
  hideHeader?: boolean;
}

export default function AuthModal({ isOpen: externalIsOpen, onClose, defaultTab = "login", hideHeader = false }: AuthModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose || setInternalIsOpen;
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Verileri
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Yeni eklenen
  const [confirmPassword, setConfirmPassword] = useState(""); // Yeni eklenen

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal açıldığında default tab'i ayarla
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Giriş başarısız: " + error.message);
    } else {
      if (onClose) onClose();
      window.location.reload();
    }
    setIsLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Şifre Kontrolü
    if (password !== confirmPassword) {
      alert("Şifreler eşleşmiyor, lütfen tekrar kontrol edin.");
      setIsLoading(false);
      return;
    }

    // 2. Kullanıcı Adı Uzunluk Kontrolü
    if (username.length < 3) {
      alert("Kullanıcı adı en az 3 karakter olmalıdır.");
      setIsLoading(false);
      return;
    }
    
    // 3. Auth Tablosuna Kayıt
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        // Kullanıcı adını metadata olarak da ekleyelim (yedek olsun)
        data: {
          username: username,
        }
      },
    });

    if (authError) {
      alert("Kayıt hatası: " + authError.message);
      setIsLoading(false);
      return;
    }

    // 4. Profil Tablosuna Kayıt
    // NOT: Profil otomatik olarak trigger tarafından oluşturulacak
    // Eğer trigger çalışmazsa, callback route'unda oluşturulacak
    if (authData.user) {
      // Profil trigger tarafından otomatik oluşturulacak
      
      // 5. Yönlendirme
      if (authData.session) {
        // Mail onayı kapalıysa direkt girdi demektir
        alert("Kayıt başarılı! Giriş yapıldı.");
        if (onClose) onClose();
        window.location.reload();
      } else {
        // Mail onayı açıksa
        setShowSuccess(true);
      }
    }
    
    setIsLoading(false);
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (onClose) {
          if (!open) onClose();
        } else {
          setInternalIsOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[400px] bg-[#0f172a] border border-white/10 text-white p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">E-posta Gönderildi!</h2>
          <p className="text-gray-400 mb-6">
            <span className="text-white font-medium">{email}</span> adresine bir doğrulama linki gönderdik.
          </p>
          <Button 
            className="w-full bg-[#D69ADE] hover:bg-[#B84DC7]" 
            onClick={() => {
              setShowSuccess(false);
              setActiveTab("login");
            }}
          >
            Tamam
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (onClose) {
        if (!open) onClose();
      } else {
        setInternalIsOpen(open);
      }
    }}>
      <DialogContent className="sm:max-w-[400px] bg-[#0f172a] border border-white/10 text-white p-0 overflow-hidden">
        {!hideHeader && (
          <div className="p-6 pb-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-center uppercase tracking-tight">
                Aramıza <span className="text-[#D69ADE]">Katıl</span>
              </DialogTitle>
              <DialogDescription className="text-center text-gray-400">
                Tahmin yapmak ve ödül kazanmak için devam et.
              </DialogDescription>
            </DialogHeader>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 bg-black/20">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 pt-4 pb-6">
            {/* GİRİŞ SEKME İÇERİĞİ */}
            <TabsContent value="login" className="mt-0 space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email">E-posta</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="mail@ornek.com" 
                    className="bg-black/20 border-white/10 text-white focus:border-[#D69ADE]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Şifre</Label>
                    <span className="text-xs text-[#D69ADE] cursor-pointer hover:underline">Unuttum?</span>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-black/20 border-white/10 text-white focus:border-[#D69ADE]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#D69ADE] hover:bg-[#B84DC7] text-white font-bold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Giriş Yap
                </Button>
              </form>
            </TabsContent>

            {/* KAYIT SEKME İÇERİĞİ - GÜNCELLENDİ */}
            <TabsContent value="register" className="mt-0 space-y-4">
              <form onSubmit={handleEmailSignUp} className="space-y-3">
                {/* Kullanıcı Adı */}
                <div className="space-y-1">
                  <Label htmlFor="reg-username">Kullanıcı Adı</Label>
                  <Input 
                    id="reg-username" 
                    type="text" 
                    placeholder="Kullanıcı adınız" 
                    className="bg-black/20 border-white/10 text-white focus:border-[#D69ADE]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>

                {/* E-posta */}
                <div className="space-y-1">
                  <Label htmlFor="reg-email">E-posta</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="mail@ornek.com" 
                    className="bg-black/20 border-white/10 text-white focus:border-[#D69ADE]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Şifre */}
                <div className="space-y-1">
                  <Label htmlFor="reg-password">Şifre</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    placeholder="En az 6 karakter" 
                    className="bg-black/20 border-white/10 text-white focus:border-[#D69ADE]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                {/* Şifre Tekrar */}
                <div className="space-y-1">
                  <Label htmlFor="reg-confirm-password">Şifre Tekrar</Label>
                  <Input 
                    id="reg-confirm-password" 
                    type="password" 
                    placeholder="Şifrenizi doğrulayın" 
                    className="bg-black/20 border-white/10 text-white focus:border-[#D69ADE]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#D69ADE] hover:bg-[#B84DC7] text-white font-bold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Hesap Oluştur
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}