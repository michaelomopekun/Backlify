import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function OrgProjectsSkeleton() {
  return (
    <div className="flex-1 px-8 lg:px-12 py-8 max-w-[1600px] w-full animate-in fade-in duration-200">
      <Skeleton className="h-8 w-36 mb-8 bg-white/[0.09]" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Projects Toolbar & Cards */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Toolbar Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-56 rounded-md bg-white/[0.04] border border-[#222222]" />
              <Skeleton className="h-8 w-24 rounded-md bg-white/[0.04] border border-[#222222]" />
              <Skeleton className="h-8 w-20 rounded-md bg-white/[0.04] border border-[#222222]" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md bg-white/[0.08]" />
          </div>

          {/* Project Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="p-5 bg-[#111111] border-[#222222] space-y-4 hover:border-[#333333] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center">
                      <Skeleton className="size-4 rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 bg-white/[0.08]" />
                      <Skeleton className="h-3 w-20 bg-white/[0.04]" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full bg-white/[0.06]" />
                </div>

                <div className="pt-2 border-t border-[#1c1c1c] flex items-center justify-between text-xs">
                  <Skeleton className="h-3 w-28 bg-white/[0.04]" />
                  <Skeleton className="h-3 w-16 bg-white/[0.04]" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Org Usage / Limits Card Skeleton */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
            <Skeleton className="h-4 w-28 bg-white/[0.08]" />
            <Skeleton className="h-2 w-full rounded bg-white/[0.05]" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 bg-white/[0.04]" />
              <Skeleton className="h-3 w-20 bg-white/[0.04]" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
