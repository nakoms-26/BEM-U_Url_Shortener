"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Check } from "lucide-react";

export default function CopyButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = origin ? `${origin}/${slug}` : `/${slug}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassButton
      size="sm"
      variant="outline"
      onClick={handleCopy}
      className="w-40 max-w-40 min-w-0 overflow-hidden transition-all"
    >
      {copied ? <Check className="size-3 text-green-400" /> : null}
      <span className="min-w-0 flex-1">
        <span
          title={copied ? undefined : slug}
          className={copied ? "block truncate text-green-400" : "block truncate"}
        >
          {copied ? "Copied!" : slug}
        </span>
      </span>
    </GlassButton>
  );
}
