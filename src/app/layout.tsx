import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Grainient from "@/components/background/Grainient";
import Dock from "@/components/ui/Dock";
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
  title: "Url Shortner",
  description: "Short your Link ",
  openGraph: {
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Url Shortner OG Image",
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
    <html lang="en" className={`${geistSans.variable} h-dvh `}>
      <body
        // Tambahkan relative, h-full, dan overflow-hidden di sini juga
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative h-full overflow-hidden 
       bg-zinc-950`}
      >
        {" "}
        <div className="fixed inset-0 z-0">
          <Grainient
            color1="#a79dda"
            color2="#201d39"
            color3="#514575"
            // color1="#FF9FFC" tiga ini warna aslinya
            // color2="#5227FF"
            // color3="#B19EEF"
            timeSpeed={0}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.8}
          />
        </div>
        {children} <Toaster position="top-center" richColors />
        <Dock />
      </body>
    </html>
  );
}
