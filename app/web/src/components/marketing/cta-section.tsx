"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-button";

export interface CtaSectionProps {
  headline_first_half?: string;
  headline_second_half?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  className?: string;
}

export function CtaSection({
  headline_first_half = "Ship in a weekend,",
  headline_second_half = "recover in seconds",
  primaryCtaText = "Start your project",
  primaryCtaHref = "/signup",
  secondaryCtaText = "Request a demo",
  secondaryCtaHref = "mailto:support@dbdock.xyz",
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

      {/* ── Action Buttons using ActionButton UI Component ── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Primary Action Button (Brand Amber) */}
        <ActionButton
          variant="amber"
          size="lg"
          borderRadius="8px"
          fontSize="14px"
          fontWeight="600"
          href={primaryCtaHref}
        >
          {primaryCtaText}
        </ActionButton>

        {/* Secondary Action Button (Dark Secondary) */}
        <ActionButton
          variant="dark"
          size="lg"
          borderRadius="8px"
          fontSize="14px"
          fontWeight="500"
          href={secondaryCtaHref}
        >
          {secondaryCtaText}
        </ActionButton>
      </div>
    </section>
  );
}
