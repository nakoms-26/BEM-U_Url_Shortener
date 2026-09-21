import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Skeleton loader untuk tabel pesanan (Monitoring Dashboard & Admin Table)
 */
export function MonitoringTableSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Tabs Menu Placeholder */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 border border-border/50 max-w-full overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-28 sm:w-36 rounded-md" />
          ))}
        </div>
      </div>

      {/* Filter Card Placeholder */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Card Placeholder */}
      <Card className="border border-border/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[120px]">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="w-[200px]">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-36" />
                </TableHead>
                <TableHead className="w-[140px]">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="w-[120px]">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="w-[100px]">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7].map((row) => (
                <TableRow key={row} className="border-b border-border/40">
                  {/* Waktu */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  {/* Pemesan & Kementerian */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36 opacity-70" />
                    </div>
                  </TableCell>
                  {/* Judul & Platform Pills */}
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton
                        className="h-4"
                        style={{ width: `${60 + (row % 4) * 10}%` }}
                      />
                      <div className="flex gap-1.5">
                        <Skeleton className="h-4 w-14 rounded-full" />
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </div>
                    </div>
                  </TableCell>
                  {/* Deadline */}
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 opacity-70" />
                    </div>
                  </TableCell>
                  {/* Status Badge */}
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  {/* Link / Action Button */}
                  <TableCell>
                    <Skeleton className="h-7 w-16 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar Placeholder */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/40 bg-muted/10">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Skeleton loader untuk Admin Dashboard (Statistik + Tab + Filter + Tabel)
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* 4 StatCards Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32 opacity-70" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabel & Filter Skeleton */}
      <MonitoringTableSkeleton />
    </div>
  );
}

/**
 * Skeleton loader untuk Halaman Statistik & Heatmap
 */
export function StatistikSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Triwulan Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 border border-border/50">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 sm:w-28 rounded-md" />
          ))}
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-28 opacity-70" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2 Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-44 mb-1" />
            <Skeleton className="h-3 w-60 opacity-70" />
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-2 pt-8 pb-4">
            {[40, 70, 55, 85, 60, 95, 75, 50, 65, 80, 45, 90].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-3 w-56 opacity-70" />
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <Skeleton className="h-44 w-44 rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Activity Placeholder */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-72 opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
            {Array.from({ length: 12 * 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3.5 w-3.5 rounded-xs" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Skeleton loader untuk Kalender Jadwal
 */
export function CalendarSkeleton() {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300">
      {/* Calendar Header Controls */}
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-6 w-36 ml-2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Month Grid */}
      <Card className="border border-border/60 shadow-xs overflow-hidden">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20 text-center py-2.5">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
            <div key={day} className="flex justify-center">
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>

        {/* 5 Weeks Grid */}
        <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-border/30">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div
              key={idx}
              className="min-h-[90px] sm:min-h-[110px] p-2 flex flex-col gap-1.5 bg-background/50"
            >
              <Skeleton className="h-4 w-5 self-end rounded-xs" />
              {idx % 3 === 0 && (
                <Skeleton className="h-4 w-full rounded-xs bg-primary/20" />
              )}
              {idx % 5 === 0 && (
                <Skeleton className="h-4 w-4/5 rounded-xs bg-muted/60" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Skeleton loader untuk Halaman & Manajemen Kontak PJ
 */
export function PJPageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-64 opacity-70" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64 rounded-md" />
      </div>

      {/* Grid Kontak PJ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border border-border/60 shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center gap-3 space-y-0">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 opacity-70" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 opacity-70" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
