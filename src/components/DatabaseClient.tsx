"use client";

import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectGroup,
  GlassSelectItem,
  GlassSelectLabel,
  GlassSelectTrigger,
  GlassSelectValue,
} from "@/components/glass-select";
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogDescription,
  GlassDialogFooter,
  GlassDialogHeader,
  GlassDialogTitle,
} from "@/components/ui/glass-dialog";
import { LEMBAGA_LIST } from "@/lib/constants";
import { toast } from "sonner";


interface Link {
  id: string;
  lembaga: string | null;
  slug: string;
  url_asli: string | null;
  jumlah_klik: number | null;
  created_at: string;
}

interface DatabaseClientProps {
  initialLinks: Link[];
}

const editFormSchema = z.object({
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

type EditFormData = z.infer<typeof editFormSchema>;

const getLinkUrlAsli = (link: Link | null) => {
  if (!link) return "";
  const candidate = (link as Link & { urlAsli?: string | null }).urlAsli;
  return link.url_asli || candidate || "";
};

export default function DatabaseClient({ initialLinks }: DatabaseClientProps) {
  const [links, setLinks] = useState(initialLinks);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("waktu");
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [previousUrlAsli, setPreviousUrlAsli] = useState("");
  const [selectedLembaga, setSelectedLembaga] = useState("");
  const [deleteConfirmationSlug, setDeleteConfirmationSlug] = useState("");
  // Accordion state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyLink = async (e: React.MouseEvent, link: Link) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = origin ? `${origin}/${link.slug}` : `/${link.slug}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      slug: "",
      urlAsli: "",
      lembaga: "",
    },
  });

  const handleOpenPasswordDialog = (link: Link) => {
    const urlAsliValue = getLinkUrlAsli(link);
    setSelectedLink(link);
    setPreviousUrlAsli(urlAsliValue);
    setSelectedLembaga(link.lembaga || "");
    reset({
      slug: link.slug,
      urlAsli: urlAsliValue,
      lembaga: link.lembaga || "",
    });
    setAdminPassword("");
    setIsPasswordDialogOpen(true);
  };

  const handleVerifyPassword = async () => {
    if (!adminPassword) {
      toast.error("Password wajib diisi.");
      return;
    }

    try {
      const response = await fetch("/api/links/verify-super-admin-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.message || "Password super admin salah.");
        return;
      }
    } catch {
      toast.error("Gagal memverifikasi password super admin.");
      return;
    }

    if (!selectedLink) return;

    const urlAsliValue = getLinkUrlAsli(selectedLink);
    const lembagaValue = selectedLink.lembaga || "";

    reset({
      slug: selectedLink.slug,
      urlAsli: urlAsliValue,
      lembaga: lembagaValue,
    });
    setSelectedLembaga(lembagaValue);
    setPreviousUrlAsli(urlAsliValue);
    setIsPasswordDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleEditFormSubmit = async (data: EditFormData) => {
    if (!selectedLink) {
      toast.error("Data link tidak ditemukan.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const response = await fetch("/api/links/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedLink.id,
          slug: data.slug,
          urlAsli: data.urlAsli,
          lembaga: data.lembaga,
          password: adminPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.message || "Gagal memperbarui link.");
        return;
      }

      const updatedLink = payload?.link as Link;
      if (!updatedLink) {
        toast.error("Respons server tidak valid.");
        return;
      }

      setLinks((prev) =>
        prev.map((link) => (link.id === updatedLink.id ? updatedLink : link)),
      );
      setSelectedLink(updatedLink);
      setPreviousUrlAsli(updatedLink.url_asli || "");
      setIsEditDialogOpen(false);
      toast.success("Link berhasil diperbarui.");
    } catch {
      toast.error("Terjadi gangguan jaringan saat menyimpan perubahan.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteConfirmationSlug("");
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLink) {
      toast.error("Data link tidak ditemukan.");
      return;
    }

    if (deleteConfirmationSlug !== selectedLink.slug) {
      toast.error("Slug konfirmasi tidak sesuai.");
      return;
    }

    setIsSubmittingDelete(true);
    try {
      const response = await fetch("/api/links/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedLink.id,
          slug: selectedLink.slug,
          confirmationSlug: deleteConfirmationSlug,
          password: adminPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.message || "Gagal menghapus link.");
        return;
      }

      setLinks((prev) => prev.filter((link) => link.id !== selectedLink.id));
      setDeleteConfirmationSlug("");
      setIsDeleteDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedLink(null);
      toast.success("Link berhasil dihapus.");
    } catch {
      toast.error("Terjadi gangguan jaringan saat menghapus link.");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const filteredLinks = useMemo(
    () =>
      links.filter(
        (link) =>
          link.lembaga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [links, searchTerm],
  );

  const sortedLinks = useMemo(() => {
    const sorted = [...filteredLinks];
    if (sortOption === "waktu") {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sortOption === "jumlah_klik") {
      sorted.sort((a, b) => (b.jumlah_klik || 0) - (a.jumlah_klik || 0));
    }
    return sorted;
  }, [filteredLinks, sortOption]);

  return (
    <div className="w-full relative z-20 space-y-3">
      {/* Search & Sort Bar */}
      <div className="flex gap-2 mb-3">
        <GlassInput
          type="text"
          placeholder="Cari lembaga atau slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <GlassSelect value={sortOption} onValueChange={setSortOption}>
          <GlassSelectTrigger className="w-32 shrink-0">
            <GlassSelectValue placeholder="Urut" />
          </GlassSelectTrigger>
          <GlassSelectContent>
            <GlassSelectItem value="waktu">Waktu</GlassSelectItem>
            <GlassSelectItem value="jumlah_klik">Kunjungan</GlassSelectItem>
          </GlassSelectContent>
        </GlassSelect>
      </div>

      {/* Link Count */}
      <p className="text-xs text-slate-500 mb-3 px-1">
        {sortedLinks.length} link ditemukan
      </p>

      {/* Accordion List */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 overflow-hidden divide-y divide-slate-200">
        {sortedLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <p className="text-sm">Tidak ada data yang cocok.</p>
          </div>
        ) : (
          sortedLinks.map((link) => {
            const isExpanded = expandedIds.has(link.id);
            const isCopied = copiedId === link.id;
            return (
              <div key={link.id}>
                {/* Collapsed Header Row */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(link.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors duration-100"
                >
                  {/* Expand chevron */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-150 ${
                      isExpanded
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Slug */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate font-mono">
                      /{link.slug}
                    </p>
                    {!isExpanded && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {link.lembaga || "Umum"} · {(link.jumlah_klik ?? 0).toLocaleString()} klik
                      </p>
                    )}
                  </div>

                  {/* Lembaga badge (collapsed only) */}
                  {!isExpanded && (
                    <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-md px-1.5 py-0.5 uppercase tracking-wide shrink-0">
                      {link.lembaga || "Umum"}
                    </span>
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-50/50">
                    {/* Divider */}
                    <div className="h-px bg-slate-200 mb-3" />

                    {/* Key-Value Rows */}
                    <div className="space-y-2.5 mb-4">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 w-20">Lembaga</span>
                        <span className="text-[13px] text-slate-900 text-right">
                          <span className="inline-block text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                            {link.lembaga || "Umum"}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 w-20">Slug</span>
                        <span className="text-[13px] text-slate-900 font-mono text-right break-all">{link.slug}</span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 w-20">URL Asli</span>
                        <span className="text-[12px] text-slate-500 text-right break-all line-clamp-2">{link.url_asli || "—"}</span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 w-20">Kunjungan</span>
                        <span className="text-[13px] font-semibold text-slate-900">{(link.jumlah_klik ?? 0).toLocaleString()} klik</span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 w-20">Dibuat</span>
                        <span className="text-[12px] text-slate-600">
                          {new Date(link.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, link)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                          isCopied
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                        }`}
                      >
                        {isCopied ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        {isCopied ? "Tersalin!" : "Salin Link"}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPasswordDialog(link);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white transition-colors duration-150"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <GlassDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <GlassDialogContent className="sm:max-w-md">
          <GlassDialogHeader>
            <GlassDialogTitle>Password Super Admin</GlassDialogTitle>
            <GlassDialogDescription>
              Masukkan password super admin untuk edit atau menghapus link.
            </GlassDialogDescription>
          </GlassDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="edit-admin-password">Password</Label>
            <GlassInput
              id="edit-admin-password"
              type="password"
              placeholder="••••••••"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  void handleVerifyPassword();
                }
              }}
            />
          </div>
          <GlassDialogFooter className="flex flex-row gap-1.5">
            <GlassButton
              type="button"
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="button"
              onClick={handleVerifyPassword}
              disabled={!adminPassword}
            >
              Lanjut
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>

      <GlassDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <GlassDialogContent className="sm:max-w-lg">
          <GlassDialogHeader>
            <GlassDialogTitle>Form Edit Link</GlassDialogTitle>
            <GlassDialogDescription>
              Anda hanya dapat mengubah slug, real URL, dan lembaga.
            </GlassDialogDescription>
          </GlassDialogHeader>

          <form
            onSubmit={handleSubmit(handleEditFormSubmit)}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <GlassInput
                id="edit-slug"
                type="text"
                {...register("slug")}
                className={errors.slug ? "border-red-500" : ""}
                placeholder="Masukkan slug"
              />
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url-asli">Real URL</Label>
              <p className="text-xs text-slate-500 break-all">
                Real URL sebelumnya: {previousUrlAsli || "(kosong)"}
              </p>
              <GlassInput
                id="edit-url-asli"
                type="text"
                {...register("urlAsli")}
                className={errors.urlAsli ? "border-red-500" : ""}
                placeholder="https://contoh.com"
              />
              {errors.urlAsli && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.urlAsli.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lembaga">Lembaga</Label>
              <GlassSelect
                value={selectedLembaga}
                onValueChange={(value) => {
                  setSelectedLembaga(value);
                  setValue("lembaga", value, { shouldValidate: true });
                }}
              >
                <GlassSelectTrigger id="edit-lembaga" className="w-full">
                  <GlassSelectValue placeholder="Pilih lembaga" />
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

            <GlassDialogFooter className="flex flex-row gap-1.5">
              <GlassButton
                type="button"
                variant="destructive"
                onClick={handleOpenDeleteDialog}
                disabled={isSubmittingEdit || isSubmittingDelete}
              >
                Delete
              </GlassButton>
              <GlassButton
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmittingEdit || isSubmittingDelete}
              >
                Tutup
              </GlassButton>
              <GlassButton
                type="submit"
                disabled={isSubmittingEdit || isSubmittingDelete}
              >
                {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </GlassButton>
            </GlassDialogFooter>
          </form>
        </GlassDialogContent>
      </GlassDialog>

      <GlassDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <GlassDialogContent className="sm:max-w-md">
          <GlassDialogHeader>
            <GlassDialogTitle>Konfirmasi Hapus Link</GlassDialogTitle>
            <GlassDialogDescription>
              Untuk menghapus data, ketik slug berikut secara persis:
              <span className="ml-1 font-semibold text-red-500 break-all">
                {selectedLink?.slug || "-"}
              </span>
            </GlassDialogDescription>
          </GlassDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="delete-confirm-slug">Ketik slug konfirmasi</Label>
            <GlassInput
              id="delete-confirm-slug"
              type="text"
              value={deleteConfirmationSlug}
              onChange={(event) =>
                setDeleteConfirmationSlug(event.target.value)
              }
              placeholder="Masukkan slug persis"
            />
          </div>

          <GlassDialogFooter className="flex flex-row gap-1.5">
            <GlassButton
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmittingDelete}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={
                isSubmittingDelete ||
                !selectedLink ||
                deleteConfirmationSlug !== selectedLink.slug
              }
            >
              {isSubmittingDelete ? "Menghapus..." : "Hapus Permanen"}
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>
    </div>
  );
}
