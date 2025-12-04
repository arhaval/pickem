"use client";

import Image from "next/image";

interface TeamLogoProps {
  teamName: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

// Fallback logo - logo URL yoksa veya yüklenemezse kullanılacak
const fallbackLogo = "/teams/aurora.png";

export default function TeamLogo({ teamName, logoUrl, size = 64, className = "" }: TeamLogoProps) {
  // Logo URL varsa ve boş değilse kullan, yoksa fallback logo kullan
  const logoPath = (logoUrl && logoUrl.trim() !== "") ? logoUrl : fallbackLogo;
  
  // Debug: Logo URL'lerini konsola yazdır (sadece development'ta ve SelectedMatchesSummary'dan gelenler için)
  if (process.env.NODE_ENV === 'development' && className.includes('ring-')) {
    console.log(`[TeamLogo] ${teamName}`);
    console.log(`  logoUrl prop:`, logoUrl);
    console.log(`  logoUrl type:`, typeof logoUrl);
    console.log(`  logoUrl length:`, logoUrl?.length);
    console.log(`  logoPath:`, logoPath);
    console.log(`  usingFallback:`, logoPath === fallbackLogo);
    if (!logoUrl || logoUrl.trim() === "") {
      console.warn(`  ⚠️ logoUrl boş veya null! Fallback logo kullanılacak.`);
    }
  }
  
  // Responsive boyutlar: mobil için w-12 h-12 (48px), masaüstü için md:w-20 md:h-20 (80px)
  // size prop'u artık kullanılmıyor, her zaman responsive class'lar kullanılıyor
  const responsiveClasses = "w-12 h-12 md:w-20 md:h-20";
  
  // Retina ekranlar için 2x boyut (160px) - yüksek kalite için
  // Next.js Image optimizasyonu ile otomatik olarak uygun boyut seçilecek
  const imageSize = 160; // Retina için 2x (80px * 2)

  return (
    <div className={`relative rounded-lg overflow-hidden border-2 border-white/10 shadow-lg bg-[#0a0e1a] ${responsiveClasses} ${className}`}>
      <Image
        src={logoPath}
        alt={teamName}
        width={imageSize}
        height={imageSize}
        className="object-contain w-full h-full p-1"
        quality={95}
        priority={false}
        unoptimized={logoPath?.startsWith('http') || logoPath?.startsWith('https')}
        onError={(e) => {
          // Logo yüklenemezse fallback logo'ya geç
          const target = e.target as HTMLImageElement;
          const currentSrc = target.src;
          
          // Debug: Logo yükleme hatası
          if (process.env.NODE_ENV === 'development' && className.includes('ring-')) {
            console.error(`[TeamLogo] Logo yüklenemedi: ${teamName}`, {
              attemptedUrl: logoUrl || logoPath,
              currentSrc,
              logoPath
            });
          }
          
          const fallbackSrc = currentSrc.includes('/teams/') 
            ? fallbackLogo 
            : (currentSrc.includes('http') ? fallbackLogo : `/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`);
          
          if (!currentSrc.includes('aurora.png')) {
            target.src = fallbackSrc;
          }
        }}
        onLoad={() => {
          // Debug: Logo başarıyla yüklendi
          if (process.env.NODE_ENV === 'development' && className.includes('ring-')) {
            console.log(`[TeamLogo] Logo başarıyla yüklendi: ${teamName}`, logoUrl || logoPath);
          }
        }}
      />
    </div>
  );
}

