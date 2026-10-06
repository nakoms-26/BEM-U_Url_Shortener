"use client";

import * as React from "react";
import { getOrders } from "@/lib/rismed/actions/orders";
import {
  Order,
  DesainPublikasiOrder,
  WebsiteOrder,
  BantuanTeknisOrder,
  SurveyOrder,
} from "@/lib/rismed/types";
import {
  STATUS_OPTIONS,
  KEMENTERIAN_OPTIONS,
  PLATFORM_OPTIONS,
  MENU_OPTIONS,
  MenuType,
  JENIS_BANTUAN_OPTIONS,
} from "@/lib/rismed/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatDateOnly } from "@/lib/rismed/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonitoringTableSkeleton } from "@/components/rismed/shared/Skeletons";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Palette,
  Globe,
  Video,
  ClipboardList,
  Calendar,
  Clock,
  FileText,
  FolderArchive,
  Music,
  MapPin,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import {
  TwibbonDetailRow,
  TwibbonDetailCardContent,
} from "@/components/rismed/shared/TwibbonDetailRow";

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

const COLLISION_EXEMPT_WAKTU_PUBLIKASI = new Set([
  "12.00 (Instagram Story)",
  "18.00 (Instagram Story)",
]);

// Type guards
function isDesainPublikasi(order: Order): order is DesainPublikasiOrder {
  return order.menu_type === "desain_publikasi";
}
function isWebsite(order: Order): order is WebsiteOrder {
  return order.menu_type === "website";
}
function isBantuanTeknis(order: Order): order is BantuanTeknisOrder {
  return order.menu_type === "bantuan_teknis";
}
function isSurvey(order: Order): order is SurveyOrder {
  return order.menu_type === "survey";
}

function isPublicationChecklistCompleted(order: DesainPublikasiOrder): boolean {
  if (!order.platform_publikasi || order.platform_publikasi.length === 0) {
    return false;
  }

  return order.platform_publikasi.every(
    (platform) => order.status_publikasi?.[platform] === true,
  );
}

function isCollisionExempt(order: DesainPublikasiOrder): boolean {
  return COLLISION_EXEMPT_WAKTU_PUBLIKASI.has(order.waktu_publikasi);
}

interface MonitoringDashboardProps {
  initialOrders?: Order[];
}

