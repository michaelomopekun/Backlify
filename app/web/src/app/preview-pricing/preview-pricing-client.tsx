"use client";

import { useState } from "react";
import { VeyroProCard, BacklifyProCardAdapted } from "@/components/marketing/veyro-card";
import { cn } from "@/lib/utils";

export function PreviewPricingClient() {
  const [patternMode, setPatternMode] = useState<"exact" | "brand">("brand");
  const [opacity, setOpacity] = useState<number>(0.95);

  return (
    <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-2 pb-24">
      {/* ── Texture Pattern Controls ── */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-10 p-3 rounded-2xl bg-[#121316]/80 border border-[#222328] backdrop-blur-sm max-w-xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-wider text-[#8a8f98] font-medium pl-2">
          Pegboard Pattern:
        </span>
        <div className="inline-flex items-center p-1 rounded-full bg-[#1b1c20] border border-[#2b2c32]">
          <button
            type="button"
            onClick={() => setPatternMode("exact")}
            className={cn(
              "px-3.5 py-1 text-xs font-mono rounded-full transition-all duration-150 cursor-pointer",
              patternMode === "exact"
                ? "bg-[#2a2b33] text-white shadow-sm font-semibold"
                : "text-[#8a8f98] hover:text-white"
            )}
          >
            Exact 1:1 From Image
          </button>
          <button
            type="button"
            onClick={() => setPatternMode("brand")}
            className={cn(
              "px-3.5 py-1 text-xs font-mono rounded-full transition-all duration-150 cursor-pointer",
              patternMode === "brand"
                ? "bg-[#2a2b33] text-white shadow-sm font-semibold"
                : "text-[#8a8f98] hover:text-white"
            )}
          >
            Brand Colors (Amber & Cyan)
          </button>
        </div>

        <div className="flex items-center gap-2 pl-2">
          <span className="font-mono text-[11px] text-[#8a8f98]">Opacity:</span>
          {[0.75, 0.95, 1.0].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setOpacity(val)}
              className={cn(
                "px-2 py-0.5 text-[11px] font-mono rounded border transition-all cursor-pointer",
                opacity === val
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/50"
                  : "bg-transparent text-[#64748b] border-transparent hover:text-white"
              )}
            >
              {Math.round(val * 100)}%
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start justify-items-center">
        {/* Card 1: 1:1 Exact Veyro Pro (As in the provided image) */}
        <div className="flex flex-col items-center w-full">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium mb-5">
            1:1 Exact Veyro Pro (From Image)
          </span>
          <VeyroProCard
            patternVariant={patternMode === "exact" ? "exact" : "blue"}
            patternOpacity={opacity}
          />
        </div>

        {/* Card 2: Backlify Adaptation in Brand Amber */}
        <div className="flex flex-col items-center w-full">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium mb-5">
            Backlify Brand Amber Adaptation
          </span>
          <BacklifyProCardAdapted
            patternVariant={patternMode === "exact" ? "exact" : "amber"}
            patternOpacity={opacity}
          />
        </div>
      </div>
    </section>
  );
}

