"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { getOrders } from "@/lib/rismed/actions/orders";
import { Order } from "@/lib/rismed/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarSkeleton } from "@/components/rismed/shared/Skeletons";
import { Calendar, X } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/rismed/constants";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  extendedProps: {
    order: Order;
  };
  backgroundColor: string;
  borderColor: string;
}

interface ScheduleCalendarProps {
  initialOrders?: Order[];
}

export function ScheduleCalendar({ initialOrders = [] }: ScheduleCalendarProps) {
  const [orders, setOrders] = React.useState<Order[]>(() =>
    initialOrders.filter((order) => order.status !== "cancel" && !order.is_hidden),
  );
  const [isLoading, setIsLoading] = React.useState(initialOrders.length === 0);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [showMobileDetail, setShowMobileDetail] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (initialOrders.length === 0) {
      fetchOrders();
    }

    // Auto refresh data every 15 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [initialOrders.length]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const { data, error } = await getOrders();
      if (error) throw new Error(error);

      if (data) {
        setOrders(
          data.filter(
            (order) => order.status !== "cancel" && !order.is_hidden,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };


  const getEventTitle = (order: Order): string => {
    switch (order.menu_type) {
      case "desain_publikasi":
        return `${order.waktu_publikasi} - ${order.judul_desain}`;
      case "bantuan_teknis":
        return `${order.waktu_kegiatan} - ${order.nama_kegiatan}`;
      case "survey":
        return `Survey: ${order.judul_survey}`;
      case "website":
        return order.website_sub_type === "twibbon" 
          ? `Twibbon: ${order.judul_kampanye || order.nama}`
          : `Website: ${order.tujuan_pemesanan || order.nama}`;
    }
  };

  const getEventDate = (order: Order): string | null => {
    switch (order.menu_type) {
      case "desain_publikasi":
        return order.tanggal_publikasi ?? null;
      case "bantuan_teknis":
        return order.tanggal_kegiatan ?? null;
      case "survey":
        return order.deadline_survey ?? null;
      case "website":
        return order.website_sub_type === "twibbon"
          ? order.tanggal_publikasi_twibbon ?? null
          : null;
      default:
        return (order as { tanggal_publikasi?: string }).tanggal_publikasi ?? null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return { bg: "#3b82f6", border: "#2563eb" }; // blue
      case "in progress":
        return { bg: "#eab308", border: "#ca8a04" }; // yellow
      case "under review":
        return { bg: "#a855f7", border: "#9333ea" }; // purple
      case "ready":
        return { bg: "#22c55e", border: "#16a34a" }; // green
      case "pause":
        return { bg: "#f97316", border: "#ea580c" }; // orange
      default:
        return { bg: "#6b7280", border: "#4b5563" }; // gray
    }
  };

  const events: CalendarEvent[] = orders
    .filter((order) => getEventDate(order) !== null)
    .map((order) => {
      const colors = getStatusColor(order.status);
      return {
        id: order.id,
        title: getEventTitle(order),
        start: getEventDate(order)!,
        extendedProps: {
          order: order,
        },
        backgroundColor: colors.bg,
        borderColor: colors.border,
      };
    });

  const handleEventClick = (info: EventClickArg) => {
    const order = info.event.extendedProps.order as Order;
    setSelectedOrder(order);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status;
  };

  const getStatusBadgeColor = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  const getOrderTitle = (order: Order): string => {
    switch (order.menu_type) {
      case "desain_publikasi":
        return order.judul_desain;
      case "bantuan_teknis":
        return order.nama_kegiatan;
      case "survey":
        return order.judul_survey;
      case "website":
        return order.website_sub_type === "twibbon"
          ? (order.judul_kampanye || "Twibbon Request")
          : (order.tujuan_pemesanan || "Website Request");
    }
  };

  const getOrderSchedule = (order: Order): string => {
    switch (order.menu_type) {
      case "desain_publikasi":
        return `${order.tanggal_publikasi} • ${order.waktu_publikasi}`;
      case "bantuan_teknis":
        return `${order.tanggal_kegiatan} • ${order.waktu_kegiatan}`;
      case "survey":
        return `Deadline: ${order.deadline_survey}`;
      case "website":
        return "-";
    }
  };

  const getMenuTypeLabel = (menuType: string): string => {
    switch (menuType) {
      case "desain_publikasi":
        return "Desain & Publikasi";
      case "bantuan_teknis":
        return "Bantuan Teknis";
      case "survey":
        return "Survey";
      case "website":
        return "Website";
      default:
        return menuType;
    }
  };

  const DetailContent = () => {
    if (!selectedOrder) return null;

    return (
      <div className="space-y-3">
        <div>
          <div className="text-xs text-muted-foreground">Tipe Layanan</div>
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
            {getMenuTypeLabel(selectedOrder.menu_type)}
          </span>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Judul</div>
          <div className="font-semibold">{getOrderTitle(selectedOrder)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Pemesan</div>
          <div className="font-medium">{selectedOrder.nama}</div>
          <div className="text-xs text-muted-foreground">
            {selectedOrder.kementerian}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Jadwal</div>
          <div className="font-medium">{getOrderSchedule(selectedOrder)}</div>
        </div>
        {selectedOrder.menu_type === "desain_publikasi" && (
          <div>
            <div className="text-xs text-muted-foreground">Platform</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedOrder.platform_publikasi.map((p: string) => (
                <span
                  key={p}
                  className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        {selectedOrder.menu_type === "bantuan_teknis" && (
          <div>
            <div className="text-xs text-muted-foreground">Tempat</div>
            <div className="font-medium">{selectedOrder.tempat_kegiatan}</div>
          </div>
        )}
        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusBadgeColor(selectedOrder.status)}`}
          >
            {getStatusLabel(selectedOrder.status)}
          </span>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">WhatsApp</div>
          <a
            href={`https://wa.me/${selectedOrder.nomor_whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            {selectedOrder.nomor_whatsapp}
          </a>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Detail Modal */}
      {showMobileDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileDetail(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Detail Konten
              </h3>
              <button
                onClick={() => setShowMobileDetail(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DetailContent />
          </div>
        </div>
      )}

      {/* Legend - Horizontal on mobile */}
      <Card className="mb-4">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Keterangan:
            </span>
            {STATUS_OPTIONS.filter((s) => s.value !== "cancel").map(
              (status) => (
                <div
                  key={status.value}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <div
                    className="w-2.5 h-2.5 rounded"
                    style={{ backgroundColor: getStatusColor(status.value).bg }}
                  />
                  <span>{status.label}</span>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-3 order-1">
          <Card>
            <CardContent className="p-2 sm:p-4">
              <style jsx global>{`
                .fc {
                  font-size: 12px;
                }
                @media (min-width: 640px) {
                  .fc {
                    font-size: 14px;
                  }
                }
                .fc .fc-toolbar {
                  flex-wrap: wrap;
                  gap: 8px;
                }
                .fc .fc-toolbar-title {
                  font-size: 1rem;
                }
                @media (min-width: 640px) {
                  .fc .fc-toolbar-title {
                    font-size: 1.25rem;
                  }
                }
                /* Container Utama Button */ /* Container Utama Button - Diatur agar Flat & Ber-Radius Lebar */
                .fc .fc-button {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  white-space: nowrap;

                  /* --- Kunci: Radius Sudut Sangat Besar --- */
                  border-radius: 999px !important; /* Membuat bentuk kapsul/pill */

                  font-size: 0.875rem; /* text-sm */
                  font-weight: 500;
                  height: 2.25rem; /* h-9 */
                  padding: 0 1.5rem; /* px-6 - Padding horizontal lebih lebar */
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                  outline: none !important;
                  text-transform: capitalize;

                  /* --- Warna & Border --- */
                  background-color: hsl(var(--background)) !important;
                  border: 1px solid #e5e7eb !important; /* Abu-abu muda lembut mirip gambar */
                  color: hsl(var(--foreground)) !important;

                  /* --- Hapus Shadow agar Flat --- */
                  box-shadow: none !important;
                }

                /* Penyesuaian Tombol untuk Icon Saja (tombol panah, dll) */
                .fc .fc-button:has(.fc-icon) {
                  padding: 0 !important;
                  width: 2.25rem; /* h-9 */
                  margin: 2px;
                }

                /* Hover State - Dibuat Minimalis agar Tetap Flat */
                .fc .fc-button-primary:hover {
                  background-color: hsl(
                    var(--accent)
                  ) !important; /* Gunakan warna aksen shadcn yang lembut */
                  color: hsl(var(--accent-foreground)) !important;
                  border-color: hsl(var(--accent)) !important;
                }

                /* Active/Selected State - Masih mengikuti shadcn standard untuk visibilitas */
                .fc .fc-button-primary:not(:disabled):active,
                .fc .fc-button-primary:not(:disabled).fc-button-active {
                  background-color: hsl(var(--primary)) !important;
                  border-color: hsl(var(--primary)) !important;
                  color: hsl(var(--primary-foreground)) !important;
                  box-shadow: none !important;
                }

                /* Focus Ring (Aksesibilitas) */
                .fc .fc-button-primary:focus {
                  box-shadow:
                    0 0 0 2px hsl(var(--background)),
                    0 0 0 4px hsl(var(--ring) / 0.5) !important;
                }

                /* Disabled State */
                .fc .fc-button:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                  pointer-events: none;
                }

                /* Perbaikan Icon di dalam Button */
                .fc .fc-button .fc-icon {
                  font-size: 1.1em;
                  vertical-align: middle;
                }

                /* Menghilangkan border double di button group FullCalendar */
                .fc-button-group > .fc-button:not(:first-child) {
                  margin-left: -1px;
                }
                .fc .fc-toolbar-title {
                  font-size: 1rem;
                  font-weight: 600;
                }
                .fc .fc-daygrid-event {
                  font-size: 10px;
                  padding: 1px 3px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
                @media (min-width: 640px) {
                  .fc .fc-daygrid-event {
                    font-size: 12px;
                    padding: 2px 4px;
                  }
                }
                .fc .fc-daygrid-day-number {
                  font-size: 11px;
                  padding: 4px;
                }
                @media (min-width: 640px) {
                  .fc .fc-daygrid-day-number {
                    font-size: 14px;
                    padding: 8px;
                  }
                }
                /* Styling for Calendar Header (Days of the week) */
                .fc .fc-col-header-cell {
                  background-color: hsl(
                    var(--muted)
                  ) !important; /* Using muted background for header */
                  border-bottom: 1px solid hsl(var(--border)) !important;
                  border-right: 1px solid hsl(var(--border)) !important; /* Added right border for separation */
                }
                .dark .fc .fc-col-header-cell,
                .dark .fc .fc-col-header-cell .fc-col-header-cell-cushion {
                  background-color: #171717 !important;
                }
                .fc .fc-col-header-cell:first-child {
                  /* Remove left border for the first cell if desired */
                  border-left: 1px solid hsl(var(--border)) !important;
                }
                .fc .fc-col-header-cell-cushion {
                  color: hsl(
                    var(--muted-foreground)
                  ) !important; /* Using muted-foreground for text color */
                  font-weight: 600;
                  font-size: 10px;
                  padding: 4px 2px;
                }
                @media (min-width: 640px) {
                  .fc .fc-col-header-cell-cushion {
                    font-size: 13px;
                    padding: 8px 4px;
                  }
                }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView={isMobile ? "dayGridMonth" : "dayGridMonth"}
                events={events}
                eventClick={handleEventClick}
                headerToolbar={
                  isMobile
                    ? {
                        left: "prev,next",
                        center: "title",
                        right: "today",
                      }
                    : {
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,dayGridWeek",
                      }
                }
                locale="id"
                buttonText={{
                  today: "Hari Ini",
                  month: "Bulan",
                  week: "Minggu",
                }}
                height="auto"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                dayMaxEvents={false}
                moreLinkText={(num) => `+${num}`}
                fixedWeekCount={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Desktop Detail Panel */}
        <div className="hidden lg:block lg:col-span-1 order-2">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Detail Konten
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <DetailContent />
              ) : (
                <div className="text-muted-foreground text-sm text-center py-8">
                  Klik event di kalender untuk melihat detail
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
