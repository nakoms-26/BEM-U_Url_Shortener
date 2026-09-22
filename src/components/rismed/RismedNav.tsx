"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FileEdit,
  Calendar,
  Eye,
  BarChart3,
  Users2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app/rismed", label: "Formulir", icon: FileEdit, exact: true },
  { href: "/app/rismed/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/app/rismed/monitoring", label: "Monitoring", icon: Eye },
  { href: "/app/rismed/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/app/rismed/pj", label: "Kontak PJ", icon: Users2 },
  { href: "/app/rismed/admin", label: "Admin", icon: ShieldCheck },
];

export function RismedNav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // Pastikan tema selalu berada di light mode saat di halaman /rismed
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    }
  }, [resolvedTheme, setTheme]);

  return (
    <div className="w-full mb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo Rismed"
              width={38}
              height={38}
              className="h-9 w-9 object-contain invert transition-all"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Layanan Rismed BEM Unsoed
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Pemesanan desain, publikasi, bantuan teknis, survey & twibbon
            </p>
          </div>
        </div>

        {/* Right Controls: SOP Link */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="https://drive.google.com/drive/folders/1LfBlUZEg-fnwreUZxDfg8txBNbfNmEeP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-full transition-colors"
          >
            <span>Buka SOP Rismed</span>
            <span className="text-[10px] bg-violet-200/70 text-violet-800 px-1 rounded-sm">
              Drive
            </span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs (Horizontal scrollable with clean pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95",
                isActive
                  ? "bg-violet-600 text-white shadow-xs shadow-violet-500/25"
                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5",
                  isActive ? "text-white" : "text-slate-400 dark:text-zinc-500"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
