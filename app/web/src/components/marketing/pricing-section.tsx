"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocalizedPricing, BillingPeriod } from "@/hooks/use-localized-pricing";
import {
  Sparkles,
  Database,
  Clock,
  ShieldCheck,
  Terminal,
  Lock,
  Zap,
  Bell,
  HardDrive,
  ArrowRight,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";

export function PricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const localized = useLocalizedPricing();

  const isAnnual = period === "annual";
  const isNgn = localized.currency === "NGN";

  // Pro price display
  const proDisplayMonthly = isNgn
    ? isAnnual
      ? `₦${Math.round(20000 / 12).toLocaleString()}`
      : "₦2,000"
    : isAnnual
    ? "$2.50"
    : "$3";

  const proAnnualBillingNote = isAnnual
    ? isNgn
      ? "₦20,000 billed annually (2 months free)"
      : "$30 billed annually (2 months free)"
    : "Billed monthly · Cancel anytime";

  return (
    <section id="pricing" className="relative w-full py-20 px-4 md:px-6">
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 w-[800px] h-[350px] opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.25), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Header section */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-4">
          <Sparkles className="size-3.5" />
          <span>TRANSPARENT PRICING</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Local checkpoints are free.<br />
          <span className="text-[#a1a1aa]">Add Cloud backups when you need them.</span>
        </h2>
        <p className="text-sm md:text-base text-[#888888] max-w-xl mx-auto">
          Start locally with full CLI access and BYO storage. Scale to automated cloud snapshots and continuous verification drills with Backlify Pro.
        </p>
      </div>

      {/* Segmented Billing Interval Toggle */}
      <div className="flex items-center justify-center mb-12">
        <div className="inline-flex items-center p-1 rounded-full bg-[#121316] border border-[#25282f] shadow-inner">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={cn(
              "px-5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer",
              period === "monthly"
                ? "bg-[#252830] text-white shadow-sm"
                : "text-[#888888] hover:text-neutral-300"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPeriod("annual")}
            className={cn(
              "px-5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer",
              period === "annual"
                ? "bg-[#252830] text-white shadow-sm"
                : "text-[#888888] hover:text-neutral-300"
            )}
          >
            <span>Yearly</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              -17% (2 mo free)
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {/* ── CARD 1: STARTER / FREE ── */}
        <div className="relative rounded-2xl bg-[#0e0f12] border border-[#20232a] p-7 flex flex-col justify-between hover:border-[#2e323b] transition-all duration-300">
          <div>
            <div className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider mb-3">
              // BACKLIFY STARTER
            </div>

            <div className="mb-2">
              <span className="text-4xl font-bold text-white tracking-tight">Free</span>
            </div>
            <p className="text-xs text-[#888888] mb-6 min-h-[36px]">
              Free forever for personal databases, CLI snapshots, and local development.
            </p>

            <Link href="/signup" className="w-full block">
              <ActionButton
                variant="dark"
                width="100%"
                size="md"
                className="w-full justify-center font-medium"
              >
                Start for free
              </ActionButton>
            </Link>

            <div className="border-t border-[#1f2228] my-6" />

            <div className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-semibold mb-4">
              FREE, FOREVER:
            </div>

            <ul className="space-y-3 text-xs text-[#a1a1aa]">
              <li className="flex items-center gap-2.5">
                <Sparkles className="size-3.5 text-neutral-400 shrink-0" />
                <span><strong>1 GB</strong> managed cloud storage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Database className="size-3.5 text-neutral-400 shrink-0" />
                <span><strong>2</strong> active database connections</span>
              </li>
              <li className="flex items-center gap-2.5">
                <HardDrive className="size-3.5 text-neutral-400 shrink-0" />
                <span><strong>1</strong> BYO bucket (AWS S3 / R2 / MinIO)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-3.5 text-neutral-400 shrink-0" />
                <span>Daily automated cloud backups</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="size-3.5 text-neutral-400 shrink-0" />
                <span><strong>7-day</strong> snapshot retention window</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Terminal className="size-3.5 text-neutral-400 shrink-0" />
                <span>Unlimited local CLI checkpoints</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Lock className="size-3.5 text-neutral-400 shrink-0" />
                <span>Client-side AES-256-GCM encryption</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── CARD 2: PRO (POPULAR / HIGHLIGHTED VEYRO-STYLE CARD) ── */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#181510] via-[#0f1013] to-[#0c0d10] border border-amber-500/40 p-7 flex flex-col justify-between shadow-[0_0_50px_rgba(245,158,11,0.12)] hover:border-amber-500/60 transition-all duration-300 md:-translate-y-2">
          {/* Subtle top amber highlight beam */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                // BACKLIFY PRO
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold uppercase">
                Recommended
              </span>
            </div>

            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-bold text-white tracking-tight">{proDisplayMonthly}</span>
              <span className="text-xs font-mono text-[#888888] ml-2">// MONTH</span>
            </div>

            <p className="text-xs text-amber-400/90 font-mono mb-6 min-h-[36px]">
              {proAnnualBillingNote}
            </p>

            <Link href="/signup?plan=pro" className="w-full block">
              <ActionButton
                variant="amber"
                width="100%"
                size="md"
                rightIcon={<ArrowRight className="size-3.5" />}
                className="w-full justify-center font-semibold shadow-lg shadow-amber-500/10"
              >
                Start with Pro
              </ActionButton>
            </Link>

            <div className="border-t border-amber-500/20 my-6" />

            <div className="text-[10px] font-mono tracking-widest text-amber-400/90 uppercase font-semibold mb-4">
              EVERYTHING IN STARTER, PLUS:
            </div>

            <ul className="space-y-3 text-xs text-neutral-200">
              <li className="flex items-center gap-2.5">
                <Sparkles className="size-3.5 text-amber-400 shrink-0" />
                <span><strong>50 GB</strong> managed storage (1,000x Free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Database className="size-3.5 text-amber-400 shrink-0" />
                <span><strong>50</strong> active database connections</span>
              </li>
              <li className="flex items-center gap-2.5">
                <HardDrive className="size-3.5 text-amber-400 shrink-0" />
                <span>Unlimited BYO storage vaults (S3, R2, GCS)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-3.5 text-amber-400 shrink-0" />
                <span>Hourly continuous snapshot scheduling</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="size-3.5 text-amber-400 shrink-0" />
                <span><strong>Automated DR Drills</strong> (Headless TOC verification)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="size-3.5 text-amber-400 shrink-0" />
                <span><strong>30-day retention</strong> & Point-in-Time recovery</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Bell className="size-3.5 text-amber-400 shrink-0" />
                <span>Real-time Slack & Discord incident webhooks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Terminal className="size-3.5 text-amber-400 shrink-0" />
                <span>Priority developer engineering support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── CARD 3: SCALE / ENTERPRISE ── */}
        <div className="relative rounded-2xl bg-[#0e0f12] border border-[#20232a] p-7 flex flex-col justify-between hover:border-[#2e323b] transition-all duration-300">
          <div>
            <div className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider mb-3">
              // BACKLIFY SCALE
            </div>

            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-bold text-white tracking-tight">Custom</span>
            </div>
            <p className="text-xs text-[#888888] mb-6 min-h-[36px]">
              For high-throughput clusters, large multi-region fleets, and enterprise compliance.
            </p>

            <Link href="mailto:support@backlify.space?subject=Backlify%20Scale%20Inquiry" className="w-full block">
              <ActionButton
                variant="dark"
                width="100%"
                size="md"
                className="w-full justify-center font-medium"
              >
                Talk to engineering
              </ActionButton>
            </Link>

            <div className="border-t border-[#1f2228] my-6" />

            <div className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-semibold mb-4">
              EVERYTHING IN PRO, PLUS:
            </div>

            <ul className="space-y-3 text-xs text-[#a1a1aa]">
              <li className="flex items-center gap-2.5">
                <HardDrive className="size-3.5 text-neutral-400 shrink-0" />
                <span><strong>Unlimited TB+</strong> managed cloud storage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Database className="size-3.5 text-neutral-400 shrink-0" />
                <span>Unlimited database connections & clusters</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="size-3.5 text-neutral-400 shrink-0" />
                <span>Multi-region geo-redundant replication</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="size-3.5 text-neutral-400 shrink-0" />
                <span>Dedicated backup worker isolation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-3.5 text-neutral-400 shrink-0" />
                <span>Custom compliance retention (up to 7 years)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Lock className="size-3.5 text-neutral-400 shrink-0" />
                <span>Custom 99.99% enterprise SLA guarantee</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Bell className="size-3.5 text-neutral-400 shrink-0" />
                <span>Dedicated Slack/Teams channel with core engineers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footnote statement */}
      <div className="max-w-3xl mx-auto mt-12 text-center text-xs text-[#71717a] font-mono">
        Local and customer-bucket checkpoints are outside Cloud backup limits. Encrypt snapshots on every plan with your own AES-256-GCM key.
      </div>
    </section>
  );
}

