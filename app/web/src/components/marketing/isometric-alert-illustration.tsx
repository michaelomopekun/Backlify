"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IsometricAlertIllustrationProps {
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
  /** Only play animation and reveal accent color on hover */
  playOnHover?: boolean;
  /** Custom width/max-width */
  className?: string;
  style?: React.CSSProperties;
}

export function IsometricAlertIllustration({
  dark = 1,
  groundColor = "#0a0a0a",
  inkColor = "#e5e7eb",
  accentColor = "#FFB31F",
  loop = true,
  playOnHover = false,
  className,
  style,
}: IsometricAlertIllustrationProps) {
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
        className="li-notifications w-full h-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 720 460"
        fill="none"
        role="img"
        aria-labelledby="li-notifications-t"
        style={
          {
            "--illos-dark": dark,
            "--illos-ground": groundColor,
            "--illos-ink": inkColor,
            "--illos-accent": playOnHover ? inkColor : accentColor,
            "--illos-play": playOnHover ? "paused" : "running",
          } as React.CSSProperties
        }
      >
        <title id="li-notifications-t">Multi-Channel Incident Alerts</title>
        <style>{`
          .li-notifications {
            --d: var(--illos-dark, 1);
            --g: var(--illos-ground, #0a0a0a);
            --ink: var(--illos-ink, #e5e7eb);
            --accent: var(--illos-accent, ${playOnHover ? inkColor : accentColor});
            --mute: color-mix(in srgb, var(--ink) 45%, var(--g));
          }
          ${
            playOnHover
              ? `
          .group:hover .li-notifications,
          .li-notifications:hover {
            --illos-play: running !important;
            --illos-accent: ${accentColor} !important;
          }
          `
              : ""
          }
          .li-notifications path,
          .li-notifications polygon,
          .li-notifications ellipse,
          .li-notifications circle {
            vector-effect: non-scaling-stroke;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: fill 0.3s ease, stroke 0.3s ease;
          }
          .li-notifications .top { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 10% + (1 - var(--d)) * 0%), var(--g)); }
          .li-notifications .left { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 5% + (1 - var(--d)) * 4%), var(--g)); }
          .li-notifications .right { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 2% + (1 - var(--d)) * 9%), var(--g)); }
          .li-notifications .recess { fill: color-mix(in srgb, var(--ink) calc(var(--d) * 4% + (1 - var(--d)) * 6%), var(--g)); }
          .li-notifications .ttop { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 30% + (1 - var(--d)) * 10%), var(--g)); }
          .li-notifications .tleft { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 22% + (1 - var(--d)) * 18%), var(--g)); }
          .li-notifications .tright { fill: color-mix(in srgb, var(--accent) calc(var(--d) * 16% + (1 - var(--d)) * 26%), var(--g)); }
          .li-notifications .e,
          .li-notifications .m,
          .li-notifications .te,
          .li-notifications .tem { fill: none; stroke-width: 1.15px; }
          .li-notifications .e { stroke: var(--ink); }
          .li-notifications .m { stroke: var(--mute); }
          .li-notifications .te { stroke: var(--accent); }
          .li-notifications .tcell { fill: color-mix(in srgb, var(--accent) 75%, var(--g)); stroke: var(--accent); stroke-width: 1px; }
          .li-notifications .tem { stroke: color-mix(in srgb, var(--accent) 45%, var(--g)); }
          .li-notifications .d { stroke-dasharray: 2 3; }
          .li-notifications .dot { fill: var(--ink); }
          .li-notifications .tdot { fill: var(--accent); }
          .li-notifications .mdot { fill: var(--mute); }

          .li-notifications .co,
          .li-notifications .ring {
            transform-box: fill-box;
            transform-origin: 50% 50%;
          }
          .li-notifications .ring { opacity: 0; }

          .li-notifications .cm0 { animation: li-notifications_m0 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .cm0 .co { animation: li-notifications_o0 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .ct0 { animation: li-notifications_t0 3.2s linear ${loop ? "infinite" : "1"}; }

          .li-notifications .cm1 { animation: li-notifications_m1 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .cm1 .co { animation: li-notifications_o1 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .ct1 { animation: li-notifications_t1 3.2s linear ${loop ? "infinite" : "1"}; }

          .li-notifications .cm2 { animation: li-notifications_m2 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .cm2 .co { animation: li-notifications_o2 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .ct2 { animation: li-notifications_t2 3.2s linear ${loop ? "infinite" : "1"}; }

          .li-notifications .cm3 { animation: li-notifications_m3 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .cm3 .co { animation: li-notifications_o3 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .ct3 { animation: li-notifications_t3 3.2s linear ${loop ? "infinite" : "1"}; }

          .li-notifications .cm4 { animation: li-notifications_m4 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .cm4 .co { animation: li-notifications_o4 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .ct4 { animation: li-notifications_t4 3.2s linear ${loop ? "infinite" : "1"}; }

          .li-notifications .knob { animation: li-notifications_press 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .r0 { animation: li-notifications_r0 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .r1 { animation: li-notifications_r1 3.2s linear ${loop ? "infinite" : "1"}; }
          .li-notifications .labp { animation: li-notifications_lab 3.2s linear ${loop ? "infinite" : "1"}; }

          @keyframes li-notifications_m0 {
            0% { transform: translate(0px, 0px); }
            14.687% { transform: translate(0px, 0px); animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
            27.187% { transform: translate(0px, 37px); }
            64.688% { transform: translate(0px, 37px); animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
            77.188% { transform: translate(0px, 74px); }
            100% { transform: translate(0px, 74px); }
          }
          @keyframes li-notifications_o0 {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes li-notifications_t0 {
            0% { opacity: 1; }
            10.937% { opacity: 1; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            20.313% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes li-notifications_m1 {
            0% { transform: translate(0px, 37px); }
            14.687% { transform: translate(0px, 37px); animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
            27.187% { transform: translate(0px, 74px); }
            64.688% { transform: translate(0px, 74px); animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
            77.188% { transform: translate(0px, 111px); }
            100% { transform: translate(0px, 111px); }
          }
          @keyframes li-notifications_o1 {
            0% { opacity: 1; transform: scale(1); }
            64.688% { opacity: 1; transform: scale(1); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            75.625% { opacity: 0; transform: scale(1); }
            100% { opacity: 0; transform: scale(1); }
          }
          @keyframes li-notifications_t1 {
            0% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes li-notifications_m2 {
            0% { transform: translate(0px, 74px); }
            14.687% { transform: translate(0px, 74px); animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
            27.187% { transform: translate(0px, 111px); }
            100% { transform: translate(0px, 111px); }
          }
          @keyframes li-notifications_o2 {
            0% { opacity: 1; transform: scale(1); }
            14.687% { opacity: 1; transform: scale(1); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            25.625% { opacity: 0; transform: scale(1); }
            100% { opacity: 0; transform: scale(1); }
          }
          @keyframes li-notifications_t2 {
            0% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes li-notifications_m3 {
            0% { transform: translate(96.56px, 175.75px); }
            10.937% { transform: translate(96.56px, 175.75px); animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1); }
            32.813% { transform: translate(0px, 0px); }
            64.688% { transform: translate(0px, 0px); animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1); }
            77.188% { transform: translate(0px, 37px); }
            100% { transform: translate(0px, 37px); }
          }
          @keyframes li-notifications_o3 {
            0% { opacity: 0; transform: scale(0.92); }
            10.937% { opacity: 0; transform: scale(0.92); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            17.188% { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes li-notifications_t3 {
            0% { opacity: 1; }
            60.938% { opacity: 1; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            70.313% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes li-notifications_m4 {
            0% { transform: translate(96.56px, 175.75px); }
            60.938% { transform: translate(96.56px, 175.75px); animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1); }
            82.813% { transform: translate(0px, 0px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes li-notifications_o4 {
            0% { opacity: 0; transform: scale(0.92); }
            60.938% { opacity: 0; transform: scale(0.92); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            67.188% { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes li-notifications_t4 {
            0% { opacity: 1; }
            100% { opacity: 1; }
          }

          @keyframes li-notifications_press {
            0% { transform: translateY(0px); }
            7.813% { transform: translateY(0px); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            10.937% { transform: translateY(4px); animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1); }
            17.188% { transform: translateY(0px); }
            57.813% { transform: translateY(0px); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            60.938% { transform: translateY(4px); animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1); }
            67.187% { transform: translateY(0px); }
            100% { transform: translateY(0px); }
          }

          @keyframes li-notifications_r0 {
            0% { opacity: 0; transform: scale(1); }
            10.313% { opacity: 0; transform: scale(1); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            12.188% { opacity: 0.9; transform: scale(1.06); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            26.563% { opacity: 0; transform: scale(1.6); }
            100% { opacity: 0; transform: scale(1.6); }
          }

          @keyframes li-notifications_r1 {
            0% { opacity: 0; transform: scale(1); }
            60.313% { opacity: 0; transform: scale(1); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            62.188% { opacity: 0.9; transform: scale(1.06); animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            76.563% { opacity: 0; transform: scale(1.6); }
            100% { opacity: 0; transform: scale(1.6); }
          }

          @keyframes li-notifications_lab {
            0% { opacity: 1; }
            10.313% { opacity: 1; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            14.063% { opacity: 0; }
            34.375% { opacity: 0; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            42.188% { opacity: 1; }
            60.313% { opacity: 1; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            64.063% { opacity: 0; }
            84.375% { opacity: 0; animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
            92.188% { opacity: 1; }
            100% { opacity: 1; }
          }

          .li-notifications * {
            animation-iteration-count: ${loop ? "infinite" : "1"} !important;
            animation-fill-mode: both !important;
            animation-play-state: var(--illos-play, running) !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .li-notifications * { animation: none !important; }
            .li-notifications .cm0 { transform: translate(0px, 0px); }
            .li-notifications .ct0 { opacity: 1; }
            .li-notifications .cm1 { transform: translate(0px, 37px); }
            .li-notifications .ct1 { opacity: 0; }
            .li-notifications .cm2 { transform: translate(0px, 74px); }
            .li-notifications .ct2 { opacity: 0; }
            .li-notifications .cm3 .co,
            .li-notifications .cm4 .co { opacity: 0; }
          }
        `}</style>

        {/* ── Device Stand Base ── */}
        <polygon className="right" points="353.78,247 353.59,248.1 353.03,249.16 352.13,250.14 350.91,251 253.91,307 252.43,307.7 250.74,308.23 248.9,308.55 246.99,308.66 246.99,320.66 248.9,320.55 250.74,320.23 252.43,319.7 253.91,319 350.91,263 352.13,262.14 353.03,261.16 353.59,260.1 353.78,259" />
        <polygon className="left" points="246.99,308.66 245.07,308.55 243.24,308.23 241.54,307.7 240.06,307 208.88,289 207.66,288.14 206.76,287.16 206.2,286.1 206.01,285 206.01,297 206.2,298.1 206.76,299.16 207.66,300.14 208.88,301 240.06,319 241.54,319.7 243.24,320.23 245.07,320.55 246.99,320.66" />
        <polygon className="top" points="305.88,225 307.36,224.3 309.05,223.77 310.89,223.45 312.8,223.34 314.72,223.45 316.55,223.77 318.25,224.3 319.73,225 350.91,243 352.13,243.86 353.03,244.84 353.59,245.9 353.78,247 353.59,248.1 353.03,249.16 352.13,250.14 350.91,251 253.91,307 252.43,307.7 250.74,308.23 248.9,308.55 246.99,308.66 245.07,308.55 243.24,308.23 241.54,307.7 240.06,307 208.88,289 207.66,288.14 206.76,287.16 206.2,286.1 206.01,285 206.2,283.9 206.76,282.84 207.66,281.86 208.88,281" />
        <path className="e" d="M305.88 225L307.36 224.3L309.05 223.77L310.89 223.45L312.8 223.34L314.72 223.45L316.55 223.77L318.25 224.3L319.73 225L350.91 243L352.13 243.86L353.03 244.84L353.59 245.9L353.78 247L353.59 248.1L353.03 249.16L352.13 250.14L350.91 251L253.91 307L252.43 307.7L250.74 308.23L248.9 308.55L246.99 308.66L245.07 308.55L243.24 308.23L241.54 307.7L240.06 307L208.88 289L207.66 288.14L206.76 287.16L206.2 286.1L206.01 285L206.2 283.9L206.76 282.84L207.66 281.86L208.88 281ZM353.78 259L353.59 260.1L353.03 261.16L352.13 262.14L350.91 263L253.91 319L252.43 319.7L250.74 320.23L248.9 320.55L246.99 320.66L245.07 320.55L243.24 320.23L241.54 319.7L240.06 319L208.88 301L207.66 300.14L206.76 299.16L206.2 298.1L206.01 297M353.78 247L353.78 259M206.01 285L206.01 297" />
        <path className="m" d="M316.7 235.25L317.44 234.9L318.29 234.64L319.21 234.48L320.17 234.42L321.12 234.48L322.04 234.64L322.89 234.9L323.63 235.25L333.16 240.75L333.76 241.18L334.22 241.67L334.5 242.2L334.59 242.75L334.5 243.3L334.22 243.83L333.76 244.32L333.16 244.75L243.09 296.75L242.35 297.1L241.5 297.36L240.58 297.52L239.62 297.58L238.67 297.52L237.75 297.36L236.9 297.1L236.16 296.75L226.63 291.25L226.03 290.82L225.57 290.33L225.29 289.8L225.2 289.25L225.29 288.7L225.57 288.17L226.03 287.68L226.63 287.25Z" />

        {/* ── Smartphone / Device Chassis ── */}
        <polygon className="right" points="327.66,56.75 327.57,57.3 327.29,57.83 326.84,58.32 326.23,58.75 243.09,106.75 242.35,107.1 241.5,107.36 240.58,107.52 239.62,107.58 239.62,293.58 240.58,293.52 241.5,293.36 242.35,293.1 243.09,292.75 326.23,244.75 326.84,244.32 327.29,243.83 327.57,243.3 327.66,242.75" />
        <polygon className="left" points="239.62,107.58 238.67,107.52 237.75,107.36 236.9,107.1 236.16,106.75 233.56,105.25 232.95,104.82 232.5,104.33 232.22,103.8 232.13,103.25 232.13,289.25 232.22,289.8 232.5,290.33 232.95,290.82 233.56,291.25 236.16,292.75 236.9,293.1 237.75,293.36 238.67,293.52 239.62,293.58" />
        <polygon className="top" points="316.7,53.25 317.44,52.9 318.29,52.64 319.21,52.48 320.17,52.42 321.12,52.48 322.04,52.64 322.89,52.9 323.63,53.25 326.23,54.75 326.84,55.18 327.29,55.67 327.57,56.2 327.66,56.75 327.57,57.3 327.29,57.83 326.84,58.32 326.23,58.75 243.09,106.75 242.35,107.1 241.5,107.36 240.58,107.52 239.62,107.58 238.67,107.52 237.75,107.36 236.9,107.1 236.16,106.75 233.56,105.25 232.95,104.82 232.5,104.33 232.22,103.8 232.13,103.25 232.22,102.7 232.5,102.17 232.95,101.68 233.56,101.25" />
        <path className="e" d="M316.7 53.25L317.44 52.9L318.29 52.64L319.21 52.48L320.17 52.42L321.12 52.48L322.04 52.64L322.89 52.9L323.63 53.25L326.23 54.75L326.84 55.18L327.29 55.67L327.57 56.2L327.66 56.75L327.57 57.3L327.29 57.83L326.84 58.32L326.23 58.75L243.09 106.75L242.35 107.1L241.5 107.36L240.58 107.52L239.62 107.58L238.67 107.52L237.75 107.36L236.9 107.1L236.16 106.75L233.56 105.25L232.95 104.82L232.5 104.33L232.22 103.8L232.13 103.25L232.22 102.7L232.5 102.17L232.95 101.68L233.56 101.25ZM327.66 242.75L327.57 243.3L327.29 243.83L326.84 244.32L326.23 244.75L243.09 292.75L242.35 293.1L241.5 293.36L240.58 293.52L239.62 293.58L238.67 293.52L237.75 293.36L236.9 293.1L236.16 292.75L233.56 291.25L232.95 290.82L232.5 290.33L232.22 289.8L232.13 289.25M327.66 56.75L327.66 242.75M232.13 103.25L232.13 289.25" />

        {/* ── Screen Inset ── */}
        <polygon className="recess" points="249.15,275.25 247.49,275.83 246.09,275.55 245.15,274.47 244.82,272.75 244.82,118.75 245.15,116.65 246.09,114.48 247.49,112.59 249.15,111.25 320.17,70.25 321.82,69.67 323.23,69.95 324.17,71.03 324.5,72.75 324.5,226.75 324.17,228.85 323.23,231.02 321.82,232.91 320.17,234.25" />
        <path className="e" d="M249.15 275.25L247.49 275.83L246.09 275.55L245.15 274.47L244.82 272.75L244.82 118.75L245.15 116.65L246.09 114.48L247.49 112.59L249.15 111.25L320.17 70.25L321.82 69.67L323.23 69.95L324.17 71.03L324.5 72.75L324.5 226.75L324.17 228.85L323.23 231.02L321.82 232.91L320.17 234.25Z" />
        <path className="e" d="M278.16 92L277.67 92.17L277.24 92.09L276.96 91.77L276.86 91.25L276.86 91.25L276.96 90.62L277.24 89.97L277.67 89.4L278.16 89L291.15 81.5L291.65 81.33L292.07 81.41L292.35 81.73L292.45 82.25L292.45 82.25L292.35 82.88L292.07 83.53L291.65 84.1L291.15 84.5Z" />
        <path className="m" d="M274.27 267.75L295.05 255.75" />
        <path className="m" d="M237.03 147.25L237.03 165.25" />

        {/* ── Reception Service Bell (Incident Trigger) ── */}
        <ellipse className="m ring r0" cx="382.09" cy="381" rx="63.69" ry="36.77" />
        <ellipse className="m ring r1" cx="382.09" cy="381" rx="63.69" ry="36.77" />
        <path className="left" d="M325.75 371L325.75 381A56.34 32.53 0 0 0 382.09 413.53L382.09 403.53A56.34 32.53 0 0 1 325.75 371Z" />
        <path className="right" d="M438.42 371L438.42 381A56.34 32.53 0 0 1 382.09 413.53L382.09 403.53A56.34 32.53 0 0 0 438.42 371Z" />
        <ellipse className="top" cx="382.09" cy="371" rx="56.34" ry="32.53" />
        <path className="e" d="M325.75 371L325.75 381A56.34 32.53 0 0 0 438.42 381L438.42 371" />
        <ellipse className="e" cx="382.09" cy="371" rx="56.34" ry="32.53" />
        <path className="top" d="M339.22 371A42.87 42.87 0 0 1 424.95 371A42.87 24.75 0 0 1 339.22 371Z" />
        <path className="e" d="M339.22 371A42.87 42.87 0 0 1 424.95 371A42.87 24.75 0 0 1 339.22 371" />
        <path className="m" d="M355.51 348.71A34.29 34.29 0 0 1 376.94 337.14" />

        {/* Bell Push Knob ── Pressing Down Animation */}
        <g className="knob">
          <path className="left" d="M378.41 328L378.41 339A3.67 2.12 0 0 0 382.09 341.12L382.09 330.12A3.67 2.12 0 0 1 378.41 328Z" />
          <path className="right" d="M385.76 328L385.76 339A3.67 2.12 0 0 1 382.09 341.12L382.09 330.12A3.67 2.12 0 0 0 385.76 328Z" />
          <ellipse className="top" cx="382.09" cy="328" rx="3.67" ry="2.12" />
          <path className="e" d="M378.41 328L378.41 339A3.67 2.12 0 0 0 385.76 339L385.76 328" />
          <ellipse className="e" cx="382.09" cy="328" rx="3.67" ry="2.12" />
          <path className="left" d="M372.29 324L372.29 328A9.8 5.66 0 0 0 382.09 333.66L382.09 329.66A9.8 5.66 0 0 1 372.29 324Z" />
          <path className="right" d="M391.88 324L391.88 328A9.8 5.66 0 0 1 382.09 333.66L382.09 329.66A9.8 5.66 0 0 0 391.88 324Z" />
          <ellipse className="top" cx="382.09" cy="324" rx="9.8" ry="5.66" />
          <path className="e" d="M372.29 324L372.29 328A9.8 5.66 0 0 0 391.88 328L391.88 324" />
          <ellipse className="e" cx="382.09" cy="324" rx="9.8" ry="5.66" />
        </g>

        {/* ── Notification Banner Cards on Screen ── */}
        {/* Card Stack 0 (Shifts down, highlighted in Amber) */}
        <g className="cm0">
          <g transform="matrix(0.87,-0.5,0,1,285.52,114.25)">
            <g className="co">
              <path className="right" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <path className="e" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <circle className="e" cx="-27" cy="0" r="7" />
              <path className="m" d="M-14 -4.5H26M-14 4H11" />
              <g className="ct0">
                <path className="tright" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <path className="te" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <circle className="te" cx="-27" cy="0" r="7" />
                <path className="tem" d="M-14 -4.5H26M-14 4H11" />
              </g>
            </g>
          </g>
        </g>

        {/* Card Stack 1 */}
        <g className="cm1">
          <g transform="matrix(0.87,-0.5,0,1,285.52,114.25)">
            <g className="co">
              <path className="right" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <path className="e" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <circle className="e" cx="-27" cy="0" r="7" />
              <path className="m" d="M-14 -4.5H26M-14 4H11" />
              <g className="ct1">
                <path className="tright" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <path className="te" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <circle className="te" cx="-27" cy="0" r="7" />
                <path className="tem" d="M-14 -4.5H26M-14 4H11" />
              </g>
            </g>
          </g>
        </g>

        {/* Card Stack 2 */}
        <g className="cm2">
          <g transform="matrix(0.87,-0.5,0,1,285.52,114.25)">
            <g className="co">
              <path className="right" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <path className="e" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <circle className="e" cx="-27" cy="0" r="7" />
              <path className="m" d="M-14 -4.5H26M-14 4H11" />
              <g className="ct2">
                <path className="tright" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <path className="te" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <circle className="te" cx="-27" cy="0" r="7" />
                <path className="tem" d="M-14 -4.5H26M-14 4H11" />
              </g>
            </g>
          </g>
        </g>

        {/* Card Stack 3 (Incoming Alert 1 Landing) */}
        <g className="cm3">
          <g transform="matrix(0.87,-0.5,0,1,285.52,114.25)">
            <g className="co">
              <path className="right" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <path className="e" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <circle className="e" cx="-27" cy="0" r="7" />
              <path className="m" d="M-14 -4.5H26M-14 4H11" />
              <g className="ct3">
                <path className="tright" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <path className="te" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <circle className="te" cx="-27" cy="0" r="7" />
                <path className="tem" d="M-14 -4.5H26M-14 4H11" />
              </g>
            </g>
          </g>
        </g>

        {/* Card Stack 4 (Incoming Alert 2 Landing) */}
        <g className="cm4">
          <g transform="matrix(0.87,-0.5,0,1,285.52,114.25)">
            <g className="co">
              <path className="right" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <path className="e" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
              <circle className="e" cx="-27" cy="0" r="7" />
              <path className="m" d="M-14 -4.5H26M-14 4H11" />
              <g className="ct4">
                <path className="tright" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <path className="te" d="M-36 -15H36A4 4 0 0 1 40 -11V11A4 4 0 0 1 36 15H-36A4 4 0 0 1 -40 11V-11A4 4 0 0 1 -36 -15Z" />
                <circle className="te" cx="-27" cy="0" r="7" />
                <path className="tem" d="M-14 -4.5H26M-14 4H11" />
              </g>
            </g>
          </g>
        </g>

        {/* ── Technical Leader Lines & Labels ── */}
        {/* PUSH Label (Top Leader Line) */}
        <g className="labp">
          <g className="lab">
            <circle className="tdot" cx="316.7" cy="81.25" r="1.75" />
            <path className="te" d="M316.7 81.25V51.25H596" />
            {/* Vector typography for PUSH */}
            <path
              className="te"
              d="M604 54.85L604 47.65L607.6 47.65L608.8 48.85L608.8 50.05L607.6 51.25L604 51.25M611.68 47.65L611.68 53.65L612.88 54.85L615.28 54.85L616.48 53.65L616.48 47.65M624.16 48.85L622.96 47.65L620.56 47.65L619.36 48.85L619.36 50.05L620.56 51.25L622.96 51.25L624.16 52.45L624.16 53.65L622.96 54.85L620.56 54.85L619.36 53.65M627.04 47.65L627.04 54.85M631.84 47.65L631.84 54.85M627.04 51.25L631.84 51.25"
            />
          </g>
        </g>

        {/* DEVICE Label (Middle Leader Line) */}
        <g className="lab">
          <circle className="dot" cx="327.96" cy="213.75" r="1.75" />
          <path className="e" d="M327.96 213.75H596" />
          {/* Vector typography for DEVICE */}
          <path
            className="e"
            d="M604 210.15L604 217.35L607.6 217.35L608.8 216.15L608.8 211.35L607.6 210.15L604 210.15M616.48 210.15L611.68 210.15L611.68 217.35L616.48 217.35M611.68 213.75L615.28 213.75M619.36 210.15L621.76 217.35L624.16 210.15M628.24 210.15L630.64 210.15M629.44 210.15L629.44 217.35M628.24 217.35L630.64 217.35M639.52 211.35L638.32 210.15L635.92 210.15L634.72 211.35L634.72 216.15L635.92 217.35L638.32 217.35L639.52 216.15M647.2 210.15L642.4 210.15L642.4 217.35L647.2 217.35M642.4 213.75L646 213.75"
          />
        </g>

        {/* EVENT Label (Bottom Leader Line) */}
        <g className="lab">
          <circle className="dot" cx="412.95" cy="348.71" r="1.75" />
          <path className="e" d="M412.95 348.71H596" />
          {/* Vector typography for EVENT */}
          <path
            className="e"
            d="M608.8 345.11L604 345.11L604 352.31L608.8 352.31M604 348.71L607.6 348.71M611.68 345.11L614.08 352.31L616.48 345.11M624.16 345.11L619.36 345.11L619.36 352.31L624.16 352.31M619.36 348.71L622.96 348.71M627.04 352.31L627.04 345.11L631.84 352.31L631.84 345.11M634.72 345.11L639.52 345.11M637.12 345.11L637.12 352.31"
          />
        </g>
      </svg>
    </div>
  );
}

export default IsometricAlertIllustration;
