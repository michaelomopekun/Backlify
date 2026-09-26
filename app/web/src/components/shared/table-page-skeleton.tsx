import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconSearch } from "@tabler/icons-react";

interface TablePageSkeletonProps {
  title: string;
  description: string;
  actionLabel?: string;
  searchPlaceholder?: string;
  columns?: string[];
  hasStats?: boolean;
  statCount?: number;
  rowCount?: number;
}

export function TablePageSkeleton({
  title,
  description,
  actionLabel,
  searchPlaceholder = "Search...",
  columns = ["Status", "Name / ID", "Created", "Size", "Actions"],
  hasStats = false,
  statCount = 3,
  rowCount = 6,
}: TablePageSkeletonProps) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Real Static Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        {actionLabel && (
          <div className="flex items-center gap-3">
            <Button disabled variant="default" size="sm" className="opacity-70 cursor-not-allowed">
              {actionLabel}
            </Button>
          </div>
        )}
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

      {/* Real Static Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            disabled
            type="text"
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-4 rounded-md bg-[#111111] border border-[#222222] text-xs text-muted-foreground placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <Card className="bg-[#111111] border-[#222222] overflow-hidden">
        {/* Real Static Table Header Row */}
        <div className="h-10 px-6 border-b border-[#222222] bg-[#141414] flex items-center justify-between gap-4 text-xs font-mono uppercase text-muted-foreground">
          {columns.map((col, idx) => (
            <span
              key={col}
              className={
                idx === 0
                  ? "w-28 text-left"
                  : idx === 1
                  ? "flex-1 text-left"
                  : idx === columns.length - 1
                  ? "w-12 text-right"
                  : "w-24 text-left hidden sm:inline-block"
              }
            >
              {col}
            </span>
          ))}
        </div>

        {/* Table Body: ONLY the rows waiting for data show skeletons */}
        <div className="divide-y divide-[#1e1e1e]">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div
              key={i}
              className="h-14 px-6 flex items-center justify-between gap-4"
            >
              {/* Status pill & name */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <Skeleton className="h-5 w-20 rounded-full bg-white/[0.07]" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-3.5 w-36 bg-white/[0.08]" />
                  <Skeleton className="h-2.5 w-24 bg-white/[0.04]" />
                </div>
              </div>

              <div className="w-24 hidden sm:block">
                <Skeleton className="h-3.5 w-20 bg-white/[0.05]" />
              </div>

              <div className="w-24 hidden sm:block">
                <Skeleton className="h-3.5 w-16 bg-white/[0.05]" />
              </div>

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
