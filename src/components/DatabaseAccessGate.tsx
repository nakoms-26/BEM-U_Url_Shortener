"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";

export default function DatabaseAccessGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleVerify = async () => {
    if (!password) {
      toast.error("Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/links/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.message || "Password tidak valid.");
        return;
      }

      setPassword("");
      setIsDialogOpen(false);
      toast.success("Akses database dibuka.");
      router.refresh();
    } catch {
      toast.error("Gagal memverifikasi password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-full items-center justify-center p-4 py-6">
      <div className="w-full max-w-xs">
      <GlassCard className="p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image
            className="brightness-0 opacity-80"
            src="/KabinetKausaCipta.webp"
            alt="BEM-U logo"
            width={65}
            height={12}
            priority
          />
        </div>
        <div className="w-full space-y-4 text-center">
          <h2 className="font-bold text-xl text-slate-900">Database Dilindungi</h2>
          <p className="text-sm text-slate-500">
            Masukkan password admin untuk membuka halaman database.
          </p>
          <GlassButton
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="w-full"
          >
            Buka Verifikasi
          </GlassButton>
        </div>
      </GlassCard>

      <AdminPasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        password={password}
        onPasswordChange={setPassword}
        onConfirm={handleVerify}
        title="Verifikasi Admin"
        description="Masukkan password admin untuk membuka data database."
        confirmLabel="Masuk"
        loadingLabel="Memverifikasi..."
        loading={loading}
        inputId="database-admin-password"
      />
      </div>
    </div>
  );
}
