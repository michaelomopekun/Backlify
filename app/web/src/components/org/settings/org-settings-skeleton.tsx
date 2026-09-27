import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconBuilding,
  IconCopy,
  IconDatabase,
  IconServer,
} from "@tabler/icons-react";

export function OrgSettingsSkeleton() {
  return (
    <div className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full animate-in fade-in duration-200">
      <div className="max-w-4xl space-y-10 pb-16">
        {/* Real Static Page Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Organization Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage organization profile, team members, subscription limits, and danger zone.
          </p>
        </div>

      {/* ─── 1. General Information Card ─── */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#181818] border border-[#2a2a2a] text-[#888888]">
              <IconBuilding className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">General Information</h2>
              <p className="text-xs text-muted-foreground">
                Organization details and URL identifiers
              </p>
            </div>
          </div>
          {/* Dynamic Created Date (red box) */}
          <Skeleton className="h-3.5 w-32 bg-white/[0.08]" />
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Org Name (label is static, input value is red box) */}
            <div className="space-y-2">
              <Label className="text-xs text-[#aaaaaa]">
                Organization Name
              </Label>
              <div className="h-9 px-3 flex items-center bg-[#161616] border border-[#2c2c2c] rounded-md">
                <Skeleton className="h-4 w-48 bg-white/[0.08]" />
              </div>
            </div>

            {/* Org Slug (label is static, input value is red box) */}
            <div className="space-y-2">
              <Label className="text-xs text-[#aaaaaa]">
                Organization Slug
              </Label>
              <div className="h-9 px-3 flex items-center bg-[#161616] border border-[#2c2c2c] rounded-md">
                <Skeleton className="h-4 w-40 bg-white/[0.08]" />
              </div>
            </div>
          </div>

          {/* Org ID (label is static, input value is red box) */}
          <div className="space-y-2">
            <Label className="text-xs text-[#aaaaaa]">Organization ID</Label>
            <div className="flex items-center gap-2">
              <div className="h-9 px-3 flex-1 flex items-center bg-[#161616] border border-[#2c2c2c] rounded-md font-mono text-xs">
                <Skeleton className="h-3.5 w-44 bg-white/[0.08]" />
              </div>
              <Button
                disabled
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 border-[#2c2c2c] bg-[#161616] text-xs text-muted-foreground opacity-70"
              >
                <IconCopy className="size-3.5 mr-1.5" />
                Copy ID
              </Button>
            </div>
          </div>

          {/* Static Save Changes Button */}
          <div className="pt-2 flex justify-end">
            <Button
              disabled
              className="h-9 px-4 text-xs font-medium bg-white text-black opacity-70 cursor-not-allowed"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 2. Plan & Resource Usage Card ─── */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#181818] border border-[#2a2a2a] text-[#888888]">
              <IconDatabase className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Plan & Resource Usage</h2>
              <p className="text-xs text-muted-foreground">
                Active backup quotas, database limits, and storage usage
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-border/80 bg-muted/30 text-muted-foreground font-mono text-[11px] uppercase tracking-wider"
          >
            FREE TIER
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          {/* Storage Meter (label is static, usage string & bar are red box) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#aaaaaa] flex items-center gap-1.5">
                <IconServer className="size-3.5" /> Storage Consumption
              </span>
              <Skeleton className="h-3.5 w-40 bg-white/[0.08]" />
            </div>
            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <Skeleton className="h-full w-48 bg-amber-500/80" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Calculated across all live project backups and table archives. Upgrade to Pro for 50 GB.
            </p>
          </div>

          {/* Quota Highlights Grid (labels are static, numbers are red box) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Active Projects */}
            <div className="p-3.5 rounded-md bg-[#161616] border border-[#262626]">
              <div className="text-[11px] text-[#777777]">Active Projects</div>
              <div className="mt-1 flex items-baseline gap-1">
                <Skeleton className="h-5 w-8 bg-white/[0.08]" />
                <span className="text-xs text-[#555555] font-normal">/ 2 max</span>
              </div>
            </div>

            {/* Retention Window */}
            <div className="p-3.5 rounded-md bg-[#161616] border border-[#262626]">
              <div className="text-[11px] text-[#777777]">Retention Window</div>
              <div className="mt-1 flex items-baseline gap-1">
                <Skeleton className="h-5 w-14 bg-white/[0.08]" />
                <span className="text-xs text-[#555555] font-normal">FIFO</span>
              </div>
            </div>

            {/* Team Seats */}
            <div className="p-3.5 rounded-md bg-[#161616] border border-[#262626]">
              <div className="text-[11px] text-[#777777]">Team Seats</div>
              <div className="mt-1 flex items-baseline gap-1">
                <Skeleton className="h-5 w-6 bg-white/[0.08]" />
                <span className="text-xs text-[#555555] font-normal">/ Unlimited</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
