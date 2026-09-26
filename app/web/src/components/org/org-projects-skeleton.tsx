import { Skeleton } from "@/components/ui/skeleton";
import {
  IconSearch,
  IconChevronDown,
  IconArrowsSort,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconDotsVertical,
  IconX,
} from "@tabler/icons-react";

export function OrgProjectsSkeleton() {
  return (
    <div className="flex-1 px-8 lg:px-12 py-8 max-w-[1600px] w-full animate-in fade-in duration-200">
      <h1 className="text-[26px] font-normal tracking-tight text-white mb-8">Projects</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left / Main Projects Section */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Static Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#555555]" />
              <input
                disabled
                type="text"
                placeholder="Search for a project"
                className="h-8 pl-8 pr-3 w-56 bg-[#111111] border border-[#222222] rounded-md text-[12px] text-white placeholder-[#555555] focus:outline-none"
              />
            </div>

            {/* Status dropdown filter */}
            <button
              disabled
              type="button"
              className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-[#888888] bg-[#111111] border border-[#222222] rounded-md font-mono"
            >
              <span>Status</span>
              <IconChevronDown className="size-3 text-[#666666]" />
            </button>

            {/* Sorted by dropdown */}
            <button
              disabled
              type="button"
              className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] text-[#888888] bg-[#111111] border border-[#222222] rounded-md font-mono"
            >
              <IconArrowsSort className="size-3.5 text-[#666666]" />
              <span>Sorted by name</span>
            </button>

            {/* View toggle & New project button */}
            <div className="ml-auto flex items-center gap-2.5">
              <div className="flex items-center border border-[#222222] bg-[#111111] rounded-md overflow-hidden p-0.5">
                <div className="p-1 rounded bg-[#222222] text-white">
                  <IconLayoutGrid className="size-3.5" />
                </div>
                <div className="p-1 rounded text-[#666666]">
                  <IconList className="size-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground font-medium text-[12px] opacity-90 cursor-not-allowed">
                <IconPlus className="size-3.5 stroke-[2.5]" />
                <span>New project</span>
              </div>
            </div>
          </div>

          {/* Projects Grid (Exact 3-column layout matching live page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col justify-between p-5 rounded-lg border border-[#1e1e1e] bg-[#111111] min-h-[160px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    {/* Dynamic Project Title Skeleton */}
                    <Skeleton className="h-4 w-28 bg-white/[0.08]" />
                    <span className="p-1 -mr-1 rounded text-[#555555]">
                      <IconDotsVertical className="size-3.5" />
                    </span>
                  </div>

                  {/* Dynamic Database URL / Host Skeleton */}
                  <Skeleton className="h-3.5 w-44 bg-white/[0.04] mt-1" />
                </div>

                {/* Static ACTIVE badge */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#242424] bg-[#161616] text-[#888888] tracking-wider">
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Aside: Exact Static Cards matching live page */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Free plan usage Card */}
          <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[13px] font-medium text-white">Free plan usage</h3>
                <p className="text-[11px] text-[#666666] mt-0.5">Current billing cycle</p>
              </div>
              <div className="flex items-center h-7 px-2.5 rounded-md border border-[#2a2a2a] bg-transparent text-white font-normal text-[11px]">
                Upgrade to Pro
              </div>
            </div>

            {/* Static labels with skeletons ONLY for the dynamic counts */}
            <div className="space-y-3 pt-1">
              {[
                { label: "Projects", limit: "2", width: "w-8" },
                { label: "Total backups", limit: "50", width: "w-10" },
                { label: "Storage used", limit: "50 MB", width: "w-14" },
                { label: "Active schedules", limit: "3", width: "w-8" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full border border-[#444444] shrink-0" />
                    <span className="text-[#888888]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11.5px] font-mono">
                    <Skeleton className={`h-3.5 ${item.width} bg-white/[0.08]`} />
                    <span className="text-[#555555]">/ {item.limit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Storage Quota Bar */}
            <div className="pt-2 border-t border-[#1e1e1e]/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#888888]">Storage limit</span>
                <Skeleton className="h-3 w-24 bg-white/[0.06]" />
              </div>
              <div className="h-1.5 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
                <Skeleton className="h-full w-20 bg-white/[0.08]" />
              </div>
            </div>
          </div>

          {/* Automated DR Drill Engine Notice Card (100% Static) */}
          <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-4 space-y-2.5 relative">
            <span className="absolute top-3.5 right-3.5 text-[#555555]">
              <IconX className="size-3.5" />
            </span>

            <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#2a2a2a] bg-[#181818] text-[#888888] font-semibold tracking-wider">
              NOTICE
            </span>

            <h4 className="text-[12.5px] font-medium text-white leading-snug pr-4">
              Automated DR Drill Engine
            </h4>

            <p className="text-[11.5px] text-[#666666] leading-relaxed">
              Scheduled point-in-time disaster recovery testing is now enabled for all PostgreSQL clusters.
            </p>

            <div className="pt-1">
              <div className="inline-flex h-7 px-3 text-[11px] items-center border border-[#2a2a2a] bg-[#161616] text-white rounded-md font-medium">
                Learn more
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
