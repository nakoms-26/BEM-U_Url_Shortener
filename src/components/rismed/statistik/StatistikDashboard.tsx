"use client";

import * as React from "react";
import { getOrders } from "@/lib/rismed/actions/orders";
import { Order } from "@/lib/rismed/types";
import {
  TRIWULAN_PERIODS,
  TriwulanKey,
  MENU_OPTIONS,
  MenuType,
  STATUS_OPTIONS,
  KEMENTERIAN_OPTIONS,
} from "@/lib/rismed/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatistikSkeleton } from "@/components/rismed/shared/Skeletons";
import {
  BarChart3,
  Palette,
  Globe,
  Video,
  ClipboardList,
  TrendingUp,
  CalendarRange,
  Users,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Icon helper ───
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

// ─── Filter orders by triwulan date range ───
function filterByTriwulan(orders: Order[], key: TriwulanKey): Order[] {
  const period = TRIWULAN_PERIODS.find((p) => p.key === key);
  if (!period) return orders;

  // "1 Periode" → no filtering
  if (!period.startDate && !period.endDate) return orders;

  return orders.filter((order) => {
    const createdDate = order.created_at.slice(0, 10); // "YYYY-MM-DD"
    if (period.startDate && createdDate < period.startDate) return false;
    if (period.endDate && createdDate > period.endDate) return false;
    return true;
  });
}

// ─── Compute statistics from a set of orders ───
function computeStats(orders: Order[]) {
  const total = orders.length;

  // Per menu
  const perMenu: Record<MenuType, number> = {
    desain_publikasi: 0,
    website: 0,
    bantuan_teknis: 0,
    survey: 0,
  };
  // Per status
  const perStatus: Record<string, number> = {};
  STATUS_OPTIONS.forEach((s) => (perStatus[s.value] = 0));
  // Per kementerian
  const perKementerian: Record<string, number> = {};
  KEMENTERIAN_OPTIONS.forEach((k) => (perKementerian[k] = 0));
  // Per menu per status (for the breakdown table)
  const perMenuPerStatus: Record<MenuType, Record<string, number>> = {
    desain_publikasi: {},
    website: {},
    bantuan_teknis: {},
    survey: {},
  };
  MENU_OPTIONS.forEach((m) => {
    STATUS_OPTIONS.forEach((s) => {
      perMenuPerStatus[m.id][s.value] = 0;
    });
  });

  orders.forEach((order) => {
    perMenu[order.menu_type]++;
    perStatus[order.status] = (perStatus[order.status] || 0) + 1;
    perKementerian[order.kementerian] =
      (perKementerian[order.kementerian] || 0) + 1;
    perMenuPerStatus[order.menu_type][order.status] =
      (perMenuPerStatus[order.menu_type][order.status] || 0) + 1;
  });

  return { total, perMenu, perStatus, perKementerian, perMenuPerStatus };
}

// ─── Color helpers ───
const MENU_COLORS: Record<
  MenuType,
  { bg: string; text: string; bar: string; iconBg: string }
> = {
  desain_publikasi: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    iconBg: "bg-violet-500/20",
  },
  website: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
    iconBg: "bg-blue-500/20",
  },
  bantuan_teknis: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    iconBg: "bg-amber-500/20",
  },
  survey: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-500/20",
  },
};

type KemSort = "name" | "count";

