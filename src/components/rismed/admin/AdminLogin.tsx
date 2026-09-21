"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { loginAdmin } from "@/lib/rismed/actions/auth";

interface AdminLoginProps {
  onSuccess?: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await loginAdmin(username, password);
      if (res.success) {
        window.dispatchEvent(new Event("adminAuthChange"));
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setError(res.error || "Password atau username salah");
        setIsLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan koneksi saat login");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] py-8 px-4">
      <Card className="w-full max-w-md bg-white border border-slate-200 rounded-2xl sm:rounded-[1.5rem] shadow-xs">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
            Portal Admin Rismed
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Masuk dengan kredensial Admin Portal atau Rismed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-bold text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-violet-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                className="h-10 text-sm rounded-xl border-slate-200 focus-visible:ring-violet-500"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-xs active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Masuk Admin
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
