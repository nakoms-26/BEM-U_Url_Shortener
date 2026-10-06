"use client";

import * as React from "react";
import { format } from "date-fns";
import { parseDateOnly } from "@/lib/rismed/date";
import { helperDate, getStatusColor, getWaUrl } from "@/lib/rismed/order-utils";
import { cn } from "@/lib/utils";
import { DesainPublikasiOrder, Order, OrderStatus } from "@/lib/rismed/types";
import {
  STATUS_OPTIONS,
  WAKTU_PUBLIKASI_OPTIONS,
} from "@/lib/rismed/constants";
import { updateOrder as updateOrderAction } from "@/lib/rismed/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Check,
  FileText,
  FolderArchive,
  Music,
  Phone,
} from "lucide-react";

interface DesainPublikasiTableProps {
  orders: DesainPublikasiOrder[];
  hasCollision: (order: DesainPublikasiOrder) => boolean;
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function DesainPublikasiTable({
  orders,
  hasCollision,
  updateStatus,
  updateField,
  setOrders,
  toggleHideOrder,
  deleteOrder,
}: DesainPublikasiTableProps) {
  const [expandedOrderIds, setExpandedOrderIds] = React.useState<string[]>([]);

  const toggleDetail = (id: string) => {
    setExpandedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* Mobile View: Cards */}
      <div className="block md:hidden p-3 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground bg-slate-50 rounded-xl">
            Tidak ada pesanan desain publikasi.
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.id);
            const collision = hasCollision(order);
            const waUrl = getWaUrl(order.nomor_whatsapp);

