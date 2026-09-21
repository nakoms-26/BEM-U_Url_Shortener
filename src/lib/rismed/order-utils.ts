import { format } from "date-fns";
import { formatDateOnly } from "@/lib/rismed/date";
import {
  Order,
  DesainPublikasiOrder,
  WebsiteOrder,
  BantuanTeknisOrder,
  SurveyOrder,
} from "@/lib/rismed/types";
import { STATUS_OPTIONS, MenuType, JENIS_BANTUAN_OPTIONS } from "@/lib/rismed/constants";

export const COLLISION_EXEMPT_WAKTU_PUBLIKASI = new Set([
  "12.00 (Instagram Story)",
  "18.00 (Instagram Story)",
]);

export const HEATMAP_LEVEL_CLASSES = [
  "bg-emerald-50 dark:bg-emerald-950",
  "bg-emerald-100 dark:bg-emerald-900",
  "bg-emerald-200 dark:bg-emerald-800",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-400 dark:bg-emerald-600",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-600 dark:bg-emerald-400",
  "bg-emerald-700 dark:bg-emerald-300",
  "bg-emerald-800 dark:bg-emerald-200",
  "bg-emerald-900 dark:bg-emerald-100",
];

export const MENU_BADGE_STYLES: Record<MenuType, string> = {
  desain_publikasi: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  website: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  bantuan_teknis: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  survey: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function helperDate(d: string): string {
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
}

export function formatDate(d: string): string {
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
}

export function getStatusColor(status: string): string {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status || "New";
}

export function getJenisBantuanLabel(jenis: string): string {
  const option = JENIS_BANTUAN_OPTIONS.find((opt) => opt.id === jenis);
  return option?.label || jenis;
}

export function getHeatmapLevel(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted/40 ring-1 ring-inset ring-border";

  const ratio = count / Math.max(maxCount, 1);
  const levelIndex = Math.min(
    HEATMAP_LEVEL_CLASSES.length - 1,
    Math.max(0, Math.ceil(ratio * HEATMAP_LEVEL_CLASSES.length) - 1),
  );

  return HEATMAP_LEVEL_CLASSES[levelIndex];
}

// Type guard functions
export function isDesainPublikasi(order: Order): order is DesainPublikasiOrder {
  return order.menu_type === "desain_publikasi";
}

export function isWebsite(order: Order): order is WebsiteOrder {
  return order.menu_type === "website";
}

export function isBantuanTeknis(order: Order): order is BantuanTeknisOrder {
  return order.menu_type === "bantuan_teknis";
}

export function isSurvey(order: Order): order is SurveyOrder {
  return order.menu_type === "survey";
}

export function isPublicationChecklistCompleted(order: DesainPublikasiOrder): boolean {
  if (!order.platform_publikasi || order.platform_publikasi.length === 0) {
    return false;
  }

  return order.platform_publikasi.every(
    (platform) => order.status_publikasi?.[platform] === true,
  );
}

export function isCollisionExempt(order: DesainPublikasiOrder): boolean {
  return (
    Boolean(order.waktu_publikasi) &&
    COLLISION_EXEMPT_WAKTU_PUBLIKASI.has(order.waktu_publikasi)
  );
}

export function getContentDateKey(order: Order): string | null {
  switch (order.menu_type) {
    case "desain_publikasi":
      return (order as DesainPublikasiOrder).tanggal_publikasi || null;
    case "bantuan_teknis":
      return (order as BantuanTeknisOrder).tanggal_kegiatan || null;
    case "survey":
      return (order as SurveyOrder).deadline_survey || null;
    case "website": {
      const d = new Date(order.created_at);
      return Number.isNaN(d.getTime()) ? null : format(d, "yyyy-MM-dd");
    }
    default:
      return null;
  }
}
