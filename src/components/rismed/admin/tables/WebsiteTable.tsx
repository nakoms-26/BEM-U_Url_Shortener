"use client";

import * as React from "react";
import { helperDate, getStatusColor } from "@/lib/rismed/order-utils";
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
} from "lucide-react";
import { TwibbonDetailRow } from "@/components/rismed/shared/TwibbonDetailRow";

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
      <table className="w-full table-fixed text-xs divide-y divide-slate-200">
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
  );
}
