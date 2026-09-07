export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-4 py-6 w-full max-w-2xl mx-auto">
      <main className="w-full relative z-20">
        {/* Search & Sort Bar Skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-10 w-full rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-10 w-32 shrink-0 rounded-xl bg-slate-200 animate-pulse" />
        </div>

        {/* Link Count Skeleton */}
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3 px-1" />

        {/* Accordion List Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 overflow-hidden divide-y divide-slate-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full flex items-center gap-3 px-4 py-3.5 animate-pulse">
              {/* Expand chevron placeholder */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200" />

              {/* Text placeholder */}
              <div className="flex-1 min-w-0">
                <div className="h-4 w-1/3 bg-slate-200 rounded mb-1.5" />
                <div className="h-3 w-1/4 bg-slate-100 rounded" />
              </div>

              {/* Badge placeholder */}
              <div className="w-12 h-4 rounded-md bg-slate-200 shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
