import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Dock from "@/components/ui/Dock";
import AppHeader from "@/components/AppHeader";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unsoed.link"),
  title: "URL Shortener — BEM Unsoed",
  description:
    "Persingkat URL Google Drive, Form, atau tautan panjang menjadi tautan pendek yang profesional untuk publikasi BEM Universitas Jenderal Soedirman.",
  openGraph: {
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "BEM Unsoed URL Shortener",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} h-dvh overflow-hidden`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans h-full flex flex-col bg-slate-50 overflow-hidden`}
      >
        {/* Light background: soft violet top glow */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(139,92,246,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Mobile App Shell */}
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {children}
          </main>
          <Dock />
        </div>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
