import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  IconDatabase,
  IconServer,
  IconClock,
  IconCalendar,
} from "@tabler/icons-react";

export default function OrgBillingLoading() {
  return (
    <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1400px] w-full">
      <div className="w-full max-w-5xl space-y-10 sm:space-y-12 pb-24 font-sans animate-in fade-in duration-200">
        {/* ── Page Header (Static) ── */}
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground font-sans">
            Billing & Subscription
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your organization&apos;s subscription plan, view past invoices, and configure billing recipients.
          </p>
        </div>

        {/* ── Section 1: Subscription Plan ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Static Left Column */}
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground font-sans">Subscription Plan</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each organization has its own subscription plan, billing cycle, and backup resource quotas.
            </p>
          </div>

          {/* Right Column Card */}
          <div className="md:col-span-2">
            <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
              <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-5 w-24 bg-white/[0.08]" />
                    <Skeleton className="h-4 w-16 rounded bg-white/[0.05]" />
                  </div>
                  <Skeleton className="h-3.5 w-56 bg-white/[0.04]" />
                </div>
                <Skeleton className="h-8.5 w-32 rounded bg-white/[0.08]" />
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {/* Notice Banner Placeholder */}
                <Skeleton className="h-16 w-full rounded-lg bg-white/[0.04]" />

                {/* Quotas Grid: Static labels with dynamic value placeholders */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <IconDatabase className="size-3.5" /> Databases
                    </div>
                    <Skeleton className="h-5 w-14 bg-white/[0.08] mt-1" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <IconServer className="size-3.5" /> Included Storage
                    </div>
                    <Skeleton className="h-5 w-14 bg-white/[0.08] mt-1" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <IconClock className="size-3.5" /> Backup Frequency
                    </div>
                    <Skeleton className="h-5 w-20 bg-white/[0.08] mt-1" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <IconCalendar className="size-3.5" /> Retention
                    </div>
                    <Skeleton className="h-5 w-16 bg-white/[0.08] mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Section 2: Past Invoices ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Static Left Column */}
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground font-sans">Past Invoices</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Invoices are generated upon subscription renewal or plan changes. Download official PDF receipts for your accounting and tax records.
            </p>
          </div>

          {/* Right Column Card */}
          <div className="md:col-span-2">
            <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
              <CardHeader className="p-5 sm:p-6 border-b border-border/50">
                <CardTitle className="text-sm font-semibold text-foreground font-sans">
                  Payment History
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Invoices paid by credit card or bank transfer
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded bg-white/[0.03]" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Section 3: Billing Email Recipient ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Static Left Column */}
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground font-sans">Billing Email Recipient</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All billing correspondence, renewal notices, and payment receipts will be sent to this email address.
            </p>
          </div>

          {/* Right Column Card */}
          <div className="md:col-span-2">
            <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">
                    Email address
                  </Label>
                  <Skeleton className="h-9.5 w-full rounded-md bg-white/[0.04]" />
                  <p className="text-[11px] text-muted-foreground">
                    Enter the primary finance, accounting, or founder email for this organization.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/20 border-t border-border/50 flex items-center justify-end">
                <Button
                  disabled
                  size="sm"
                  className="h-8.5 px-4 text-xs font-medium bg-white text-black opacity-50 cursor-not-allowed"
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
