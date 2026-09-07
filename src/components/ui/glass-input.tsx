"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  glowOnFocus?: boolean;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, glowOnFocus: _glowOnFocus, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl px-4 py-2 text-sm",
        "bg-white border border-slate-300",
        "text-slate-900 placeholder:text-slate-400",
        "transition-colors duration-150",
        "focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

GlassInput.displayName = "GlassInput";

export { GlassInput };
