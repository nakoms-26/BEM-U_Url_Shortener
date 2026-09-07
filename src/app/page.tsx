import { ArrowUpRight, Link2, QrCode, Database, BarChart3, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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
    <div className="flex flex-col min-h-full px-6 py-8 md:py-12 max-w-md mx-auto w-full gap-6 pb-24">
      {/* Header Sapaan */}
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Halo, Sobat Kata! <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            URL Shortener BEM Unsoed
          </p>
        </div>
        <div className="flex-shrink-0 rounded-2xl bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100">
          <Image
            src="/logo.webp"
            alt="Logo BEM"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="flex gap-4 w-full">
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 flex-1 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-black text-slate-900">{totalLinks}</span>
            <div className="p-2 rounded-full bg-violet-50 text-violet-600">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Link</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 flex-1 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-black text-slate-900">{totalClicks || 0}</span>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Klik</span>
        </div>
      </div>

      {/* Widget Utama: Buat Short Link */}
      <Link
        href="/shortener"
        className={cn(
          "relative overflow-hidden group flex flex-col justify-between",
          "w-full h-36 p-5 rounded-[2rem]",
          "bg-violet-600",
          "shadow-[0_12px_30px_rgba(124,58,237,0.3)]",
          "transition-transform duration-200 active:scale-95"
        )}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
            <Link2 className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="p-2 bg-black/10 rounded-full backdrop-blur-sm group-hover:bg-black/20 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <h2 className="text-xl font-bold text-white mb-0.5 tracking-wide">Buat Short Link</h2>
          <p className="text-white/80 text-xs font-medium">Ubah URL panjang jadi rapi</p>
        </div>
      </Link>

      {/* Widget Sekunder: Grid 2 Kolom */}
      <div className="flex flex-row w-full gap-4">
        {/* Generate QR */}
        <Link
          href="/qrgenerator"
          className={cn(
            "flex flex-col justify-between h-32 p-4 rounded-[1.5rem] w-1/2",
            "bg-white border border-slate-200 shadow-sm",
            "transition-all duration-200 active:scale-95 hover:border-slate-300 hover:shadow-md"
          )}
        >
          <div className="p-2.5 bg-slate-50 w-fit rounded-xl border border-slate-100">
            <QrCode className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">QR Code</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">Buat visual QR untuk poster</p>
          </div>
        </Link>

        {/* Database */}
        <Link
          href="/database"
          className={cn(
            "flex flex-col justify-between h-32 p-4 rounded-[1.5rem] w-1/2",
            "bg-white border border-slate-200 shadow-sm",
            "transition-all duration-200 active:scale-95 hover:border-slate-300 hover:shadow-md"
          )}
        >
          <div className="p-2.5 bg-slate-50 w-fit rounded-xl border border-slate-100">
            <Database className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">Database</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">Kelola dan lihat data klik</p>
          </div>
        </Link>
      </div>

      {/* Top Links Section — Horizontal Carousel */}
      {topLinks.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-900">Paling Banyak Diklik</h3>
            <Link href="/database" className="text-xs font-semibold text-violet-600">Lihat Semua</Link>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topLinks.map((link, index) => (
              <Link
                key={link.id}
                href="/database"
                className="flex-shrink-0 w-52 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm snap-start active:scale-95 transition-all duration-200 hover:shadow-md hover:border-violet-200 flex flex-col gap-3"
              >
                {/* Title */}
                <p className="text-[15px] font-extrabold text-slate-900 truncate leading-snug">
                  /{link.slug}
                </p>

                {/* Klik count with icon */}
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "p-1 rounded-md",
                    index === 0 ? "bg-amber-50" :
                    index === 1 ? "bg-slate-50" :
                    "bg-orange-50"
                  )}>
                    <TrendingUp className={cn(
                      "w-3.5 h-3.5",
                      index === 0 ? "text-amber-500" :
                      index === 1 ? "text-slate-400" :
                      "text-orange-400"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold",
                    index === 0 ? "text-amber-600" :
                    index === 1 ? "text-slate-500" :
                    "text-orange-500"
                  )}>
                    {link.jumlah_klik || 0} klik
                  </span>
                </div>

                {/* Lembaga */}
                <p className="text-xs text-slate-500 font-medium truncate leading-snug">
                  {link.lembaga || 'BEM Unsoed'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Links Section */}
      {recentLinks.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Terbaru</h3>
          </div>
          <div className="flex flex-col gap-3">
            {recentLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-slate-50 rounded-xl shrink-0">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">{link.slug}</span>
                    <span className="text-[11px] font-medium text-slate-500 truncate">{formatDate(link.created_at)}</span>
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <Link href={`/database`} className="p-2 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
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