export function StatistikDashboard() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTriwulan, setActiveTriwulan] =
    React.useState<TriwulanKey>("1_periode");
  const [kemSort, setKemSort] = React.useState<KemSort>("count");
  const [kemSortAsc, setKemSortAsc] = React.useState(false);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await getOrders();
        if (error) throw new Error(error);
        if (data) {
          setOrders(data.filter((o) => !o.is_hidden));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);


  // Filtered orders for the active triwulan
  const filteredOrders = React.useMemo(
    () => filterByTriwulan(orders, activeTriwulan),
    [orders, activeTriwulan],
  );

  const stats = React.useMemo(
    () => computeStats(filteredOrders),
    [filteredOrders],
  );

  // Sorted kementerian list
  const sortedKementerian = React.useMemo(() => {
    const entries = KEMENTERIAN_OPTIONS.map((k) => ({
      name: k,
      count: stats.perKementerian[k] || 0,
    }));
    entries.sort((a, b) => {
      if (kemSort === "count") {
        return kemSortAsc ? a.count - b.count : b.count - a.count;
      }
      return kemSortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    return entries;
  }, [stats.perKementerian, kemSort, kemSortAsc]);

  const maxKemCount = React.useMemo(
    () => Math.max(...sortedKementerian.map((k) => k.count), 1),
    [sortedKementerian],
  );

  const toggleKemSort = (field: KemSort) => {
    if (kemSort === field) {
      setKemSortAsc(!kemSortAsc);
    } else {
      setKemSort(field);
      setKemSortAsc(field === "name");
    }
  };

  // Get active period info
  const activePeriod = TRIWULAN_PERIODS.find(
    (p) => p.key === activeTriwulan,
  );

  const formatPeriodRange = () => {
    if (!activePeriod) return "";
    if (!activePeriod.startDate && !activePeriod.endDate)
      return "Seluruh periode";
    const fmt = (d: string) => {
      const date = new Date(d + "T00:00:00");
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };
    if (!activePeriod.startDate) return `s/d ${fmt(activePeriod.endDate!)}`;
    if (!activePeriod.endDate) return `${fmt(activePeriod.startDate)} - selesai`;
    return `${fmt(activePeriod.startDate)} - ${fmt(activePeriod.endDate)}`;
  };

  if (isLoading) {
    return <StatistikSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Triwulan Tabs */}
      <Tabs
        value={activeTriwulan}
        onValueChange={(v) => setActiveTriwulan(v as TriwulanKey)}
        className="w-full"
      >
        <div className="flex justify-center mb-2">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto rounded-lg">
            {TRIWULAN_PERIODS.map((tw) => (
              <TabsTrigger
                key={tw.key}
                value={tw.key}
                className="flex items-center gap-2 py-2.5 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <CalendarRange className="w-4 h-4 hidden sm:block" />
                <span className="hidden sm:inline">{tw.label}</span>
                <span className="sm:hidden text-xs">{tw.shortLabel}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Period info badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <CalendarRange className="w-4 h-4" />
          {activePeriod?.label}: {formatPeriodRange()}
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total card */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/20 p-3">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Pesanan
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per menu cards */}
        {MENU_OPTIONS.map((menu) => {
          const colors = MENU_COLORS[menu.id];
          const count = stats.perMenu[menu.id];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <Card key={menu.id} className={`${colors.bg} border-transparent`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl ${colors.iconBg} p-3`}>
                    <MenuIcon
                      icon={menu.icon}
                      className={`w-5 h-5 ${colors.text}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                      {menu.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-foreground">
                        {count}
                      </p>
                      <p className={`text-xs font-semibold ${colors.text}`}>
                        {pct.toFixed(0)}%
                      </p>
                    </div>
                    {/* Mini bar */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── Status Breakdown ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="w-5 h-5 text-primary" />
            Breakdown per Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status overview bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {STATUS_OPTIONS.map((s) => {
              const count = stats.perStatus[s.value] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div
                  key={s.value}
                  className="rounded-xl border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.color}`}
                    >
                      {s.label}
                    </span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        s.value === "new"
                          ? "bg-blue-500"
                          : s.value === "in progress"
                            ? "bg-yellow-500"
                            : s.value === "under review"
                              ? "bg-purple-500"
                              : s.value === "ready"
                                ? "bg-green-500"
                                : s.value === "pause"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">
                    {pct.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>

          {/* Cross-tab: menu × status */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Layanan</TableHead>
                  {STATUS_OPTIONS.map((s) => (
                    <TableHead key={s.value} className="text-center min-w-[80px]">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${s.color}`}
                      >
                        {s.label}
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MENU_OPTIONS.map((menu) => {
                  const colors = MENU_COLORS[menu.id];
                  return (
                    <TableRow key={menu.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MenuIcon
                            icon={menu.icon}
                            className={`w-4 h-4 ${colors.text}`}
                          />
                          <span className="font-medium text-sm">
                            {menu.label}
                          </span>
                        </div>
                      </TableCell>
                      {STATUS_OPTIONS.map((s) => (
                        <TableCell
                          key={s.value}
                          className="text-center text-sm"
                        >
                          {stats.perMenuPerStatus[menu.id][s.value] || 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-sm">
                        {stats.perMenu[menu.id]}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals row */}
                <TableRow className="border-t-2 bg-muted/30 font-bold">
                  <TableCell className="font-bold text-sm">Total</TableCell>
                  {STATUS_OPTIONS.map((s) => (
                    <TableCell
                      key={s.value}
                      className="text-center font-bold text-sm"
                    >
                      {stats.perStatus[s.value] || 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-sm text-primary">
                    {stats.total}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Kementerian Breakdown ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Users className="w-5 h-5 text-primary" />
            Breakdown per Kementerian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 -ml-2 text-xs font-bold"
                      onClick={() => toggleKemSort("name")}
                    >
                      Kementerian / Biro
                      {kemSort === "name" ? (
                        kemSortAsc ? (
                          <ChevronUp className="w-3 h-3 ml-1" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-1" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">Distribusi</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 -mr-2 text-xs font-bold"
                      onClick={() => toggleKemSort("count")}
                    >
                      Jumlah
                      {kemSort === "count" ? (
                        kemSortAsc ? (
                          <ChevronUp className="w-3 h-3 ml-1" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-1" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedKementerian.map((item, idx) => {
                  const pct =
                    stats.total > 0
                      ? (item.count / stats.total) * 100
                      : 0;
                  const barWidth =
                    maxKemCount > 0
                      ? (item.count / maxKemCount) * 100
                      : 0;
                  return (
                    <TableRow key={item.name}>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70 transition-all duration-700 ease-out"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-10 text-right">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Total row */}
                <TableRow className="border-t-2 bg-muted/30">
                  <TableCell />
                  <TableCell className="font-bold text-sm">Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right font-bold text-sm text-primary">
                    {stats.total}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
