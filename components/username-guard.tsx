"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/supabase/client";

export default function UsernameGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUsername = async () => {
      // Skip check for public routes
      if (
        pathname?.startsWith("/register") ||
        pathname?.startsWith("/auth") ||
        pathname?.startsWith("/setup")
      ) {
        setIsChecking(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsChecking(false);
          return;
        }

        // Check if user has username
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        // If no username and not already on setup page, redirect
        if (!(profile as any)?.username && pathname !== "/setup/username") {
          router.push("/setup/username");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error checking username:", error);
        setIsChecking(false);
      }
    };

    checkUsername();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#D69ADE]/30 border-t-[#D69ADE] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

