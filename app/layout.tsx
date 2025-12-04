import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/conditional-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Arhaval | CS2 Tahmin Platformu",
  description: "Arhaval - CS2 tahmin ve fantezi oyunu platformu. Maç tahminleri yap, puan kazan, sıralamada yüksel!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${inter.variable} antialiased text-white min-h-screen relative`}
      >
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
