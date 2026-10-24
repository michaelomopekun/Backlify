"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IsometricReplicationIllustrationProps {
  /** Dark mode flag (1 for dark mode, 0 for light mode) */
  dark?: number;
  /** Canvas ground background color */
  groundColor?: string;
  /** Primary ink/line stroke color */
  inkColor?: string;
  /** Accent highlight color (default: "#FFB31F" for Backlify amber) */
  accentColor?: string;
  /** Whether the animation should loop continuously */
  loop?: boolean;
  /** Custom width/max-width */
  className?: string;
  style?: React.CSSProperties;
}

export function IsometricReplicationIllustration({
  dark = 1,
  groundColor = "#0a0a0a",
  inkColor = "#e5e7eb",
  accentColor = "#FFB31F",
  loop = true,
  className,
  style,
}: IsometricReplicationIllustrationProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none w-full",
        className
      )}
      style={{
        maxWidth: "600px",
        ...style,
      }}
    >
      <svg
        className="li-replication w-full h-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 720 460"
        fill="none"
        role="img"
        aria-labelledby="li-replication-t"
        aria-describedby="li-replication-d"
        style={
          {
            "--illos-dark": dark,
            "--illos-ground": groundColor,
            "--illos-ink": inkColor,
            "--illos-accent": accentColor,
            "--illos-play": "running",
          } as React.CSSProperties
        }
      >
        <title id="li-replication-t">Continuous WAL Replication & Point-in-Time Recovery</title>
        <desc id="li-replication-d">
          A change lands on the primary database stack and every replica catches up via streaming replication.
        </desc>
        <style>{`
          .li-replication {
            stroke: none;
            --d: var(--illos-dark, 1);
            --g: var(--illos-ground, #0a0a0a);
            --ink: var(--illos-ink, #e5e7eb);
            --accent: var(--illos-accent, #FFB31F);
            --mute: color-mix(in srgb, var(--ink) 45%, var(--g));
          }
          .li-replication path,
          .li-replication polygon,
          .li-replication ellipse,
          .li-replication circle {
            vector-effect: non-scaling-stroke;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .li-replication .top { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 10% + (1 - var(--d)) * 0%), var(--g)); }
          .li-replication .left { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 5% + (1 - var(--d)) * 4%), var(--g)); }
          .li-replication .right { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 2% + (1 - var(--d)) * 9%), var(--g)); }
          .li-replication .recess { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 4% + (1 - var(--d)) * 6%), var(--g)); }
          .li-replication .ttop { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 30% + (1 - var(--d)) * 10%), var(--g)); }
          .li-replication .tleft { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 22% + (1 - var(--d)) * 18%), var(--g)); }
          .li-replication .tright { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 16% + (1 - var(--d)) * 26%), var(--g)); }
          .li-replication .trecess { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 40% + (1 - var(--d)) * 15%), var(--g)); }
          .li-replication .e,
          .li-replication .m,
          .li-replication .te,
          .li-replication .tem { fill: none; stroke-width: 1.15px; }
          .li-replication .e { stroke: var(--ink); }
          .li-replication .m { stroke: var(--mute); }
          .li-replication .te { stroke: var(--accent); }
          .li-replication .tem { stroke: color-mix(in srgb, var(--accent) 45%, var(--g)); }
          .li-replication .d { stroke-dasharray: 2 3; }
          .li-replication .dot { fill: var(--ink); }
          .li-replication .tdot { fill: var(--accent); }
          .li-replication .mdot { fill: var(--mute); }

          /* Animation Keyframes */
          .li-replication .primary-pulse {
            animation: li-repl_primary 3.2s linear ${loop ? "infinite" : "1"};
            transform-origin: 320px 135px;
          }
          .li-replication .primary-dot-0 { animation: li-repl_pdot0 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-replication .primary-dot-1 { animation: li-repl_pdot1 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-replication .primary-dot-2 { animation: li-repl_pdot2 3.2s linear ${loop ? "infinite" : "1"}; }

          .li-replication .packet-left {
            animation: li-repl_packet_l 3.2s cubic-bezier(0.32, 0.72, 0, 1) ${loop ? "infinite" : "1"};
          }
          .li-replication .packet-right {
            animation: li-repl_packet_r 3.2s cubic-bezier(0.32, 0.72, 0, 1) ${loop ? "infinite" : "1"};
          }

          .li-replication .replica-catchup {
            animation: li-repl_catchup 3.2s linear ${loop ? "infinite" : "1"};
          }

          .li-replication .leader-pulse {
            animation: li-repl_leader 3.2s linear ${loop ? "infinite" : "1"};
          }

          @keyframes li-repl_primary {
            0% { opacity: 0; transform: scale(0.97); }
            4% { opacity: 0.85; transform: scale(1.02); }
            12% { opacity: 0; transform: scale(1.06); }
            100% { opacity: 0; transform: scale(1); }
          }

          @keyframes li-repl_pdot0 {
            0% { transform: scale(1); }
            4% { transform: scale(1.6); }
            10% { transform: scale(1); }
            100% { transform: scale(1); }
          }
          @keyframes li-repl_pdot1 {
            0% { transform: scale(1); }
            7% { transform: scale(1.6); }
            13% { transform: scale(1); }
            100% { transform: scale(1); }
          }
          @keyframes li-repl_pdot2 {
            0% { transform: scale(1); }
            10% { transform: scale(1.6); }
            16% { transform: scale(1); }
            100% { transform: scale(1); }
          }

          @keyframes li-repl_packet_l {
            0% { opacity: 0; transform: translate(280px, 260px) scale(0.8); }
            14% { opacity: 0; transform: translate(280px, 260px) scale(0.8); }
            18% { opacity: 1; transform: translate(280px, 260px) scale(1.2); }
            46% { opacity: 1; transform: translate(210px, 310px) scale(1.2); }
            52% { opacity: 0; transform: translate(210px, 310px) scale(0.7); }
            100% { opacity: 0; transform: translate(210px, 310px) scale(0.7); }
          }

          @keyframes li-repl_packet_r {
            0% { opacity: 0; transform: translate(360px, 260px) scale(0.8); }
            14% { opacity: 0; transform: translate(360px, 260px) scale(0.8); }
            18% { opacity: 1; transform: translate(360px, 260px) scale(1.2); }
            46% { opacity: 1; transform: translate(430px, 310px) scale(1.2); }
            52% { opacity: 0; transform: translate(430px, 310px) scale(0.7); }
            100% { opacity: 0; transform: translate(430px, 310px) scale(0.7); }
          }

          @keyframes li-repl_catchup {
            0% { opacity: 0; }
            46% { opacity: 0; }
            54% { opacity: 1; }
            72% { opacity: 1; }
            88% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes li-repl_leader {
            0% { opacity: 1; }
            48% { opacity: 1; }
            54% { opacity: 0.5; }
            62% { opacity: 1; }
            100% { opacity: 1; }
          }

          .li-replication * {
            animation-iteration-count: ${loop ? "infinite" : "1"} !important;
            animation-fill-mode: both !important;
            animation-play-state: var(--illos-play, running) !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .li-replication * { animation: none !important; }
            .li-replication .primary-pulse { opacity: 0; }
            .li-replication .packet-left,
            .li-replication .packet-right { opacity: 0; }
            .li-replication .replica-catchup { opacity: 0; }
          }
        `}</style>

        {/* ── Connecting Streaming Conduits (Dashed branching lines) ── */}
        <path className="m d" d="M 280 260 L 210 310" />
        <path className="m d" d="M 360 260 L 430 310" />

        {/* ── Traveling WAL Streaming Packets ── */}
        <g className="packet-left">
          <circle className="tdot" cx="0" cy="0" r="3.2" />
          <circle className="tem" cx="0" cy="0" r="5.5" />
        </g>
        <g className="packet-right">
          <circle className="tdot" cx="0" cy="0" r="3.2" />
          <circle className="tem" cx="0" cy="0" r="5.5" />
        </g>

        {/* ══════════════════════════════════════════════════════════
            1. PRIMARY DATABASE STACK (Top, Accent Brand Color)
            Center: (320, 135), rx: 65, ry: 37.5, h: 26 (tiers: 26, 52, 78)
           ══════════════════════════════════════════════════════════ */}
        <g id="primary-stack">
          {/* Ground Footprint Ring (Dashed) */}
          <ellipse className="m d" cx="320" cy="235" rx="84" ry="48.5" />

          {/* Tier 3 (Bottom) */}
          {/* Left half */}
          <path
            className="tleft"
            d="M 255 187 A 65 37.5 0 0 0 320 224.5 L 320 250.5 A 65 37.5 0 0 1 255 213 Z"
          />
          {/* Right half */}
          <path
            className="tright"
            d="M 320 224.5 A 65 37.5 0 0 0 385 187 L 385 213 A 65 37.5 0 0 1 320 250.5 Z"
          />

          {/* Tier 2 (Middle) */}
          {/* Left half */}
          <path
            className="tleft"
            d="M 255 161 A 65 37.5 0 0 0 320 198.5 L 320 224.5 A 65 37.5 0 0 1 255 187 Z"
          />
          {/* Right half */}
          <path
            className="tright"
            d="M 320 198.5 A 65 37.5 0 0 0 385 161 L 385 187 A 65 37.5 0 0 1 320 224.5 Z"
          />

          {/* Tier 1 (Top) */}
          {/* Left half */}
          <path
            className="tleft"
            d="M 255 135 A 65 37.5 0 0 0 320 172.5 L 320 198.5 A 65 37.5 0 0 1 255 161 Z"
          />
          {/* Right half */}
          <path
            className="tright"
            d="M 320 172.5 A 65 37.5 0 0 0 385 135 L 385 161 A 65 37.5 0 0 1 320 198.5 Z"
          />

          {/* Top Platter Disc */}
          <ellipse className="ttop" cx="320" cy="135" rx="65" ry="37.5" />
          {/* Inner concentric hole */}
          <ellipse className="trecess" cx="320" cy="135" rx="16" ry="9.2" />
          <path className="te" d="M 304 135 A 16 9.2 0 0 0 336 135" />

          {/* Cylinder Contour Lines */}
          <ellipse className="te" cx="320" cy="135" rx="65" ry="37.5" />
          <ellipse className="te" cx="320" cy="135" rx="16" ry="9.2" />
          <path className="te" d="M 255 135 L 255 213" />
          <path className="te" d="M 385 135 L 385 213" />
          <path className="te" d="M 320 172.5 L 320 250.5" />
          <path className="te" d="M 255 161 A 65 37.5 0 0 0 385 161" />
          <path className="te" d="M 255 187 A 65 37.5 0 0 0 385 187" />
          <path className="te" d="M 255 213 A 65 37.5 0 0 0 385 213" />

          {/* 3 Status Indicator Dots on Front-Left */}
          <circle className="tdot primary-dot-0" cx="291" cy="179" r="2.2" />
          <circle className="tdot primary-dot-1" cx="291" cy="205" r="2.2" />
          <circle className="tdot primary-dot-2" cx="291" cy="231" r="2.2" />

          {/* Transaction Commit Pulse Glow Ring */}
          <ellipse
            className="te primary-pulse"
            cx="320"
            cy="135"
            rx="67"
            ry="38.5"
            style={{ strokeWidth: "1.8px" }}
          />
        </g>

        {/* ══════════════════════════════════════════════════════════
            2. LEFT REPLICA DATABASE STACK (Neutral Ink, Standby)
            Center: (180, 295), rx: 60, ry: 34.6, h: 24 (tiers: 24, 48, 72)
           ══════════════════════════════════════════════════════════ */}
        <g id="left-replica-stack">
          {/* Ground Footprint Ring (Dashed) */}
          <ellipse className="m d" cx="180" cy="385" rx="78" ry="45" />

          {/* Tier 3 (Bottom) */}
          <path
            className="left"
            d="M 120 343 A 60 34.6 0 0 0 180 377.6 L 180 401.6 A 60 34.6 0 0 1 120 367 Z"
          />
          <path
            className="right"
            d="M 180 377.6 A 60 34.6 0 0 0 240 343 L 240 367 A 60 34.6 0 0 1 180 401.6 Z"
          />

          {/* Tier 2 (Middle) */}
          <path
            className="left"
            d="M 120 319 A 60 34.6 0 0 0 180 353.6 L 180 377.6 A 60 34.6 0 0 1 120 343 Z"
          />
          <path
            className="right"
            d="M 180 353.6 A 60 34.6 0 0 0 240 319 L 240 343 A 60 34.6 0 0 1 180 377.6 Z"
          />

          {/* Tier 1 (Top) */}
          <path
            className="left"
            d="M 120 295 A 60 34.6 0 0 0 180 329.6 L 180 353.6 A 60 34.6 0 0 1 120 319 Z"
          />
          <path
            className="right"
            d="M 180 329.6 A 60 34.6 0 0 0 240 295 L 240 319 A 60 34.6 0 0 1 180 353.6 Z"
          />

          {/* Top Platter Disc */}
          <ellipse className="top" cx="180" cy="295" rx="60" ry="34.6" />
          <ellipse className="recess" cx="180" cy="295" rx="14.5" ry="8.4" />
          <path className="e" d="M 165.5 295 A 14.5 8.4 0 0 0 194.5 295" />

          {/* Contour Lines */}
          <ellipse className="e" cx="180" cy="295" rx="60" ry="34.6" />
          <ellipse className="e" cx="180" cy="295" rx="14.5" ry="8.4" />
          <path className="e" d="M 120 295 L 120 367" />
          <path className="e" d="M 240 295 L 240 367" />
          <path className="e" d="M 180 329.6 L 180 401.6" />
          <path className="e" d="M 120 319 A 60 34.6 0 0 0 240 319" />
          <path className="e" d="M 120 343 A 60 34.6 0 0 0 240 343" />
          <path className="e" d="M 120 367 A 60 34.6 0 0 0 240 367" />

          {/* 3 Status Indicator Dots */}
          <circle className="dot" cx="153" cy="336" r="2.2" />
          <circle className="dot" cx="153" cy="360" r="2.2" />
          <circle className="dot" cx="153" cy="384" r="2.2" />

          {/* Catch-Up Amber Flash Overlay */}
          <g className="replica-catchup">
            <ellipse className="ttop" cx="180" cy="295" rx="60" ry="34.6" />
            <ellipse className="trecess" cx="180" cy="295" rx="14.5" ry="8.4" />
            <ellipse className="te" cx="180" cy="295" rx="60" ry="34.6" />
            <ellipse className="te" cx="180" cy="295" rx="14.5" ry="8.4" />
            <circle className="tdot" cx="153" cy="336" r="2.4" />
            <circle className="tdot" cx="153" cy="360" r="2.4" />
            <circle className="tdot" cx="153" cy="384" r="2.4" />
          </g>
        </g>

        {/* ══════════════════════════════════════════════════════════
            3. RIGHT REPLICA DATABASE STACK (Neutral Ink, Standby)
            Center: (460, 295), rx: 60, ry: 34.6, h: 24 (tiers: 24, 48, 72)
           ══════════════════════════════════════════════════════════ */}
        <g id="right-replica-stack">
          {/* Ground Footprint Ring (Dashed) */}
          <ellipse className="m d" cx="460" cy="385" rx="78" ry="45" />

          {/* Tier 3 (Bottom) */}
          <path
            className="left"
            d="M 400 343 A 60 34.6 0 0 0 460 377.6 L 460 401.6 A 60 34.6 0 0 1 400 367 Z"
          />
          <path
            className="right"
            d="M 460 377.6 A 60 34.6 0 0 0 520 343 L 520 367 A 60 34.6 0 0 1 460 401.6 Z"
          />

          {/* Tier 2 (Middle) */}
          <path
            className="left"
            d="M 400 319 A 60 34.6 0 0 0 460 353.6 L 460 377.6 A 60 34.6 0 0 1 400 343 Z"
          />
          <path
            className="right"
            d="M 460 353.6 A 60 34.6 0 0 0 520 319 L 520 343 A 60 34.6 0 0 1 460 377.6 Z"
          />

          {/* Tier 1 (Top) */}
          <path
            className="left"
            d="M 400 295 A 60 34.6 0 0 0 460 329.6 L 460 353.6 A 60 34.6 0 0 1 400 319 Z"
          />
          <path
            className="right"
            d="M 460 329.6 A 60 34.6 0 0 0 520 295 L 520 319 A 60 34.6 0 0 1 460 353.6 Z"
          />

          {/* Top Platter Disc */}
          <ellipse className="top" cx="460" cy="295" rx="60" ry="34.6" />
          <ellipse className="recess" cx="460" cy="295" rx="14.5" ry="8.4" />
          <path className="e" d="M 445.5 295 A 14.5 8.4 0 0 0 474.5 295" />

          {/* Contour Lines */}
          <ellipse className="e" cx="460" cy="295" rx="60" ry="34.6" />
          <ellipse className="e" cx="460" cy="295" rx="14.5" ry="8.4" />
          <path className="e" d="M 400 295 L 400 367" />
          <path className="e" d="M 520 295 L 520 367" />
          <path className="e" d="M 460 329.6 L 460 401.6" />
          <path className="e" d="M 400 319 A 60 34.6 0 0 0 520 319" />
          <path className="e" d="M 400 343 A 60 34.6 0 0 0 520 343" />
          <path className="e" d="M 400 367 A 60 34.6 0 0 0 520 367" />

          {/* 3 Status Indicator Dots */}
          <circle className="dot" cx="433" cy="336" r="2.2" />
          <circle className="dot" cx="433" cy="360" r="2.2" />
          <circle className="dot" cx="433" cy="384" r="2.2" />

          {/* Catch-Up Amber Flash Overlay */}
          <g className="replica-catchup">
            <ellipse className="ttop" cx="460" cy="295" rx="60" ry="34.6" />
            <ellipse className="trecess" cx="460" cy="295" rx="14.5" ry="8.4" />
            <ellipse className="te" cx="460" cy="295" rx="60" ry="34.6" />
            <ellipse className="te" cx="460" cy="295" rx="14.5" ry="8.4" />
            <circle className="tdot" cx="433" cy="336" r="2.4" />
            <circle className="tdot" cx="433" cy="360" r="2.4" />
            <circle className="tdot" cx="433" cy="384" r="2.4" />
          </g>
        </g>

        {/* ══════════════════════════════════════════════════════════
            4. TECHNICAL LEADER LINES & DRAFTING LABELS
           ══════════════════════════════════════════════════════════ */}
        {/* PRIMARY Leader Line & Vector Typography */}
        <g className="lab">
          <circle className="tdot" cx="385" cy="148" r="1.75" />
          <path className="te" d="M 385 148 H 590" />
          {/* PRIMARY: P-R-I-M-A-R-Y */}
          <path
            className="te"
            d="M598 151.6L598 144.4L601.6 144.4L602.8 145.6L602.8 146.8L601.6 148L598 148M605.6 151.6L605.6 144.4L609.2 144.4L610.4 145.6L610.4 146.8L609.2 148L605.6 148M608 148L610.4 151.6M615.6 144.4L615.6 151.6M614.4 144.4L616.8 144.4M614.4 151.6L616.8 151.6M620.8 151.6L620.8 144.4L623.2 149.2L625.6 144.4L625.6 151.6M628.4 151.6L628.4 146.8L630.8 144.4L633.2 146.8L633.2 151.6M628.4 148.6L633.2 148.6M636 151.6L636 144.4L639.6 144.4L640.8 145.6L640.8 146.8L639.6 148L636 148M638.4 148L640.8 151.6M643.6 144.4L646 148L648.4 144.4M646 148L646 151.6"
          />
        </g>

        {/* REPLICAS Leader Line & Vector Typography */}
        <g className="lab">
          <circle className="dot leader-pulse" cx="520" cy="308" r="1.75" />
          <path className="e leader-pulse" d="M 520 308 H 590" />
          {/* REPLICAS: R-E-P-L-I-C-A-S */}
          <path
            className="e leader-pulse"
            d="M598 311.6L598 304.4L601.6 304.4L602.8 305.6L602.8 306.8L601.6 308L598 308M600.4 308L602.8 311.6M610.4 304.4L605.6 304.4L605.6 311.6L610.4 311.6M605.6 308L609.2 308M613.2 311.6L613.2 304.4L616.8 304.4L618 305.6L618 306.8L616.8 308L613.2 308M620.8 304.4L620.8 311.6L625.6 311.6M630.8 304.4L630.8 311.6M629.6 304.4L632 304.4M629.6 311.6L632 311.6M640.8 305.6L639.6 304.4L637.2 304.4L636 305.6L636 310.4L637.2 311.6L639.6 311.6L640.8 310.4M643.6 311.6L643.6 306.8L646 304.4L648.4 306.8L648.4 311.6M643.6 308.6L648.4 308.6M656 305.6L654.8 304.4L652.4 304.4L651.2 305.6L656 310.4L654.8 311.6L652.4 311.6L651.2 310.4"
          />
        </g>
      </svg>
    </div>
  );
}
