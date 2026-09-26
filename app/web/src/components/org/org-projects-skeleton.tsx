import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { IconSearch, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function OrgProjectsSkeleton() {
  return (
    <div className="flex-1 px-8 lg:px-12 py-8 max-w-[1600px] w-full animate-in fade-in duration-200">
      <h1 className="text-[26px] font-normal tracking-tight text-white mb-8">Projects</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Projects Toolbar & Cards */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Static Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#555555]" />
                <input
                  disabled
                  type="text"
                  placeholder="Search for a project"
                  className="h-8 pl-8 pr-3 w-56 bg-[#111111] border border-[#222222] rounded-md text-[12px] text-white placeholder-[#555555] focus:outline-none"
                />
              </div>

              <button
                disabled
                type="button"
                className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-[#888888] bg-[#111111] border border-[#222222] rounded-md font-mono"
              >
                <span>Status</span>
                <IconChevronDown className="size-3 text-[#666666]" />
              </button>
            </div>

            <Button disabled size="sm" className="h-8 gap-1.5 opacity-70">
              <IconPlus className="size-3.5" />
              <span>New Project</span>
            </Button>
          </div>

          {/* Project Cards Grid Skeleton — only the cards waiting for DB are skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="p-5 bg-[#111111] border-[#222222] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center">
                      <div className="size-3 rounded-full bg-zinc-700 animate-pulse" />
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
            <h3 className="text-xs font-mono uppercase text-muted-foreground">Storage Quota</h3>
            <Skeleton className="h-2 w-full rounded bg-white/[0.05]" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <Skeleton className="h-3 w-16 bg-white/[0.04]" />
              <Skeleton className="h-3 w-20 bg-white/[0.04]" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
