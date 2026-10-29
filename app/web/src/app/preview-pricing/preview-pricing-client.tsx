"use client";

import { useState } from "react";
import {
  VeyroProCard,
  BacklifyProCardAdapted,
  BacklifyStarterCard,
} from "@/components/marketing/veyro-card";
import { cn } from "@/lib/utils";

export function PreviewPricingClient() {
  const [patternMode, setPatternMode] = useState<"exact" | "brand">("brand");
  const [opacity, setOpacity] = useState<number>(0.95);
  const [showVeyroRef, setShowVeyroRef] = useState<boolean>(false);

  return (
    <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-2 pb-24">
      {/* ── Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-12 p-3.5 rounded-2xl bg-[#121316]/90 border border-[#222328] backdrop-blur-md max-w-2xl mx-auto shadow-xl">
        <div className="flex items-center gap-2 pl-1">
          <span className="font-mono text-xs uppercase tracking-wider text-[#8a8f98] font-medium">
            Pro Pegboard:
          </span>
          <div className="inline-flex items-center p-1 rounded-full bg-[#1b1c20] border border-[#2b2c32]">
            <button
              type="button"
              onClick={() => setPatternMode("brand")}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded-full transition-all duration-150 cursor-pointer",
                patternMode === "brand"
                  ? "bg-[#2a2b33] text-white shadow-sm font-semibold"
                  : "text-[#8a8f98] hover:text-white"
              )}
            >
              Brand Amber
            </button>
            <button
              type="button"
              onClick={() => setPatternMode("exact")}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded-full transition-all duration-150 cursor-pointer",
                patternMode === "exact"
                  ? "bg-[#2a2b33] text-white shadow-sm font-semibold"
                  : "text-[#8a8f98] hover:text-white"
              )}
            >
              Exact 1:1 Image
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVeyroRef(!showVeyroRef)}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded-full border transition-all cursor-pointer",
              showVeyroRef
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-[#1b1c20] text-[#8a8f98] border-[#2b2c32] hover:text-white"
            )}
          >
            {showVeyroRef ? "Hide Veyro Reference" : "Show Veyro Reference"}
          </button>
        </div>
      </div>

      {/* ── Main Production Tier: Starter (Free) vs Pro ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch justify-items-center max-w-4xl mx-auto mb-16">
        {/* Tier 1: Backlify Starter (Free Plan - Clean, No Pro Aesthetics) */}
        <div className="flex flex-col items-center w-full">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-800/60 text-[#94a3b8] border border-zinc-700/50 font-medium mb-5">
            Free Plan · Clean Baseline (No Pro Aesthetics)
          </span>
          <BacklifyStarterCard />
        </div>

        {/* Tier 2: Backlify Pro (Featured Plan - With Brand Amber Aesthetics) */}
        <div className="flex flex-col items-center w-full">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 font-semibold mb-5">
            Pro Plan · Premium Amber Aesthetics
          </span>
          <BacklifyProCardAdapted
            patternVariant={patternMode === "exact" ? "exact" : "amber"}
            patternOpacity={opacity}
          />
        </div>
      </div>

      {/* ── Optional Reference Comparison ── */}
      {showVeyroRef && (
        <div className="mt-16 pt-12 border-t border-[#1e2026] flex flex-col items-center">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium mb-8">
            1:1 Exact Veyro Pro Reference (Sky Blue Theme)
          </span>
          <VeyroProCard
            patternVariant={patternMode === "exact" ? "exact" : "blue"}
            patternOpacity={opacity}
          />
        </div>
      )}
    </section>
  );
}

