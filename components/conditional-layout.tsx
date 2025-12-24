"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import UsernameGuard from "@/components/username-guard";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/register" || pathname === "/login";

  // Admin sayfalarında Navbar ve SponsorBanner gösterme
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Auth sayfalarında (register/login) layout gösterme
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Normal sayfalarda Navbar göster
  return (
    <UsernameGuard>
      <Navbar />
      <main className="relative z-0">{children}</main>
    </UsernameGuard>
  );
}








