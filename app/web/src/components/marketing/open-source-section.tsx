"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DotMatrixDisplay } from "./dot-matrix-display";

export interface OpenSourceSectionProps {
  headline?: string;
  description?: string;
  repoUrl?: string;
  starCount?: string;
  colorTheme?: "amber" | "emerald";
  className?: string;
}

export function OpenSourceSection({
  headline = "Open source from day one",
  description = "Backlify is built in the open because we believe critical infrastructure tools should be transparent, inspectable, and owned by the community. Read, contribute, self-host. You're never locked in, and always in control.",
  repoUrl = "https://github.com/michaelomopekun/Backlify",
  starCount = "114.2K",
  colorTheme = "amber",
  className,
}: OpenSourceSectionProps) {
  return (
    <section
      id="open-source"
      className={cn(
        "relative w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 py-20 lg:py-28 select-none",
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* ── Left Column: Headline, Narrative & GitHub CTA ── */}
        <div className="flex flex-col items-start lg:col-span-6 max-w-xl">
          {/* Main Display Headline */}
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#ededed] tracking-[-0.03em] leading-[1.14] mb-5">
            {headline}
          </h2>

          {/* Value Narrative Body */}
          <p className="font-sans text-[15px] sm:text-[16px] text-[#8a8f98] leading-[1.68] mb-8 font-normal">
            {description}
          </p>

          {/* GitHub Action Link Button */}
          <Link
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg",
              "bg-[#15171c] hover:bg-[#1f2228] border border-[#2a2c33] hover:border-[#3a3d46]",
              "text-[13.5px] font-medium text-[#ededed] hover:text-white transition-all duration-150 shadow-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50"
            )}
          >
            {/* GitHub Octocat Icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[#ededed] shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>View on GitHub</span>
          </Link>
        </div>

        {/* ── Right Column: Giant Scoreboard Dot-Matrix Display ── */}
        <div className="flex items-center justify-center lg:justify-end lg:col-span-6 w-full overflow-hidden">
          <DotMatrixDisplay
            value={starCount}
            colorTheme={colorTheme}
            interactive={true}
          />
        </div>
      </div>
    </section>
  );
}
