"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  getOrders,
  updateOrderStatus,
  updateOrder as updateOrderAction,
  deleteOrder as deleteOrderAction,
} from "@/lib/rismed/actions/orders";
import {
  Order,
  DesainPublikasiOrder,
  OrderStatus,
} from "@/lib/rismed/types";
import {
  STATUS_OPTIONS,
  KEMENTERIAN_OPTIONS,
  PLATFORM_OPTIONS,
  MENU_OPTIONS,
  MenuType,
} from "@/lib/rismed/constants";
import { parseDateOnly } from "@/lib/rismed/date";
import {
  formatDate,
  isDesainPublikasi,
  isWebsite,
  isBantuanTeknis,
  isSurvey,
  isPublicationChecklistCompleted,
  isCollisionExempt,
} from "@/lib/rismed/order-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import { AdminDashboardSkeleton } from "@/components/rismed/shared/Skeletons";
import { cn } from "@/lib/utils";
import {
  Filter,
  AlertTriangle,
  Palette,
  Globe,
  Video,
  ClipboardList,
  BarChart3,
  UserCog,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { DesainPublikasiTable } from "./tables/DesainPublikasiTable";
import { WebsiteTable } from "./tables/WebsiteTable";
import { BantuanTeknisTable } from "./tables/BantuanTeknisTable";
import { SurveyTable } from "./tables/SurveyTable";
import { AdminStatistics } from "./AdminStatistics";
import { PJManagement } from "./pj/PJManagement";

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

type SortOption = "waktu_pemesanan" | "deadline";
type DashboardTab = MenuType | "statistik" | "kelola_pj";

export function AdminDashboard() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<DashboardTab>(
    "desain_publikasi",
  );

  // Filters
  const [filterKementerian, setFilterKementerian] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [filterDate, setFilterDate] = React.useState<string>("");
  const [filterPlatform, setFilterPlatform] = React.useState<string>("");
  const [filterVisibility, setFilterVisibility] =
    React.useState<string>("all-visibility");
  const [sortBy, setSortBy] = React.useState<SortOption>("waktu_pemesanan");

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState("25");

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filterKementerian && filterKementerian !== "all-kementerian") count++;
    if (filterStatus && filterStatus !== "all-status") count++;
    if (filterDate) count++;
    if (filterPlatform && filterPlatform !== "all-platform" && activeTab === "desain_publikasi") count++;
    if (filterVisibility && filterVisibility !== "all-visibility") count++;
    if (sortBy !== "waktu_pemesanan") count++;
    return count;
  }, [filterKementerian, filterStatus, filterDate, filterPlatform, filterVisibility, activeTab, sortBy]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    filterKementerian,
    filterStatus,
    filterDate,
    filterPlatform,
    filterVisibility,
    sortBy,
  ]);

  const fetchOrders = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { data, error } = await getOrders();
      if (error) throw new Error(error);
      if (data) setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) throw new Error(res.error);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status");
    }
  };

  const updateField = async (orderId: string, field: string, value: unknown) => {
    let prevValue: unknown;
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          prevValue = (order as unknown as Record<string, unknown>)[field];
          return { ...order, [field]: value };
        }
        return order;
      }),
    );

    try {
      const res = await updateOrderAction(orderId, { [field]: value });
      if (!res.success) throw new Error(res.error);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, [field]: prevValue } : order,
        ),
      );
      alert(`Gagal menyimpan ${field}`);
      throw error;
    }
  };

  const toggleHideOrder = async (orderId: string, currentIsHidden: boolean) => {
    const nextState = !currentIsHidden;
    try {
      const res = await updateOrderAction(orderId, { is_hidden: nextState });
      if (!res.success) throw new Error(res.error);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, is_hidden: nextState } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating is_hidden:", error);
      alert("Gagal mengubah status visibilitas pesanan");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      return;
    }

    try {
      const res = await deleteOrderAction(orderId);
      if (!res.success) throw new Error(res.error);

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      alert("Pesanan berhasil dihapus");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Gagal menghapus pesanan");
    }
  };

  // Check for schedule collisions (same date + time) for Desain & Publikasi
  const scheduleCollisions = React.useMemo(() => {
    const desainOrders = orders
      .filter(isDesainPublikasi)
      .filter((o) => o.status !== "cancel")
      .filter((o) => !isPublicationChecklistCompleted(o))
      .filter((o) => !isCollisionExempt(o));
    const collisionMap: { [key: string]: DesainPublikasiOrder[] } = {};

    desainOrders.forEach((order) => {
      const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`;
      if (!collisionMap[key]) {
        collisionMap[key] = [];
      }
      collisionMap[key].push(order);
    });

    const collisions: { [key: string]: DesainPublikasiOrder[] } = {};
    Object.keys(collisionMap).forEach((key) => {
      if (collisionMap[key].length > 1) {
        collisions[key] = collisionMap[key];
      }
    });

    return collisions;
  }, [orders]);

  const hasCollision = (order: DesainPublikasiOrder) => {
    const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`;
    return scheduleCollisions[key] && scheduleCollisions[key].length > 1;
  };

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    let result = orders.filter((o) => o.menu_type === activeTab);

    if (filterKementerian && filterKementerian !== "all-kementerian") {
      result = result.filter((o) => o.kementerian === filterKementerian);
    }
    if (filterStatus && filterStatus !== "all-status") {
      result = result.filter((o) => o.status === filterStatus);
    }

    if (filterDate) {
      result = result.filter((o) => {
        if (isDesainPublikasi(o)) return o.tanggal_publikasi === filterDate;
        if (isBantuanTeknis(o)) return o.tanggal_kegiatan === filterDate;
        if (isSurvey(o)) return o.deadline_survey === filterDate;
        return true;
      });
    }

    if (
      filterPlatform &&
      filterPlatform !== "all-platform" &&
      activeTab === "desain_publikasi"
    ) {
      result = result.filter((o) => {
        if (isDesainPublikasi(o)) {
          return o.platform_publikasi?.includes(filterPlatform);
        }
        return true;
      });
    }

    if (sortBy === "waktu_pemesanan") {
      result.sort((a, b) => {
        if (a.created_at > b.created_at) return -1;
        if (a.created_at < b.created_at) return 1;
        return 0;
      });
    } else if (sortBy === "deadline") {
      result.sort((a, b) => {
        const aIsNotCancel = a.status !== "cancel";
        const bIsNotCancel = b.status !== "cancel";

        if (aIsNotCancel && !bIsNotCancel) return -1;
        if (!aIsNotCancel && bIsNotCancel) return 1;

        const getDeadlineDate = (order: Order): string | null => {
          if (isDesainPublikasi(order)) return order.tanggal_publikasi;
          if (isBantuanTeknis(order)) return order.tanggal_kegiatan;
          if (isSurvey(order)) return order.deadline_survey;
          return null;
        };

        const aDate = getDeadlineDate(a);
        const bDate = getDeadlineDate(b);

        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

      if (activeTab === "desain_publikasi") {
        result = result.filter(
          (order) =>
            !isDesainPublikasi(order) ||
            !isPublicationChecklistCompleted(order),
        );
      }
    }

    if (filterVisibility === "visible") {
      result = result.filter((o) => !o.is_hidden);
    } else if (filterVisibility === "hidden") {
      result = result.filter((o) => o.is_hidden === true);
    }

    return result;
  }, [
    orders,
    activeTab,
    filterKementerian,
    filterStatus,
    filterDate,
    filterPlatform,
    filterVisibility,
    sortBy,
  ]);

  // Pagination logic
  const paginatedOrders = React.useMemo(() => {
    if (itemsPerPage === "all") return filteredOrders;
    const limit = parseInt(itemsPerPage, 10);
    const start = (currentPage - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = React.useMemo(() => {
    if (itemsPerPage === "all") return 1;
    const limit = parseInt(itemsPerPage, 10);
    return Math.max(1, Math.ceil(filteredOrders.length / limit));
  }, [filteredOrders.length, itemsPerPage]);

  const menuCounts = React.useMemo(() => {
    return {
      desain_publikasi: orders.filter((o) => o.menu_type === "desain_publikasi")
        .length,
      website: orders.filter((o) => o.menu_type === "website").length,
      bantuan_teknis: orders.filter((o) => o.menu_type === "bantuan_teknis")
        .length,
      survey: orders.filter((o) => o.menu_type === "survey").length,
    };
  }, [orders]);

  const clearFilters = () => {
    setFilterKementerian("all-kementerian");
    setFilterStatus("all-status");
    setFilterDate("");
    setFilterPlatform("all-platform");
    setFilterVisibility("all-visibility");
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  // Collision warning banner
  const CollisionWarning = () => {
    const collisionCount = Object.keys(scheduleCollisions).length;
    if (collisionCount === 0 || activeTab !== "desain_publikasi") return null;

    return (
      <Card className="border-destructive/20 bg-destructive/10 mb-6">
        <CardContent className="py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-destructive">
              <p className="font-semibold">
                Peringatan: Jadwal Upload Bersamaan
              </p>
              <p className="text-sm text-destructive/90 mt-1">
                Ada {collisionCount} jadwal dengan lebih dari 1 pesanan:
              </p>
              <ul className="text-sm text-destructive/90 mt-2 space-y-1">
                {Object.entries(scheduleCollisions).map(([key, collisionList]) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatDate(key.split("_")[0])} - {key.split("_")[1]}:
                    </span>
                    <span>
                      {collisionList.map((o) => o.judul_desain).join(", ")} (
                      {collisionList.length} pesanan)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTable = () => {
    switch (activeTab) {
      case "statistik":
      case "kelola_pj":
        return null;
      case "desain_publikasi":
        return (
          <DesainPublikasiTable
            orders={paginatedOrders.filter(isDesainPublikasi)}
            hasCollision={hasCollision}
            updateStatus={updateStatus}
            updateField={updateField}
            setOrders={setOrders}
            toggleHideOrder={toggleHideOrder}
            deleteOrder={deleteOrder}
          />
        );
      case "website":
        return (
          <WebsiteTable
            orders={paginatedOrders.filter(isWebsite)}
            updateStatus={updateStatus}
            toggleHideOrder={toggleHideOrder}
            deleteOrder={deleteOrder}
          />
        );
      case "bantuan_teknis":
        return (
          <BantuanTeknisTable
            orders={paginatedOrders.filter(isBantuanTeknis)}
            updateStatus={updateStatus}
            updateField={updateField}
            toggleHideOrder={toggleHideOrder}
            deleteOrder={deleteOrder}
          />
        );
      case "survey":
        return (
          <SurveyTable
            orders={paginatedOrders.filter(isSurvey)}
            updateStatus={updateStatus}
            updateField={updateField}
            toggleHideOrder={toggleHideOrder}
            deleteOrder={deleteOrder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="desain_publikasi"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as DashboardTab)}
        className="w-full"
      >
        {/* Navigation Tabs - Horizontal Scrollable on Mobile */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <TabsList className="flex items-center gap-1.5 overflow-x-auto w-full p-1 bg-slate-100/90 dark:bg-zinc-800/80 rounded-2xl no-scrollbar justify-start sm:justify-center">
            {MENU_OPTIONS.map((menu) => (
              <TabsTrigger
                key={menu.id}
                value={menu.id}
                className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold shrink-0 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs"
              >
                <MenuIcon icon={menu.icon} className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{menu.label}</span>
                <span className="ml-1 bg-slate-200/80 dark:bg-zinc-700/80 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {menuCounts[menu.id]}
                </span>
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="statistik"
              className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold shrink-0 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Statistik</span>
              <span className="ml-1 bg-slate-200/80 dark:bg-zinc-700/80 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {orders.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="kelola_pj"
              className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-bold shrink-0 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Kelola PJ</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {activeTab !== "statistik" && activeTab !== "kelola_pj" && (
          <>
            <CollisionWarning />

            {/* Filter Section with Mobile Collapsible */}
            <Card className="mb-4 sm:mb-6 border-slate-200 shadow-2xs">
              <CardHeader className="p-3 sm:p-5 pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-violet-600" />
                    <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                      Filter & Sortir
                    </CardTitle>
                    {activeFilterCount > 0 && (
                      <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {activeFilterCount} aktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:hidden">
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 px-2 text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        Reset
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="h-7 px-2.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      {showMobileFilters ? "Tutup" : "Filter"}
                      {showMobileFilters ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent
                className={cn(
                  "p-3 sm:p-5 pt-0 sm:pt-0",
                  !showMobileFilters && "hidden sm:block"
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 pt-1 sm:pt-0">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Kementerian/Biro
                    </Label>
                    <Select
                      value={filterKementerian}
                      onValueChange={setFilterKementerian}
                    >
                      <SelectTrigger className="h-9 text-xs w-full rounded-xl">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-kementerian">Semua</SelectItem>
                        {KEMENTERIAN_OPTIONS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Tanggal Deadline
                    </Label>
                    <DatePicker03
                      date={parseDateOnly(filterDate)}
                      setDate={(date) =>
                        setFilterDate(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      className="h-9 text-xs w-full rounded-xl"
                      placeholder="Semua Tanggal"
                    />
                  </div>
                  {activeTab === "desain_publikasi" && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Platform
                      </Label>
                      <Select
                        value={filterPlatform}
                        onValueChange={setFilterPlatform}
                      >
                        <SelectTrigger className="h-9 text-xs w-full rounded-xl">
                          <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-platform">Semua</SelectItem>
                          {PLATFORM_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Status
                    </Label>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="h-9 text-xs w-full rounded-xl">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">Semua</SelectItem>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Visibilitas
                    </Label>
                    <Select
                      value={filterVisibility}
                      onValueChange={setFilterVisibility}
                    >
                      <SelectTrigger className="h-9 text-xs w-full rounded-xl">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-visibility">
                          Semua Visibilitas
                        </SelectItem>
                        <SelectItem value="visible">Tampil Saja</SelectItem>
                        <SelectItem value="hidden">Tersembunyi Saja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Urutkan
                    </Label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortOption)}
                    >
                      <SelectTrigger className="h-9 text-xs w-full rounded-xl">
                        <SelectValue placeholder="Urutkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waktu_pemesanan">
                          Waktu Pemesanan
                        </SelectItem>
                        <SelectItem value="deadline">
                          Deadline Terdekat
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="h-9 w-full text-xs font-semibold rounded-xl"
                    >
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs overflow-hidden">
              <CardHeader className="p-3.5 sm:p-5 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
                  <MenuIcon
                    icon={MENU_OPTIONS.find((m) => m.id === activeTab)?.icon || ""}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600"
                  />
                  <span>{MENU_OPTIONS.find((m) => m.id === activeTab)?.label} Orders</span>
                  <span className="ml-auto bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {filteredOrders.length} Pesanan
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-4">
                <div className="w-full">{renderTable()}</div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-0 sm:mt-6 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Baris per halaman:
                    </span>
                    <Select
                      value={itemsPerPage}
                      onValueChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[80px] text-xs rounded-lg">
                        <SelectValue placeholder="25" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="all">Semua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {itemsPerPage !== "all" && totalPages > 1 && (
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                      <span className="text-xs text-slate-500 font-medium">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="h-8 px-3 text-xs rounded-lg font-semibold"
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="h-8 px-3 text-xs rounded-lg font-semibold"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "statistik" && <AdminStatistics orders={orders} />}
        {activeTab === "kelola_pj" && <PJManagement />}
      </Tabs>
    </div>
  );
}
