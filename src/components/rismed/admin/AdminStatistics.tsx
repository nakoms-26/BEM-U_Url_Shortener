"use client";

import * as React from "react";
import { format } from "date-fns";
import { Order } from "@/lib/rismed/types";
import { MENU_OPTIONS, STATUS_OPTIONS, MenuType } from "@/lib/rismed/constants";
import {
  getContentDateKey,
  getHeatmapLevel,
  HEATMAP_LEVEL_CLASSES,
  MENU_BADGE_STYLES,
} from "@/lib/rismed/order-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users2,
  CalendarRange,
  Flame,
  Activity,
  CheckCircle2,
  XCircle,
  Palette,
  Globe,
  Video,
  ClipboardList,
} from "lucide-react";

interface AdminStatisticsProps {
  orders: Order[];
}

const MenuIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) => {
  switch (icon) {
    case "palette":
      return <Palette className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "video":
      return <Video className={className} />;
    case "clipboard-list":
      return <ClipboardList className={className} />;
    default:
      return null;
  }
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/60 bg-linear-to-br from-background to-muted/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {title}
            </p>
            <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminStatistics({ orders }: AdminStatisticsProps) {
  const statusCounts = React.useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      ...status,
      count: orders.filter((order) => order.status === status.value).length,
    }));
  }, [orders]);

  const kementerianStats = React.useMemo(() => {
    const counts = new Map<string, number>();
    const menuCountsByKementerian = new Map<
      string,
      Record<MenuType, number>
    >();

    orders.forEach((order) => {
      counts.set(order.kementerian, (counts.get(order.kementerian) || 0) + 1);

      const currentMenuCounts = menuCountsByKementerian.get(order.kementerian) ?? {
        desain_publikasi: 0,
        website: 0,
        bantuan_teknis: 0,
        survey: 0,
      };
      currentMenuCounts[order.menu_type] += 1;
      menuCountsByKementerian.set(order.kementerian, currentMenuCounts);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"))
      .map(([kementerian, count]) => ({
        kementerian,
        count,
        menuCounts: menuCountsByKementerian.get(kementerian) ?? {
          desain_publikasi: 0,
          website: 0,
          bantuan_teknis: 0,
          survey: 0,
        },
      }));
  }, [orders]);

  const orderStats = React.useMemo(() => {
    const total = orders.length;
    const active = orders.filter((order) => order.status !== "cancel").length;
    const completed = orders.filter((order) => order.status === "ready").length;
    const uniqueKementerian = new Set(orders.map((order) => order.kementerian)).size;

    const menuBreakdown = MENU_OPTIONS.map((menu) => ({
      ...menu,
      count: orders.filter((order) => order.menu_type === menu.id).length,
    }));

    const menuStatusBreakdown = MENU_OPTIONS.map((menu) => {
      const menuOrders = orders.filter((o) => o.menu_type === menu.id);
      return {
        ...menu,
        total: menuOrders.length,
        completed: menuOrders.filter((o) => o.status === "ready").length,
        cancelled: menuOrders.filter((o) => o.status === "cancel").length,
      };
    });

    const contentDateCounts = new Map<string, number>();
    orders.forEach((order) => {
      const key = getContentDateKey(order);
      if (!key) return;
      contentDateCounts.set(key, (contentDateCounts.get(key) || 0) + 1);
    });

    const days: { date: Date; key: string; count: number }[] = [];
    const today = new Date();
    for (let offset = 83; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      const key = format(day, "yyyy-MM-dd");
      days.push({ date: day, key, count: contentDateCounts.get(key) || 0 });
    }

    const heatmapWeeks: typeof days[] = [];
    for (let index = 0; index < days.length; index += 7) {
      heatmapWeeks.push(days.slice(index, index + 7));
    }

    const busiestDay = days.reduce(
      (best, current) => (current.count > best.count ? current : best),
      days[0] || { date: today, key: format(today, "yyyy-MM-dd"), count: 0 },
    );

    const windowStart = format(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 83),
      "yyyy-MM-dd",
    );
    const windowEnd = format(today, "yyyy-MM-dd");
    let contentCountInWindow = 0;
    orders.forEach((order) => {
      const key = getContentDateKey(order);
      if (key && key >= windowStart && key <= windowEnd) {
        contentCountInWindow += 1;
      }
    });

    return {
      total,
      active,
      completed,
      uniqueKementerian,
      menuBreakdown,
      menuStatusBreakdown,
      days,
      heatmapWeeks,
      busiestDay,
      averagePerDay: contentCountInWindow / 84,
    };
  }, [orders]);

  const heatmapMaxCount = React.useMemo(
    () => Math.max(1, ...orderStats.days.map((day) => day.count)),
    [orderStats.days],
  );

  const heatmapMonthLabels = React.useMemo(() => {
    return orderStats.heatmapWeeks.map((week, index) => {
      const firstDay = week[0];
      const currentLabel = firstDay ? format(firstDay.date, "MMM") : "";
      const previousWeek = orderStats.heatmapWeeks[index - 1];
      const previousLabel = previousWeek?.[0]
        ? format(previousWeek[0].date, "MMM")
        : "";

      return currentLabel !== previousLabel ? currentLabel : "";
    });
  }, [orderStats.heatmapWeeks]);

  const heatmapLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const percentageFromTotal = (count: number) =>
    orderStats.total > 0 ? Math.round((count / orderStats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Pesanan"
          value={orderStats.total}
          description="Semua pesanan dari seluruh menu"
          icon={BarChart3}
        />
        <StatCard
          title="Pesanan Aktif"
          value={orderStats.active}
          description="Status selain cancel"
          icon={Activity}
        />
        <StatCard
          title="Pesanan Selesai"
          value={orderStats.completed}
          description="Status ready"
          icon={TrendingUp}
        />
        <StatCard
          title="Kementerian"
          value={orderStats.uniqueKementerian}
          description="Jumlah kementerian/biro"
          icon={Users2}
        />
      </div>

      {/* Per-Menu Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {orderStats.menuStatusBreakdown.map((menu) => (
          <Card
            key={menu.id}
            className="border-border/60 bg-linear-to-br from-background to-muted/30 shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {menu.label}
                  </p>
                  <div className="text-2xl font-bold tracking-tight">
                    {menu.total}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="font-semibold">{menu.completed}</span>
                      <span className="text-muted-foreground">selesai</span>
                    </span>
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="h-3.5 w-3.5" />
                      <span className="font-semibold">{menu.cancelled}</span>
                      <span className="text-muted-foreground">cancel</span>
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <MenuIcon icon={menu.icon} className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Pemesan Terbanyak
              </CardTitle>
            </div>
            <CardDescription>
              Diurutkan dari paling banyak hingga paling sedikit berdasarkan kementerian.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Kementerian/Biro</TableHead>
                    <TableHead>Rincian Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kementerianStats.map((item, index) => (
                    <TableRow key={item.kementerian}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.kementerian}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {orderStats.menuBreakdown
                            .map((menu) => ({
                              ...menu,
                              count: item.menuCounts[menu.id],
                            }))
                            .filter((menu) => menu.count > 0)
                            .sort((a, b) => b.count - a.count)
                            .map((menu) => (
                              <span
                                key={menu.id}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${MENU_BADGE_STYLES[menu.id]}`}
                                title={menu.label}
                              >
                                {menu.label}: {menu.count}
                              </span>
                            ))}
                          {orderStats.menuBreakdown.every(
                            (menu) => item.menuCounts[menu.id] === 0,
                          ) && (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                  {kementerianStats.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Belum ada data pesanan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Ringkasan Aktivitas
              </CardTitle>
            </div>
            <CardDescription>
              Rata-rata {orderStats.averagePerDay.toFixed(2)} konten per hari dalam 84 hari terakhir (berdasar tanggal konten).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Hari tersibuk
                </p>
                <div className="mt-2 text-sm font-semibold">
                  {orderStats.busiestDay.count > 0
                    ? format(orderStats.busiestDay.date, "dd MMM yyyy")
                    : "Belum ada data"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {orderStats.busiestDay.count} konten dijadwalkan
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Total menu aktif
                </p>
                <div className="mt-2 text-sm font-semibold">
                  {
                    orderStats.menuBreakdown.filter((menu) => menu.count > 0)
                      .length
                  }{" "}
                  menu
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dari {orderStats.menuBreakdown.length} kategori layanan
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {orderStats.menuBreakdown.map((menu) => (
                <div
                  key={menu.id}
                  className="rounded-xl border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium">{menu.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {menu.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      {menu.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Jumlah Berdasar Status
            </CardTitle>
            <CardDescription>
              Distribusi status pesanan dari seluruh data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusCounts.map((status) => {
              const percent = percentageFromTotal(status.count);

              return (
                <div key={status.value} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <span className="font-semibold">
                      {status.count}{" "}
                      <span className="text-muted-foreground">
                        ({percent}%)
                      </span>
                    </span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Heatmap Konten 84 Hari
              </CardTitle>
            </div>
            <CardDescription>
              Berdasarkan tanggal konten (publikasi/kegiatan/deadline). Semakin gelap, semakin banyak konten dijadwalkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-muted/40 ring-1 ring-inset ring-border" />
                0
              </span>
              <span className="flex items-center gap-1">
                {HEATMAP_LEVEL_CLASSES.map((levelClass, index) => (
                  <span
                    key={levelClass}
                    className={`h-3 w-3 rounded-sm ${levelClass}`}
                    title={`Level ${index + 1}`}
                  />
                ))}
                <span className="ml-1">1-10</span>
              </span>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2">
              <div className="flex flex-col gap-1 pr-1 pt-[1.1rem] text-[10px] text-muted-foreground">
                {heatmapLabels.map((label) => (
                  <span key={label} className="h-3.5 leading-none">
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-end gap-1 pl-px pb-1 text-[10px] font-medium text-muted-foreground">
                  {heatmapMonthLabels.map((label, index) => (
                    <span
                      key={`${label || "month"}-${index}`}
                      className="w-3.5 text-center leading-none"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1">
                  {orderStats.heatmapWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day) => (
                        <div
                          key={day.key}
                          title={`${format(day.date, "dd MMM yyyy")} · ${day.count} konten`}
                          className={`h-3.5 w-3.5 rounded-sm border border-transparent ${getHeatmapLevel(day.count, heatmapMaxCount)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
