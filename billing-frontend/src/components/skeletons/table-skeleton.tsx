import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton Rows */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 rounded" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div
            key={rIndex}
            className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-none dark:border-neutral-800/50"
          >
            {Array.from({ length: cols }).map((_, cIndex) => (
              <Skeleton key={cIndex} className="h-6 w-24 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
