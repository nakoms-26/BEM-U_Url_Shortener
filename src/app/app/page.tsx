import { ArrowUpRight, Link2, QrCode, Database, BarChart3, Clock, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import pool, { twibbonPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import QuickCopyButton from "@/components/QuickCopyButton";

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
  } catch (error) {
    console.error("Failed to fetch home stats:", error);
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
  } catch (error) {
    console.error("Failed to fetch twibbon stats:", error);
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
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {/* Total Link */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900">{totalLinks}</span>
            <div className="p-1.5 rounded-full bg-violet-50 text-violet-600">
              <Link2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Link
          </span>
        </div>

        {/* Total Klik */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900">{totalClicks || 0}</span>
            <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Klik
          </span>
        </div>

        {/* Unduhan Twibbon */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900">{totalTwibbonDownloads || 0}</span>
            <div className="p-1.5 rounded-full bg-amber-50 text-amber-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Unduhan
          </span>
        </div>
      </div>

      {/* Bento Grid 2x2: 4 Fitur Utama Terpadu (Clean & Seragam) */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* 1. Short Link */}
        <Link
          href="/app/shortener"
          className={cn(
            "flex flex-col justify-between h-34 p-4 rounded-[1.5rem]",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-violet-300 hover:shadow-sm group"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Link2 className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="p-1 rounded-full text-slate-300 group-hover:text-violet-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm mb-0.5">Short Link</h2>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">Ubah URL panjang jadi rapi</p>
          </div>
        </Link>

        {/* 2. Twibbon BEM */}
        <Link
          href="/app/twibbons"
          className={cn(
            "flex flex-col justify-between h-34 p-4 rounded-[1.5rem]",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-amber-300 hover:shadow-sm group"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
              {totalTwibbons} Frame
            </span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm mb-0.5">Twibbon BEM</h2>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">Frame foto & video resmi</p>
          </div>
        </Link>

        {/* 3. QR Code */}
        <Link
          href="/app/qrgenerator"
          className={cn(
            "flex flex-col justify-between h-34 p-4 rounded-[1.5rem]",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-sky-300 hover:shadow-sm group"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <QrCode className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="p-1 rounded-full text-slate-300 group-hover:text-sky-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">QR Code</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">Visual QR poster & cetak</p>
          </div>
        </Link>

        {/* 4. Database */}
        <Link
          href="/app/database"
          className={cn(
            "flex flex-col justify-between h-34 p-4 rounded-[1.5rem]",
            "bg-white border border-slate-200 shadow-xs",
            "transition-all duration-200 active:scale-95 hover:border-emerald-300 hover:shadow-sm group"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Database className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="p-1 rounded-full text-slate-300 group-hover:text-emerald-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">Database</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">Kelola tautan & data klik</p>
          </div>
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
    </div>
  );
}
