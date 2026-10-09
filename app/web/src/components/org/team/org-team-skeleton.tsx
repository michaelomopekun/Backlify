import { Skeleton } from "@/components/ui/skeleton";

export function OrgTeamSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-28 bg-white/[0.08]" />
        <Skeleton className="h-4 w-64 bg-white/[0.05]" />
      </div>

      {/* Action Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Skeleton className="h-9 flex-1 bg-white/[0.08] rounded-md" />
          <Skeleton className="h-9 w-[130px] bg-white/[0.08] rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-20 bg-white/[0.08] rounded-md" />
          <Skeleton className="h-9 w-32 bg-white/[0.08] rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-[#222222] bg-[#111111] rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#222222] bg-[#161616]">
          <Skeleton className="col-span-5 h-3.5 w-16 bg-white/[0.08]" />
          <Skeleton className="col-span-2 h-3.5 w-8 bg-white/[0.08]" />
          <Skeleton className="col-span-3 h-3.5 w-12 bg-white/[0.08]" />
          <div className="col-span-2"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#1e1e1e]">
          {[1, 2].map((i) => (
            <div key={i} className="grid grid-cols-12 px-5 py-3.5 items-center">
              <div className="col-span-5 flex items-center gap-3">
                <Skeleton className="size-7 rounded-full bg-white/[0.08]" />
                <Skeleton className="h-4 w-44 bg-white/[0.08]" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-3.5 w-4 bg-white/[0.05]" />
              </div>
              <div className="col-span-3">
                <Skeleton className="h-4 w-16 bg-white/[0.08]" />
              </div>
              <div className="col-span-2 flex justify-end">
                <Skeleton className="h-7 w-20 bg-white/[0.08] rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#222222] bg-[#141414]">
          <Skeleton className="h-3.5 w-16 bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}
