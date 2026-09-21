"use client";

import * as React from "react";
import { AdminDashboard } from "@/components/rismed/admin/AdminDashboard";
import { AdminLogin } from "@/components/rismed/admin/AdminLogin";
import { AdminDashboardSkeleton } from "@/components/rismed/shared/Skeletons";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkAdminAuth, logoutAdmin } from "@/lib/rismed/actions/auth";

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const verify = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const isAuthed = await checkAdminAuth();
      setIsAuthenticated(isAuthed);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    verify();
    window.addEventListener("adminAuthChange", verify);
    return () => {
      window.removeEventListener("adminAuthChange", verify);
    };
  }, [verify]);

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("adminAuthChange"));
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Admin Dashboard Rismed
          </h2>
        </div>
        <AdminDashboardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={verify} />;
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Kelola Pesanan & PJ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manajemen status pesanan, penugasan PJ, dan pembaruan hasil desain.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl h-9 self-start sm:self-auto active:scale-95 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Keluar Admin
        </Button>
      </div>

      <div className="w-full">
        <AdminDashboard />
      </div>
    </div>
  );
}
