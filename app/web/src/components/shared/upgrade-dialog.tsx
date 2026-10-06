"use client";

import { useState, useEffect } from "react";
import {
  IconSparkles,
  IconCheck,
  IconLoader2,
  IconCreditCard,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocalizedPricing } from "@/hooks/use-localized-pricing";

export interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  defaultCurrency?: "USD" | "NGN";
}

export function UpgradeDialog({
  open,
  onOpenChange,
  orgId,
  defaultCurrency,
}: UpgradeDialogProps) {
  const localized = useLocalizedPricing();
  const selectedCurrency = defaultCurrency || localized.currency;
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!orgId) {
      toast.error("Organization ID is required.");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      if (selectedCurrency === "NGN") {
        // Paystack (₦2,000 / month)
        const res = await fetch("/api/billing/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId }),
        });
        const data = await res.json();
        if (data.success && data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          toast.error(data.error || "Failed to initialize Paystack checkout.");
          setIsCheckoutLoading(false);
        }
      } else {
        // Stripe ($3 / month)
        const res = await fetch("/api/billing/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || "Failed to initialize Stripe checkout.");
          setIsCheckoutLoading(false);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate payment gateway.");
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#111111] border-[#222222] text-white p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <IconSparkles className="size-4" />
            </div>
            <DialogTitle className="text-base font-semibold">Upgrade to Backlify Pro</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#888888]">
            Automate your database resilience with high-frequency backups, automated disaster recovery drills, and expanded cloud storage.
          </DialogDescription>
        </DialogHeader>

        {/* Single Localized Plan Display (Anonymous PPP - No Currency Toggles) */}
        <div className="my-4 p-4 rounded-lg bg-[#141414] border border-[#242424] flex items-baseline justify-between">
          <div>
            <div className="text-xs text-[#888888] font-medium">Pro Subscription</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {selectedCurrency === "NGN" ? "₦2,000" : "$3"}
              <span className="text-xs text-[#888888] font-normal"> / month</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Billed monthly
          </span>
        </div>

        {/* Pro Benefits list */}
        <div className="space-y-2 py-1 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span><strong>50 GB Cloud Storage</strong> (1,000x Free Tier limit)</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span><strong>Hourly Backups</strong> & continuous snapshot scheduling</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span><strong>Automated Disaster Recovery Drills</strong> (Headless TOC audits)</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span><strong>Custom Webhooks</strong> (Discord & Slack real-time incident alerts)</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span><strong>Custom S3 / Cloudflare R2 Vaults</strong> (Bring Your Own Storage)</span>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-col sm:flex-col gap-2">
          <Button
            type="button"
            onClick={handleCheckout}
            disabled={isCheckoutLoading}
            className="w-full h-10 bg-white text-black hover:bg-neutral-200 font-medium text-xs flex items-center justify-center gap-2"
          >
            {isCheckoutLoading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Connecting to {selectedCurrency === "NGN" ? "Paystack" : "Stripe"}...</span>
              </>
            ) : (
              <>
                <IconCreditCard className="size-4" />
                <span>
                  Pay {selectedCurrency === "NGN" ? "₦2,000 / month with Paystack" : "$3 / month with Stripe"}
                </span>
              </>
            )}
          </Button>
          <p className="text-[11px] text-center text-[#666666]">
            {selectedCurrency === "NGN"
              ? "Secured by Paystack. Supports Nigerian Cards, Bank Transfer & USSD."
              : "Secured by Stripe. Cancel anytime from your organization dashboard."}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
