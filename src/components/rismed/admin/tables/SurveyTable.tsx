"use client";

import * as React from "react";
import { format } from "date-fns";
import { parseDateOnly } from "@/lib/rismed/date";
import { helperDate, getStatusColor, getWaUrl } from "@/lib/rismed/order-utils";
import { SurveyOrder, OrderStatus } from "@/lib/rismed/types";
import { STATUS_OPTIONS } from "@/lib/rismed/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker03 } from "@/components/rismed/shadcn-studio/date-picker/date-picker-03";
import { ExternalLink, Trash2, Eye, EyeOff, Phone, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurveyTableProps {
  orders: SurveyOrder[];
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function SurveyTable({
  orders,
  updateStatus,
  updateField,
  toggleHideOrder,
  deleteOrder,
}: SurveyTableProps) {
  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* MOBILE CARDS VIEW (block md:hidden) */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3.5 p-3">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic bg-white rounded-xl border border-slate-100">
            Tidak ada data pesanan survey & riset.
          </div>
        ) : (
          orders.map((order) => {
            const waLink = getWaUrl(order.nomor_whatsapp);

            return (
              <div
                key={order.id}
                className={cn(
                  "bg-white rounded-xl border p-3.5 shadow-xs transition-shadow space-y-3",
                  order.is_hidden
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                {/* 1. Header: Timestamp, Hidden Badge & Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {helperDate(order.created_at)}
                    </span>
                    {order.is_hidden && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold inline-flex items-center gap-1">
                        <EyeOff className="w-2.5 h-2.5" />
                        Tersembunyi
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-lg transition-colors",
                        order.is_hidden
                          ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      )}
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
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteOrder(order.id)}
                      title="Hapus pesanan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 2. Requester Info & WhatsApp Link */}
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">
                    {order.nama}
                  </div>
                  <div className="text-xs text-slate-500">
                    {order.kementerian}
                  </div>
                  {order.nomor_whatsapp && (
                    <div className="pt-0.5">
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 active:scale-95 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{order.nomor_whatsapp}</span>
                          <span className="text-[10px] text-emerald-600/70 font-normal">
                            (Chat WA)
                          </span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          {order.nomor_whatsapp}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Judul & Deskripsi Survey */}
                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs leading-snug">
                    {order.judul_survey}
                  </div>
                  {order.deskripsi_survey && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {order.deskripsi_survey}
                    </p>
                  )}
                </div>

                {/* 4. Target Responden & Hadiah & Brief Link */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50/60 p-2 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Target className="w-3 h-3 text-slate-400" />
                      Target Responden:
                    </span>
                    <div className="font-medium text-slate-800 text-[11px] truncate">
                      {order.target_responden || "-"}
                    </div>
                  </div>

                  <div className="bg-slate-50/60 p-2 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">
                      Hadiah:
                    </span>
                    <div>
                      <span
                        className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold",
                          order.hadiah_survey === "ada"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        )}
                      >
                        {order.hadiah_survey === "ada" ? "Ada Hadiah" : "Tidak Ada"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Brief Link if exists */}
                {order.link_gdrive_brief && (
                  <div className="pt-0.5">
                    <a
                      href={order.link_gdrive_brief}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors w-full justify-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Brief di Google Drive</span>
                    </a>
                  </div>
                )}

                {/* 5. Deadline Editor */}
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Deadline Survey:
                  </span>
                  <DatePicker03
                    date={parseDateOnly(order.deadline_survey)}
                    setDate={(date) => {
                      const formatted = date ? format(date, "yyyy-MM-dd") : "";
                      if (formatted !== order.deadline_survey) {
                        updateField(order.id, "deadline_survey", formatted);
                      }
                    }}
                    className="h-8 text-xs w-full px-2"
                  />
                </div>

                {/* 6. Status Selector */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Status:
                  </span>
                  <Select
                    value={order.status || "new"}
                    onValueChange={(v) =>
                      updateStatus(order.id, v as OrderStatus)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-8 text-xs px-3 rounded-full font-bold border-0 min-w-[125px]",
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
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      {/* ========================================================================= */}
      <div className="hidden md:block overflow-x-auto w-full min-w-0">
        <table className="w-full table-fixed min-w-[850px] text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="w-[20%] py-3 px-2 text-left font-bold text-slate-700">
                Waktu & Pemesan
              </th>
              <th className="w-[32%] py-3 px-2 text-left font-bold text-slate-700">
                Judul & Deskripsi
              </th>
              <th className="w-[20%] py-3 px-2 text-left font-bold text-slate-700">
                Target & Deadline
              </th>
              <th className="w-[14%] py-3 px-2 text-left font-bold text-slate-700">
                Brief & Hadiah
              </th>
              <th className="w-[14%] py-3 px-2 text-left font-bold text-slate-700">
                Status & Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs italic">
                  Tidak ada data pesanan survey & riset.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
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
                    {order.nomor_whatsapp && (
                      <div className="mt-0.5">
                        {getWaUrl(order.nomor_whatsapp) ? (
                          <a
                            href={getWaUrl(order.nomor_whatsapp)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-mono hover:underline inline-flex items-center gap-0.5"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            {order.nomor_whatsapp}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {order.nomor_whatsapp}
                          </span>
                        )}
                      </div>
                    )}
                    {order.is_hidden && (
                      <span className="text-[9px] px-1.5 py-0.5 mt-1 rounded bg-amber-100 text-amber-800 font-semibold inline-flex items-center gap-0.5">
                        <EyeOff className="w-2.5 h-2.5" />
                        Tersembunyi
                      </span>
                    )}
                  </td>

                  {/* 2. Judul & Deskripsi */}
                  <td className="py-2.5 px-2 align-top whitespace-normal">
                    <div
                      className="font-semibold text-slate-900 line-clamp-2 leading-snug"
                      title={order.judul_survey}
                    >
                      {order.judul_survey}
                    </div>
                    {order.deskripsi_survey && (
                      <div
                        className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed"
                        title={order.deskripsi_survey}
                      >
                        {order.deskripsi_survey}
                      </div>
                    )}
                  </td>

                  {/* 3. Target & Deadline */}
                  <td className="py-2.5 px-2 align-top">
                    <div
                      className="text-[11px] font-medium text-slate-800 truncate"
                      title={order.target_responden}
                    >
                      🎯 {order.target_responden || "-"}
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 w-full max-w-[135px]">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Deadline:
                      </span>
                      <DatePicker03
                        date={parseDateOnly(order.deadline_survey)}
                        setDate={(date) => {
                          const formatted = date ? format(date, "yyyy-MM-dd") : "";
                          if (formatted !== order.deadline_survey) {
                            updateField(order.id, "deadline_survey", formatted);
                          }
                        }}
                        className="h-7 text-[10px] w-full px-2"
                      />
                    </div>
                  </td>

                  {/* 4. Brief & Hadiah */}
                  <td className="py-2.5 px-2 align-top whitespace-normal">
                    <div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          order.hadiah_survey === "ada"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        Hadiah: {order.hadiah_survey === "ada" ? "Ada" : "Tidak"}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      {order.link_gdrive_brief ? (
                        <a
                          href={order.link_gdrive_brief}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Brief GDrive
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </div>
                  </td>

                  {/* 5. Status & Aksi */}
                  <td className="py-2.5 px-2 align-top">
                    <div className="flex flex-col gap-1.5">
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

                      <div className="flex items-center gap-1 mt-0.5">
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
