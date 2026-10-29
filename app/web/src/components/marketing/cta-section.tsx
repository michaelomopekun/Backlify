"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CtaSectionProps {
  headline_first_half?: string;
  headline_second_half?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  buttonVariant?: "amber" | "emerald";
  className?: string;
}

export function CtaSection({
  headline_first_half = "Build in a weekend,",
  headline_second_half = "scale to millions",
  primaryCtaText = "Start your project",
  primaryCtaHref = "/signup",
  secondaryCtaText = "Request a demo",
  secondaryCtaHref = "mailto:support@dbdock.xyz",
  buttonVariant = "amber",
  className,
}: CtaSectionProps) {
  return (
    <section
      id="cta"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-36 select-none",
        "flex flex-col items-center justify-center text-center",
        className
      )}
    >
      {/* ── Headline: Muted First Half + Crisp White Second Half ── */}
      <h2 className="font-sans text-3xl sm:text-4xl lg:text-[42px] tracking-[-0.03em] leading-[1.18] mb-8">
        <span className="text-[#8a8f98] font-normal">{headline_first_half}</span>{" "}
        <span className="text-[#f9fafb] font-medium">{headline_second_half}</span>
      </h2>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Primary Action Button (Brand Amber or Supabase Emerald) */}
        <Link
          href={primaryCtaHref}
          className={cn(
            "inline-flex items-center justify-center px-4 h-[38px] rounded-[6px] text-[13.5px] transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]",
            buttonVariant === "amber"
              ? "bg-[#ffb31f] hover:bg-[#e69f16] text-[#000000] font-semibold"
              : "bg-[#04653b] hover:bg-[#077b49] text-white font-medium border border-[#0d8250]/40"
          )}
        >
          {primaryCtaText}
        </Link>

        {/* Secondary Action Button (Dark Secondary) */}
        <Link
          href={secondaryCtaHref}
          className={cn(
            "inline-flex items-center justify-center px-4 h-[38px] rounded-[6px] text-[13.5px] font-medium transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]",
            "bg-[#1b1c20] hover:bg-[#25272e] border border-[#2b2c32] hover:border-[#383a42] text-[#ededed] hover:text-white"
          )}
        >
          {secondaryCtaText}
        </Link>
      </div>
    </section>
  );
}

