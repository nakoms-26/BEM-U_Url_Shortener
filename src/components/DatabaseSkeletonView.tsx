"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound } from "lucide-react";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";
import { toast } from "sonner";

export default function DatabaseSkeletonView() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin || data.isSuperAdmin) {
            router.refresh();
          }
        }
      } catch {}
    };

    window.addEventListener("auth-changed", syncAuth);
    return () => window.removeEventListener("auth-changed", syncAuth);
  }, [router]);

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal memverifikasi password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-4 md:py-6 max-w-md mx-auto w-full gap-5 pb-24">
      {/* Lock Verification Card */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Database Terkunci
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Data tautan, slug kustom, dan statistik klik hanya dapat diakses oleh Staf Kabinet yang terverifikasi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="w-full py-3.5 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>Buka Akses Database</span>
        </button>
      </div>

      {/* Accordion Skeleton matching DatabaseClient */}
      <div className="space-y-3 pointer-events-none opacity-50 select-none">
        {/* Search & Sort Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 rounded-xl flex-1 animate-pulse" />
          <div className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse shrink-0" />
        </div>

        {/* Count Skeleton */}
        <div className="h-3 w-24 bg-slate-200 rounded-md animate-pulse ml-1" />

        {/* Accordion List Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 overflow-hidden divide-y divide-slate-200">
          {[
            { slugW: "w-28", subW: "w-36", tagW: "w-12" },
            { slugW: "w-36", subW: "w-28", tagW: "w-14" },
            { slugW: "w-24", subW: "w-40", tagW: "w-10" },
            { slugW: "w-32", subW: "w-32", tagW: "w-16" },
            { slugW: "w-20", subW: "w-24", tagW: "w-12" },
          ].map((item, idx) => (
            <div key={idx} className="w-full flex items-center gap-3 px-4 py-3.5">
              {/* Chevron icon placeholder */}
              <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse shrink-0" />

              {/* Slug & subtitle */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className={`h-4 ${item.slugW} bg-slate-200 rounded animate-pulse`} />
                <div className={`h-3 ${item.subW} bg-slate-100 rounded animate-pulse`} />
              </div>

              {/* Tag placeholder */}
              <div className={`h-5 ${item.tagW} bg-slate-200/80 rounded-md animate-pulse shrink-0`} />
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
        title="Verifikasi Staf Kabinet"
        description="Masukkan password Staf Kabinet atau Nakomisme untuk membuka database tautan BEM Unsoed."
        confirmLabel="Buka Database"
        loadingLabel="Memverifikasi..."
        loading={loading}
      />
    </div>
  );
}
