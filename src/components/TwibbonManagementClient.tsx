"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TwibbonItem } from "@/lib/twibbon-schemas";
import { GlassInput } from "@/components/ui/glass-input";
import { CreateTwibbonDialog } from "@/components/CreateTwibbonDialog";
import { EditTwibbonDialog } from "@/components/EditTwibbonDialog";
import { DeleteTwibbonDialog } from "@/components/DeleteTwibbonDialog";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";
import { toast } from "sonner";
import {
  Sparkles,
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TwibbonManagementClientProps {
  initialTwibbons: TwibbonItem[];
  stats: {
    total: number;
    active: number;
    totalDownloads: number;
  };
  initialIsSuperAdmin?: boolean;
}

export default function TwibbonManagementClient({
  initialTwibbons,
  stats: initialStats,
  initialIsSuperAdmin = false,
}: TwibbonManagementClientProps) {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(initialIsSuperAdmin);
  const [twibbons, setTwibbons] = useState<TwibbonItem[]>(initialTwibbons);
  const [stats, setStats] = useState(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTwibbon, setSelectedTwibbon] = useState<TwibbonItem | null>(null);

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const publicBaseUrl =
    process.env.NEXT_PUBLIC_TWIBBON_BASE_URL || "https://twibbon.bem-unsoed.com";

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/twibbons");
      if (res.ok) {
        const data = await res.json();
        setTwibbons(data.twibbons);
        setStats(data.stats);
        if (typeof data.isSuperAdmin === "boolean") {
          setIsSuperAdmin(data.isSuperAdmin);
        }
      }
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(!!data.isSuperAdmin);
          await refreshData();
        }
      } catch {}
    };

    window.addEventListener("auth-changed", syncAuth);
    return () => window.removeEventListener("auth-changed", syncAuth);
  }, []);

  const handleSuperAdminLogin = async () => {
    if (!loginPassword) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Password salah.");
      }

      if (data.role !== "SUPER_ADMIN") {
        throw new Error("Hanya Nakomisme yang berwenang mengelola Twibbon.");
      }

      setIsSuperAdmin(true);
      setIsLoginDialogOpen(false);
      setLoginPassword("");
      toast.success("Login Nakomisme berhasil! Seluruh kontrol twibbon terbuka.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk sebagai Nakomisme.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsSuperAdmin(false);
      toast.success("Keluar dari mode Nakomisme. Menampilkan twibbon terpublikasi.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }
      await refreshData();
    } catch {
      toast.error("Gagal keluar.");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${publicBaseUrl}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success(`Tautan twibbon /${slug} disalin!`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredTwibbons = useMemo(() => {
    return twibbons.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType =
        filterType === "ALL" || item.type === filterType;

      const matchStatus =
        !isSuperAdmin ||
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" && item.isActive) ||
        (filterStatus === "INACTIVE" && !item.isActive);

      return matchSearch && matchType && matchStatus;
    });
  }, [twibbons, searchTerm, filterType, filterStatus, isSuperAdmin]);

  return (
    <div className="flex flex-col min-h-full px-6 py-4 md:py-6 max-w-md mx-auto w-full gap-5 pb-24">
      {/* Button Buat Twibbon (Super Admin) */}
      {isSuperAdmin && (
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-full py-3.5 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs md:text-sm shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Twibbon Baru</span>
        </button>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900">{stats.total}</span>
            <div className="p-1.5 rounded-full bg-violet-50 text-violet-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isSuperAdmin ? "Total" : "Aktif"}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900">{stats.active}</span>
            <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Publik
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900">{stats.totalDownloads.toLocaleString()}</span>
            <div className="p-1.5 rounded-full bg-amber-50 text-amber-600">
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Unduhan
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-2.5">
        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <GlassInput
              placeholder="Cari judul twibbon atau slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs bg-white h-10 rounded-xl"
            />
          </div>
          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
            title="Muat Ulang Data"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-xs">
            <button
              onClick={() => setFilterType("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all text-[11px]",
                filterType === "ALL" ? "bg-violet-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType("IMAGE")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all text-[11px]",
                filterType === "IMAGE" ? "bg-violet-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Foto
            </button>
            <button
              onClick={() => setFilterType("VIDEO")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all text-[11px]",
                filterType === "VIDEO" ? "bg-violet-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Video
            </button>
          </div>

          {isSuperAdmin && (
            <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-xs">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all text-[11px]",
                  filterStatus === "ALL" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Status
              </button>
              <button
                onClick={() => setFilterStatus("ACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all text-[11px]",
                  filterStatus === "ACTIVE" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Aktif
              </button>
              <button
                onClick={() => setFilterStatus("INACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all text-[11px]",
                  filterStatus === "INACTIVE" ? "bg-red-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Nonaktif
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Twibbon Feed */}
      {filteredTwibbons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
                ? "Tidak ada twibbon yang cocok"
                : "Belum ada kampanye twibbon"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
                ? "Coba ubah kata kunci pencarian atau sesuaikan filter Anda."
                : isSuperAdmin
                ? "Mulai buat kampanye pertama Anda dengan mengunggah frame twibbon."
                : "Belum ada frame twibbon yang terpublikasi saat ini."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {filteredTwibbons.map((twibbon) => (
            <div
              key={twibbon.id}
              className="group bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Container (4:5 Ratio) with Badges */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center mb-2.5">
                  {twibbon.thumbnail ? (
                    <Image
                      src={
                        twibbon.updatedAt
                          ? `${twibbon.thumbnail}?t=${new Date(twibbon.updatedAt).getTime()}`
                          : twibbon.thumbnail
                      }
                      alt={twibbon.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 240px"
                      unoptimized
                    />
                  ) : (
                    <div className="text-slate-300 font-bold text-xl">BEM</div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1">
                    {isSuperAdmin && (
                      <span
                        className={cn(
                          "text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full backdrop-blur-md border shadow-2xs",
                          twibbon.isActive
                            ? "bg-emerald-500/90 text-white border-emerald-400/40"
                            : "bg-red-500/90 text-white border-red-400/40"
                        )}
                      >
                        {twibbon.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    )}

                    <span
                      className={cn(
                        "text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full backdrop-blur-md border shadow-2xs",
                        twibbon.type === "VIDEO"
                          ? "bg-purple-600/90 text-white border-purple-400/40"
                          : "bg-blue-600/90 text-white border-blue-400/40"
                      )}
                    >
                      {twibbon.type === "VIDEO" ? "Video" : "Foto"}
                    </span>
                  </div>

                  {/* Downloads count */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold flex items-center gap-1 border border-white/20">
                    <Download className="w-2.5 h-2.5" />
                    <span>{(twibbon.downloadsCount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Title & Slug */}
                <h3
                  className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1"
                  title={twibbon.title}
                >
                  {twibbon.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span className="font-mono text-violet-700 font-bold truncate max-w-[85px] sm:max-w-[110px]">
                    /{twibbon.slug}
                  </span>
                  <button
                    onClick={() => handleCopyLink(twibbon.slug)}
                    className="p-1 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shrink-0"
                    title="Salin Tautan"
                  >
                    {copiedSlug === twibbon.slug ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 pt-2 flex items-center gap-1 mt-auto">
                <a
                  href={`${publicBaseUrl}/${twibbon.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">Buka</span>
                </a>

                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTwibbon(twibbon);
                        setIsEditOpen(true);
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-violet-50 hover:text-violet-700 text-slate-600 transition-all shadow-2xs shrink-0"
                      title="Edit Kampanye"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTwibbon(twibbon);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 text-slate-600 transition-all shadow-2xs shrink-0"
                      title="Hapus Kampanye"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Buat Twibbon */}
      <CreateTwibbonDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refreshData}
      />

      {/* Dialog Edit Twibbon */}
      <EditTwibbonDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        twibbon={selectedTwibbon}
        onSuccess={refreshData}
      />

      {/* Dialog Hapus Twibbon */}
      <DeleteTwibbonDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        twibbon={selectedTwibbon}
        onSuccess={refreshData}
      />

      {/* Dialog Password Nakomisme */}
      <AdminPasswordDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        password={loginPassword}
        onPasswordChange={setLoginPassword}
        onConfirm={handleSuperAdminLogin}
        title="Masuk Akun Nakomisme"
        description="Masukkan password Nakomisme untuk mengelola frame twibbon BEM Unsoed."
        confirmLabel="Masuk"
        loadingLabel="Memeriksa..."
        loading={loginLoading}
      />
    </div>
  );
}
