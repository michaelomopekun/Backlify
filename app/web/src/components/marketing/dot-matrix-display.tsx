"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 7-Row High Dot Matrix Font Definitions (Exact 1:1 Match with Reference)
 * '#' represents an illuminated LED bead, '.' represents an unlit grid cell.
 */
const GLYPHS: Record<string, string[]> = {
  "0": [
    ".###.",
    "#...#",
    "#..##",
    "#.#.#",
    "##..#",
    "#...#",
    ".###.",
  ],
  "1": [
    ".#.",
    "##.",
    ".#.",
    ".#.",
    ".#.",
    ".#.",
    "###",
  ],
  "2": [
    ".###.",
    "#...#",
    "....#",
    "..##.",
    ".##..",
    "##...",
    "#####",
  ],
  "3": [
    ".###.",
    "#...#",
    "....#",
    "..##.",
    "....#",
    "#...#",
    ".###.",
  ],
  "4": [
    "..##",
    ".##.",
    "#..#",
    "#..##",
    "#####",
    "...##",
    "...##",
  ],
  "5": [
    "#####",
    "#....",
    "####.",
    "....#",
    "....#",
    "#...#",
    ".###.",
  ],
  "6": [
    ".###.",
    "#....",
    "####.",
    "#...#",
    "#...#",
    "#...#",
    ".###.",
  ],
  "7": [
    "#####",
    "....#",
    "...#.",
    "..#..",
    ".#...",
    ".#...",
    ".#...",
  ],
  "8": [
    ".###.",
    "#...#",
    "#...#",
    ".###.",
    "#...#",
    "#...#",
    ".###.",
  ],
  "9": [
    ".###.",
    "#...#",
    "#...#",
    ".####",
    "....#",
    "....#",
    ".###.",
  ],
  ".": [
    "..",
    "..",
    "..",
    "..",
    "..",
    "..",
    "##",
  ],
  "K": [
    "#...#",
    "#..#.",
    "#.##.",
    "###..",
    "#.##.",
    "#..#.",
    "#...#",
  ],
  "k": [
    "#...#",
    "#..#.",
    "#.##.",
    "###..",
    "#.##.",
    "#..#.",
    "#...#",
  ],
  "M": [
    "#...#",
    "##.##",
    "#.#.#",
    "#.#.#",
    "#...#",
    "#...#",
    "#...#",
  ],
  "+": [
    ".....",
    "..#..",
    "..#..",
    "#####",
    "..#..",
    "..#..",
    ".....",
  ],
  "%": [
    "##..#",
    "##.#.",
    "..#..",
    ".#...",
    "#..##",
    "#..##",
    ".....",
  ],
  ",": [
    "..",
    "..",
    "..",
    "..",
    "..",
    ".#",
    "##",
  ],
  " ": [
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
  ],
};

export interface DotMatrixDisplayProps {
  /** The value or count to display (e.g. "114.2K", "100K", "14.8K") */
  value?: string;
  /** Primary accent color theme: "amber" (Backlify brand) or "emerald" (Supabase reference) */
  colorTheme?: "amber" | "emerald";
  /** Optional interactive hover shimmer effect */
  interactive?: boolean;
  className?: string;
}

