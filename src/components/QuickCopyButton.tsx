"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickCopyButtonProps {
  slug: string;
  className?: string;
  iconClassName?: string;
}

export default function QuickCopyButton({
  slug,
  className,
  iconClassName,
}: QuickCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = origin ? `${origin}/${slug}` : `/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success(`Tautan /${slug} berhasil disalin!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "p-2 rounded-full border border-slate-200 bg-white hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 text-slate-500 transition-all active:scale-90 shadow-2xs flex items-center justify-center",
        copied && "border-emerald-200 bg-emerald-50 text-emerald-600",
        className
      )}
      title="Salin tautan singkat"
      aria-label={`Salin tautan /${slug}`}
    >
      {copied ? (
        <Check className={cn("w-3.5 h-3.5 text-emerald-600 stroke-[2.5]", iconClassName)} />
      ) : (
        <Copy className={cn("w-3.5 h-3.5 stroke-[2.2]", iconClassName)} />
      )}
    </button>
  );
}