            return (
              <div
                key={order.id}
                className={cn(
                  "rounded-2xl border p-4 bg-white transition-all shadow-xs space-y-3",
                  collision ? "border-red-300 bg-red-50/20" : "border-slate-200"
                )}
              >
                {/* Top Bar: Created At, Name, Kementerian, and Status dropdown */}
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
                    {order.nomor_whatsapp && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg mt-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.nomor_whatsapp}</span>
                      </a>
                    )}
                    {order.is_hidden && (
                      <div className="mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold inline-flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5" />
                          Tersembunyi
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Select for Mobile */}
                  <div className="shrink-0">
                    <Select
                      value={order.status || "new"}
                      onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-xs px-2.5 rounded-full font-bold border-0 shadow-2xs",
                          getStatusColor(order.status)
                        )}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Collision alert */}
                {collision && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-red-100 text-red-800 text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                    <span>Peringatan: Jadwal upload tabrakan!</span>
                  </div>
                )}

                {/* Title & Platforms */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-900 text-sm leading-snug">
                    {order.judul_desain}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {order.platform_publikasi?.map((p) => (
                      <span
                        key={p}
                        className="bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Assets Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {order.link_file_konten && (
                    <a
                      href={order.link_file_konten}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-xl transition-colors"
                    >
                      <FolderArchive className="w-3 h-3 text-blue-600" />
                      <span>Files Drive</span>
                    </a>
                  )}
                  {order.link_caption_docs && (
                    <a
                      href={order.link_caption_docs}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-xl transition-colors"
                    >
                      <FileText className="w-3 h-3 text-indigo-600" />
                      <span>Caption Docs</span>
                    </a>
                  )}
                  {order.request_lagu && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-xl truncate max-w-full">
                      <Music className="w-3 h-3 shrink-0" />
                      <span className="truncate">{order.request_lagu}</span>
                    </span>
                  )}
                </div>

                {/* Mobile Form Controls: Deadline & Waktu */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Jadwal Publikasi:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <DatePicker03
                      date={parseDateOnly(order.tanggal_publikasi)}
                      setDate={(date) => {
                        const formatted = date ? format(date, "yyyy-MM-dd") : "";
                        if (formatted !== order.tanggal_publikasi) {
                          updateField(order.id, "tanggal_publikasi", formatted);
                        }
                      }}
                      className="h-8 text-xs w-full bg-white rounded-lg"
                    />
                    <Select
                      defaultValue={order.waktu_publikasi}
                      onValueChange={(v) => updateField(order.id, "waktu_publikasi", v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-full bg-white rounded-lg">
                        <SelectValue placeholder="Waktu Publikasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {WAKTU_PUBLIKASI_OPTIONS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mobile Form Controls: Checklist Status Publikasi */}
                {order.platform_publikasi && order.platform_publikasi.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Checklist Upload Publikasi:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {order.platform_publikasi.map((platform) => {
                        const isChecked = order.status_publikasi?.[platform] || false;
                        return (
                          <label
                            key={platform}
                            htmlFor={`mob-status-${order.id}-${platform}`}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors",
                              isChecked
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-white border-slate-200 text-slate-700"
                            )}
                          >
                            <Checkbox
                              id={`mob-status-${order.id}-${platform}`}
                              checked={isChecked}
                              onCheckedChange={async (checked) => {
                                const newStatusPublikasi = {
                                  ...(order.status_publikasi || {}),
                                  [platform]: checked === true,
                                };
                                try {
                                  const res = await updateOrderAction(order.id, {
                                    status_publikasi: newStatusPublikasi,
                                  });
                                  if (!res.success) throw new Error(res.error);
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o.id === order.id
                                        ? ({ ...o, status_publikasi: newStatusPublikasi } as Order)
                                        : o
                                    )
                                  );
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <span className={cn("text-xs font-semibold leading-tight truncate", isChecked && "line-through opacity-80")}>
                              {platform}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mobile Form Controls: Link Desain Selesai */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Link Hasil Desain Selesai (Drive):
                  </span>
                  <LinkDesainCell
                    orderId={order.id}
                    initialValue={order.link_desain_selesai || ""}
                    updateField={updateField}
                  />
                </div>

                {/* Footer Actions: Sembunyikan & Hapus */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleDetail(order.id)}
                    className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 mr-1" />
                        Tutup Rincian
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 mr-1" />
                        Rincian Lengkap
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHideOrder(order.id, !!order.is_hidden)}
                      className={cn(
                        "h-7 px-2.5 text-xs font-semibold rounded-lg",
                        order.is_hidden
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : "text-slate-600"
                      )}
                    >
                      {order.is_hidden ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" /> Tampilkan
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" /> Sembunyikan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                      className="h-7 px-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg"
                      title="Hapus Pesanan"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Hapus
                    </Button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-600">Judul Lengkap:</span>
                      <p className="text-slate-900 mt-0.5">{order.judul_desain}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">File Konten:</span>
                      <p className="mt-0.5">
                        {order.link_file_konten ? (
                          <a href={order.link_file_konten} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">
                            <ExternalLink className="w-3 h-3" /> Buka Google Drive
                          </a>
                        ) : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">Caption Docs:</span>
                      <p className="mt-0.5">
                        {order.link_caption_docs ? (
                          <a href={order.link_caption_docs} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">
                            <ExternalLink className="w-3 h-3" /> Buka Google Docs
                          </a>
                        ) : "-"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto w-full min-w-0">
        <table className="w-full min-w-[950px] table-fixed text-xs divide-y divide-slate-200">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="w-[16%] py-3 px-2 text-left font-bold text-slate-700">
              Waktu & Pemesan
            </th>
            <th className="w-[27%] py-3 px-2 text-left font-bold text-slate-700">
              Judul, Platform & Aset
            </th>
            <th className="w-[14%] py-3 px-2 text-left font-bold text-slate-700">
              Deadline
            </th>
            <th className="w-[11%] py-3 px-2 text-left font-bold text-slate-700">
              Status
            </th>
            <th className="w-[15%] py-3 px-2 text-left font-bold text-slate-700">
              Status Publikasi
            </th>
            <th className="w-[17%] py-3 px-2 text-left font-bold text-slate-700">
              Hasil Desain & Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.id);
            const collision = hasCollision(order);

            return (
              <React.Fragment key={order.id}>
                <tr
                  className={`transition-colors hover:bg-slate-50/70 ${
                    collision ? "bg-red-50/40 hover:bg-red-50/70" : ""
                  }`}
                >
                  {/* 1. Waktu & Pemesan */}
                  <td className="py-2.5 px-2 align-top">
                    <div className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                      {helperDate(order.created_at)}
                    </div>
                    <div
                      className="font-bold text-slate-900 truncate mt-0.5 text-xs"
                      title={order.nama}
                    >
                      {order.nama}
                    </div>
                    <div
                      className="text-[10px] text-slate-500 truncate"
                      title={order.kementerian}
                    >
                      {order.kementerian}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {order.nomor_whatsapp}
                    </div>
                    {order.is_hidden && (
                      <span className="text-[9px] px-1.5 py-0.5 mt-1 rounded bg-amber-100 text-amber-800 font-semibold inline-flex items-center gap-0.5">
                        <EyeOff className="w-2.5 h-2.5" />
                        Tersembunyi
                      </span>
                    )}
                  </td>

                  {/* 2. Judul, Platform & Aset */}
                  <td className="py-2.5 px-2 align-top whitespace-normal">
                    <div
                      className="font-semibold text-slate-900 line-clamp-2 leading-snug"
                      title={order.judul_desain || ""}
                    >
                      {order.judul_desain}
                    </div>

                    {/* Platform Tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.platform_publikasi?.map((p) => (
                        <span
                          key={p}
                          className="bg-violet-50 text-violet-700 border border-violet-100 px-1.5 py-0.2 rounded text-[9px] font-semibold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Quick Asset & Song Links */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {order.link_file_konten && (
                        <a
                          href={order.link_file_konten}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-1.5 py-0.5 rounded transition-colors"
                          title="Buka File Konten"
                        >
                          <FolderArchive className="w-2.5 h-2.5" />
                          <span>Files</span>
                        </a>
                      )}

                      {order.link_caption_docs && (
                        <a
                          href={order.link_caption_docs}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-1.5 py-0.5 rounded transition-colors"
                          title="Buka Caption Docs"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>Caption</span>
                        </a>
                      )}

                      {order.request_lagu && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded truncate max-w-[140px]"
                          title={`Request Lagu: ${order.request_lagu}`}
                        >
                          <Music className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{order.request_lagu}</span>
                        </span>
                      )}
                    </div>

                    {/* Toggle Detail */}
                    <button
                      type="button"
                      onClick={() => toggleDetail(order.id)}
                      className="inline-flex items-center text-[10px] font-semibold text-slate-500 hover:text-violet-600 mt-1.5 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-0.5" />
                          Tutup Detail
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-0.5" />
                          Detail
                        </>
                      )}
                    </button>
                  </td>

                  {/* 3. Deadline & Waktu */}
                  <td className="py-2.5 px-2 align-top">
                    <div className="flex flex-col gap-1 w-full max-w-[135px]">
                      <DatePicker03
                        date={parseDateOnly(order.tanggal_publikasi)}
                        setDate={(date) => {
                          const formatted = date
                            ? format(date, "yyyy-MM-dd")
                            : "";
                          if (formatted !== order.tanggal_publikasi) {
                            updateField(
                              order.id,
                              "tanggal_publikasi",
                              formatted
                            );
                          }
                        }}
                        className="h-7 text-[10px] w-full px-2"
                      />
                      <Select
                        defaultValue={order.waktu_publikasi}
                        onValueChange={(v) =>
                          updateField(order.id, "waktu_publikasi", v)
                        }
                      >
                        <SelectTrigger className="h-7 text-[10px] w-full px-2">
                          <SelectValue placeholder="Waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          {WAKTU_PUBLIKASI_OPTIONS.map((w) => (
                            <SelectItem key={w} value={w}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {collision && (
                      <div className="flex items-center gap-1 mt-1 text-red-600">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="text-[9px] font-bold">Tabrakan!</span>
                      </div>
                    )}
                  </td>

                  {/* 4. Status Pesanan */}
                  <td className="py-2.5 px-2 align-top">
                    <Select
                      value={order.status || "new"}
                      onValueChange={(v) =>
                        updateStatus(order.id, v as OrderStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-7 text-[10px] w-full max-w-[105px] px-2 rounded-full font-bold border-0 shadow-2xs ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* 5. Status Publikasi Checklist */}
                  <td className="py-2.5 px-2 align-top whitespace-normal">
                    <div className="flex flex-col gap-1">
                      {order.platform_publikasi?.map((platform) => {
                        const isChecked =
                          order.status_publikasi?.[platform] || false;
                        return (
                          <div
                            key={platform}
                            className="flex items-center gap-1.5"
                          >
                            <Checkbox
                              id={`status-${order.id}-${platform}`}
                              checked={isChecked}
                              onCheckedChange={async (checked) => {
                                const newStatusPublikasi = {
                                  ...(order.status_publikasi || {}),
                                  [platform]: checked === true,
                                };
                                try {
                                  const res = await updateOrderAction(order.id, {
                                    status_publikasi: newStatusPublikasi,
                                  });
                                  if (!res.success) throw new Error(res.error);
                                  setOrders((prev) =>
                                    prev.map((o) =>
                                      o.id === order.id
                                        ? ({
                                            ...o,
                                            status_publikasi:
                                              newStatusPublikasi,
                                          } as Order)
                                        : o
                                    )
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error updating status_publikasi:",
                                    error
                                  );
                                }
                              }}
                              className="h-3 w-3"
                            />
                            <Label
                              htmlFor={`status-${order.id}-${platform}`}
                              className={`text-[10px] cursor-pointer leading-tight truncate ${
                                isChecked
                                  ? "text-emerald-700 line-through font-semibold"
                                  : "text-slate-600 font-medium"
                              }`}
                              title={platform}
                            >
                              {platform}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* 6. Hasil Desain & Aksi */}
                  <td className="py-2.5 px-2 align-top">
                    <div className="space-y-1.5 w-full">
                      <LinkDesainCell
                        orderId={order.id}
                        initialValue={order.link_desain_selesai || ""}
                        updateField={updateField}
                      />

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 rounded-md transition-colors ${
                            order.is_hidden
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          }`}
                          title={
                            order.is_hidden
                              ? "Tampilkan kembali ke publik"
                              : "Sembunyikan dari monitoring publik"
                          }
                          onClick={() =>
                            toggleHideOrder(order.id, !!order.is_hidden)
                          }
                        >
                          {order.is_hidden ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteOrder(order.id)}
                          title="Hapus pesanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr className="bg-slate-50/70 border-b border-slate-200">
                    <td colSpan={6} className="p-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-700">Judul Lengkap:</span>
                          <p className="text-slate-900 mt-0.5">{order.judul_desain}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Platform:</span>
                          <p className="text-slate-900 mt-0.5">
                            {order.platform_publikasi?.join(", ") || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Request Lagu:</span>
                          <p className="text-slate-900 mt-0.5">{order.request_lagu || "-"}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">File Konten:</span>
                          <p className="mt-0.5">
                            {order.link_file_konten ? (
                              <a
                                href={order.link_file_konten}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                              >
                                <ExternalLink className="w-3 h-3" /> Buka Google Drive
                              </a>
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Caption Docs:</span>
                          <p className="mt-0.5">
                            {order.link_caption_docs ? (
                              <a
                                href={order.link_caption_docs}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                              >
                                <ExternalLink className="w-3 h-3" /> Buka Google Docs
                              </a>
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Nomor WhatsApp:</span>
                          <p className="text-slate-900 mt-0.5 font-mono">{order.nomor_whatsapp}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

interface LinkDesainCellProps {
  orderId: string;
  initialValue?: string;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
}

function LinkDesainCell({
  orderId,
  initialValue = "",
  updateField,
}: LinkDesainCellProps) {
  const [value, setValue] = React.useState(initialValue || "");
  const [status, setStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused && status !== "saving") {
      setValue(initialValue || "");
    }
  }, [initialValue, isFocused, status]);

  const handleSave = async (val: string) => {
    const trimmed = val.trim();
    if (trimmed === (initialValue || "")) return;

    setStatus("saving");
    try {
      await updateField(orderId, "link_desain_selesai", trimmed);
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center gap-1 w-full">
      <div className="relative flex-1 min-w-0">
        <Input
          type="text"
          placeholder="Link G-Drive"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleSave(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave(value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={status === "saving"}
          className={`h-7 text-[10px] w-full px-2 pr-5 transition-all ${
            status === "saved"
              ? "border-emerald-500 bg-emerald-50/50 text-emerald-900"
              : status === "error"
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-slate-200"
          }`}
          title="Tekan Enter atau klik di luar untuk menyimpan"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          {status === "saving" && (
            <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-400" />
          )}
          {status === "saved" && (
            <Check className="w-2.5 h-2.5 text-emerald-600" />
          )}
        </div>
      </div>
      {value && (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="p-1 rounded text-blue-600 hover:bg-blue-50 shrink-0"
          title="Buka Link Desain"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
