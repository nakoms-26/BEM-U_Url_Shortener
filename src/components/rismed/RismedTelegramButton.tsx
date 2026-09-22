"use client";

import { Send, ArrowUpRight } from "lucide-react";

export function RismedTelegramButton() {
  return (
    <aside
      aria-label="Kontak Bot Telegram Layanan Rismed"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group"
    >
      <a
        href="https://t.me/rismed_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-[#229ED9] to-[#1E88E5] text-white shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 border border-white/20 backdrop-blur-xs select-none"
        title="Buka bot Telegram @rismed_bot"
      >
        {/* Telegram Paper Plane Icon */}
        <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-white/20">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 translate-x-[-0.5px] translate-y-[0.5px] text-white transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-200"
            aria-hidden="true"
          >
            <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.672c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.411z" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="flex flex-col text-left pr-0.5">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-xs font-bold tracking-tight text-white">
              Bot Telegram
            </span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"
              title="Online"
            />
          </div>
          <span className="text-[10px] font-medium text-sky-100 leading-none mt-0.5">
            @rismed_bot
          </span>
        </div>

        {/* Small Arrow Link Icon */}
        <ArrowUpRight className="w-3.5 h-3.5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 -ml-0.5 hidden xs:inline-block sm:inline-block" />
      </a>
    </aside>
  );
}
