import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2"><Skeleton className="h-8 w-40" /><Skeleton className="h-5 w-56" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" key={index}><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-32" /></div>)}
      </div>
    </div>
  );
}