export function MonitoringDashboard({ initialOrders = [] }: MonitoringDashboardProps) {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = React.useState(initialOrders.length === 0);
  const [activeTab, setActiveTab] =
    React.useState<MenuType>("desain_publikasi");

  // Filter states
  const [filterKementerian, setFilterKementerian] =
    React.useState<string>("all-kementerian");
  const [filterStatus, setFilterStatus] = React.useState<string>("all-status");
  const [filterDate, setFilterDate] = React.useState<Date | undefined>();
  const [filterPlatform, setFilterPlatform] =
    React.useState<string>("all-platform");
  const [sortBy, setSortBy] = React.useState<SortOption>("waktu_pemesanan");
  const [expandedDesainOrderIds, setExpandedDesainOrderIds] = React.useState<
    string[]
  >([]);
  const [expandedWebsiteOrderIds, setExpandedWebsiteOrderIds] = React.useState<
    string[]
  >([]);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState("25");

  // Mobile filter collapse state
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filterKementerian !== "all-kementerian") count++;
    if (filterStatus !== "all-status") count++;
    if (filterDate) count++;
    if (filterPlatform !== "all-platform" && activeTab === "desain_publikasi") count++;
    if (sortBy !== "waktu_pemesanan") count++;
    return count;
  }, [filterKementerian, filterStatus, filterDate, filterPlatform, activeTab, sortBy]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterKementerian, filterStatus, filterDate, filterPlatform, sortBy]);

  React.useEffect(() => {
    if (initialOrders.length === 0) {
      fetchOrders();
    }

    // Auto refresh data every 8 seconds (Smart Polling)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    return () => {
      clearInterval(interval);
    };
  }, [initialOrders.length]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const { data, error } = await getOrders();
      if (error) throw new Error(error);
      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };


  const helperDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    try {
      return formatDateOnly(d, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status || "New";
  };

  const getJenisBantuanLabel = (jenis: string) => {
    const option = JENIS_BANTUAN_OPTIONS.find((o) => o.id === jenis);
    return option?.label || jenis;
  };

  const visibleOrders = React.useMemo(() => {
    return orders.filter((o) => !o.is_hidden);
  }, [orders]);

  // Check for schedule collisions (same date + time) for Desain & Publikasi
  const scheduleCollisions = React.useMemo(() => {
    const desainOrders = visibleOrders
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

    // Return only keys with more than 1 order
    const collisions: { [key: string]: DesainPublikasiOrder[] } = {};
    Object.keys(collisionMap).forEach((key) => {
      if (collisionMap[key].length > 1) {
        collisions[key] = collisionMap[key];
      }
    });

    return collisions;
  }, [visibleOrders]);

  const hasCollision = (order: DesainPublikasiOrder) => {
    const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`;
    return scheduleCollisions[key] && scheduleCollisions[key].length > 1;
  };

  // Filter by menu type and other filters
  const filteredOrders = React.useMemo(() => {
    let result = visibleOrders.filter((o) => o.menu_type === activeTab);

    if (filterKementerian && filterKementerian !== "all-kementerian") {
      result = result.filter((o) => o.kementerian === filterKementerian);
    }
    if (filterStatus && filterStatus !== "all-status") {
      result = result.filter((o) => o.status === filterStatus);
    }

    // Date filter based on menu type
    if (filterDate) {
      const filterDateString = format(filterDate, "yyyy-MM-dd");
      result = result.filter((o) => {
        if (isDesainPublikasi(o))
          return o.tanggal_publikasi === filterDateString;
        if (isBantuanTeknis(o)) return o.tanggal_kegiatan === filterDateString;
        if (isSurvey(o)) return o.deadline_survey === filterDateString;
        return true;
      });
    }

    // Platform filter (only for desain_publikasi)
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

    // Apply sorting
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

        // Get deadline dates based on menu type
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

    return result;
  }, [
    visibleOrders,
    activeTab,
    filterKementerian,
    filterStatus,
    filterDate,
    filterPlatform,
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

  // Count orders per menu type
  const menuCounts = React.useMemo(() => {
    return {
      desain_publikasi: visibleOrders.filter((o) => o.menu_type === "desain_publikasi")
        .length,
      website: visibleOrders.filter((o) => o.menu_type === "website").length,
      bantuan_teknis: visibleOrders.filter((o) => o.menu_type === "bantuan_teknis")
        .length,
      survey: visibleOrders.filter((o) => o.menu_type === "survey").length,
    };
  }, [visibleOrders]);

  const clearFilters = () => {
    setFilterKementerian("all-kementerian");
    setFilterStatus("all-status");
    setFilterDate(undefined);
    setFilterPlatform("all-platform");
  };

  const toggleDesainOrderDetail = (orderId: string) => {
    setExpandedDesainOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const toggleWebsiteOrderDetail = (orderId: string) => {
    setExpandedWebsiteOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  if (isLoading) {
    return <MonitoringTableSkeleton />;
  }

  // Collision warning component
  const CollisionWarning = () => {
    const collisionCount = Object.keys(scheduleCollisions).length;
    if (collisionCount === 0 || activeTab !== "desain_publikasi") return null;

    return (
      <Card className="border-destructive/20 bg-destructive/10 mb-6">
        <CardContent className="py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-destructive">
              <p className="font-semibold">
                Peringatan: Jadwal Upload Bersamaan
              </p>
              <p className="text-sm text-destructive/90 mt-1">
                Ada {collisionCount} jadwal dengan lebih dari 1 pesanan:
              </p>
              <ul className="text-sm text-destructive/90 mt-2 space-y-1">
                {Object.entries(scheduleCollisions).map(([key, orders]) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatDate(key.split("_")[0])} - {key.split("_")[1]}:
                    </span>
                    <span>
                      {orders.map((o) => o.judul_desain).join(", ")} (
                      {orders.length} pesanan)
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

  // Render table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "desain_publikasi":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Judul & Platform</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link Desain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isDesainPublikasi).map((order) => {
                const isExpanded = expandedDesainOrderIds.includes(order.id);

                return (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className={
                        hasCollision(order)
                          ? "bg-destructive/10 hover:bg-destructive/20"
                          : ""
                      }
                    >
                      <TableCell className="font-medium whitespace-nowrap" suppressHydrationWarning>
                        {helperDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{order.nama}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.kementerian}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium truncate">
                          {order.judul_desain}
                        </div>
                        <div className="text-[10px] mt-1 flex flex-wrap gap-1">
                          {order.platform_publikasi?.map((p) => (
                            <span
                              key={p}
                              className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[9px]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDesainOrderDetail(order.id)}
                          className="h-6 px-2 mt-1 text-[10px]"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ChevronDown className="w-3 h-3 mr-1" />
                          )}
                          {isExpanded ? "Sembunyikan" : "Detail"}
                        </Button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-xs font-medium">
                          {formatDate(order.tanggal_publikasi)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.waktu_publikasi}
                        </div>
                        {hasCollision(order) && (
                          <div className="flex items-center gap-1 mt-1 text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[9px]">Tabrakan!</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.link_desain_selesai ? (
                          <a
                            href={order.link_desain_selesai}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6}>
                          <div className="text-xs space-y-1.5 py-1">
                            <div>
                              <span className="font-semibold">Judul lengkap:</span>{" "}
                              {order.judul_desain}
                            </div>
                            <div>
                              <span className="font-semibold">Aset konten:</span>{" "}
                              <a
                                href={order.link_file_konten}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link file konten
                              </a>
                            </div>
                            <div>
                              <span className="font-semibold">Caption:</span>{" "}
                              <a
                                href={order.link_caption_docs}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link caption docs
                              </a>
                            </div>
                            <div>
                              <span className="font-semibold">Request lagu:</span>{" "}
                              {order.request_lagu || "-"}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        );

      case "website":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Link & Shortlink</TableHead>
                <TableHead>Lampiran</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isWebsite).map((order) => {
                const isExpanded = expandedWebsiteOrderIds.includes(order.id);
                return (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell className="font-medium whitespace-nowrap" suppressHydrationWarning>
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.kementerian}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="font-medium text-xs">
                      {order.website_sub_type === "twibbon" ? (order.judul_kampanye || "-") : (order.tujuan_pemesanan || "-")}
                    </span>
                    {order.website_sub_type && (
                      <div className="mt-0.5">
                        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          order.website_sub_type === "twibbon" ? "bg-purple-100 text-purple-700" :
                          order.website_sub_type === "shortlink" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.website_sub_type === "twibbon" ? "Twibbon" :
                           order.website_sub_type === "shortlink" ? "Shortlink" : "Laman"}
                        </span>
                      </div>
                    )}
                    {order.website_sub_type === "twibbon" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWebsiteOrderDetail(order.id)}
                        className="h-6 px-2 mt-1 text-[10px]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ChevronDown className="w-3 h-3 mr-1" />
                        )}
                        {isExpanded ? "Sembunyikan" : "Detail"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-[10px]">
                      {order.link_original && (
                        <a
                          href={order.link_original}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Original
                        </a>
                      )}
                      {order.custom_shortlink && (
                        <span className="text-gray-700 font-medium">
                          → {order.custom_shortlink}
                        </span>
                      )}
                      {!order.link_original && !order.custom_shortlink && "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {order.link_pengajuan_fitur && (
                        <a
                          href={order.link_pengajuan_fitur}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Fitur
                        </a>
                      )}
                      {order.link_pendaftaran_event && (
                        <a
                          href={order.link_pendaftaran_event}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Event
                        </a>
                      )}
                      {!order.link_pengajuan_fitur &&
                        !order.link_pendaftaran_event &&
                        "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                </TableRow>

                {isExpanded && order.website_sub_type === "twibbon" && (
                  <TwibbonDetailRow order={order} colSpan={6} />
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
          </Table>
        );

      case "bantuan_teknis":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Jadwal & Tempat</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isBantuanTeknis).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap" suppressHydrationWarning>
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.kementerian}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-xs truncate">
                      {order.nama_kegiatan}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-xs font-medium">
                      {formatDate(order.tanggal_kegiatan)} -{" "}
                      {order.waktu_kegiatan}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {order.tempat_kegiatan}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {getJenisBantuanLabel(order.jenis_bantuan)}
                    </span>
                    {order.jenis_bantuan === "lainnya" &&
                      order.jenis_bantuan_lainnya && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {order.jenis_bantuan_lainnya}
                        </div>
                      )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "survey":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Judul Survey</TableHead>
                <TableHead>Target & Deadline</TableHead>
                <TableHead>Hadiah</TableHead>
                <TableHead>Brief</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isSurvey).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap" suppressHydrationWarning>
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.kementerian}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-xs truncate">
                      {order.judul_survey}
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-normal wrap-break-word">
                      {order.deskripsi_survey}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{order.target_responden}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Deadline: {formatDate(order.deadline_survey)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${order.hadiah_survey === "ada" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                    >
                      {order.hadiah_survey === "ada" ? "Ada" : "Tidak"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={order.link_gdrive_brief}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  // Render mobile cards based on active tab
  const renderMobileCards = () => {
    switch (activeTab) {
      case "desain_publikasi": {
        const desainOrders = paginatedOrders.filter(isDesainPublikasi);
        return (
          <div className="space-y-3">
            {desainOrders.map((order) => {
              const isExpanded = expandedDesainOrderIds.includes(order.id);
              const collision = hasCollision(order);

              return (
                <div
                  key={order.id}
                  className={cn(
                    "rounded-2xl border p-4 bg-white transition-all shadow-xs space-y-3",
                    collision
                      ? "border-red-300 bg-red-50/20"
                      : "border-slate-200"
                  )}
                >
                  {/* Top Bar: Created At & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning>
                        {helperDate(order.created_at)}
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {order.nama}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {order.kementerian}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 tracking-wide",
                        getStatusColor(order.status)
                      )}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Collision alert if any */}
                  {collision && (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-red-100 text-red-800 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>Peringatan: Jadwal upload tabrakan!</span>
                    </div>
                  )}

                  {/* Main: Title & Platform badges */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {order.judul_desain}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {order.platform_publikasi?.map((p) => (
                        <span
                          key={p}
                          className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schedule & Deadline */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {formatDate(order.tanggal_publikasi)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-600 text-[11px]">
                      {order.waktu_publikasi}
                    </span>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {order.link_desain_selesai && (
                      <a
                        href={order.link_desain_selesai}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Desain Selesai</span>
                      </a>
                    )}
                    {order.link_file_konten && (
                      <a
                        href={order.link_file_konten}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <FolderArchive className="w-3 h-3 text-slate-500" />
                        <span>File Konten</span>
                      </a>
                    )}
                    {order.link_caption_docs && (
                      <a
                        href={order.link_caption_docs}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>Caption Docs</span>
                      </a>
                    )}
                  </div>

                  {/* Collapsible Detail Toggle */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleDesainOrderDetail(order.id)}
                      className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 mr-1" />
                          Sembunyikan Rincian
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 mr-1" />
                          Lihat Rincian Lengkap
                        </>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-600">Judul Lengkap:</span>
                          <p className="text-slate-900 mt-0.5">{order.judul_desain}</p>
                        </div>
                        {order.request_lagu && (
                          <div className="flex items-center gap-1.5 text-purple-700 font-medium">
                            <Music className="w-3.5 h-3.5 shrink-0" />
                            <span>Request Lagu: {order.request_lagu}</span>
                          </div>
                        )}
                        {order.status_publikasi && Object.keys(order.status_publikasi).length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-600 block mb-1">Status Publikasi:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(order.status_publikasi).map(([plat, isDone]) => (
                                <span
                                  key={plat}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-semibold",
                                    isDone
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {plat}: {isDone ? "Sudah Diupload" : "Belum"}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      case "website": {
        const webOrders = paginatedOrders.filter(isWebsite);
        return (
          <div className="space-y-3">
            {webOrders.map((order) => {
              const isExpanded = expandedWebsiteOrderIds.includes(order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 p-4 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning>
                        {helperDate(order.created_at)}
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {order.nama}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {order.kementerian}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 tracking-wide",
                        getStatusColor(order.status)
                      )}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div>
                    {order.website_sub_type && (
                      <span
                        className={cn(
                          "inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mb-1.5",
                          order.website_sub_type === "twibbon"
                            ? "bg-purple-100 text-purple-700"
                            : order.website_sub_type === "shortlink"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {order.website_sub_type === "twibbon"
                          ? "Twibbon"
                          : order.website_sub_type === "shortlink"
                          ? "Shortlink"
                          : "Laman"}
                      </span>
                    )}
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {order.website_sub_type === "twibbon"
                        ? order.judul_kampanye || "-"
                        : order.tujuan_pemesanan || "-"}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-col gap-1.5 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {order.link_original && (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500 font-semibold shrink-0">Link Asli:</span>
                        <a
                          href={order.link_original}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline truncate inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{order.link_original}</span>
                        </a>
                      </div>
                    )}
                    {order.custom_shortlink && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold shrink-0">Shortlink:</span>
                        <span className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {order.custom_shortlink}
                        </span>
                      </div>
                    )}
                    {order.link_pengajuan_fitur && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold shrink-0">Fitur:</span>
                        <a
                          href={order.link_pengajuan_fitur}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Buka Fitur
                        </a>
                      </div>
                    )}
                    {order.link_pendaftaran_event && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold shrink-0">Event:</span>
                        <a
                          href={order.link_pendaftaran_event}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Buka Event
                        </a>
                      </div>
                    )}
                  </div>

                  {order.website_sub_type === "twibbon" && (
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleWebsiteOrderDetail(order.id)}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 mr-1" />
                            Sembunyikan Rincian Twibbon
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 mr-1" />
                            Lihat Rincian Twibbon
                          </>
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                          <TwibbonDetailCardContent order={order} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case "bantuan_teknis": {
        const tekOrders = paginatedOrders.filter(isBantuanTeknis);
        return (
          <div className="space-y-3">
            {tekOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 p-4 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning>
                      {helperDate(order.created_at)}
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {order.nama}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {order.kementerian}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 tracking-wide",
                      getStatusColor(order.status)
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div>
                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1.5">
                    {getJenisBantuanLabel(order.jenis_bantuan)}
                  </span>
                  <div className="font-bold text-slate-900 text-sm leading-snug">
                    {order.nama_kegiatan}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {formatDate(order.tanggal_kegiatan)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-600 text-[11px]">
                      {order.waktu_kegiatan}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{order.tempat_kegiatan}</span>
                  </div>
                </div>

                {order.jenis_bantuan === "lainnya" && order.jenis_bantuan_lainnya && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-600">Catatan Tambahan:</span>
                    <p className="text-slate-700 mt-0.5">{order.jenis_bantuan_lainnya}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case "survey": {
        const surveyOrders = paginatedOrders.filter(isSurvey);
        return (
          <div className="space-y-3">
            {surveyOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 p-4 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning>
                      {helperDate(order.created_at)}
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {order.nama}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {order.kementerian}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 tracking-wide",
                      getStatusColor(order.status)
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm leading-snug">
                    {order.judul_survey}
                  </div>
                  {order.deskripsi_survey && (
                    <p className="text-xs text-slate-600 line-clamp-3">
                      {order.deskripsi_survey}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Target
                    </span>
                    <span className="font-medium text-slate-800">
                      {order.target_responden || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Deadline
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatDate(order.deadline_survey)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      order.hadiah_survey === "ada"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    Hadiah: {order.hadiah_survey === "ada" ? "Ada" : "Tidak"}
                  </span>

                  {order.link_gdrive_brief && (
                    <a
                      href={order.link_gdrive_brief}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Brief Drive</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <Tabs
        defaultValue="desain_publikasi"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as MenuType)}
        className="w-full"
      >
        {/* Navigation Tabs - Horizontal Scroll on Mobile */}
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
          </TabsList>
        </div>

        {/* Collision Warning */}
        <CollisionWarning />

        {/* Filter Section with Mobile Collapsible Support */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-1 sm:pt-0">
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
                  date={filterDate}
                  setDate={setFilterDate}
                  placeholder="Pilih tanggal"
                  className="text-xs rounded-xl"
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                    <SelectItem value="deadline">Deadline Terdekat</SelectItem>
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

        {/* Content Container (Mobile Card List on mobile, Desktop Table on md+) */}
        <Card className="border-slate-200 shadow-2xs overflow-hidden">
          <CardHeader className="p-3.5 sm:p-5 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
              <MenuIcon
                icon={MENU_OPTIONS.find((m) => m.id === activeTab)?.icon || ""}
                className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600"
              />
              <span>{MENU_OPTIONS.find((m) => m.id === activeTab)?.label}</span>
              <span className="ml-auto bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filteredOrders.length} Pesanan
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile View: Cards */}
            <div className="block md:hidden p-3 space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-xl my-2 text-xs">
                  Tidak ada pesanan{" "}
                  {MENU_OPTIONS.find((m) => m.id === activeTab)?.label.toLowerCase()}{" "}
                  yang ditemukan.
                </div>
              ) : (
                renderMobileCards()
              )}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg mx-6 my-4 text-sm">
                  Tidak ada pesanan{" "}
                  {MENU_OPTIONS.find((m) => m.id === activeTab)?.label.toLowerCase()}{" "}
                  yang ditemukan.
                </div>
              ) : (
                renderTable()
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-5 border-t border-slate-100">
              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <span className="text-xs text-slate-500 font-medium">Baris per halaman:</span>
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-xs rounded-lg font-semibold"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      </Tabs>
    </div>
  );
}
