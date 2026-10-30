"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ComplianceBadge {
  id: string;
  title: string;
  status: string;
}

const DEFAULT_BADGES: ComplianceBadge[] = [
  { id: "soc2", title: "SOC2 Type 2", status: "Certified" },
  { id: "hipaa", title: "HIPAA", status: "Compliant" },
  { id: "iso27001", title: "ISO 27001", status: "Certified" },
];

export interface SecurityTrustStripProps {
  headingText?: string;
  linkText?: string;
  linkHref?: string;
  badges?: ComplianceBadge[];
  accentColor?: "amber" | "emerald";
  className?: string;
}

export function SecurityTrustStrip({
  headingText = "We protect your data.",
  linkText = "More on Security",
  linkHref = "/security",
  badges = DEFAULT_BADGES,
  accentColor = "amber",
  className,
}: SecurityTrustStripProps) {
  return (
    <section
      id="security-trust"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-9 select-none",
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
        {/* ── Left Side: Trust Statement + Security Link ── */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[13.5px] sm:text-[14px]">
          <span className="text-[#ededed] font-normal">{headingText}</span>
          <Link
            href={linkHref}
            className={cn(
              "transition-colors duration-150 font-normal hover:underline underline-offset-4 cursor-pointer",
              accentColor === "amber"
                ? "text-amber-400 hover:text-amber-300 decoration-amber-400/40"
                : "text-[#3ecf8e] hover:text-[#4ee29f] decoration-[#3ecf8e]/40"
            )}
          >
            {linkText}
          </Link>
        </div>

        {/* ── Right Side: Compliance Badges with Checkmarks ── */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 sm:gap-8 lg:gap-10">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14px]"
            >
              {/* Subtle Checkmark */}
              <Check
                className="w-3.5 h-3.5 text-[#8a8f98] shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="font-medium text-[#ededed]">{badge.title}</span>
              <span className="text-[#8a8f98] font-normal">{badge.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
