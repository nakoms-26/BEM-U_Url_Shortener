"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert, KeyRound } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";
import { toast } from "sonner";

export default function DatabaseSkeletonView() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!password) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Password admin salah.");
      }

      toast.success(data.message || "Akses database berhasil dibuka!");
      setIsDialogOpen(false);
      setPassword("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal memverifikasi password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] p-4 py-6 max-w-4xl mx-auto w-full">
      {/* Floating Lock Verification Banner */}
      <div className="sticky top-2 z-20 mb-6 mx-auto max-w-md bg-white/90 backdrop-blur-xl border border-violet-200/80 rounded-3xl p-6 shadow-xl shadow-violet-500/10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" strokeWidth={2.2} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Database Terkunci
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Data tautan, slug kustom, dan statistik klik hanya dapat diakses oleh admin yang terverifikasi.
          </p>
        </div>
        <GlassButton
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 text-xs md:text-sm rounded-xl shadow-md shadow-violet-500/25 flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>Buka Akses Database</span>
        </GlassButton>
      </div>

      {/* Skeleton Header & Search */}
      <div className="space-y-4 pointer-events-none opacity-60">
        {/* Search & Sort Skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-11 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="w-28 h-11 bg-slate-200 rounded-2xl animate-pulse" />
        </div>

        {/* Horizontal Lembaga Pills Skeleton */}
        <div className="flex gap-2 overflow-hidden py-1">
          {[48, 64, 56, 72, 60, 52].map((w, i) => (
            <div
              key={i}
              className="h-8 bg-slate-200 rounded-xl animate-pulse shrink-0"
              style={{ width: `${w * 1.5}px` }}
            />
          ))}
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-slate-100 rounded-md animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="h-5 w-3/4 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-3.5 w-full bg-slate-100 rounded-md animate-pulse" />
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse" />
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Password Dialog */}
      <AdminPasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        password={password}
        onPasswordChange={setPassword}
        onConfirm={handleVerify}
        title="Verifikasi Admin Database"
        description="Masukkan password admin untuk membuka database tautan BEM Unsoed."
        confirmLabel="Buka Database"
        loadingLabel="Memverifikasi..."
        loading={loading}
      />
    </div>
  );
}
