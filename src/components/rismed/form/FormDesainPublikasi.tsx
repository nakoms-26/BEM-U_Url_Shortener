"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { DesainPublikasiFormValues } from "@/lib/rismed/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import { formatDateOnly, parseDateOnly } from "@/lib/rismed/date";

import { PLATFORM_OPTIONS, WAKTU_PUBLIKASI_OPTIONS } from "@/lib/rismed/constants";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface FormDesainProps {
  form: UseFormReturn<DesainPublikasiFormValues>;
  step: "detail" | "aset" | "review";
}

export function FormDesainPublikasi({ form, step }: FormDesainProps) {
  const {
    register,
    control,
    formState: { errors },
    getValues,
  } = form;

  if (step === "detail") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Detail Konten
          </h2>

          <div className="grid gap-2">
            <Label htmlFor="judul_desain">Judul Desain / Konten</Label>
            <Input
              id="judul_desain"
              placeholder="Contoh: Belajar Bersama Medkom #1"
              {...register("judul_desain")}
            />
            {errors.judul_desain && (
              <p className="text-sm text-destructive">
                {errors.judul_desain.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>
              Platform Publikasi (Semua Mirroring ke WAC, X/Twitter dan IGS)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-md bg-secondary/20">
              {PLATFORM_OPTIONS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="platform_publikasi"
                    render={({ field }) => (
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={field.value?.includes(platform)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, platform]
                            : current.filter((value) => value !== platform);
                          field.onChange(updated);
                        }}
                      />
                    )}
                  />
                  <Label
                    htmlFor={`platform-${platform}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
            {errors.platform_publikasi && (
              <p className="text-sm text-destructive">
                {errors.platform_publikasi.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tanggal_publikasi">Tanggal Publikasi</Label>
              <Controller
                control={control}
                name="tanggal_publikasi"
                render={({ field }) => (
                  <DatePicker03
                    date={parseDateOnly(field.value)}
                    setDate={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    id="tanggal_publikasi"
                  />
                )}
              />
              {errors.tanggal_publikasi && (
                <p className="text-sm text-destructive">
                  {errors.tanggal_publikasi.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="waktu_publikasi">Waktu Publikasi</Label>
              <Controller
                control={control}
                name="waktu_publikasi"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="waktu_publikasi" className="w-full">
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      {WAKTU_PUBLIKASI_OPTIONS.map((waktu) => (
                        <SelectItem key={waktu} value={waktu}>
                          {waktu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.waktu_publikasi && (
                <p className="text-sm text-destructive">
                  {errors.waktu_publikasi.message}
                </p>
              )}
            </div>
          </div>
          <div className="ml-3 text-sm">
            <p className="font-medium text-foreground">
              Lihat{" "}
              <span className="font-bold text-blue-700 italic underline">
                <a href="/app/rismed/jadwal" target="_blank">
                  Jadwal Publikasi
                </a>
              </span>
            </p>
            <p className="text-muted-foreground mt-1">
              Lihat Jadwal Publikasi Sebelum Memilih Jadwal, Pastikan Tidak Ada
              Jadwal Bentrok dengan Konten Lain.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "aset") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Aset & Request Tambahan
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Penting:</p>
              <p>
                Pastikan link Google Drive yang Anda lampirkan{" "}
                <strong>
                  sudah dibuka aksesnya (Anyone with the link can view)
                </strong>
                .
              </p>
              <p className="mt-1">
                Isi <strong>&quot;-&quot;</strong> jika tidak ada file yang perlu
                dilampirkan.
              </p>
              <p className="mt-2">
                Lihat contoh brief:{" "}
                <a
                  href="https://docs.google.com/document/d/1NNIIlvfk_oeajPTPW-H_z0fplF3OAN4_8H0aIzZwHpA/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-blue-900"
                >
                  Contoh Google Docs Brief
                </a>
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="link_file_konten">
              Link File Konten (G-Drive/Docs)
            </Label>
            <Input
              id="link_file_konten"
              placeholder="https://drive.google.com/... atau isi '-' jika tidak ada"
              {...register("link_file_konten")}
            />
            {errors.link_file_konten && (
              <p className="text-sm text-destructive">
                {errors.link_file_konten.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="link_caption_docs">Link Caption (G-Docs)</Label>
            <Input
              id="link_caption_docs"
              placeholder="https://docs.google.com/... atau isi '-' jika tidak ada"
              {...register("link_caption_docs")}
            />
            {errors.link_caption_docs && (
              <p className="text-sm text-destructive">
                {errors.link_caption_docs.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="request_lagu">Request Lagu (Opsional)</Label>
            <Input
              id="request_lagu"
              placeholder="Spotify Link/Judul - Penyanyi"
              {...register("request_lagu")}
            />
          </div>
        </div>
      </div>
    );
  }

  // Review step
  const values = getValues();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Review Pesanan Desain & Publikasi
        </h2>
        <p className="text-muted-foreground text-sm">
          Mohon periksa kembali data pesanan Anda sebelum dikirim.
        </p>

        <div className="bg-secondary/30 rounded-lg p-4 space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">Identitas</h3>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <span className="text-muted-foreground">Nama:</span>
              <span className="col-span-2 font-medium">{values.nama}</span>
              <span className="text-muted-foreground">Kementerian:</span>
              <span className="col-span-2 font-medium">
                {values.kementerian}
              </span>
              <span className="text-muted-foreground">WhatsApp:</span>
              <span className="col-span-2 font-medium">
                {values.nomor_whatsapp}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h3 className="font-semibold text-foreground">Detail Konten</h3>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <span className="text-muted-foreground">Judul:</span>
              <span className="col-span-2 font-medium">
                {values.judul_desain}
              </span>
              <span className="text-muted-foreground">Platform:</span>
              <span className="col-span-2 font-medium">
                {values.platform_publikasi?.join(", ")}
              </span>
              <span className="text-muted-foreground">Waktu Tayang:</span>
              <span className="col-span-2 font-medium">
                {formatDateOnly(values.tanggal_publikasi)} — Pukul{" "}
                {values.waktu_publikasi}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h3 className="font-semibold text-foreground">Aset & Link</h3>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">
                  File Konten:
                </span>
                <a
                  href={values.link_file_konten}
                  target="_blank"
                  className="text-blue-600 hover:underline truncate"
                >
                  {values.link_file_konten}
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Caption:</span>
                <a
                  href={values.link_caption_docs}
                  target="_blank"
                  className="text-blue-600 hover:underline truncate"
                >
                  {values.link_caption_docs}
                </a>
              </div>
            </div>
          </div>

          {values.request_lagu && (
            <div className="border-t border-border pt-3">
              <h3 className="font-semibold text-foreground">Tambahan</h3>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <span className="text-muted-foreground">Lagu:</span>
                <span className="col-span-2">{values.request_lagu}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
