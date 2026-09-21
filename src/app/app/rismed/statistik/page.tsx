import { StatistikDashboard } from "@/components/rismed/statistik/StatistikDashboard";

export const metadata = {
  title: "Statistik Triwulan — Rismed BEM Unsoed",
  description: "Statistik pesanan per triwulan BEM Unsoed 2026",
};

export default function StatistikPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Statistik Triwulan Pemesanan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ringkasan analitik dan metrik pesanan masuk per kementerian dan kemenkoan.
        </p>
      </div>

      <div className="w-full">
        <StatistikDashboard />
      </div>
    </div>
  );
}
