"use client";

import * as React from "react";
import { format } from "date-fns";
import { parseDateOnly } from "@/lib/rismed/date";
import {
  helperDate,
  getStatusColor,
  getJenisBantuanLabel,
} from "@/lib/rismed/order-utils";
import { BantuanTeknisOrder, OrderStatus } from "@/lib/rismed/types";
import { STATUS_OPTIONS } from "@/lib/rismed/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface BantuanTeknisTableProps {
  orders: BantuanTeknisOrder[];
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function BantuanTeknisTable({
  orders,
  updateStatus,
  updateField,
  toggleHideOrder,
  deleteOrder,
}: BantuanTeknisTableProps) {
  return (
    <div className="w-full">
      <table className="w-full table-fixed text-xs divide-y divide-slate-200">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="w-[20%] py-3 px-2 text-left font-bold text-slate-700">
              Waktu & Pemesan
            </th>
            <th className="w-[30%] py-3 px-2 text-left font-bold text-slate-700">
              Kegiatan & Jenis
            </th>
            <th className="w-[24%] py-3 px-2 text-left font-bold text-slate-700">
              Jadwal & Tempat
            </th>
            <th className="w-[13%] py-3 px-2 text-left font-bold text-slate-700">
              Status
            </th>
            <th className="w-[13%] py-3 px-2 text-left font-bold text-slate-700">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="transition-colors hover:bg-slate-50/70"
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

              {/* 2. Kegiatan & Jenis */}
              <td className="py-2.5 px-2 align-top whitespace-normal">
                <div
                  className="font-semibold text-slate-900 line-clamp-2 leading-snug"
                  title={order.nama_kegiatan}
                >
                  {order.nama_kegiatan}
                </div>
                <div className="mt-1">
                  <span className="inline-block bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                    {getJenisBantuanLabel(order.jenis_bantuan)}
                  </span>
                </div>
                {order.jenis_bantuan === "lainnya" &&
                  order.jenis_bantuan_lainnya && (
                    <div
                      className="text-[10px] text-slate-500 mt-1 italic line-clamp-2"
                      title={order.jenis_bantuan_lainnya}
                    >
                      {order.jenis_bantuan_lainnya}
                    </div>
                  )}
              </td>

              {/* 3. Jadwal & Tempat */}
              <td className="py-2.5 px-2 align-top">
                <div className="flex flex-col gap-1 w-full max-w-[140px]">
                  <DatePicker03
                    date={parseDateOnly(order.tanggal_kegiatan)}
                    setDate={(date) => {
                      const formatted = date ? format(date, "yyyy-MM-dd") : "";
                      if (formatted !== order.tanggal_kegiatan) {
                        updateField(order.id, "tanggal_kegiatan", formatted);
                      }
                    }}
                    className="h-7 text-[10px] w-full px-2"
                  />
                  <Input
                    type="time"
                    defaultValue={order.waktu_kegiatan}
                    onBlur={(e) => {
                      if (e.target.value !== order.waktu_kegiatan) {
                        updateField(order.id, "waktu_kegiatan", e.target.value);
                      }
                    }}
                    className="h-7 text-[10px] w-full px-2"
                  />
                </div>
                <div
                  className="text-[10px] text-slate-500 mt-1 truncate"
                  title={order.tempat_kegiatan}
                >
                  📍 {order.tempat_kegiatan}
                </div>
              </td>

              {/* 4. Status */}
              <td className="py-2.5 px-2 align-top">
                <Select
                  value={order.status || "new"}
                  onValueChange={(v) =>
                    updateStatus(order.id, v as OrderStatus)
                  }
                >
                  <SelectTrigger
                    className={`h-7 text-[10px] w-full max-w-[105px] px-2 rounded-full font-bold border-0 ${getStatusColor(
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

              {/* 5. Aksi */}
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
                      toggleHideOrder(order.id, !order.is_hidden)
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
