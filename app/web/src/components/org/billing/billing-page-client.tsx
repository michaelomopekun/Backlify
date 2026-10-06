"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  IconCreditCard,
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconExternalLink,
  IconDownload,
  IconAlertCircle,
  IconDatabase,
  IconServer,
  IconClock,
  IconCalendar,
  IconMail,
  IconReceipt,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { BILLING_CONFIG } from "shared";

export interface InvoiceItem {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string | null;
  hostedUrl?: string | null;
}

export interface BillingPageProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    billingProvider?: string | null;
    subscriptionId?: string | null;
    customerId?: string | null;
    subscriptionStatus?: string | null;
    subscriptionEndsAt?: Date | string | null;
    billingEmail?: string | null;
    projectsCount: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function BillingPageClient({ organization, user }: BillingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPro = organization.plan === "pro";

  // Upgrade modal & Portal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  // Billing email state
  const initialEmail = organization.billingEmail || user.email || "";
  const [initialEmailState, setInitialEmailState] = useState(initialEmail);
  const [billingEmail, setBillingEmail] = useState(initialEmail);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const hasEmailChanges = billingEmail.trim().toLowerCase() !== initialEmailState.trim().toLowerCase();

  // Check URL query parameters for checkout return & upgrade intent
  useEffect(() => {
    const billingParam = searchParams.get("billing");
    if (billingParam === "success") {
      toast.success("🎉 Upgrade successful! Your organization is now on the Pro Plan.");
      router.replace(window.location.pathname);
    } else if (billingParam === "canceled") {
      toast.info("Checkout was canceled.");
      router.replace(window.location.pathname);
    }

    if (searchParams.get("upgrade") === "true") {
      setIsUpgradeModalOpen(true);
    }
  }, [searchParams, router]);

  // Fetch past invoices
  useEffect(() => {
    setIsLoadingInvoices(true);
    fetch(`/api/billing/invoices?orgId=${organization.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        }
      })
      .catch((err) => {
        console.error("Error loading invoices:", err);
      })
      .finally(() => {
        setIsLoadingInvoices(false);
      });
  }, [organization.id]);

  // Handle Stripe Customer Portal
  const handleOpenPortal = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/billing/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: organization.id }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.info(data.error || "Subscription management is available through your provider.");
        setIsPortalLoading(false);
      }
    } catch {
      toast.error("Failed to connect to billing portal.");
      setIsPortalLoading(false);
    }
  };

  // Handle Save Billing Email
  const handleSaveBillingEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingEmail.trim()) {
      setEmailError("Email cannot be empty.");
      return;
    }

    setIsSavingEmail(true);
    setEmailError(null);
    setIsEmailSaved(false);

    try {
      const res = await fetch(`/api/organization/${organization.id}/billing-email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingEmail: billingEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update billing email");
      }

      setInitialEmailState(billingEmail.trim());
      setIsEmailSaved(true);
      toast.success("Billing email updated successfully.");
      router.refresh();
      setTimeout(() => setIsEmailSaved(false), 2500);
    } catch (err: any) {
      setEmailError(err?.message || "Failed to update billing email.");
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-10 sm:space-y-12 pb-24 font-sans">
      {/* ── Page Header ── */}
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
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground font-sans">Subscription Plan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Each organization has its own subscription plan, billing cycle, and backup resource quotas.
          </p>
        </div>

        <div className="md:col-span-2">
          <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
            <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold text-foreground font-sans">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </h3>
                  {isPro ? (
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
                      PRO TIER
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-border/80 bg-muted/40 text-muted-foreground font-mono text-[10px] uppercase tracking-wider"
                    >
                      FREE TIER
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPro
                    ? `Active subscription · ${organization.billingProvider === "paystack" ? "₦2,000 / month" : "$3 / month"}`
                    : "Free Tier (Active) · 1 of 1 Free Organizations used"}
                </p>
              </div>

              {isPro ? (
                <Button
                  size="sm"
                  onClick={handleOpenPortal}
                  disabled={isPortalLoading}
                  className="h-8.5 px-3.5 text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors shrink-0"
                >
                  {isPortalLoading ? (
                    <>
                      <IconLoader2 className="size-3.5 mr-1.5 animate-spin text-black" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Manage Subscription
                      <IconExternalLink className="size-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="h-8.5 px-3.5 text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors shrink-0"
                >
                  <IconSparkles className="size-3.5 mr-1.5 text-black" />
                  Upgrade to Pro
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Notice Banner */}
              {!isPro ? (
                <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] text-xs text-muted-foreground flex items-start gap-3">
                  <IconAlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      This organization is limited by the included Free usage.
                    </p>
                    <p className="text-[11.5px] leading-relaxed">
                      Free tier organizations are capped at 2 databases and 50 MB backup storage with daily schedules. To run hourly automated backups, unlimited disaster recovery drills, and up to 50 databases, upgrade to Pro.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-3">
                  <IconCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-300">
                      Pro subscription active with full enterprise features.
                    </p>
                    <p className="text-[11.5px] text-emerald-400/80 mt-0.5">
                      Your organization has 50 GB storage, hourly backups, custom cron schedules, and unlimited disaster recovery drills enabled.
                    </p>
                  </div>
                </div>
              )}

              {/* Plan Quotas Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <IconDatabase className="size-3.5" /> Databases
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {organization.projectsCount}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      / {isPro ? "50 max" : "2 max"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <IconServer className="size-3.5" /> Included Storage
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {isPro ? "50 GB" : "50 MB"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <IconClock className="size-3.5" /> Backup Frequency
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {isPro ? "Hourly" : "Daily (24h)"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0e0e0e] border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <IconCalendar className="size-3.5" /> Retention
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {isPro ? "30+ Days" : "7 Days"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Section 2: Past Invoices ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground font-sans">Past Invoices</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Invoices are generated upon subscription renewal or plan changes. Download official PDF receipts for your accounting and tax records.
          </p>
        </div>

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

            <CardContent className="p-0">
              {isLoadingInvoices ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
                  <span>Loading invoice history…</span>
                </div>
              ) : invoices.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="size-10 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
                    <IconReceipt className="size-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">No invoices yet</p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    When your organization upgrades or renews its monthly subscription, receipts will be listed here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e0e0e] border-b border-border/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-3 px-5 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Amount</th>
                        <th className="py-3 px-4 font-medium">Invoice Number</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-5 text-right font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-3.5 px-5 text-foreground font-medium">
                            {new Date(inv.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-foreground font-mono">
                            {inv.currency === "NGN" ? "₦" : "$"}
                            {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11.5px]">
                            {inv.number}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {inv.pdfUrl || inv.hostedUrl ? (
                              <a
                                href={inv.pdfUrl || inv.hostedUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                              >
                                <IconDownload className="size-3.5" />
                                <span>PDF</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground/40 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Section 3: Billing Email Recipient ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground font-sans">Billing Email Recipient</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All billing correspondence, renewal notices, and payment receipts will be sent to this email address.
          </p>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSaveBillingEmail}>
            <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billing-email" className="text-xs font-medium text-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <IconMail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="billing-email"
                      type="email"
                      placeholder="finance@company.com"
                      value={billingEmail}
                      onChange={(e) => {
                        setBillingEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      className="h-9.5 pl-9 bg-[#080808] border-input text-xs sm:text-sm text-foreground"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Enter the primary finance, accounting, or founder email for this organization.
                  </p>
                </div>

                {emailError && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <IconAlertCircle className="size-4 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/20 border-t border-border/50 flex items-center justify-end">
                <Button
                  size="sm"
                  type="submit"
                  disabled={isSavingEmail || (!hasEmailChanges && !isEmailSaved)}
                  className="h-8.5 px-4 text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingEmail ? (
                    <>
                      <IconLoader2 className="size-3.5 mr-1.5 animate-spin text-black" />
                      Saving...
                    </>
                  ) : isEmailSaved ? (
                    <span className="flex items-center gap-1.5">
                      <IconCheck className="size-3.5 text-black" />
                      Saved
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>

      {/* ── Upgrade Dialog Modal ── */}
      <UpgradeDialog
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        orgId={organization.id}
      />
    </div>
  );
}
