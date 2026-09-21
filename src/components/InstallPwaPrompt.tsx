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
    // 1. Periksa apakah sudah berjalan di mode Standalone (sudah terinstal)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Cek apakah pengguna sebelumnya menekan "Nanti Saja" dalam 7 hari terakhir
    const dismissedUntil = localStorage.getItem("bem_pwa_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil) && process.env.NODE_ENV !== "development") {
      return;
    }

    // 3. Deteksi apakah perangkat adalah iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("android");

    if (isIosDevice && isSafariBrowser) {
      setIsIos(true);
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 4. Tangkap event beforeinstallprompt untuk Android / Chromium / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Tangkap event saat aplikasi selesai di-install
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

  // Timer auto-close 5 detik ketika popup muncul
  useEffect(() => {
    if (!showPrompt || showIosGuide) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [showPrompt, showIosGuide]);

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
    // Simpan waktu penundaan selama 7 hari
    if (process.env.NODE_ENV !== "development") {
      const sevenDaysLater = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("bem_pwa_dismissed_until", String(sevenDaysLater));
    }
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* 1-Layar Backdrop dengan Blur (Klik di luar frame untuk close) */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleDismiss}
      >
        {/* Frame Modal Popup */}
        <div
          className={cn(
            "relative bg-white border border-slate-100 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl overflow-hidden",
            "animate-in zoom-in-95 fade-in duration-300 pointer-events-auto"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar Durasi 5 Detik */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-violet-100/80 overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-r-full"
              style={{
                animation: "pwaProgress 5s linear forwards",
              }}
            />
          </div>

          {/* Tombol X untuk Close */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo BEM App */}
          <div className="flex justify-center mt-2 mb-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shadow-lg shadow-violet-500/25 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-white p-2.5 flex items-center justify-center overflow-hidden">
                <Image
                  src="/icons/icon-192.png"
                  alt="Logo BEM"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Text Info */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 tracking-wider mb-2">
              PWA · Portal Resmi
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Pasang Aplikasi BEM
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed px-2">
              Akses cepat tanpa bilah browser langsung di layar utama HP kamu.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Pasang Sekarang</span>
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>

          {/* Label Durasi 5 Detik */}
          <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
            Otomatis tertutup dalam 5 detik
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pwaProgress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>

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
