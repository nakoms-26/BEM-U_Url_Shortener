"use client";

import { Label } from "@/components/ui/label";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
} from "./glass-select";
import { Link2, Lock, ShieldCheck, LogOut } from "lucide-react";
import { LEMBAGA_LIST } from "@/lib/constants";
import { toast } from "sonner";
import { GlassNotification } from "./glass-notification";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { GlassButton } from "./ui/glass-button";
import { useRouter } from "next/navigation";

// Skema Validasi Zod
const formSchema = z.object({
  urlAsli: z
    .string()
    .min(1, { message: "URL Asli tidak boleh kosong." })
    .regex(
      /^(?:(?:https?:\/\/)?(?:www\.)?)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:[\/?#][^\s]*)?$/,
      {
        message:
          "Format URL tidak valid (contoh: google.com atau https://google.com)",
      },
    ),
  slug: z
    .string()
    .min(3, { message: "Slug minimal 3 karakter." })
    .max(50, { message: "Slug maksimal 50 karakter." })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Slug hanya boleh berisi huruf, angka, dan strip (-).",
    }),
  lembaga: z.string().min(1, { message: "Silakan pilih lembaga." }),
});

type FormData = z.infer<typeof formSchema>;

interface ShortLinkFormProps {
  initialIsLoggedIn?: boolean;
}

export default function ShortLinkForm({ initialIsLoggedIn = false }: ShortLinkFormProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [loading, setLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urlAsli: "",
      slug: "",
      lembaga: "",
    },
  });

  // Login handler
  const handleAdminLogin = async () => {
    if (!adminPassword) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Password salah.");
      }

      setIsLoggedIn(true);
      setIsPasswordDialogOpen(false);
      setAdminPassword("");
      toast.success(data.message || "Login berhasil! Tombol generate kini aktif.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan verifikasi.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      toast.success("Anda telah keluar. Tombol generate dinonaktifkan.");
      router.refresh();
    } catch {
      toast.error("Gagal keluar.");
    }
  };

  // Submit Handler
  const onSubmit = async (data: FormData) => {
    if (!isLoggedIn) {
      setIsPasswordDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/links/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urlAsli: data.urlAsli,
          slug: data.slug,
          lembaga: data.lembaga,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.custom(() => (
          <GlassNotification
            type="error"
            title="Gagal Membuat Link!"
            description={payload?.message || "Terjadi kesalahan saat membuat link."}
            className="w-87.5"
          />
        ));
        setLoading(false);
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = origin ? `${origin}/${data.slug}` : `/${data.slug}`;

      toast.custom(() => (
        <GlassNotification
          type="success"
          title="Berhasil!"
          className="w-87.5"
          description={
            <div className="space-y-3 mt-2">
              <p className="text-slate-600">Link Anda sudah siap.</p>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <code className="flex-1 text-xs truncate text-slate-900 px-1 font-mono">
                  {fullUrl}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullUrl);
                    toast.success("Copied!", { id: "copy-success" });
                  }}
                  className="h-8 text-xs px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-md font-medium transition-all border border-slate-200 shadow-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          }
        />
      ));

      reset();
    } catch {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8 md:py-12 max-w-md mx-auto w-full gap-6 pb-24">
      {/* Status Auth Banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isLoggedIn ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isLoggedIn ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isLoggedIn ? "Status: Admin Aktif" : "Status: Belum Login"}
            </p>
            <p className="text-[10px] text-slate-500">
              {isLoggedIn
                ? "Tombol generate aktif & siap digunakan"
                : "Tombol generate dinonaktifkan"}
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <GlassButton
            type="button"
            onClick={() => setIsPasswordDialogOpen(true)}
            className="text-xs font-bold py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
          >
            Masuk
          </GlassButton>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* URL Asli Widget */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <Label
            htmlFor="urlAsli"
            className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            URL Asli
          </Label>
          <input
            id="urlAsli"
            type="text"
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none"
            placeholder="https://contoh.com/artikel-sangat-panjang"
            {...register("urlAsli")}
          />
          {errors.urlAsli && (
            <p className="text-[10px] text-red-500 font-medium mt-2">
              {errors.urlAsli.message}
            </p>
          )}
        </div>

        {/* Custom Slug Widget */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <Label
            htmlFor="slug"
            className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Custom Slug
          </Label>
          <div className="flex items-center gap-1 text-slate-900 font-medium text-sm">
            <span className="text-slate-400 select-none font-mono">/</span>
            <input
              id="slug"
              type="text"
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none font-mono"
              placeholder="kegiatan-bem"
              {...register("slug")}
            />
          </div>
          {errors.slug && (
            <p className="text-[10px] text-red-500 font-medium mt-2">{errors.slug.message}</p>
          )}
        </div>

        {/* Lembaga Selector */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm">
          <Label
            htmlFor="lembaga"
            className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Kementerian / Lembaga
          </Label>
          <GlassSelect onValueChange={(value) => setValue("lembaga", value)}>
            <GlassSelectTrigger id="lembaga" className="w-full border-none shadow-none p-0 h-auto">
              <GlassSelectValue placeholder="Pilih Kementerian / Lembaga" />
            </GlassSelectTrigger>
            <GlassSelectContent className="max-h-60">
              {LEMBAGA_LIST.map((item) => (
                <GlassSelectItem key={item} value={item}>
                  {item}
                </GlassSelectItem>
              ))}
            </GlassSelectContent>
          </GlassSelect>
          {errors.lembaga && (
            <p className="text-[10px] text-red-500 font-medium mt-2">
              {errors.lembaga.message}
            </p>
          )}
        </div>

        {/* Submit Button (Off jika belum login) */}
        {isLoggedIn ? (
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-4 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            <Link2 className="w-5 h-5" />
            {loading ? "Membuat Link..." : "Generate Short Link"}
          </button>
        ) : (
          <div className="space-y-3 mt-4">
            <button
              type="button"
              disabled
              className="w-full py-4 rounded-full bg-slate-200/90 text-slate-400 font-bold border border-slate-300/80 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Generate Short Link (Off — Belum Login)</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-center space-y-2">
              <p className="text-xs text-amber-800 font-medium">
                🔒 Masuk dengan password admin untuk mengaktifkan tombol generate shortlink.
              </p>
              <GlassButton
                type="button"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm"
              >
                Masuk sebagai Admin
              </GlassButton>
            </div>
          </div>
        )}
      </form>

      {/* Dialog Password Admin */}
      <AdminPasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        password={adminPassword}
        onPasswordChange={setAdminPassword}
        onConfirm={handleAdminLogin}
        title="Login Admin"
        description="Masukkan password admin (atau super admin) untuk mengaktifkan pembuatan link."
        confirmLabel="Masuk"
        loadingLabel="Memverifikasi..."
        loading={loginLoading}
      />

      {/* How it works */}
      <div className="mt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
          Cara Kerja
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-violet-600">1</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tempelkan URL panjang</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Salin URL asli dari browser atau dokumen Anda
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-violet-600">2</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tentukan slug & lembaga</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Buat slug yang mudah diingat, misal: <code className="font-mono text-violet-600">OprecS3</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-violet-600">3</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Bagikan short link!</p>
              <p className="text-xs text-slate-500 mt-0.5">Link siap disebarkan ke sosial media BEM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
