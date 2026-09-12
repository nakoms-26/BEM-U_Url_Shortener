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
import { TwibbonItem } from "@/lib/twibbon-schemas";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteTwibbonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  twibbon: TwibbonItem | null;
  onSuccess: () => void;
}

export function DeleteTwibbonDialog({
  open,
  onOpenChange,
  twibbon,
  onSuccess,
}: DeleteTwibbonDialogProps) {
  const [confirmationSlug, setConfirmationSlug] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!twibbon) return null;

  const handleDelete = async () => {
    if (confirmationSlug !== twibbon.slug) {
      toast.error("Slug konfirmasi tidak cocok!");
      return;
    }

    if (!password) {
      toast.error("Password admin wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/twibbons/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: twibbon.id,
          slug: twibbon.slug,
          confirmationSlug,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus twibbon.");
      }

      toast.success(data.message || "Twibbon berhasil dihapus.");
      setConfirmationSlug("");
      setPassword("");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menghapus twibbon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassDialog open={open} onOpenChange={onOpenChange}>
      <GlassDialogContent className="sm:max-w-md">
        <GlassDialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Trash2 className="w-5 h-5" />
            <GlassDialogTitle className="text-red-600">Hapus Twibbon</GlassDialogTitle>
          </div>
          <GlassDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Twibbon <strong>{twibbon.title}</strong> (/{twibbon.slug}) akan dihapus secara permanen dari database.
          </GlassDialogDescription>
        </GlassDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm-slug" className="text-xs font-semibold text-slate-700">
              Ketik slug <span className="text-red-600 font-bold font-mono">/{twibbon.slug}</span> untuk konfirmasi
            </Label>
            <GlassInput
              id="delete-confirm-slug"
              placeholder={twibbon.slug}
              value={confirmationSlug}
              onChange={(e) => setConfirmationSlug(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delete-twibbon-password" className="text-xs font-semibold text-slate-700">
              Password Super Admin / Admin
            </Label>
            <GlassInput
              id="delete-twibbon-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleDelete();
                }
              }}
            />
          </div>
        </div>

        <GlassDialogFooter className="flex flex-row gap-2 mt-2">
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
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={loading || confirmationSlug !== twibbon.slug || !password}
          >
            {loading ? "Menghapus..." : "Hapus Permanen"}
          </GlassButton>
        </GlassDialogFooter>
      </GlassDialogContent>
    </GlassDialog>
  );
}
