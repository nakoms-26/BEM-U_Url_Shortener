"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "rismed_closing_announcement_seen_v1";

export default function InstallPwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah pernah menutup pengumuman ini sebelumnya
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleDismiss}
      >
        {/* Frame Modal Popup */}
        <div
          className={cn(
            "relative bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl overflow-hidden",
            "animate-in zoom-in-95 fade-in duration-300 pointer-events-auto"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

          {/* Tombol X untuk Close */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon + Title */}
          <div className="flex items-start gap-3.5 mb-4 pr-6">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 tracking-wider mb-1">
                Pengumuman Penting
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                Penutupan Form Pemesanan Rismed
              </h3>
            </div>
          </div>

          {/* Highlight Penutupan */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 mb-4 leading-relaxed">
            Form Pemesanan Rismed akan ditutup pada:
            <div className="flex items-center gap-2 font-bold mt-1 text-rose-600 dark:text-rose-400 text-sm">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Jum&apos;at, 27 November 2026 pukul 23.59</span>
            </div>
          </div>

          {/* Isi Poin Instruksi */}
          <div className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 space-y-3 mb-6">
            <p className="font-semibold text-slate-800 dark:text-zinc-200">
              Seluruh kementerian dan biro diwajibkan:
            </p>
            <ol className="list-decimal pl-4 space-y-2.5 leading-relaxed marker:font-bold marker:text-amber-600 dark:marker:text-amber-400">
              <li>
                <span className="font-medium">Semua kebutuhan konten</span> harus diorder maksimal tanggal{" "}
                <strong className="text-slate-900 dark:text-zinc-100">27 November 2026 pukul 23.59</strong>
              </li>
              <li>
                <span className="font-medium">Batas maksimal tanggal publikasi konten</span>
                <ul className="mt-1.5 space-y-1.5 pl-1 list-none text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">→</span>
                    <span>
                      <strong className="text-slate-900 dark:text-zinc-100">2 Desember 2026 19.00</strong> untuk feeds instagram, reels, dan tiktok
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">→</span>
                    <span>
                      <strong className="text-slate-900 dark:text-zinc-100">13 Desember 2026 19.00</strong> untuk media lainnya
                    </span>
                  </li>
                </ul>
              </li>
              <li>
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Form tidak akan dibuka kembali
                </span>
                , atau tidak menerima order dalam cara apapun. Sehingga segala keluputan ditanggung oleh kementerian masing-masing.
              </li>
            </ol>
          </div>

          {/* Action Button */}
          <button
            onClick={handleDismiss}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Saya Mengerti</span>
          </button>
        </div>
      </div>
    </>
  );
}
