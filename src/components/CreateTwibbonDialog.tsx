"use client";

import React, { useState } from "react";
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
import { Upload, Film, ImageIcon, Sparkles, Loader2, Info } from "lucide-react";
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "@/lib/twibbon-schemas";

interface CreateTwibbonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTwibbonDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTwibbonDialogProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [chromaColor, setChromaColor] = useState("#00FF00");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  const [layerFile, setLayerFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    percent: number;
    loaded: string;
    total: string;
    stage: string;
  } | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  };

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
            else reject(new Error(res.error || "Upload ditolak oleh server."));
          } catch {
            reject(new Error("Format response dari server upload tidak valid."));
          }
        } else {
          reject(new Error(`Server upload error: status ${xhr.status}`));
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
    if (!layerFile) {
      toast.error(`File frame (${type === "IMAGE" ? "PNG transparan" : "Video MP4"}) wajib diunggah.`);
      return;
    }
    if (!thumbnailFile) {
      toast.error("File thumbnail wajib diunggah.");
      return;
    }
    if (!password) {
      toast.error("Password admin wajib diisi.");
      return;
    }

    const maxLayerSize = type === "VIDEO" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (layerFile.size > maxLayerSize) {
      toast.error(`Ukuran file frame layer maksimal ${type === "VIDEO" ? "100MB" : "10MB"}.`);
      return;
    }
    if (thumbnailFile.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran thumbnail maksimal 10MB.");
      return;
    }

    setLoading(true);
    setUploadProgress({ percent: 0, loaded: "0 MB", total: "0 MB", stage: "Menyiapkan upload..." });

    try {
      // 1. Ambil kredensial upload dari server
      const credRes = await fetch("/api/twibbons/upload-credentials");
      if (!credRes.ok) throw new Error("Gagal mengambil kredensial server upload.");
      const creds = await credRes.json();

      // 2. Upload file layer/frame
      const layerUrl = await uploadFile(
        layerFile,
        "twibbon",
        creds.secret,
        creds.url,
        `Mengunggah File Frame ${type === "VIDEO" ? "Video" : "Gambar"}...`
      );

      // 3. Upload file thumbnail
      const thumbnailUrl = await uploadFile(
        thumbnailFile,
        "twibbon",
        creds.secret,
        creds.url,
        "Mengunggah File Thumbnail..."
      );

      setUploadProgress({ percent: 100, loaded: "Selesai", total: "Selesai", stage: "Menyimpan ke database..." });

      // 4. Simpan ke database via API
      const res = await fetch("/api/twibbons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          type,
          chromaColor: type === "VIDEO" ? chromaColor : undefined,
          layerUrl,
          thumbnailUrl,
          isActive,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat twibbon.");
      }

      toast.success("Twibbon baru berhasil dibuat!");
      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setType("IMAGE");
      setChromaColor("#00FF00");
      setIsActive(true);
      setLayerFile(null);
      setThumbnailFile(null);
      setPassword("");
      setUploadProgress(null);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat memproses.");
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
            <Sparkles className="w-5 h-5" />
            <GlassDialogTitle className="text-xl">Tambah Twibbon Baru</GlassDialogTitle>
          </div>
          <GlassDialogDescription>
            Publikasikan frame twibbon baru untuk kegiatan atau kepengurusan BEM Unsoed.
          </GlassDialogDescription>
        </GlassDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Judul & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="twibbon-title" className="text-xs font-semibold text-slate-700">
                Judul Kampanye <span className="text-red-500">*</span>
              </Label>
              <GlassInput
                id="twibbon-title"
                placeholder="Contoh: Cakrawala 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twibbon-slug" className="text-xs font-semibold text-slate-700">
                Slug URL <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                  /
                </span>
                <GlassInput
                  id="twibbon-slug"
                  placeholder="cakrawala-2026"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="pl-6 font-mono text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tipe & Warna Chroma Key (if Video) */}
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
                <Label htmlFor="chroma-color" className="text-xs font-semibold text-slate-700">
                  Warna Chroma Key (Green Screen)
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="chroma-color"
                    value={chromaColor}
                    onChange={(e) => setChromaColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <GlassInput
                    value={chromaColor}
                    onChange={(e) => setChromaColor(e.target.value)}
                    className="font-mono text-sm uppercase"
                    placeholder="#00FF00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Deskripsi & Caption */}
          <div className="space-y-1.5">
            <Label htmlFor="twibbon-desc" className="text-xs font-semibold text-slate-700">
              Deskripsi & Template Caption Instagram
            </Label>
            <textarea
              id="twibbon-desc"
              rows={3}
              placeholder="Tuliskan keterangan kampanye atau template caption untuk disalin pengguna..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Layer Frame */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>File Frame {type === "VIDEO" ? "Video" : "Gambar"} <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {type === "VIDEO" ? "MP4 (Max 100MB)" : "PNG (Max 10MB)"}
                </span>
              </Label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-xl p-3 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept={type === "VIDEO" ? "video/mp4,video/webm" : "image/png,image/webp"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLayerFile(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required
                />
                <div className="flex flex-col items-center justify-center py-1 pointer-events-none">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                    {layerFile ? layerFile.name : "Pilih file frame..."}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {layerFile ? formatBytes(layerFile.size) : "Disarankan 1080x1350 (4:5)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Thumbnail Preview <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">JPG/PNG (Max 10MB)</span>
              </Label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-xl p-3 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setThumbnailFile(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required
                />
                <div className="flex flex-col items-center justify-center py-1 pointer-events-none">
                  <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                    {thumbnailFile ? thumbnailFile.name : "Pilih gambar thumbnail..."}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {thumbnailFile ? formatBytes(thumbnailFile.size) : "Rasio 4:5 (portrait)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Aktif Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Status Kampanye Langsung Aktif</p>
              <p className="text-[11px] text-slate-500">Jika aktif, twibbon langsung bisa diakses publik di web.</p>
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

          {/* Password Super Admin Verification */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="twibbon-create-password" className="text-xs font-semibold text-slate-700">
              Password Super Admin <span className="text-red-500">*</span>
            </Label>
            <GlassInput
              id="twibbon-create-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Upload Progress Bar */}
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
                  <span>Memproses...</span>
                </div>
              ) : (
                "Simpan & Terbitkan"
              )}
            </GlassButton>
          </GlassDialogFooter>
        </form>
      </GlassDialogContent>
    </GlassDialog>
  );
}
