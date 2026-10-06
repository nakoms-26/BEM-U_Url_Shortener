"use client";

import * as React from "react";
import { helperDate, getStatusColor, getWaUrl } from "@/lib/rismed/order-utils";
import { cn } from "@/lib/utils";
import { WebsiteOrder, OrderStatus } from "@/lib/rismed/types";
import { STATUS_OPTIONS } from "@/lib/rismed/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react";
import {
  TwibbonDetailRow,
  TwibbonDetailCardContent,
} from "@/components/rismed/shared/TwibbonDetailRow";

interface WebsiteTableProps {
  orders: WebsiteOrder[];
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function WebsiteTable({
  orders,
  updateStatus,
  toggleHideOrder,
  deleteOrder,
}: WebsiteTableProps) {
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
            Tidak ada pesanan website / twibbon.
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderIds.includes(order.id);
            const waUrl = getWaUrl(order.nomor_whatsapp);

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 p-4 bg-white shadow-xs space-y-3"
              >
                {/* Top Row: Info & Status */}
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

                {/* Subtype & Title */}
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
                        className="text-blue-600 hover:underline truncate inline-flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{order.link_original}</span>
                      </a>
                    </div>
                  )}
                  {order.custom_shortlink && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold shrink-0">Shortlink:</span>
                      <span className="font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-semibold">
                        /{order.custom_shortlink}
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
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
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
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> Buka Event
                      </a>
                    </div>
                  )}
                </div>

                {/* Twibbon Details if Twibbon */}
                {order.website_sub_type === "twibbon" && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleDetail(order.id)}
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

                {/* Footer Actions: Sembunyikan & Hapus */}
                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
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
            );
          })
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto w-full min-w-0">
        <table className="w-full min-w-[850px] table-fixed text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="w-[18%] py-3 px-2 text-left font-bold text-slate-700">Waktu & Pemesan</th>
              <th className="w-[28%] py-3 px-2 text-left font-bold text-slate-700">Tujuan & Tipe</th>
              <th className="w-[24%] py-3 px-2 text-left font-bold text-slate-700">Link & Shortlink</th>
              <th className="w-[12%] py-3 px-2 text-left font-bold text-slate-700">Lampiran</th>
              <th className="w-[10%] py-3 px-2 text-left font-bold text-slate-700">Status</th>
              <th className="w-[8%] py-3 px-2 text-left font-bold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {orders.map((order) => {
              const isExpanded = expandedOrderIds.includes(order.id);
              return (
                <React.Fragment key={order.id}>
                  <tr className="transition-colors hover:bg-slate-50/70">
                    <td className="py-2.5 px-2 align-top">
                      <div className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        {helperDate(order.created_at)}
                      </div>
                      <div className="font-bold text-slate-900 truncate mt-0.5 text-xs" title={order.nama}>
                        {order.nama}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={order.kementerian}>
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
                    <td className="py-2.5 px-2 align-top whitespace-normal">
                      <span className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {order.website_sub_type === "twibbon"
                          ? order.judul_kampanye || "-"
                          : order.tujuan_pemesanan || "-"}
                      </span>
                      {order.website_sub_type && (
                        <div className="mt-1">
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              order.website_sub_type === "twibbon"
                                ? "bg-purple-100 text-purple-700"
                                : order.website_sub_type === "shortlink"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.website_sub_type === "twibbon"
                              ? "Twibbon"
                              : order.website_sub_type === "shortlink"
                              ? "Shortlink"
                              : "Laman"}
                          </span>
                        </div>
                      )}
                      {order.website_sub_type === "twibbon" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetail(order.id)}
                          className="h-6 px-2 mt-1 text-[10px] text-slate-500 hover:text-violet-600"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ChevronDown className="w-3 h-3 mr-1" />
                          )}
                          {isExpanded ? "Sembunyikan" : "Detail Twibbon"}
                        </Button>
                      )}
                    </td>
                    <td className="py-2.5 px-2 align-top whitespace-normal">
                      <div className="flex flex-col gap-1 text-[10px]">
                        {order.link_original && (
                          <a
                            href={order.link_original}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center font-medium truncate"
                            title={order.link_original}
                          >
                            <ExternalLink className="w-3 h-3 mr-1 shrink-0" />
                            <span className="truncate">Original</span>
                          </a>
                        )}
                        {order.custom_shortlink && (
                          <span className="text-slate-800 font-semibold font-mono truncate" title={order.custom_shortlink}>
                            → /{order.custom_shortlink}
                          </span>
                        )}
                        {!order.link_original && !order.custom_shortlink && "-"}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 align-top whitespace-normal">
                      <div className="flex flex-col gap-1">
                        {order.link_pengajuan_fitur && (
                          <a
                            href={order.link_pengajuan_fitur}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center text-[10px] font-medium"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Fitur
                          </a>
                        )}
                        {order.link_pendaftaran_event && (
                          <a
                            href={order.link_pendaftaran_event}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center text-[10px] font-medium"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Event
                          </a>
                        )}
                        {!order.link_pengajuan_fitur &&
                          !order.link_pendaftaran_event &&
                          "-"}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 align-top">
                      <Select
                        value={order.status || "new"}
                        onValueChange={(v) =>
                          updateStatus(order.id, v as OrderStatus)
                        }
                      >
                        <SelectTrigger
                          className={`h-7 text-[10px] w-full max-w-[100px] px-2 rounded-full font-bold border-0 ${getStatusColor(
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
                    <td className="py-2.5 px-2 align-top">
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
                              ? "Tampilkan kembali"
                              : "Sembunyikan pesanan"
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
                    </td>
                  </tr>

                  {isExpanded && order.website_sub_type === "twibbon" && (
                    <TwibbonDetailRow order={order} colSpan={6} />
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
