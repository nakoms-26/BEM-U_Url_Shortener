"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TwibbonItem } from "@/lib/twibbon-schemas";
import { GlassButton } from "@/components/ui/glass-button";
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
  ShieldCheck,
  LogOut,
  KeyRound,
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
        throw new Error("Hanya Super Admin yang berwenang mengelola Twibbon.");
      }

      setIsSuperAdmin(true);
      setIsLoginDialogOpen(false);
      setLoginPassword("");
      toast.success("Login Super Admin berhasil! Seluruh kontrol twibbon terbuka.");
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk sebagai Super Admin.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsSuperAdmin(false);
      toast.success("Keluar dari mode Super Admin. Menampilkan twibbon terpublikasi.");
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
    <div className="flex flex-col min-h-full px-4 md:px-6 py-6 max-w-5xl mx-auto w-full gap-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Twibbon BEM Unsoed
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-slate-500">
            {isSuperAdmin
              ? "Mode Super Admin: Kelola seluruh kampanye twibbon foto & video"
              : "Katalog Publik: Menampilkan twibbon yang sedang aktif dan terpublikasi"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            title="Muat Ulang Data"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>

          {isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <GlassButton
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-violet-500/20"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>+ Buat Twibbon</span>
              </GlassButton>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                title="Keluar dari Super Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GlassButton
              type="button"
              onClick={() => setIsLoginDialogOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk Super Admin</span>
            </GlassButton>
          )}
        </div>
      </div>

      {/* Role State Indicator */}
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold",
          isSuperAdmin
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-slate-100 border-slate-200 text-slate-700"
        )}
      >
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <Lock className="w-4 h-4 text-slate-500" />
          )}
          <span>
            {isSuperAdmin
              ? "Akses Super Admin Aktif: Anda dapat membuat, mengedit, dan menghapus twibbon."
              : "Mode Publik: Hanya menampilkan twibbon yang terpublikasi."}
          </span>
        </div>
        {!isSuperAdmin && (
          <button
            onClick={() => setIsLoginDialogOpen(true)}
            className="text-xs font-bold text-violet-700 hover:underline flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Buka Akses Pengelolaan</span>
          </button>
        )}
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {/* Total Twibbon */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl md:text-2xl font-black text-slate-900">{stats.total}</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-violet-50 text-violet-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isSuperAdmin ? "Total Kampanye" : "Twibbon Aktif"}
          </span>
        </div>

        {/* Twibbon Aktif */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl md:text-2xl font-black text-slate-900">{stats.active}</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
            Terpublikasi
          </span>
        </div>

        {/* Total Download */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl md:text-2xl font-black text-slate-900">
              {stats.totalDownloads.toLocaleString()}
            </span>
            <div className="p-1.5 md:p-2 rounded-xl bg-amber-50 text-amber-600">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Unduhan
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <GlassInput
            placeholder="Cari judul twibbon atau slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs md:text-sm bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
          {/* Tipe Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                filterType === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType("IMAGE")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                filterType === "IMAGE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Gambar
            </button>
            <button
              onClick={() => setFilterType("VIDEO")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                filterType === "VIDEO" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Video
            </button>
          </div>

          {/* Status Filter (Hanya untuk Super Admin) */}
          {isSuperAdmin && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  filterStatus === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Status
              </button>
              <button
                onClick={() => setFilterStatus("ACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  filterStatus === "ACTIVE" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Aktif
              </button>
              <button
                onClick={() => setFilterStatus("INACTIVE")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  filterStatus === "INACTIVE" ? "bg-white text-red-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Nonaktif
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Twibbons Grid */}
      {filteredTwibbons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
              ? "Tidak ada twibbon yang cocok"
              : "Belum ada kampanye twibbon terpublikasi"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
              ? "Coba ubah kata kunci pencarian atau sesuaikan filter Anda."
              : isSuperAdmin
              ? "Mulai buat kampanye pertama Anda dengan mengunggah frame twibbon."
              : "Belum ada twibbon yang terpublikasi saat ini."}
          </p>
          {isSuperAdmin ? (
            <GlassButton
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs"
            >
              + Buat Twibbon Baru
            </GlassButton>
          ) : (
            <GlassButton
              type="button"
              onClick={() => setIsLoginDialogOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs"
            >
              Masuk Super Admin
            </GlassButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredTwibbons.map((twibbon) => (
            <div
              key={twibbon.id}
              className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                {/* Header Card: Thumbnail + Badges */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-3 flex items-center justify-center">
                  {twibbon.thumbnail ? (
                    <Image
                      src={
                        twibbon.updatedAt
                          ? `${twibbon.thumbnail}?t=${new Date(twibbon.updatedAt).getTime()}`
                          : twibbon.thumbnail
                      }
                      alt={twibbon.title}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="text-slate-300 font-bold text-3xl">BEM</div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {isSuperAdmin && (
                      <span
                        className={cn(
                          "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md backdrop-blur-md border",
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
                        "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md backdrop-blur-md border",
                        twibbon.type === "VIDEO"
                          ? "bg-purple-600/90 text-white border-purple-400/40"
                          : "bg-blue-600/90 text-white border-blue-400/40"
                      )}
                    >
                      {twibbon.type === "VIDEO" ? "Video" : "Gambar"}
                    </span>
                  </div>

                  {/* Downloads count pill */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                    <Download className="w-3 h-3" />
                    <span>{(twibbon.downloadsCount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Title & Slug */}
                <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1 mb-1">
                  {twibbon.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-mono text-violet-700 font-bold">
                    /{twibbon.slug}
                  </span>
                  <button
                    onClick={() => handleCopyLink(twibbon.slug)}
                    className="p-1 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    title="Salin Tautan"
                  >
                    {copiedSlug === twibbon.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Description snippet */}
                {twibbon.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-1">
                    {twibbon.description}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="border-t border-slate-100 pt-3 flex items-center gap-1.5 mt-auto">
                <a
                  href={`${publicBaseUrl}/${twibbon.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat</span>
                </a>

                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTwibbon(twibbon);
                        setIsEditOpen(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-violet-50 hover:text-violet-700 text-slate-600 transition-all"
                      title="Edit Kampanye"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTwibbon(twibbon);
                        setIsDeleteOpen(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 text-slate-600 transition-all"
                      title="Hapus Kampanye"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {isSuperAdmin && (
        <>
          <CreateTwibbonDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSuccess={refreshData}
          />

          <EditTwibbonDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            twibbon={selectedTwibbon}
            onSuccess={refreshData}
          />

          <DeleteTwibbonDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            twibbon={selectedTwibbon}
            onSuccess={refreshData}
          />
        </>
      )}

      {/* Super Admin Login Dialog */}
      <AdminPasswordDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        password={loginPassword}
        onPasswordChange={setLoginPassword}
        onConfirm={handleSuperAdminLogin}
        title="Masuk Super Admin"
        description="Masukkan password Super Admin untuk membuka fitur pembuatan dan pengelolaan Twibbon."
        confirmLabel="Masuk"
        loadingLabel="Memverifikasi..."
        loading={loginLoading}
      />
    </div>
  );
}
