"use client";

import { Label } from "@/components/ui/label";
import { useState } from "react";
// 1. Import Zod dan React Hook Form
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectGroup,
  GlassSelectItem,
  GlassSelectLabel,
  GlassSelectTrigger,
  GlassSelectValue,
} from "./glass-select";
import { Link2 } from "lucide-react";
import { LEMBAGA_LIST } from "@/lib/constants";
import { toast } from "sonner";
import { GlassNotification } from "./glass-notification";
import { AdminPasswordDialog } from "./AdminPasswordDialog";

// 2. Buat Skema Validasi Zod (Sangat Ketat & Profesional)
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

// Infer type dari schema
type FormData = z.infer<typeof formSchema>;

export default function ShortLinkForm() {
  const [loading, setLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  // 3. Inisialisasi React Hook Form
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

  // 4. Fungsi Submit yang baru
  const onSubmit = (data: FormData) => {
    // Simpan data sementara dan buka dialog password
    setPendingData(data);
    setIsPasswordDialogOpen(true);
  };

  const handleVerifyAndSubmit = async () => {
    if (!pendingData) return;

    setLoading(true);
    const response = await fetch("/api/links/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urlAsli: pendingData.urlAsli,
        slug: pendingData.slug,
        lembaga: pendingData.lembaga,
        password: adminPassword,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      toast.custom(() => (
        <GlassNotification
          type="error"
          title={
            response.status === 401 ? "Password Salah!" : "Gagal Membuat Link!"
          }
          description={
            payload?.message || "Terjadi kesalahan saat membuat link."
          }
          className="w-87.5"
        />
      ));
      setLoading(false);
      return;
    } else {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = origin ? `${origin}/${pendingData.slug}` : `/${pendingData.slug}`;

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
      setIsPasswordDialogOpen(false);
      setAdminPassword(""); // Reset password input
      setPendingData(null);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8 md:py-12 max-w-md mx-auto w-full gap-6 pb-24">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        {/* URL Asli Widget */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <Label htmlFor="urlAsli" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
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
            <p className="text-[10px] text-red-500 font-medium mt-2">{errors.urlAsli.message}</p>
          )}
        </div>

        {/* Short URL Widget */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <Label htmlFor="slug" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Short URL
          </Label>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold text-sm">/</span>
            <input
              id="slug"
              type="text"
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none"
              placeholder="oprec-staff-s3-2025"
              {...register("slug")}
            />
          </div>
          {errors.slug && (
            <p className="text-[10px] text-red-500 font-medium mt-2 leading-tight">{errors.slug.message}</p>
          )}
        </div>

        {/* Lembaga Widget */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <Label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Lembaga
          </Label>
          <GlassSelect onValueChange={(value) => setValue("lembaga", value)}>
            <GlassSelectTrigger className="w-full px-0 py-0 h-auto border-0 bg-transparent shadow-none text-slate-900 font-medium text-sm focus:ring-0">
              <GlassSelectValue placeholder="Pilih kementerian atau biro" />
            </GlassSelectTrigger>
            <GlassSelectContent>
              <GlassSelectGroup>
                <GlassSelectLabel>Kementerian / Biro</GlassSelectLabel>
                {LEMBAGA_LIST.map((lembaga) => (
                  <GlassSelectItem key={lembaga} value={lembaga}>
                    {lembaga}
                  </GlassSelectItem>
                ))}
              </GlassSelectGroup>
            </GlassSelectContent>
          </GlassSelect>
          {errors.lembaga && (
            <p className="text-[10px] text-red-500 font-medium mt-2 leading-tight">{errors.lembaga.message}</p>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-4 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Link2 className="w-5 h-5" />
          {loading ? "Membuat Link..." : "Generate Short Link"}
        </button>

      </form>

      {/* Dialog Password Admin */}
      <AdminPasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        password={adminPassword}
        onPasswordChange={setAdminPassword}
        onConfirm={handleVerifyAndSubmit}
        title="Verifikasi Admin"
        description="Masukkan password admin untuk membuat link singkat baru."
        confirmLabel="Buat Link"
        loadingLabel="Memproses..."
        loading={loading}
      />

      {/* How it works */}
      <div className="mt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Cara Kerja</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-violet-600">1</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tempelkan URL panjang</p>
              <p className="text-xs text-slate-500 mt-0.5">Salin URL asli dari browser atau dokumen Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-violet-600">2</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tentukan slug & lembaga</p>
              <p className="text-xs text-slate-500 mt-0.5">Buat slug yang mudah diingat, misal: <code className="font-mono text-violet-600">OprecS3</code></p>
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

      {/* Tips Card */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex gap-3 items-start">
        <div className="text-xl shrink-0">💡</div>
        <div>
          <p className="text-sm font-bold text-violet-900 mb-1">Tips Membuat Slug</p>
          <p className="text-xs text-violet-700 leading-relaxed">Gunakan nama singkat yang relevan dengan kegiatan. Hindari spasi — gunakan strip (-) sebagai pengganti. Contoh: <code className="font-mono font-bold">oprec-s3-2025</code></p>
        </div>
      </div>
    </div>
  );
}
