import { Skeleton } from "@/components/ui/skeleton";
import { ProjectOverviewSkeleton } from "@/components/projects/overview/overview-skeleton";

export function DashboardShellSkeleton() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0c0c0c] text-foreground">
      {/* Topbar Skeleton */}
      <header className="flex h-12 items-center gap-3 px-4 border-b border-[#222222] shrink-0 bg-[#0e0e0e] z-30">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded bg-white/[0.08]" />
          <span className="text-zinc-600 font-light text-sm">/</span>
          <Skeleton className="h-5 w-24 rounded bg-white/[0.06]" />
          <span className="text-zinc-600 font-light text-sm">/</span>
          <Skeleton className="h-5 w-32 rounded bg-white/[0.08]" />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-7 w-20 rounded bg-white/[0.05]" />
          <Skeleton className="size-7 rounded-full bg-white/[0.08]" />
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-56 border-r border-[#222222] bg-[#0d0d0d] hidden md:flex flex-col p-3 space-y-4">
          <div className="space-y-1.5 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 h-9 px-3 rounded-md bg-transparent">
                <Skeleton className="size-4 rounded bg-white/[0.06]" />
                <Skeleton className="h-3.5 w-24 bg-white/[0.05]" />
              </div>
            ))}
          </div>

          <div className="border-t border-[#1e1e1e] pt-3">
            <div className="flex items-center gap-3 h-9 px-3">
              <Skeleton className="size-4 rounded bg-white/[0.06]" />
              <Skeleton className="h-3.5 w-28 bg-white/[0.05]" />
            </div>
          </div>

          <div className="mt-auto border-t border-[#1e1e1e] pt-3 flex items-center gap-3 px-2">
            <Skeleton className="size-7 rounded-full bg-white/[0.08]" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-20 bg-white/[0.06]" />
              <Skeleton className="h-2.5 w-28 bg-white/[0.04]" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#0c0c0c]">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 xl:px-12 pt-6 sm:pt-8 pb-16">
            <ProjectOverviewSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
