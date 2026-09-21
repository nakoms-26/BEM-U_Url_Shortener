"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { SurveyFormValues } from "@/lib/rismed/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import { formatDateOnly, parseDateOnly } from "@/lib/rismed/date";

import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface FormSurveyProps {
  form: UseFormReturn<SurveyFormValues>;
  step: "detail" | "review";
}

export function FormSurvey({ form, step }: FormSurveyProps) {
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
          <h2 className="text-xl font-semibold text-foreground">Detail Survey</h2>
          <p className="text-muted-foreground text-sm">
            Isi detail survey yang akan dipublikasikan
          </p>

          <div className="grid gap-2">
            <Label htmlFor="judul_survey">Judul Survey</Label>
            <Input
              id="judul_survey"
              placeholder="Contoh: Survey Kepuasan Mahasiswa 2026"
              {...register("judul_survey")}
            />
            {errors.judul_survey && (
              <p className="text-sm text-destructive">
                {errors.judul_survey.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deskripsi_survey">
              Deskripsi dan Tujuan Survey
            </Label>
            <Textarea
              id="deskripsi_survey"
              placeholder="Jelaskan deskripsi dan tujuan survey Anda..."
              className="min-h-[100px]"
              {...register("deskripsi_survey")}
            />
            {errors.deskripsi_survey && (
              <p className="text-sm text-destructive">
                {errors.deskripsi_survey.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="target_responden">Target Responden</Label>
            <Input
              id="target_responden"
              placeholder="Contoh: Mahasiswa Unsoed angkatan 2022-2025"
              {...register("target_responden")}
            />
            {errors.target_responden && (
              <p className="text-sm text-destructive">
                {errors.target_responden.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline_survey">Deadline Pengisian</Label>
            <Controller
              control={control}
              name="deadline_survey"
              render={({ field }) => (
                <DatePicker03
                    date={parseDateOnly(field.value)}
                  setDate={(date) =>
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  id="deadline_survey"
                />
              )}
            />
            {errors.deadline_survey && (
              <p className="text-sm text-destructive">
                {errors.deadline_survey.message}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Penting:</p>
              <p>
                Link G-Drive harus berisi:{" "}
                <strong>Google Docs brief survey</strong> dan{" "}
                <strong>desain header form</strong>.
              </p>
              <p className="mt-1">
                Pastikan akses sudah dibuka (Anyone with the link can view).
              </p>
              <br />
              <p>Contoh brief survei & oprec: <strong><a href="https://docs.google.com/document/d/1R_3sjZE6oGd_Qg3Mnf3K-g0bQL1Bcor7gncfe92LD3A/edit?usp=drive_link" target="blank">KLIK DISINI</a></strong></p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="link_gdrive_brief">
              Link G-Drive (Brief & Header)
            </Label>
            <Input
              id="link_gdrive_brief"
              placeholder="https://drive.google.com/..."
              {...register("link_gdrive_brief")}
            />
            {errors.link_gdrive_brief && (
              <p className="text-sm text-destructive">
                {errors.link_gdrive_brief.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Hadiah Survey</Label>
            <Controller
              control={control}
              name="hadiah_survey"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4 p-4 border rounded-md bg-secondary/20"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ada" id="hadiah-ada" />
                    <Label
                      htmlFor="hadiah-ada"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Ada
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tidak" id="hadiah-tidak" />
                    <Label
                      htmlFor="hadiah-tidak"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Tidak Ada
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.hadiah_survey && (
              <p className="text-sm text-destructive">
                {errors.hadiah_survey.message}
              </p>
            )}
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
          Review Pesanan Survey
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
            <h3 className="font-semibold text-foreground">Detail Survey</h3>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <span className="text-muted-foreground">Judul:</span>
              <span className="col-span-2 font-medium">
                {values.judul_survey}
              </span>
              <span className="text-muted-foreground">Deskripsi:</span>
              <span className="col-span-2">{values.deskripsi_survey}</span>
              <span className="text-muted-foreground">Target:</span>
              <span className="col-span-2 font-medium">
                {values.target_responden}
              </span>
              <span className="text-muted-foreground">Deadline:</span>
              <span className="col-span-2 font-medium">
                {formatDateOnly(values.deadline_survey)}
              </span>
              <span className="text-muted-foreground">Hadiah:</span>
              <span className="col-span-2 font-medium">
                {values.hadiah_survey === "ada" ? "Ada" : "Tidak Ada"}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h3 className="font-semibold text-foreground">Link Brief</h3>
            <a
              href={values.link_gdrive_brief}
              target="_blank"
              className="text-blue-600 hover:underline truncate block mt-1"
            >
              {values.link_gdrive_brief}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
