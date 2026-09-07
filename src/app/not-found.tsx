import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-md">
        <GlassCard className="flex flex-col items-center text-center p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-8xl font-black text-slate-200 select-none">404</p>
            <h1 className="text-2xl font-bold text-slate-900">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-slate-500 text-sm">
              Maaf, halaman yang Anda cari tidak ada atau link singkat tersebut
              belum terdaftar.
            </p>
          </div>
          <GlassButton asChild>
            {/* <Link href="/app" className="inline-flex items-center gap-2">
              <Home className="h-4! w-4!" /> Kembali ke Beranda
            </Link> */}
          </GlassButton>
        </GlassCard>
      </main>
    </div>
  );
}

