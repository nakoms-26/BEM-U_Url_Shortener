"use client";

import * as React from "react";
import { WebsiteOrder } from "@/lib/rismed/types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, Copy } from "lucide-react";
import { formatDateOnly } from "@/lib/rismed/date";

interface TwibbonDetailRowProps {
  order: WebsiteOrder;
  colSpan?: number;
}

export function TwibbonDetailRow({
  order,
  colSpan = 7,
}: TwibbonDetailRowProps) {
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
    <TableRow className="bg-muted/30">
      <TableCell colSpan={colSpan}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs py-1">
          <div>
            <span className="font-semibold">Judul Twibbon:</span>{" "}
            {order.judul_kampanye || "-"}
          </div>
          <div>
            <span className="font-semibold">Nama URL:</span>{" "}
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
            <span className="font-semibold">Format Twibbon:</span>{" "}
            {order.format_twibbon || "-"}
            {order.format_twibbon === "video" &&
              order.warna_chroma_key &&
              ` (Chroma Key: ${order.warna_chroma_key})`}
          </div>
          <div>
            <span className="font-semibold">Tanggal Publikasi:</span>{" "}
            {order.tanggal_publikasi_twibbon
              ? formatDateOnly(order.tanggal_publikasi_twibbon)
              : "-"}
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Caption Twibbon:</span>
              {order.caption_twibbon && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopyCaption(order.caption_twibbon || "")
                  }
                  className="h-6 px-2 text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">
                        Tersalin
                      </span>
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
            <p className="mt-1 p-2 bg-background border rounded text-[10px] whitespace-pre-wrap max-h-24 overflow-y-auto">
              {order.caption_twibbon || "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold">Link Asset:</span>{" "}
            {order.link_asset_twibbon ? (
              <a
                href={order.link_asset_twibbon}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> Lihat Asset Twibbon
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
