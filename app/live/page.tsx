"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LivePage() {
  const router = useRouter();

  useEffect(() => {
    // Ana live sayfası gizli - sadece link ile erişilebilir
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
      <div className="text-center">
        <p className="text-gray-400">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
