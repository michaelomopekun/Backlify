"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { OpenSourceSection } from "@/components/marketing/open-source-section";

export function PreviewOpenSourceClient() {
  const [colorTheme, setColorTheme] = React.useState<"amber" | "emerald">("amber");
  const [displayValue, setDisplayValue] = React.useState<string>("114.2K");
  const [showComparison, setShowComparison] = React.useState<boolean>(false);

  const presets = ["114.2K", "100K", "50K", "14.8K", "100%"];

  return (
    <div className="w-full">
      {/* ── Floating Controls Bar ── */}
      <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#121316]/90 border border-[#222328] backdrop-blur-md shadow-2xl">
          {/* Color Switcher */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8a8f98] font-medium">
              LED Color:
            </span>
            <div className="inline-flex items-center p-1 rounded-full bg-[#1b1c20] border border-[#2b2c32]">
              <button
                type="button"
                onClick={() => setColorTheme("amber")}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5",
                  colorTheme === "amber"
                    ? "bg-[#2a2b33] text-amber-400 shadow-sm font-semibold"
                    : "text-[#8a8f98] hover:text-white"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#ffb31f]" />
                Brand Amber
              </button>
              <button
                type="button"
                onClick={() => setColorTheme("emerald")}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5",
                  colorTheme === "emerald"
                    ? "bg-[#2a2b33] text-emerald-400 shadow-sm font-semibold"
                    : "text-[#8a8f98] hover:text-white"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#3ecf8e]" />
                Supabase Emerald
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8a8f98] font-medium hidden sm:inline">
              Presets:
            </span>
            <div className="inline-flex items-center gap-1">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDisplayValue(val)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded-md border transition-all cursor-pointer",
                    displayValue === val
                      ? "bg-[#272832] text-white border-amber-500/40"
                      : "bg-[#16171b] text-[#8a8f98] border-[#25262d] hover:text-white"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Image Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded-full border transition-all cursor-pointer",
                showComparison
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-[#1b1c20] text-[#8a8f98] border-[#2b2c32] hover:text-white"
              )}
            >
              {showComparison ? "Hide Reference" : "Compare Reference"}
            </button>
          </div>
        </div>

        {/* Reference Image Panel */}
        {showComparison && (
          <div className="mt-4 p-4 rounded-2xl bg-[#0e0f12] border border-[#23252d] flex flex-col items-center">
            <span className="text-xs font-mono text-[#8a8f98] mb-3 uppercase tracking-wider">
              Original Supabase Reference:
            </span>
            <div className="overflow-hidden rounded-lg border border-[#2b2d35] max-w-3xl w-full">
              <img
                src="/supabase-open-source-reference.png"
                alt="Supabase Reference"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Main Open Source Section Showcase ── */}
      <div className="w-full border-t border-[#1e2026] mt-6">
        <OpenSourceSection
          starCount={displayValue}
          colorTheme={colorTheme}
        />
      </div>
    </div>
  );
}
