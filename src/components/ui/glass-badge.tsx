"use client";

import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const glassBadgeVariants = cva(
  cn(
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150",
  ),
  {
    variants: {
      variant: {
        default: "bg-slate-100 border-slate-200 text-slate-900",
        primary: "bg-violet-900/40 border-violet-700/60 text-violet-200",
        success: "bg-emerald-900/40 border-emerald-700/60 text-emerald-200",
        warning: "bg-amber-900/40 border-amber-700/60 text-amber-200",
        destructive: "bg-red-900/40 border-red-700/60 text-red-200",
        outline: "bg-transparent border-slate-300 text-slate-700",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassBadgeVariants> {
  asChild?: boolean;
}

function GlassBadge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: GlassBadgeProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(glassBadgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { GlassBadge, glassBadgeVariants };
