"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 7-Row Squircle Tile Matrix Font (Exact 1:1 Match with Physical Reference)
 * '#' represents an illuminated squircle tile, '.' represents an unlit tile.
 */
const GLYPHS: Record<string, string[]> = {
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
  "0": [
    ".###.",
    "#...#",
    "#..##",
    "#.#.#",
    "##..#",
    "#...#",
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

export type MatrixColorTheme = "amber" | "blue" | "emerald";

export interface DotMatrixDisplayProps {
  /** The value or count to display (e.g. "114.2K", "100K", "14.8K") */
  value?: string;
  /** Primary accent color theme */
  colorTheme?: MatrixColorTheme;
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
  // Grid layout geometry matching reference squircle tile matrix
  const TOTAL_COLS = 44;
  const TOTAL_ROWS = 13;
  const PITCH = 13.0; // Total pitch per tile (tile size + gap)
  const TILE_SIZE = 7.4; // Squircle tile size (approx 57% of pitch)
  const TILE_RADIUS = 1.85; // Clean squircle corner radius (25% of tile size)

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
      // Inter-character spacing (2 tiles gap)
      if (charIdx < chars.length - 1) {
        renderedRows[r].push(false);
        renderedRows[r].push(false);
      }
    }
  });

  const textWidth = renderedRows[0]?.length || 0;
  const startCol = Math.max(1, Math.floor((TOTAL_COLS - textWidth) / 2));
  const startRow = Math.max(1, Math.floor((TOTAL_ROWS - 7) / 2));

  // Precompute set of lit tiles
  const litSet = React.useMemo(() => {
    const set = new Set<string>();
    for (let r = 0; r < 7; r++) {
      const row = renderedRows[r] || [];
      for (let c = 0; c < row.length; c++) {
        if (row[c]) {
          set.add(`${startRow + r},${startCol + c}`);
        }
      }
    }
    return set;
  }, [value, startRow, startCol]);

  // Color profiles
  const colorProfiles: Record<
    MatrixColorTheme,
    {
      lit: string;
      unlitDark: string;
      unlitMid: string;
      unlitTint: string;
      glowRgba: string;
    }
  > = {
    amber: {
      lit: "#ffb31f", // Backlify signature vibrant amber
      unlitDark: "#131418", // Dark base squircle tile
      unlitMid: "#191a22", // Mid-tone ambient tile
      unlitTint: "#2d2417", // Warm amber-reflected ambient tile
      glowRgba: "rgba(255, 179, 31, 0.16)",
    },
    blue: {
      lit: "#63b9fe", // Exact RGB [99, 185, 254] from reference close-up
      unlitDark: "#111318",
      unlitMid: "#161c24",
      unlitTint: "#1f2c3c", // Blue-reflected ambient tile from screenshot
      glowRgba: "rgba(99, 185, 254, 0.16)",
    },
    emerald: {
      lit: "#3ecf8e", // Supabase emerald
      unlitDark: "#101412",
      unlitMid: "#141c18",
      unlitTint: "#182c22",
      glowRgba: "rgba(62, 207, 142, 0.16)",
    },
  };

  const theme = colorProfiles[colorTheme] || colorProfiles.amber;

  const svgWidth = TOTAL_COLS * PITCH;
  const svgHeight = TOTAL_ROWS * PITCH;

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
      {/* Soft atmospheric background bloom */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-[65px] opacity-25"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${theme.glowRgba} 0%, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto max-w-[580px] overflow-visible cursor-default"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Render ALL Squircle Tiles in the Matrix Grid ── */}
        {Array.from({ length: TOTAL_ROWS }).map((_, r) => {
          return Array.from({ length: TOTAL_COLS }).map((_, c) => {
            const isLit = litSet.has(`${r},${c}`);
            const x = c * PITCH + (PITCH - TILE_SIZE) / 2;
            const y = r * PITCH + (PITCH - TILE_SIZE) / 2;

            // Interactive cursor proximity boost
            let isHovered = false;
            if (hoverPos) {
              const hdx = x + TILE_SIZE / 2 - hoverPos.x;
              const hdy = y + TILE_SIZE / 2 - hoverPos.y;
              isHovered = hdx * hdx + hdy * hdy < 28 * 28;
            }

            if (isLit) {
              // ── CRISP FLAT ILLUMINATED SQUIRCLE TILE ──
              // Razor-sharp geometry with 25% corner radius, no blurry fuzz
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x}
                  y={y}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  rx={TILE_RADIUS}
                  ry={TILE_RADIUS}
                  fill={theme.lit}
                  className="transition-colors duration-150"
                />
              );
            }

            // ── UNLIT SQUIRCLE TILE ──
            // Organic varied luminance: base dark, mid tone, or tinted reflection
            const hash = (r * 7919 + c * 6271) % 100;
            let tileFill = theme.unlitDark;

            // Determine subtle ambient tinting matching the reference screenshot
            if (hash < 14) {
              tileFill = theme.unlitTint; // Tinted reflection tile (like in close-up)
            } else if (hash < 38) {
              tileFill = theme.unlitMid; // Mid-tone dark slate
            }

            if (isHovered) {
              tileFill = theme.unlitTint;
            }

            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={TILE_SIZE}
                height={TILE_SIZE}
                rx={TILE_RADIUS}
                ry={TILE_RADIUS}
                fill={tileFill}
                className="transition-colors duration-200"
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
