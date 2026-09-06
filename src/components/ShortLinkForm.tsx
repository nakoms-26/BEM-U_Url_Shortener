"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
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
import { GlassInput } from "./ui/glass-input";
import { GlassButton } from "./ui/glass-button";
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
              <p className="text-white/70">Link Anda sudah siap.</p>
              <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/10 backdrop-blur-md">
                <code className="flex-1 text-xs truncate text-white/90 px-1 font-mono">
                  {fullUrl}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullUrl);
                    toast.success("Copied!", { id: "copy-success" });
                  }}
                  className="h-8 text-xs px-3 bg-white/20 hover:bg-white/30 text-white rounded-md font-medium transition-all border border-white/10"
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
    <>
      <GlassCard
        className="flex flex-col  backdrop-blur-md
       shadow-2xl rounded-3xl p-8 border "
      >
        <div className="flex justify-center mb-3">
          <Image
            className="dark:invert"
            src="/KabinetKausaCipta.webp"
            alt="BEM-U logo"
            width={65}
            height={12}
            priority
          />
        </div>

        <div className="w-full space-y-6 text-center sm:text-left">
          <h2 className="font-bold text-2xl text-zinc-50 dark:text-zinc-50 text-center">
            Generate Short Link
          </h2>

          {/* Hubungkan form dengan handleSubmit dari React Hook Form */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 text-left"
          >
            <div className="space-y-2">
              <Label htmlFor="urlAsli">Real URL</Label>
              <GlassInput
                id="urlAsli"
                type="text"
                placeholder="https://contoh.com/artikel-sangat-panjang"
                {...register("urlAsli")} // Pengganti value & onChange
                className={errors.urlAsli ? "border-red-500" : ""}
              />
              {/* Tampilkan pesan error Zod jika ada */}
              {errors.urlAsli && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.urlAsli.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Short URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-white  text-sm">/</span>
                <GlassInput
                  id="slug"
                  type="text"
                  placeholder="OprecS32026"
                  {...register("slug")} // Pengganti value & onChange
                  className={errors.slug ? "border-red-500" : ""}
                />
              </div>
              {/* Tampilkan pesan error Zod jika ada */}
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Kementrian">Lembaga</Label>
              <GlassSelect
                onValueChange={(value) => setValue("lembaga", value)}
              >
                <GlassSelectTrigger
                  className={`w-full ${errors.lembaga ? "border-red-500" : ""}`}
                >
                  <GlassSelectValue placeholder="Pilih kementrian atau biro" />
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.lembaga.message}
                </p>
              )}
            </div>
            <div>
              <GlassButton
                variant="default"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate"}
              </GlassButton>
            </div>
          </form>
        </div>
      </GlassCard>

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
    </>
  );
}
