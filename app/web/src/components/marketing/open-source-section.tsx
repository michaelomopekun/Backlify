"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DotMatrixDisplay, MatrixColorTheme, MatrixPixelSize } from "./dot-matrix-display";

export interface OpenSourceSectionProps {
  headline?: string;
  headline_first_half?: string;
  headline_second_half?: string;
  description?: string;
  repoUrl?: string;
  npxCommand?: string;
  word?: string;
  starCount?: string;
  colorTheme?: MatrixColorTheme;
  pixelSize?: MatrixPixelSize;
  className?: string;
}

function NpmSquircleIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0 text-[#8a8f98] group-hover:text-white transition-colors", className)}
      {...props}
    >
      {/* Outer rounded squircle */}
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {/* Inner stylized npm 'n' mark */}
      <path
        d="M7.75 7.75h8.5v8.5h-3.25v-5.25h-2v5.25H7.75V7.75z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OpenSourceSection({
  headline,
  headline_first_half = "Open source ",
  headline_second_half = "from day one",
  description = "Backlify is built in the open because we believe critical infrastructure tools should be transparent, inspectable, and owned by the community. Read, contribute, self-host. You're never locked in, and always in control.",
  repoUrl = "https://github.com/michaelomopekun/Backlify",
  npxCommand = "npx  dbdock",
  word,
  starCount,
  colorTheme = "amber",
  pixelSize = "jumbo",
  className,
}: OpenSourceSectionProps) {
  const displayWord = word || starCount || "MIT";
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const cleanCommand = npxCommand.replace(/\s+/g, " ").trim();
    navigator.clipboard?.writeText(cleanCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section
      id="open-source"
      className={cn(
        "relative w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 py-20 lg:py-28 select-none",
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center min-h-[380px]">
        {/* ── Left Column: Headline, Narrative & GitHub CTA ── */}
        <div className="flex flex-col items-start lg:col-span-5 max-w-xl z-10">
          {/* Main Display Headline */}
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#ededed] tracking-[-0.03em] leading-[1.14] mb-5">
            {headline ? (
              headline
            ) : (
              <>
                {headline_first_half} <span className="text-[#8a8f98]">{headline_second_half}</span>
              </>
            )}
          </h2>

          {/* Value Narrative Body */}
          <p className="font-sans text-[15px] sm:text-[16px] text-[#8a8f98] leading-[1.68] mb-8 font-normal">
            {description}
          </p>

          {/* Action Buttons Group (GitHub Link + NPX CLI Copy CTA) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. GitHub Action Link Button */}
            <Link
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex items-center gap-2.5 px-4 h-[42px] rounded-[10px]",
                "bg-[#131418] hover:bg-[#1c1e24] border border-[#2a2c33] hover:border-[#383b44]",
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

            {/* 2. NPX CLI Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-2.5 px-4 h-[42px] rounded-[10px]",
                "bg-[#131418] hover:bg-[#1c1e24] border border-[#2a2c33] hover:border-[#383b44]",
                "font-mono text-[13.5px] text-[#ededed] hover:text-white transition-all duration-150 cursor-pointer shadow-sm group select-none",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 active:scale-[0.98]"
              )}
              title="Click to copy command"
            >
              <NpmSquircleIcon />
              <span>{copied ? "copied!" : npxCommand}</span>
            </button>
          </div>
        </div>

        {/* ── Right Column: Giant Scoreboard Dot-Matrix Display ── */}
        <div className="flex items-center justify-center lg:justify-end lg:col-span-7 w-full overflow-hidden">
          <DotMatrixDisplay
            value={displayWord}
            colorTheme={colorTheme}
            pixelSize={pixelSize}
            interactive={true}
          />
        </div>
      </div>
    </section>
  );
}

