import { ArrowUpRight, Link2, QrCode, Database, BarChart3, Clock, TrendingUp, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import pool, { twibbonPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import QuickCopyButton from "@/components/QuickCopyButton";
import InstallPwaPrompt from "@/components/InstallPwaPrompt";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LinkRow extends RowDataPacket {
  id: string;
  lembaga: string | null;
  slug: string;
  url_asli: string | null;
  jumlah_klik: number | null;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}
interface ClickCountRow extends RowDataPacket {
  totalClicks: number;
}

export default async function Hero() {
  let totalLinks = 0;
  let totalClicks = 0;
  let topLinks: LinkRow[] = [];
  let recentLinks: LinkRow[] = [];

  try {
    const [countRows] = await pool.query<CountRow[]>("SELECT COUNT(*) as total FROM links");
    totalLinks = countRows[0]?.total || 0;

    const [clickRows] = await pool.query<ClickCountRow[]>("SELECT SUM(jumlah_klik) as totalClicks FROM links");
    totalClicks = clickRows[0]?.totalClicks || 0;

    const [top] = await pool.query<LinkRow[]>(
      "SELECT * FROM links ORDER BY jumlah_klik DESC LIMIT 3"
    );
    topLinks = top;

    const [recent] = await pool.query<LinkRow[]>(
      "SELECT * FROM links ORDER BY created_at DESC LIMIT 3"
    );
    recentLinks = recent;
  } catch (error: any) {
    console.warn("Failed to fetch home stats (MySQL offline/unreachable):", error?.message || error);
  }

  let totalTwibbons = 0;
  let totalTwibbonDownloads = 0;
  try {
    const [tCount] = await twibbonPool.query<CountRow[]>(
      "SELECT COUNT(*) as total FROM twibbon WHERE isActive = 1"
    );
    totalTwibbons = tCount[0]?.total || 0;

    const [tDownloads] = await twibbonPool.query<ClickCountRow[]>(
      "SELECT SUM(downloadsCount) as totalClicks FROM twibbon"
    );
    totalTwibbonDownloads = tDownloads[0]?.totalClicks || 0;
  } catch (error: any) {
    console.warn("Failed to fetch twibbon stats (MySQL offline/unreachable):", error?.message || error);
  }

  const formatDate = (dateStr: Date | string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return "-";
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 pt-3 md:pt-4 pb-24 max-w-md mx-auto w-full gap-5">
      {/* Overview Stats (3 Metrik Seimbang) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
        {/* Total Link */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-[1.5rem] p-3 sm:p-3.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
            <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate min-w-0">
              {totalLinks}
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-violet-50 text-violet-600 shrink-0">
              <Link2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
            Total Link
          </span>
        </div>

        {/* Total Klik */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-[1.5rem] p-3 sm:p-3.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
            <span
              className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate min-w-0"
              title={String(totalClicks || 0)}
            >
              {totalClicks || 0}
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
            Total Klik
          </span>
        </div>

        {/* Unduhan Twibbon */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-[1.5rem] p-3 sm:p-3.5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
            <span
              className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate min-w-0"
              title={String(totalTwibbonDownloads || 0)}
            >
              {totalTwibbonDownloads || 0}
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-amber-50 text-amber-600 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
            Unduhan
          </span>
        </div>
      </div>

      {/* Fitur Utama: Pemesanan & SOP Rismed */}
      <div className="flex flex-col gap-3 w-full">
        {/* Pemesanan Rismed */}
        <Link
          href="/app/rismed"
          className={cn(
            "relative overflow-hidden p-5 rounded-[1.5rem]",
            "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xs",
            "border border-violet-400/30",
            "transition-all duration-200 active:scale-[0.98] hover:shadow-md hover:shadow-violet-500/20 group",
            "flex flex-col justify-between h-34"
          )}
        >
          {/* Ambient Decorative Glows */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-pink-500/15 rounded-full blur-xl pointer-events-none" />

          {/* Top Row: Title Besar & External Arrow */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <h2 className="font-black text-white text-3xl tracking-tight leading-tight">
              Pemesanan Rismed
            </h2>
            <div className="p-1.5 rounded-full bg-white/15 text-white/80 group-hover:bg-white group-hover:text-violet-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0">
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
            </div>
          </div>

          {/* Bottom Row: Subtitle & Status Indicator */}
          <div className="relative z-10 flex items-end justify-between gap-2">
            <p className="text-xs text-violet-100/90 font-medium leading-tight line-clamp-1">
              Layanan desain grafis, publikasi & media resmi BEM
            </p>
            <span className="text-[10px] font-semibold text-violet-200 bg-white/15 px-2 py-0.5 rounded-full shrink-0">
              Terintegrasi
            </span>
          </div>
        </Link>

        {/* SOP Rismed */}
        <a
          href="https://drive.google.com/drive/folders/1LfBlUZEg-fnwreUZxDfg8txBNbfNmEeP"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-between p-4 rounded-[1.5rem]",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-[0.98] hover:border-violet-300 hover:shadow-sm group"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors shrink-0">
              <FileText className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">SOP Rismed</h3>
                <span className="text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-md">
                  Drive
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Panduan & alur resmi pemesanan konten BEM
              </p>
            </div>
          </div>
          <div className="p-1 rounded-full text-slate-300 group-hover:text-violet-600 group-hover:rotate-12 transition-all shrink-0">
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </a>
      </div>

      {/* 4 Menu Cepat: Satu Baris Kesamping */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 w-full">
        {/* 1. Short Link */}
        <Link
          href="/app/shortener"
          className={cn(
            "flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-violet-300 hover:shadow-xs group text-center gap-1.5"
          )}
        >
          <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors">
            <Link2 className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">
            Short Link
          </span>
        </Link>

        {/* 2. Twibbon BEM */}
        <Link
          href="/app/twibbons"
          className={cn(
            "flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-amber-300 hover:shadow-xs group text-center gap-1.5"
          )}
        >
          <div className="relative">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            </div>
            {totalTwibbons > 0 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-black bg-amber-500 text-white rounded-full px-1 leading-none py-0.5 shadow-2xs">
                {totalTwibbons}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">
            Twibbon
          </span>
        </Link>

        {/* 3. QR Code */}
        <Link
          href="/app/qrgenerator"
          className={cn(
            "flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-sky-300 hover:shadow-xs group text-center gap-1.5"
          )}
        >
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-colors">
            <QrCode className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">
            QR Code
          </span>
        </Link>

        {/* 4. Database */}
        <Link
          href="/app/database"
          className={cn(
            "flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-emerald-300 hover:shadow-xs group text-center gap-1.5"
          )}
        >
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Database className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">
            Database
          </span>
        </Link>
      </div>

      {/* Top Links Section — Horizontal Carousel */}
      {topLinks.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Paling Banyak Diklik
            </h3>
            <Link
              href="/app/database"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              Lihat Semua
            </Link>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
          >
            {topLinks.map((link, index) => (
              <div
                key={link.id}
                className="flex-shrink-0 w-52 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs snap-start transition-all duration-200 hover:shadow-sm hover:border-violet-200 flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Slug Header + Quick Copy Button */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate font-mono">
                      /{link.slug}
                    </p>
                    <QuickCopyButton slug={link.slug} className="p-1.5" iconClassName="w-3 h-3" />
                  </div>

                  {/* Lembaga */}
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {link.lembaga || "BEM Unsoed"}
                  </p>
                </div>

                {/* Klik count badge */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                  <div
                    className={cn(
                      "p-1 rounded-md",
                      index === 0
                        ? "bg-amber-50"
                        : index === 1
                          ? "bg-slate-50"
                          : "bg-orange-50"
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        "w-3 h-3",
                        index === 0
                          ? "text-amber-500"
                          : index === 1
                            ? "text-slate-400"
                            : "text-orange-400"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      index === 0
                        ? "text-amber-600"
                        : index === 1
                          ? "text-slate-600"
                          : "text-orange-500"
                    )}
                  >
                    {(link.jumlah_klik || 0).toLocaleString()} klik
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Links Section dengan 1-Tap Quick Copy */}
      {recentLinks.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aktivitas Terbaru
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-50 rounded-xl shrink-0 border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate font-mono">
                      /{link.slug}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 truncate">
                      {link.lembaga || "Umum"} · {formatDate(link.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <QuickCopyButton slug={link.slug} />
                  <Link
                    href="/app/database"
                    className="p-2 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                    title="Lihat di Database"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PWA Install Prompt (hanya aktif di halaman /app) */}
      <InstallPwaPrompt />
    </div>
  );
}
