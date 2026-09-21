import { ScheduleCalendar } from "@/components/rismed/schedule/ScheduleCalendar";
import { getOrders } from "@/lib/rismed/actions/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jadwal Publikasi & Agenda — Rismed BEM Unsoed",
};

export default async function JadwalPage() {
  const { data } = await getOrders();

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Kalender Jadwal Publikasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau jadwal publikasi konten, live streaming, dan kegiatan teragenda BEM Unsoed.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-200 p-4 sm:p-6 shadow-xs">
        <ScheduleCalendar initialOrders={data || []} />
      </div>
    </div>
  );
}
