"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const GlassTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "relative w-full overflow-auto rounded-2xl border border-zinc-800 bg-zinc-900/80",
      "shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
      "no-scrollbar",
      className,
    )}
  >
    <table ref={ref} className="w-full caption-bottom text-sm" {...props} />
  </div>
));
GlassTable.displayName = "GlassTable";

const GlassTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b [&_tr]:border-zinc-800", className)}
    {...props}
  />
));
GlassTableHeader.displayName = "GlassTableHeader";

const GlassTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
GlassTableBody.displayName = "GlassTableBody";

const GlassTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-zinc-800 bg-zinc-900/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
GlassTableFooter.displayName = "GlassTableFooter";

const GlassTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-zinc-800/60 transition-colors duration-100",
      "hover:bg-zinc-800/40 data-[state=selected]:bg-zinc-800/60",
      className,
    )}
    {...props}
  />
));
GlassTableRow.displayName = "GlassTableRow";

const GlassTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-4 text-left align-middle text-xs font-semibold text-zinc-400 uppercase tracking-wider",
      "sticky top-0 bg-zinc-900 z-30",
      "[&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
GlassTableHead.displayName = "GlassTableHead";

const GlassTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle text-zinc-300 [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
GlassTableCell.displayName = "GlassTableCell";

const GlassTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-zinc-500", className)}
    {...props}
  />
));
GlassTableCaption.displayName = "GlassTableCaption";

export {
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableFooter,
  GlassTableHead,
  GlassTableRow,
  GlassTableCell,
  GlassTableCaption,
};
