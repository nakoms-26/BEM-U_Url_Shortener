"use client";

import * as React from "react";
import { format } from "date-fns";
import { parseDateOnly } from "@/lib/rismed/date";
import { helperDate, getStatusColor } from "@/lib/rismed/order-utils";
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
      <table className="w-full table-fixed text-xs divide-y divide-slate-200">
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
