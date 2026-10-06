"use client";

import * as React from "react";
import { WebsiteOrder } from "@/lib/rismed/types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, Copy } from "lucide-react";
import { formatDateOnly } from "@/lib/rismed/date";

export interface TwibbonDetailCardContentProps {
  order: WebsiteOrder;
}

export interface TwibbonDetailRowProps {
  order: WebsiteOrder;
  colSpan?: number;
}

export function TwibbonDetailCardContent({ order }: TwibbonDetailCardContentProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCaption = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs py-1">
      <div>
        <span className="font-semibold text-slate-700">Judul Twibbon:</span>{" "}
        <span className="text-slate-900">{order.judul_kampanye || "-"}</span>
      </div>
      <div>
        <span className="font-semibold text-slate-700">Nama URL:</span>{" "}
        {order.nama_url_twibbon ? (
          <a
            href={`https://twibbon.bem-unsoed.com/${order.nama_url_twibbon}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            {order.nama_url_twibbon}
          </a>
        ) : (
          "-"
        )}
      </div>
      <div>
        <span className="font-semibold text-slate-700">Format Twibbon:</span>{" "}
        <span className="text-slate-900">
          {order.format_twibbon || "-"}
          {order.format_twibbon === "video" &&
            order.warna_chroma_key &&
            ` (Chroma Key: ${order.warna_chroma_key})`}
        </span>
      </div>
      <div>
        <span className="font-semibold text-slate-700">Tanggal Publikasi:</span>{" "}
        <span className="text-slate-900">
          {order.tanggal_publikasi_twibbon
            ? formatDateOnly(order.tanggal_publikasi_twibbon)
            : "-"}
        </span>
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Caption Twibbon:</span>
          {order.caption_twibbon && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCopyCaption(order.caption_twibbon || "")}
              className="h-6 px-2 text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin</span>
                </>
              )}
            </Button>
          )}
        </div>
        <p className="mt-1 p-2 bg-background border rounded text-[10px] whitespace-pre-wrap max-h-28 overflow-y-auto">
          {order.caption_twibbon || "-"}
        </p>
      </div>
      <div className="md:col-span-2">
        <span className="font-semibold text-slate-700">Link Asset:</span>{" "}
        {order.link_asset_twibbon ? (
          <a
            href={order.link_asset_twibbon}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
          >
            <ExternalLink className="w-3 h-3" /> Lihat Asset Twibbon
          </a>
        ) : (
          "-"
        )}
      </div>
    </div>
  );
}

export function TwibbonDetailRow({
  order,
  colSpan = 7,
}: TwibbonDetailRowProps) {
  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={colSpan}>
        <TwibbonDetailCardContent order={order} />
      </TableCell>
    </TableRow>
  );
}
