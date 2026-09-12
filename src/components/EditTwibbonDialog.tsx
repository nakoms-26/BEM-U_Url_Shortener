"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogDescription,
  GlassDialogFooter,
  GlassDialogHeader,
  GlassDialogTitle,
} from "@/components/ui/glass-dialog";
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
} from "@/components/glass-select";
import { toast } from "sonner";
import { Upload, Film, ImageIcon, Edit3, Loader2 } from "lucide-react";
import { TwibbonItem, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "@/lib/twibbon-schemas";

interface EditTwibbonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  twibbon: TwibbonItem | null;
  onSuccess: () => void;
}

export function EditTwibbonDialog({
  open,
  onOpenChange,
  twibbon,
  onSuccess,
}: EditTwibbonDialogProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [chromaColor, setChromaColor] = useState("#00FF00");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  const [newLayerFile, setNewLayerFile] = useState<File | null>(null);
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    percent: number;
    loaded: string;
    total: string;
    stage: string;
  } | null>(null);

  useEffect(() => {
    if (twibbon) {
      setTitle(twibbon.title || "");
      setSlug(twibbon.slug || "");
      setDescription(twibbon.description || "");
      setType(twibbon.type || "IMAGE");
      setIsActive(Boolean(twibbon.isActive));

      const rawColor = twibbon.config?.chromaKey?.color;
      if (typeof rawColor === "string" && rawColor.startsWith("#")) {
        setChromaColor(rawColor);
      } else {
        setChromaColor("#00FF00");
      }
      setNewLayerFile(null);
      setNewThumbnailFile(null);
      setPassword("");
    }
  }, [twibbon]);

  if (!twibbon) return null;

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const uploadFile = (
    file: File,
    appName: string,
    secret: string,
    apiUrl: string,
    stageLabel: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress({
            percent,
            loaded: formatBytes(e.loaded),
            total: formatBytes(e.total),
            stage: stageLabel,
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.success) resolve(res.url);
            else reject(new Error(res.error || "Upload ditolak server."));
          } catch {
            reject(new Error("Format response dari server tidak valid."));
          }
        } else {
          reject(new Error(`Server error: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Gagal menyambung ke server upload assets."));

      const fd = new FormData();
      fd.append("file", file);
      fd.append("app", appName);
      fd.append("secret", secret);
      xhr.send(fd);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul kampanye wajib diisi.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug URL wajib diisi.");
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      toast.error("Slug hanya boleh berisi huruf, angka, dan strip (-).");
      return;
    }
    if (!password) {
      toast.error("Password admin wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      let finalLayerUrl = undefined;
      let finalThumbnailUrl = undefined;

      if (newLayerFile || newThumbnailFile) {
        setUploadProgress({ percent: 0, loaded: "0 MB", total: "0 MB", stage: "Menyiapkan upload..." });
        const credRes = await fetch("/api/twibbons/upload-credentials");
        if (!credRes.ok) throw new Error("Gagal mengambil kredensial upload.");
        const creds = await credRes.json();

        if (newLayerFile) {
          const maxLayerSize = type === "VIDEO" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
          if (newLayerFile.size > maxLayerSize) {
            throw new Error(`Ukuran file frame layer maksimal ${type === "VIDEO" ? "100MB" : "10MB"}.`);
          }
          finalLayerUrl = await uploadFile(
            newLayerFile,
            "twibbon",
            creds.secret,
            creds.url,
            "Mengunggah File Frame Baru..."
          );
        }

        if (newThumbnailFile) {
          if (newThumbnailFile.size > MAX_IMAGE_SIZE) {
            throw new Error("Ukuran thumbnail maksimal 10MB.");
          }
          finalThumbnailUrl = await uploadFile(
            newThumbnailFile,
            "twibbon",
            creds.secret,
            creds.url,
            "Mengunggah Thumbnail Baru..."
          );
        }
      }

      const res = await fetch("/api/twibbons/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: twibbon.id,
          title,
          slug,
          description,
          type,
          chromaColor: type === "VIDEO" ? chromaColor : undefined,
          layerUrl: finalLayerUrl,
          thumbnailUrl: finalThumbnailUrl,
          isActive,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui twibbon.");
      }

      toast.success(data.message || "Twibbon berhasil diperbarui!");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui twibbon.");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <GlassDialog open={open} onOpenChange={onOpenChange}>
      <GlassDialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <GlassDialogHeader>
          <div className="flex items-center gap-2 text-violet-700 mb-1">
            <Edit3 className="w-5 h-5" />
            <GlassDialogTitle className="text-xl">Edit Twibbon</GlassDialogTitle>
          </div>
          <GlassDialogDescription>
            Perbarui data kampanye <strong>{twibbon.title}</strong> (ID: {twibbon.id}).
          </GlassDialogDescription>
        </GlassDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Judul & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-twibbon-title" className="text-xs font-semibold text-slate-700">
                Judul Kampanye <span className="text-red-500">*</span>
              </Label>
              <GlassInput
                id="edit-twibbon-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-twibbon-slug" className="text-xs font-semibold text-slate-700">
                Slug URL <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                  /
                </span>
                <GlassInput
                  id="edit-twibbon-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="pl-6 font-mono text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tipe & Chroma Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Tipe Twibbon <span className="text-red-500">*</span>
              </Label>
              <GlassSelect value={type} onValueChange={(v: "IMAGE" | "VIDEO") => setType(v)}>
                <GlassSelectTrigger className="w-full">
                  <GlassSelectValue placeholder="Pilih tipe" />
                </GlassSelectTrigger>
                <GlassSelectContent>
                  <GlassSelectItem value="IMAGE">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-violet-600" />
                      <span>Gambar (PNG Transparan)</span>
                    </div>
                  </GlassSelectItem>
                  <GlassSelectItem value="VIDEO">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-emerald-600" />
                      <span>Video (MP4 Green Screen)</span>
                    </div>
                  </GlassSelectItem>
                </GlassSelectContent>
              </GlassSelect>
            </div>

            {type === "VIDEO" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-chroma-color" className="text-xs font-semibold text-slate-700">
                  Warna Chroma Key (Green Screen)
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="edit-chroma-color"
                    value={chromaColor}
                    onChange={(e) => setChromaColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <GlassInput
                    value={chromaColor}
                    onChange={(e) => setChromaColor(e.target.value)}
                    className="font-mono text-sm uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-twibbon-desc" className="text-xs font-semibold text-slate-700">
              Deskripsi & Template Caption Instagram
            </Label>
            <textarea
              id="edit-twibbon-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Current Files Preview & Optional Replacement */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-800">Pratinjau & Ganti File (Opsional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thumbnail preview */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-slate-600">Ganti Thumbnail</Label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 aspect-[4/5] rounded-xl border overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={twibbon.thumbnail}
                      alt={twibbon.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setNewThumbnailFile(file);
                      }}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {newThumbnailFile && (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                        Dipilih: {newThumbnailFile.name} ({formatBytes(newThumbnailFile.size)})
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Layer replacement */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-slate-600">
                  Ganti Frame Layer ({type === "VIDEO" ? "Video MP4" : "PNG"})
                </Label>
                <div>
                  <input
                    type="file"
                    accept={type === "VIDEO" ? "video/mp4,video/webm" : "image/png,image/webp"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewLayerFile(file);
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  {newLayerFile && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                      Dipilih: {newLayerFile.name} ({formatBytes(newLayerFile.size)})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Aktif Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Status Kampanye Aktif</p>
              <p className="text-[11px] text-slate-500">Twibbon dapat diakses publik oleh mahasiswa.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Password Super Admin */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="edit-twibbon-password" className="text-xs font-semibold text-slate-700">
              Password Super Admin <span className="text-red-500">*</span>
            </Label>
            <GlassInput
              id="edit-twibbon-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Upload progress */}
          {uploadProgress && (
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-violet-900">
                <span>{uploadProgress.stage}</span>
                <span>{uploadProgress.percent}% ({uploadProgress.loaded} / {uploadProgress.total})</span>
              </div>
              <div className="w-full bg-violet-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-violet-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          <GlassDialogFooter className="flex flex-row gap-2 pt-2">
            <GlassButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                "Simpan Perubahan"
              )}
            </GlassButton>
          </GlassDialogFooter>
        </form>
      </GlassDialogContent>
    </GlassDialog>
  );
}
