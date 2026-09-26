import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SettingsSkeleton() {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-200">
      {/* Real Static Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
          Project Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure project settings, storage targets, and retention policies.
        </p>
      </div>

      {/* General Settings Card */}
      <Card className="p-6 bg-[#111111] border-[#222222] space-y-6">
        <div>
          <h2 className="text-base font-medium text-foreground">General Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your project name and identification.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-muted-foreground">Project Name</label>
            <Skeleton className="h-10 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-muted-foreground">Project ID</label>
            <Skeleton className="h-10 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
          </div>
        </div>
      </Card>

      {/* Database Connection Card */}
      <Card className="p-6 bg-[#111111] border-[#222222] space-y-6">
        <div>
          <h2 className="text-base font-medium text-foreground">Database Connection</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Direct connection string and credentials.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-muted-foreground">Connection String (URI)</label>
          <Skeleton className="h-10 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
        </div>
      </Card>
    </div>
  );
}
