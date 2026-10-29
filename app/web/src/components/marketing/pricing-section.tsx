"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PricingHeaderProps {
  className?: string;
  onCycleChange?: (cycle: "monthly" | "annual") => void;
}

export function PricingSection({ className, onCycleChange }: PricingHeaderProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleCycleSelect = (cycle: "monthly" | "annual") => {
    setBillingCycle(cycle);
    onCycleChange?.(cycle);
  };

  return (
    <section
      id="pricing"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-12",
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
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#f9fafb] tracking-[-0.02em] leading-[1.12]">
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
              <span className="text-[#3b82f6] font-medium">2 months free</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
