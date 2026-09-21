import { MonitoringDashboard } from "@/components/rismed/monitoring/MonitoringDashboard";
import { getOrders } from "@/lib/rismed/actions/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Monitoring Pesanan — Rismed BEM Unsoed",
};

export default async function MonitoringPage() {
  const { data } = await getOrders();

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Monitoring Status Pesanan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lacak progres pengerjaan pesanan desain, publikasi, survey, dan layanan teknis secara real-time.
        </p>
      </div>

      <div className="w-full">
        <MonitoringDashboard initialOrders={data || []} />
      </div>
    </div>
  );
}
