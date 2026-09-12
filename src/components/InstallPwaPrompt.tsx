"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Daftarkan Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("PWA Service Worker gagal didaftarkan:", err);
        });
      });
    }

    // 2. Periksa apakah sudah berjalan di mode Standalone (sudah terinstal)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return; // Tidak perlu tampilkan prompt jika sudah diinstall
    }

    // 3. Cek apakah pengguna sebelumnya menekan "Nanti Saja" dalam 7 hari terakhir
    const dismissedUntil = localStorage.getItem("bem_pwa_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 4. Deteksi apakah perangkat adalah iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("android");

    if (isIosDevice && isSafariBrowser) {
      setIsIos(true);
      // Tampilkan banner setelah delay 2 detik agar tidak mengagetkan
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 5. Tangkap event beforeinstallprompt untuk Android / Chromium / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Munculkan prompt setelah delay 1.5 detik
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. Tangkap event saat aplikasi selesai di-install
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Gagal memicu install prompt:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    // Simpan waktu penundaan selama 7 hari (7 * 24 * 60 * 60 * 1000 ms)
    const sevenDaysLater = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("bem_pwa_dismissed_until", String(sevenDaysLater));
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating Pill Banner Prompt (Mengambang di atas Dock navigasi) */}
      <div
        className={cn(
          "fixed bottom-22 left-4 right-4 z-40 max-w-md mx-auto",
          "animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        )}
      >
        <div className="bg-white/95 backdrop-blur-md border border-violet-100 rounded-2xl p-3.5 shadow-[0_12px_30px_rgba(124,58,237,0.18)] flex items-center gap-3">
          {/* Logo BEM App */}
          <div className="relative w-11 h-11 rounded-xl bg-violet-50 p-1 border border-violet-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              src="/icons/icon-192.png"
              alt="Logo BEM"
              width={40}
              height={40}
              className="w-9 h-9 object-contain"
            />
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                PWA
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                Pasang Aplikasi BEM
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              Akses cepat tanpa bilah browser di layar utama HP kamu.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Pasang</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tutup (Ingatkan nanti)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal / Bottom Sheet */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 p-1 border border-violet-100 flex items-center justify-center">
                  <Image
                    src="/icons/apple-icon.png"
                    alt="Logo BEM"
                    width={36}
                    height={36}
                    className="w-8 h-8 object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pasang di iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tambahkan ke Layar Utama Safari
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <p className="leading-snug">
                  Ketuk tombol <strong className="text-slate-900">Bagikan (Share)</strong>{" "}
                  <Share className="inline w-3.5 h-3.5 mx-0.5 text-blue-600 align-text-bottom" />{" "}
                  di bilah menu bawah Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <p className="leading-snug">
                  Gulir ke bawah pada daftar opsi, lalu ketuk{" "}
                  <strong className="text-slate-900">
                    &quot;Tambah ke Layar Utama&quot;
                  </strong>{" "}
                  <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-slate-800 align-text-bottom" />
                  .
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <p className="leading-snug">
                  Pilih <strong className="text-slate-900">&quot;Tambah&quot;</strong> di
                  sudut kanan atas. Ikon aplikasi BEM Unsoed akan muncul di layar utama!
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all active:scale-95 shadow-sm"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
