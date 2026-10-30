"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

export interface ComplianceBadge {
  id: string;
  title: string;
  status: string;
}

export const BACKLIFY_SECURITY_BADGES: ComplianceBadge[] = [
  { id: "aes256", title: "AES-256-GCM", status: "Encrypted" },
  { id: "soc2", title: "SOC2 Type 2", status: "Certified" },
  { id: "hipaa", title: "HIPAA", status: "Compliant" },
  { id: "iso27001", title: "ISO 27001", status: "Certified" },
];

export const BACKLIFY_ZERO_KNOWLEDGE_BADGES: ComplianceBadge[] = [
  { id: "zero-knowledge", title: "Zero-Knowledge", status: "Architecture" },
  { id: "aes256", title: "AES-256-GCM", status: "At Rest & Transit" },
  { id: "soc2", title: "SOC2 Type 2", status: "Certified" },
  { id: "hipaa", title: "HIPAA", status: "Compliant" },
];

export interface SecurityTrustStripProps {
  headingText?: string;
  linkText?: string;
  linkHref?: string;
  badges?: ComplianceBadge[];
  accentColor?: "amber" | "emerald";
  showShieldIcon?: boolean;
  className?: string;
}

export function SecurityTrustStrip({
  headingText = "Your data stays strictly under your control.",
  linkText = "More on Security",
  linkHref = "/security",
  badges = BACKLIFY_SECURITY_BADGES,
  accentColor = "amber",
  showShieldIcon = false,
  className,
}: SecurityTrustStripProps) {
  const isAmber = accentColor === "amber";

  return (
    <section
      id="security-trust"
      aria-label="Security and Compliance Certifications"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-7 sm:py-8 select-none",
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
        {/* ── Left Side: Trust Statement + Security Link ── */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-[13.5px] sm:text-[14px]">
          {showShieldIcon && (
            <ShieldCheck
              className={cn(
                "w-4 h-4 shrink-0",
                isAmber ? "text-[#FFB31F]" : "text-[#3ecf8e]"
              )}
              aria-hidden="true"
            />
          )}
          <span className="text-[#ededed] font-normal tracking-[-0.01em]">
            {headingText}
          </span>
          <Link
            href={linkHref}
            className={cn(
              "group inline-flex items-center gap-1 font-normal transition-colors duration-150 underline-offset-4 hover:underline cursor-pointer",
              isAmber
                ? "text-[#FFB31F] hover:text-[#FFAF1A] decoration-[#FFB31F]/40"
                : "text-[#3ecf8e] hover:text-[#4ee29f] decoration-[#3ecf8e]/40"
            )}
          >
            <span>{linkText}</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ── Right Side: Compliance & Security Badges ── */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 sm:gap-7 lg:gap-8">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14px] transition-colors duration-150"
            >
              {/* Subtle Checkmark */}
              <Check
                className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-colors",
                  isAmber ? "text-[#FFB31F]/80" : "text-[#3ecf8e]/80"
                )}
                strokeWidth={2.25}
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
