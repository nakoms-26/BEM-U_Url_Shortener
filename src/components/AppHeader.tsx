"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lock, LogOut } from "lucide-react";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";
import { toast } from "sonner";

const pageTitles: Record<string, string> = {
  "/app": "Beranda",
  "/app/shortener": "Short Link",
  "/app/twibbons": "Twibbon BEM",
  "/app/qrgenerator": "QR Code",
  "/app/database": "Database",
  "/app/contact": "Kontak",
};

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname];

  const [auth, setAuth] = useState<{
    isAdmin: boolean;
    isSuperAdmin: boolean;
    loading: boolean;
  }>({
    isAdmin: false,
    isSuperAdmin: false,
    loading: true,
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        setAuth({
          isAdmin: !!data.isAdmin,
          isSuperAdmin: !!data.isSuperAdmin,
          loading: false,
        });
      }
    } catch {
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [checkAuth, pathname]);

  const handleLogin = async () => {
    if (!password) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Password salah.");
      }

      setIsLoginOpen(false);
      setPassword("");
      toast.success(
        data.role === "SUPER_ADMIN"
          ? "Berhasil masuk sebagai Nakomisme!"
          : "Berhasil masuk sebagai Staf Kabinet!"
      );

      await checkAuth();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Berhasil keluar.");
      setAuth({ isAdmin: false, isSuperAdmin: false, loading: false });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
      router.refresh();
    } catch {
      toast.error("Gagal keluar.");
    }
  };

  // Tidak tampilkan header di halaman redirect [slug] dan 404
  if (!title) return null;

  return (
    <header
      className={cn(
        "flex-shrink-0 flex items-center justify-between",
        "px-6 pt-5 pb-2 max-w-md mx-auto w-full",
        "bg-transparent",
      )}
    >
      {/* Sisi Kiri: Sapaan Beranda atau Judul Halaman */}
      {pathname === "/app" ? (
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 rounded-xl bg-white p-1.5 shadow-2xs border border-slate-100">
            <Image
              src="/logo.webp"
              alt="Logo BEM"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
              priority
            />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1">
              <span>Halo, Sobat Kata!</span>
              <span>👋</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 leading-none">
              BEM Unsoed Portal
            </p>
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
      )}

      {/* Sisi Kanan: Status Login */}
      <div className="flex items-center gap-1.5">
        {auth.loading ? (
          <div className="h-7 w-20 bg-slate-200/70 rounded-full animate-pulse" />
        ) : auth.isSuperAdmin ? (
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              <span>Nakomisme</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shadow-2xs"
              title="Keluar Nakomisme"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : auth.isAdmin ? (
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Staf Kabinet</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shadow-2xs"
              title="Keluar Staf Kabinet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
        )}
      </div>

      {/* Dialog Login Global */}
      <AdminPasswordDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        password={password}
        onPasswordChange={setPassword}
        onConfirm={handleLogin}
        title="Masuk Akun"
        description="Masukkan password Staf Kabinet atau Nakomisme untuk membuka fitur pengelolaan."
        confirmLabel="Masuk"
        loadingLabel="Memeriksa..."
      />
    </header>
  );
}
