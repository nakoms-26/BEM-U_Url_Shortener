"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { BantuanTeknisFormValues } from "@/lib/rismed/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import { formatDateOnly, parseDateOnly } from "@/lib/rismed/date";

import { JENIS_BANTUAN_OPTIONS } from "@/lib/rismed/constants";
import { format } from "date-fns";

interface FormBantuanTeknisProps {
  form: UseFormReturn<BantuanTeknisFormValues>;
  step: "detail" | "review";
}

export function FormBantuanTeknis({ form, step }: FormBantuanTeknisProps) {
  const {
    register,
    control,
    formState: { errors },
    getValues,
    watch,
  } = form;
  const jenisBantuan = watch("jenis_bantuan");

  if (step === "detail") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Detail Bantuan Teknis
          </h2>
          <p className="text-muted-foreground text-sm">
            Isi detail kegiatan yang membutuhkan bantuan teknis
          </p>

          <div className="grid gap-2">
            <Label htmlFor="nama_kegiatan">Nama Kegiatan</Label>
            <Input
              id="nama_kegiatan"
              placeholder="Contoh: Podcast BEM Unsoed Episode 10"
              {...register("nama_kegiatan")}
            />
            {errors.nama_kegiatan && (
              <p className="text-sm text-destructive">
                {errors.nama_kegiatan.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tanggal_kegiatan">Hari/Tanggal</Label>
              <Controller
                control={control}
                name="tanggal_kegiatan"
                render={({ field }) => (
                  <DatePicker03
                    date={parseDateOnly(field.value)}
                    setDate={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    id="tanggal_kegiatan"
                  />
                )}
              />
              {errors.tanggal_kegiatan && (
                <p className="text-sm text-destructive">
                  {errors.tanggal_kegiatan.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="waktu_kegiatan">Waktu</Label>
              <Input
                id="waktu_kegiatan"
                type="time"
                {...register("waktu_kegiatan")}
              />
              {errors.waktu_kegiatan && (
                <p className="text-sm text-destructive">
                  {errors.waktu_kegiatan.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tempat_kegiatan">Tempat</Label>
            <Input
              id="tempat_kegiatan"
              placeholder="Contoh: Studio Podcast Gedung A"
              {...register("tempat_kegiatan")}
            />
            {errors.tempat_kegiatan && (
              <p className="text-sm text-destructive">
                {errors.tempat_kegiatan.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Jenis Bantuan</Label>
            <Controller
              control={control}
              name="jenis_bantuan"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3 p-4 border rounded-md bg-secondary/20"
                >
                  {JENIS_BANTUAN_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.jenis_bantuan && (
              <p className="text-sm text-destructive">
                {errors.jenis_bantuan.message}
              </p>
            )}
          </div>

          {jenisBantuan === "lainnya" && (
            <div className="grid gap-2 animate-in fade-in duration-300">
              <Label htmlFor="jenis_bantuan_lainnya">
                Jelaskan Jenis Bantuan
              </Label>
              <Input
                id="jenis_bantuan_lainnya"
                placeholder="Jelaskan jenis bantuan yang Anda butuhkan..."
                {...register("jenis_bantuan_lainnya")}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Review step
  const values = getValues();

  const getJenisBantuanLabel = (id: string) => {
    const option = JENIS_BANTUAN_OPTIONS.find((o) => o.id === id);
    return option?.label || id;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Review Pesanan Bantuan Teknis
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
            <h3 className="font-semibold text-foreground">Detail Kegiatan</h3>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <span className="text-muted-foreground">Nama Kegiatan:</span>
              <span className="col-span-2 font-medium">
                {values.nama_kegiatan}
              </span>
              <span className="text-muted-foreground">Tanggal:</span>
              <span className="col-span-2 font-medium">
                {formatDateOnly(values.tanggal_kegiatan)}
              </span>
              <span className="text-muted-foreground">Waktu:</span>
              <span className="col-span-2 font-medium">
                {values.waktu_kegiatan}
              </span>
              <span className="text-muted-foreground">Tempat:</span>
              <span className="col-span-2 font-medium">
                {values.tempat_kegiatan}
              </span>
              <span className="text-muted-foreground">Jenis Bantuan:</span>
              <span className="col-span-2 font-medium">
                {getJenisBantuanLabel(values.jenis_bantuan)}
                {values.jenis_bantuan === "lainnya" &&
                  values.jenis_bantuan_lainnya && (
                    <span className="text-muted-foreground">
                      {" "}
                      - {values.jenis_bantuan_lainnya}
                    </span>
                  )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
