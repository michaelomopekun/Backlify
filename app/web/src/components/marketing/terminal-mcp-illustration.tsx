"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TerminalMcpIllustrationProps {
  /** Command to display in the top pill */
  command?: string;
  /** Command target highlight (e.g. "backlify") */
  target?: string;
  /** Accent highlight color (default: "#FFB31F" for Backlify amber) */
  accentColor?: string;
  /** Play animation and show amber only on hover */
  playOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TerminalMcpIllustration({
  command = "claude mcp add",
  target = "backlify",
  accentColor = "#FFB31F",
  playOnHover = true,
  className,
  style,
}: TerminalMcpIllustrationProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[320px] select-none flex flex-col items-center justify-center font-mono py-2",
        className
      )}
      style={style}
    >
      <style>{`
        .mcp-container {
          --mcp-play: ${playOnHover ? "paused" : "running"};
          --mcp-accent: ${playOnHover ? "#94a3b8" : accentColor};
        }

        ${
          playOnHover
            ? `
        .group:hover .mcp-container,
        .mcp-container:hover {
          --mcp-play: running !important;
          --mcp-accent: ${accentColor} !important;
        }
        `
            : ""
        }

        /* Moving laser beam down the connector spine */
        @keyframes mcp-beam-travel {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(280%);
            opacity: 0;
          }
        }

        /* Cursor blink */
        @keyframes mcp-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .mcp-beam {
          animation: mcp-beam-travel 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-play-state: var(--mcp-play);
        }

        .mcp-cursor {
          animation: mcp-cursor-blink 1s steps(2, start) infinite;
          animation-play-state: var(--mcp-play);
        }

        .mcp-transition {
          transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>

      <div className="mcp-container relative w-full flex flex-col items-center">
        {/* ── Top Command Capsule ── */}
        <div className="relative z-10 w-full rounded-full bg-[#121316] border border-[#1f222b] px-3.5 py-2 flex items-center justify-center text-[11px] sm:text-xs whitespace-nowrap tracking-wide shadow-sm mcp-transition">
          <span className="text-[#64748b] mr-2 select-none font-bold">$</span>
          <span className="text-[#f1f5f9] mr-1.5">{command}</span>
          <span
            className="mcp-transition font-medium"
            style={{ color: "var(--mcp-accent)" }}
          >
            {target}
          </span>
          <span
            className="mcp-cursor ml-1.5 inline-block w-1.5 h-3 align-middle"
            style={{ backgroundColor: "var(--mcp-accent)" }}
          />
        </div>

        {/* ── Vertical Conduit / Tree Spine ── */}
        <div className="relative w-full flex flex-col items-start mt-2.5">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-0 bottom-4 w-[1px] bg-[#1a1d24] overflow-hidden">
            {/* Animated laser beam packet */}
            <div
              className="mcp-beam w-full h-14 bg-gradient-to-b from-transparent via-[var(--mcp-accent)] to-transparent"
            />
          </div>

          {/* ── Tool Stack ── */}
          <div className="w-full flex flex-col gap-2 relative z-10">
            {/* ── Item 1: Active Running Tool (`create_backup`) ── */}
            <div className="w-full rounded-xl bg-[#121316]/90 border border-[#1a1d24] px-3.5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full mcp-transition shrink-0"
                  style={{ backgroundColor: "var(--mcp-accent)" }}
                />
                <span className="text-[#f1f5f9] font-medium tracking-tight">create_backup</span>
              </div>
              <span
                className="text-[11px] font-medium tracking-wide lowercase mcp-transition"
                style={{ color: "var(--mcp-accent)" }}
              >
                running
              </span>
            </div>

            {/* ── Item 2: Completed Tool (`list_schedules`) ── */}
            {/* <div className="w-full rounded-xl bg-[#121316]/90 border border-[#1a1d24] px-3.5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#475569] shrink-0" />
                <span className="text-[#cbd5e1] tracking-tight">list_schedules</span>
              </div>
              <span className="text-[11px] text-[#64748b] tracking-wide lowercase">
                done
              </span>
            </div> */}

            {/* ── Item 3: Completed Tool (`set_schedule_enabl...`) ── */}
            <div className="w-full rounded-xl bg-[#121316]/90 border border-[#1a1d24] px-3.5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#475569] shrink-0" />
                <span className="text-[#cbd5e1] tracking-tight truncate max-w-[150px]">
                  set_schedule_enabl...
                </span>
              </div>
              <span className="text-[11px] text-[#64748b] tracking-wide lowercase">
                done
              </span>
            </div>

            {/* ── Item 4: Bottom Faded Tool (`restore_backup`) ── */}
            <div className="w-full rounded-xl bg-[#121316]/40 border border-[#1a1d24]/60 px-3.5 py-2.5 flex items-center justify-between text-xs opacity-40">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#334155] shrink-0" />
                <span className="text-[#64748b] tracking-tight">restore_backup</span>
              </div>
              <span className="text-[11px] text-[#475569] tracking-wide lowercase">
                done
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
