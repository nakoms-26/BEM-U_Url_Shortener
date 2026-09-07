"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const glassButtonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl cursor-pointer",
    "text-sm font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-sm",
        primary:
          "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-sm",
        outline:
          "border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm",
        ghost:
          "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900",
        destructive:
          "bg-red-50 border border-red-200 hover:bg-red-100 active:bg-red-200 text-red-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  glowEffect?: boolean;
  asChild?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, asChild = false, size, glowEffect: _glowEffect, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