export function DotMatrixDisplay({
  value = "114.2K",
  colorTheme = "amber",
  interactive = true,
  className,
}: DotMatrixDisplayProps) {
  // Grid dimensions
  const TOTAL_COLS = 62;
  const TOTAL_ROWS = 27;
  const CELL_SIZE = 8.6;
  const DOT_SIZE = 5.3;
  const DOT_RADIUS = 1.35;

  const [hoverPos, setHoverPos] = React.useState<{ x: number; y: number } | null>(null);

  // Build the text bitmap row-by-row
  const chars = value.split("");
  const renderedRows: boolean[][] = Array.from({ length: 7 }, () => []);

  chars.forEach((char, charIdx) => {
    const glyph = GLYPHS[char] || GLYPHS[" "] || Array(7).fill("...");
    for (let r = 0; r < 7; r++) {
      const line = glyph[r] || "";
      for (let c = 0; c < line.length; c++) {
        renderedRows[r].push(line[c] === "#");
      }
      // Inter-character spacing (2 dots gap, except 2 dots after period)
      if (charIdx < chars.length - 1) {
        renderedRows[r].push(false);
        renderedRows[r].push(false);
      }
    }
  });

  const textWidth = renderedRows[0]?.length || 0;
  const startCol = Math.max(2, Math.floor((TOTAL_COLS - textWidth) / 2));
  const startRow = Math.max(2, Math.floor((TOTAL_ROWS - 7) / 2));

  // Center coordinate of the active text for radial falloff calculation
  const textCenterCol = startCol + textWidth / 2;
  const textCenterRow = startRow + 3.5;

  // Precompute lit dots set for O(1) lookup
  const litMap = React.useMemo(() => {
    const map = new Set<string>();
    for (let r = 0; r < 7; r++) {
      const row = renderedRows[r] || [];
      for (let c = 0; c < row.length; c++) {
        if (row[c]) {
          map.add(`${startRow + r},${startCol + c}`);
        }
      }
    }
    return map;
  }, [value, startRow, startCol]);

  // Color configurations
  const isAmber = colorTheme === "amber";
  const litColor = isAmber ? "#ffb31f" : "#3ecf8e";
  const coreHighlight = isAmber ? "#fffbeb" : "#f0fdf4";
  const glowRgba = isAmber ? "rgba(255, 179, 31, 0.9)" : "rgba(62, 207, 142, 0.9)";
  const ambientHaloRgba = isAmber ? "rgba(255, 179, 31, 0.16)" : "rgba(62, 207, 142, 0.16)";
  const unlitDotBase = isAmber ? "rgba(255, 179, 31, 0.18)" : "rgba(62, 207, 142, 0.18)";

  const svgWidth = TOTAL_COLS * CELL_SIZE;
  const svgHeight = TOTAL_ROWS * CELL_SIZE;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const y = ((e.clientY - rect.top) / rect.height) * svgHeight;
    setHoverPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div className={cn("relative flex items-center justify-center select-none w-full", className)}>
      {/* Ambient Radial Stadium Glow behind the Matrix */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-[70px] opacity-25"
        style={{
          background: isAmber
            ? "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255, 179, 31, 0.35) 0%, rgba(217, 119, 6, 0.15) 45%, transparent 75%)"
            : "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(62, 207, 142, 0.35) 0%, rgba(16, 185, 129, 0.15) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto max-w-[560px] drop-shadow-2xl overflow-visible cursor-default"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Intense Scoreboard LED Neon Bloom Filter */}
          <filter id={`matrix-glow-${colorTheme}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core Specular Gradient for Lit LEDs */}
          <radialGradient id={`core-gradient-${colorTheme}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={coreHighlight} stopOpacity="1" />
            <stop offset="55%" stopColor={litColor} stopOpacity="1" />
            <stop offset="100%" stopColor={isAmber ? "#d97706" : "#059669"} stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* ── Render Grid of LED Beads (Ambient Field + Lit Digits) ── */}
        {Array.from({ length: TOTAL_ROWS }).map((_, r) => {
          return Array.from({ length: TOTAL_COLS }).map((_, c) => {
            const isLit = litMap.has(`${r},${c}`);
            const x = c * CELL_SIZE + (CELL_SIZE - DOT_SIZE) / 2;
            const y = r * CELL_SIZE + (CELL_SIZE - DOT_SIZE) / 2;

            // Elliptical normalized distance from center of text
            const dx = (c - textCenterCol) / (TOTAL_COLS * 0.44);
            const dy = (r - textCenterRow) / (TOTAL_ROWS * 0.46);
            const distSq = dx * dx + dy * dy;

            // Interactive hover reaction
            let hoverBoost = 0;
            if (hoverPos) {
              const hdx = x + DOT_SIZE / 2 - hoverPos.x;
              const hdy = y + DOT_SIZE / 2 - hoverPos.y;
              const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
              if (hdist < 42) {
                hoverBoost = Math.max(0, (1 - hdist / 42) * 0.45);
              }
            }

            if (isLit) {
              // ── ILLUMINATED LIT DIGIT BEAD ──
              return (
                <g key={`${r}-${c}`}>
                  {/* Subtle outer bead glow square */}
                  <rect
                    x={x - 1}
                    y={y - 1}
                    width={DOT_SIZE + 2}
                    height={DOT_SIZE + 2}
                    rx={DOT_RADIUS + 0.5}
                    ry={DOT_RADIUS + 0.5}
                    fill={glowRgba}
                    opacity={0.35 + hoverBoost}
                    filter={`url(#matrix-glow-${colorTheme})`}
                  />
                  {/* Primary illuminated diode */}
                  <rect
                    x={x}
                    y={y}
                    width={DOT_SIZE}
                    height={DOT_SIZE}
                    rx={DOT_RADIUS}
                    ry={DOT_RADIUS}
                    fill={`url(#core-gradient-${colorTheme})`}
                    filter={`url(#matrix-glow-${colorTheme})`}
                    className="transition-opacity duration-150"
                  />
                </g>
              );
            }

            // ── UNLIT AMBIENT FIELD BEAD ──
            // If outside the soft stadium cloud, don't render (or keep 0 opacity)
            if (distSq > 1.05 && hoverBoost === 0) {
              return null;
            }

            // Radial opacity falloff matching Supabase's ambient field
            const falloff = Math.max(0, Math.pow(Math.max(0, 1 - Math.sqrt(distSq)), 1.15));
            const opacity = Math.min(0.48, falloff * 0.32 + hoverBoost);

            if (opacity <= 0.01) return null;

            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={DOT_SIZE}
                height={DOT_SIZE}
                rx={DOT_RADIUS}
                ry={DOT_RADIUS}
                fill={unlitDotBase}
                opacity={opacity}
                className="transition-opacity duration-200"
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
