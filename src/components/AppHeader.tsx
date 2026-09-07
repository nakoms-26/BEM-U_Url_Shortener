"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/app": "Beranda",
  "/app/shortener": "Short Link",
  "/app/qrgenerator": "QR Code",
  "/app/database": "Database",
  "/app/contact": "Kontak",
};

export default function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname];

  // Tidak tampilkan header di halaman redirect dan 404
  if (!title) return null;

  return (
    <header
      className={cn(
        "flex-shrink-0 flex items-center justify-between",
        "px-6 pt-8 pb-4",
        "bg-transparent",
      )}
    >
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h1>
      
      {pathname !== "/app/shortener" && (
        <Link
          href="/app/shortener"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </Link>
      )}
    </header>
  );
}
