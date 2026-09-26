import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SettingsSkeleton() {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-44 bg-white/[0.09]" />
        <Skeleton className="h-4 w-80 bg-white/[0.04]" />
      </div>

      {/* General Settings Card */}
      <Card className="p-6 bg-[#111111] border-[#222222] space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32 bg-white/[0.08]" />
          <Skeleton className="h-3.5 w-64 bg-white/[0.04]" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-white/[0.06]" />
            <Skeleton className="h-10 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-white/[0.06]" />
            <Skeleton className="h-10 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Skeleton className="h-9 w-28 rounded-md bg-white/[0.08]" />
        </div>
      </Card>

      {/* Database Connection Card */}
      <Card className="p-6 bg-[#111111] border-[#222222] space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-40 bg-white/[0.08]" />
          <Skeleton className="h-3.5 w-72 bg-white/[0.04]" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-white/[0.06]" />
          <Skeleton className="h-10 w-full rounded-md bg-white/[0.04] border border-[#222222]" />
        </div>
      </Card>
    </div>
  );
}
