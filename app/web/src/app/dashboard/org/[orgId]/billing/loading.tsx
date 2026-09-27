import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function OrgBillingLoading() {
  return (
    <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full">
      <div className="w-full max-w-5xl space-y-10 sm:space-y-12 pb-24 font-sans animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground font-sans">
          Billing & Subscription
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your organization&apos;s subscription plan, view past invoices, and configure billing recipients.
        </p>
      </div>

      {/* Section 1: Plan Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-white/[0.08]" />
          <Skeleton className="h-3 w-48 bg-white/[0.04]" />
        </div>

        <div className="md:col-span-2">
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 bg-white/[0.08]" />
                <Skeleton className="h-3.5 w-40 bg-white/[0.04]" />
              </div>
              <Skeleton className="h-8.5 w-32 rounded bg-white/[0.08]" />
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <Skeleton className="h-16 w-full rounded-lg bg-white/[0.04]" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg bg-white/[0.03]" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Invoices Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-white/[0.08]" />
          <Skeleton className="h-3 w-48 bg-white/[0.04]" />
        </div>

        <div className="md:col-span-2">
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50 space-y-2">
              <Skeleton className="h-4.5 w-32 bg-white/[0.08]" />
              <Skeleton className="h-3 w-48 bg-white/[0.04]" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded bg-white/[0.03]" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </main>
  );
}
