"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BacklifyStarterCard,
  BacklifyProCardAdapted,
} from "@/components/marketing/veyro-card";

export interface PricingSectionProps {
  className?: string;
  showCards?: boolean;
  onCycleChange?: (cycle: "monthly" | "annual") => void;
}

export function PricingSection({
  className,
  showCards = true,
  onCycleChange,
}: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleCycleSelect = (cycle: "monthly" | "annual") => {
    setBillingCycle(cycle);
    onCycleChange?.(cycle);
  };

  return (
    <section
      id="pricing"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-20",
        className
      )}
    >
      {/* ── Exact Pricing Header (Matching Supabase / Design Spec) ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
        {/* Left Column: Title + Two-Line Headline */}
        <div className="flex flex-col">
          <span className="font-sans text-2xl sm:text-[26px] font-normal text-[#8a8f98] mb-2 tracking-normal">
            Pricing
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[34px] font-medium text-[#f9fafb] tracking-[-0.02em] leading-[1.12]">
            Local checkpoints are free. Add
            <br />
            Cloud backups when you need them
          </h2>
        </div>

        {/* Right Column: Pill Toggle (Monthly / Annual 2 months free) */}
        <div className="flex items-center shrink-0 md:pb-1">
          <div className="inline-flex items-center p-1 rounded-full bg-[#121316] border border-[#222328] select-none">
            {/* Monthly Button */}
            <button
              type="button"
              onClick={() => handleCycleSelect("monthly")}
              className={cn(
                "px-4 py-1.5 text-xs sm:text-[13px] font-medium rounded-full transition-all duration-150 cursor-pointer",
                billingCycle === "monthly"
                  ? "bg-[#202126] text-white shadow-sm"
                  : "text-[#8a8f98] hover:text-white"
              )}
            >
              Monthly
            </button>

            {/* Annual Button */}
            <button
              type="button"
              onClick={() => handleCycleSelect("annual")}
              className={cn(
                "px-4 py-1.5 text-xs sm:text-[13px] font-medium rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                billingCycle === "annual"
                  ? "bg-[#202126] text-white shadow-sm"
                  : "text-[#8a8f98] hover:text-white"
              )}
            >
              <span>Annual</span>
              <span className="text-[#FFB31F]/90 font-medium">2 months free</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Exact Side-by-Side Pricing Cards Grid ── */}
      {showCards && (
        <div className="mt-14 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch justify-items-center max-w-4xl mx-auto">
            {/* Tier 1: Starter (Free) */}
            <div className="flex flex-col items-center w-full">
              <BacklifyStarterCard />
            </div>

            {/* Tier 2: Pro (Amber Brand Aesthetics) */}
            <div className="flex flex-col items-center w-full">
              <BacklifyProCardAdapted
                price={billingCycle === "annual" ? "$2.50" : "$3"}
                period={billingCycle === "annual" ? "// MONTH (BILLED ANNUALLY)" : "// MONTH"}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

