import { UseFormReturn, Controller } from "react-hook-form";
import { IdentityFormValues } from "@/lib/rismed/schema";
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
import { KEMENTERIAN_OPTIONS } from "@/lib/rismed/constants";

interface StepProps {
  form: UseFormReturn<IdentityFormValues>;
}

export function StepIdentity({ form }: StepProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Identitas Pemesan
        </h2>

        <div className="grid gap-2">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input
            id="nama"
            placeholder="Masukkan nama lengkap"
            {...register("nama")}
          />
          {errors.nama && (
            <p className="text-sm text-destructive">{errors.nama.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="kementerian">Asal Kementerian/Biro</Label>
          <Controller
            control={control}
            name="kementerian"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full" id="kementerian">
                  <SelectValue placeholder="Pilih Kementerian/Biro" />
                </SelectTrigger>
                <SelectContent>
                  {KEMENTERIAN_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.kementerian && (
            <p className="text-sm text-destructive">
              {errors.kementerian.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nomor_whatsapp">Nomor WhatsApp</Label>
          <Input
            id="nomor_whatsapp"
            placeholder="Contoh: 081234567890"
            type="tel"
            {...register("nomor_whatsapp")}
          />
          {errors.nomor_whatsapp && (
            <p className="text-sm text-destructive">
              {errors.nomor_whatsapp.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-xl font-semibold text-foreground">
          Konfirmasi SOP
        </h2>
        <div className="flex items-start gradient-secondary p-4 rounded-lg">
          <div className="flex items-center h-5 mt-1">
            <Controller
              control={control}
              name="sudah_baca_sop"
              render={({ field }) => (
                <Checkbox
                  id="sudah_baca_sop"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="ml-3 text-sm">
            <Label
              htmlFor="sudah_baca_sop"
              className="font-medium text-white cursor-pointer"
            >
              Saya sudah membaca dan memahami{" "}
              <span className="font-bold text-white italic underline">
                <a
                  href="https://drive.google.com/drive/folders/1LfBlUZEg-fnwreUZxDfg8txBNbfNmEeP"
                  target="blank"
                >
                  SOP Pemesanan Konten
                </a>
              </span>
            </Label>
            <p className="text-white mt-1">
              Dengan mencentang ini, Anda setuju untuk mengikuti semua prosedur
              yang berlaku.
            </p>
            {errors.sudah_baca_sop && (
              <p className="text-sm text-destructive mt-1 font-semibold">
                {errors.sudah_baca_sop.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
