"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MarketingRailsLayoutProps {
  children: React.ReactNode;
  className?: string;
  railWidth?: string; // e.g. "w-10 xl:w-12"
}

/**
 * Technical blueprint layout with diagonal-hatched side rails flanking the marketing container.
 * Automatically hidden on screen sizes <= 390px.
 */
export function MarketingRailsLayout({
  children,
  className,
}: MarketingRailsLayoutProps) {
  return (
    <div className={cn("relative min-h-screen bg-[#0a0a0a] text-[#f9fafb] flex justify-center w-full", className)}>
      {/* ── Left Blueprint Rail (Hidden at <= 390px) ── */}
      <div
        aria-hidden="true"
        className="blueprint-rail hidden min-[391px]:block w-10 2xl:w-12 shrink-0 border-r border-[#1b1e24] border-l border-[#14161a] select-none pointer-events-none self-stretch"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.05) 0px,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px,
            transparent 7px
          )`,
        }}
      />

      {/* ── Main Center Content Column ── */}
      <div className="w-full max-w-[1360px] flex flex-col relative z-10 shrink min-w-0">
        {children}
      </div>

      {/* ── Right Blueprint Rail (Hidden at <= 390px) ── */}
      <div
        aria-hidden="true"
        className="blueprint-rail hidden min-[391px]:block w-10 2xl:w-12 shrink-0 border-l border-[#1b1e24] border-r border-[#14161a] select-none pointer-events-none self-stretch"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.05) 0px,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px,
            transparent 7px
          )`,
        }}
      />
    </div>
  );
}
