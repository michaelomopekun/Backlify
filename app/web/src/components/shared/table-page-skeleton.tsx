import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface TablePageSkeletonProps {
  titleWidth?: string;
  hasStats?: boolean;
  statCount?: number;
  rowCount?: number;
}

export function TablePageSkeleton({
  titleWidth = "w-40",
  hasStats = true,
  statCount = 3,
  rowCount = 6,
}: TablePageSkeletonProps) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className={`h-8 ${titleWidth} bg-white/[0.09]`} />
          <Skeleton className="h-4 w-72 bg-white/[0.04]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-md bg-white/[0.05]" />
          <Skeleton className="h-9 w-32 rounded-md bg-white/[0.08]" />
        </div>
      </div>

      {/* Optional Top Stat Cards */}
      {hasStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: statCount }).map((_, i) => (
            <Card key={i} className="p-4 bg-[#111111] border-[#222222] space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 bg-white/[0.05]" />
                <Skeleton className="size-4 rounded bg-white/[0.05]" />
              </div>
              <Skeleton className="h-7 w-20 bg-white/[0.09]" />
              <Skeleton className="h-3 w-32 bg-white/[0.04]" />
            </Card>
          ))}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Skeleton className="h-9 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md bg-white/[0.04]" />
          <Skeleton className="h-9 w-24 rounded-md bg-white/[0.04]" />
        </div>
      </div>

      {/* Table Container */}
      <Card className="bg-[#111111] border-[#222222] overflow-hidden">
        {/* Table Header Row */}
        <div className="h-10 px-6 border-b border-[#222222] bg-[#141414] flex items-center justify-between gap-4">
          <Skeleton className="h-3.5 w-28 bg-white/[0.06]" />
          <Skeleton className="h-3.5 w-32 bg-white/[0.06]" />
          <Skeleton className="h-3.5 w-24 bg-white/[0.06] hidden md:block" />
          <Skeleton className="h-3.5 w-20 bg-white/[0.06] hidden sm:block" />
          <Skeleton className="h-3.5 w-12 bg-white/[0.06]" />
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-[#1e1e1e]">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div
              key={i}
              className="h-14 px-6 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
            >
              {/* Status pill & name */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <Skeleton className="h-5 w-20 rounded-full bg-white/[0.07]" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-3.5 w-36 bg-white/[0.08]" />
                  <Skeleton className="h-2.5 w-24 bg-white/[0.04]" />
                </div>
              </div>

              {/* Timestamp / Trigger */}
              <div className="w-32 hidden md:block">
                <Skeleton className="h-3.5 w-24 bg-white/[0.05]" />
              </div>

              {/* Size / Frequency / Duration */}
              <div className="w-24 hidden sm:block">
                <Skeleton className="h-3.5 w-16 bg-white/[0.05]" />
              </div>

              {/* Action Button */}
              <div className="flex justify-end w-12">
                <Skeleton className="size-7 rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
