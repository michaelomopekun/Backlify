"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface DatabaseBackupIllustrationProps {
  className?: string;
  style?: React.CSSProperties;
}

export function DatabaseBackupIllustration({
  className,
  style,
}: DatabaseBackupIllustrationProps) {
  const id = useId();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none w-full",
        className
      )}
      style={{
        maxWidth: "540px",
        minHeight: "420px",
        ...style,
      }}
    >
      <svg
        aria-label="Automated database backup and restore verification illustration"
        className="w-full h-auto overflow-visible"
        fill="none"
        role="img"
        viewBox="0 0 540 440"
      >
        <defs>
          {/* Amber Pulse Gradient for Backlify primary backup stream */}
          <linearGradient
            id={`${id}-amber-pulse`}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(255, 179, 31, 0)" />
            <stop offset="50%" stopColor="rgba(255, 179, 31, 1)" />
            <stop offset="100%" stopColor="rgba(255, 179, 31, 0)" />
            <animateTransform
              attributeName="gradientTransform"
              dur="2.4s"
              from="-1 0"
              repeatCount="indefinite"
              to="1 0"
              type="translate"
            />
          </linearGradient>

          {/* Cyan/Blue Pulse Gradient for restore & query stream */}
          <linearGradient
            id={`${id}-cyan-pulse`}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 1)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            <animateTransform
              attributeName="gradientTransform"
              dur="2.8s"
              from="-1 0"
              repeatCount="indefinite"
              to="1 0"
              type="translate"
            />
          </linearGradient>

          {/* Red/Alert Pulse for WAL / Migration events */}
          <linearGradient
            id={`${id}-red-pulse`}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(248, 113, 113, 0)" />
            <stop offset="50%" stopColor="rgba(248, 113, 113, 0.9)" />
            <stop offset="100%" stopColor="rgba(248, 113, 113, 0)" />
            <animateTransform
              attributeName="gradientTransform"
              dur="3s"
              from="-1 0"
              repeatCount="indefinite"
              to="1 0"
              type="translate"
            />
          </linearGradient>

          {/* Database Cylinder Top Surface Metallic Gradient */}
          <linearGradient id={`${id}-cylinder-top`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252830" />
            <stop offset="50%" stopColor="#181a20" />
            <stop offset="100%" stopColor="#0f1115" />
          </linearGradient>

          {/* Database Cylinder Wall Side Metallic Gradient */}
          <linearGradient id={`${id}-cylinder-wall`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14161c" />
            <stop offset="20%" stopColor="#222630" />
            <stop offset="50%" stopColor="#15171d" />
            <stop offset="85%" stopColor="#242832" />
            <stop offset="100%" stopColor="#101115" />
          </linearGradient>

          {/* Ambient Cylinder Base Glow */}
          <radialGradient id={`${id}-base-glow`}>
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.12)" />
            <stop offset="40%" stopColor="rgba(255, 179, 31, 0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Neon Glow Filter */}
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Ambient Under-glow ── */}
        <ellipse cx="270" cy="275" rx="170" ry="70" fill={`url(#${id}-base-glow)`} />

        {/* ── Background Technical Telemetry Radar Grid ── */}
        <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeLinecap="round">
          {/* Concentric rounded telemetry boxes */}
          <rect x="75" y="45" width="390" height="350" rx="40" strokeDasharray="3 4" fill="none" />
          <rect x="125" y="85" width="290" height="270" rx="30" strokeDasharray="2 4" fill="none" />

          {/* Crosshair coordinate axes */}
          <line x1="270" y1="20" x2="270" y2="420" strokeDasharray="3 4" stroke="rgba(255, 255, 255, 0.04)" />
          <line x1="40" y1="220" x2="500" y2="220" strokeDasharray="3 4" stroke="rgba(255, 255, 255, 0.04)" />
        </g>

        {/* Coordinate Terminal Micro-Dots */}
        <g fill="rgba(255, 255, 255, 0.25)">
          <circle cx="95" cy="115" r="1.5" />
          <circle cx="445" cy="105" r="1.5" />
          <circle cx="445" cy="335" r="1.5" />
          <circle cx="105" cy="325" r="1.5" />
          <circle cx="270" cy="65" r="2.5" fill="#f87171" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ── Circuit Traces & Pulse Lines ── */}

        {/* Trace 1: Top Right Alert / WAL Stream Line */}
        <g>
          {/* Static subtle background path */}
          <path
            d="M 315 152 L 350 152 C 354 152 357 149 357 145 L 357 78 C 357 74 360 71 364 71 L 435 71"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Outer glow pulse */}
          <path
            d="M 315 152 L 350 152 C 354 152 357 149 357 145 L 357 78 C 357 74 360 71 364 71 L 435 71"
            stroke={`url(#${id}-red-pulse)`}
            strokeWidth="5"
            opacity="0.35"
            strokeLinecap="round"
          />
          {/* Core sharp pulse */}
          <path
            d="M 315 152 L 350 152 C 354 152 357 149 357 145 L 357 78 C 357 74 360 71 364 71 L 435 71"
            stroke={`url(#${id}-red-pulse)`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Traveling particle */}
          <circle fill="#f87171" r="2.5">
            <animateMotion
              path="M 315 152 L 350 152 C 354 152 357 149 357 145 L 357 78 C 357 74 360 71 364 71 L 435 71"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              dur="3s"
              values="0;1;1;0"
              keyTimes="0;0.1;0.9;1"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Trace 2: Bottom Left Checkpoint / S3 Vault Line */}
        <g>
          <path
            d="M 215 240 L 175 240 C 171 240 168 243 168 247 L 168 335 C 168 339 165 342 161 342 L 115 342"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 215 240 L 175 240 C 171 240 168 243 168 247 L 168 335 C 168 339 165 342 161 342 L 115 342"
            stroke={`url(#${id}-amber-pulse)`}
            strokeWidth="5"
            opacity="0.35"
            strokeLinecap="round"
          />
          <path
            d="M 215 240 L 175 240 C 171 240 168 243 168 247 L 168 335 C 168 339 165 342 161 342 L 115 342"
            stroke={`url(#${id}-amber-pulse)`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle fill="#FFB31F" r="2.5">
            <animateMotion
              path="M 215 240 L 175 240 C 171 240 168 243 168 247 L 168 335 C 168 339 165 342 161 342 L 115 342"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              dur="2.5s"
              values="0;1;1;0"
              keyTimes="0;0.1;0.9;1"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Trace 3: Mid Left Agent / Sandbox Line */}
        <g>
          <path
            d="M 205 190 L 135 190"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 205 190 L 135 190"
            stroke={`url(#${id}-cyan-pulse)`}
            strokeWidth="4"
            opacity="0.3"
            strokeLinecap="round"
          />
          <path
            d="M 205 190 L 135 190"
            stroke={`url(#${id}-cyan-pulse)`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle fill="#38bdf8" r="2">
            <animateMotion
              path="M 205 190 L 135 190"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              dur="2s"
              values="0;1;1;0"
              keyTimes="0;0.1;0.9;1"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* ── 3D Isometric Database Cylinder Stack (3 Tiers) ── */}
        <g id="database-cylinder">
          {/* TIER 3: BOTTOM DISC */}
          {/* Cylinder side wall */}
          <path
            d="M 180 235 L 180 265 C 180 286 220 298 270 298 C 320 298 360 286 360 265 L 360 235 Z"
            fill={`url(#${id}-cylinder-wall)`}
          />
          {/* Bottom Neon Glowing Slit (Electric Cyan/Blue) */}
          <path
            d="M 180 265 C 180 286 220 298 270 298 C 320 298 360 286 360 265"
            stroke="#38bdf8"
            strokeWidth="2.5"
            fill="none"
            filter={`url(#${id}-glow)`}
            opacity="0.85"
          />

          {/* TIER 2: MIDDLE DISC */}
          {/* Cylinder side wall */}
          <path
            d="M 180 195 L 180 225 C 180 246 220 258 270 258 C 320 258 360 246 360 225 L 360 195 Z"
            fill={`url(#${id}-cylinder-wall)`}
          />
          {/* Middle Neon Glowing Slit (Backlify Brand Amber) */}
          <path
            d="M 180 225 C 180 246 220 258 270 258 C 320 258 360 246 360 225"
            stroke="#FFB31F"
            strokeWidth="2.5"
            fill="none"
            filter={`url(#${id}-glow)`}
            opacity="0.95"
          />

          {/* TIER 1: TOP DISC */}
          {/* Cylinder side wall */}
          <path
            d="M 180 155 L 180 185 C 180 206 220 218 270 218 C 320 218 360 206 360 185 L 360 155 Z"
            fill={`url(#${id}-cylinder-wall)`}
          />
          {/* Top Slit highlight */}
          <path
            d="M 180 185 C 180 206 220 218 270 218 C 320 218 360 206 360 185"
            stroke="#94a3b8"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />

          {/* Top Elliptical Disc Cap Surface */}
          <ellipse
            cx="270"
            cy="155"
            rx="90"
            ry="28"
            fill={`url(#${id}-cylinder-top)`}
            stroke="#333842"
            strokeWidth="1.5"
          />

          {/* Inset Core Ring with Neon Cyan Rim */}
          <ellipse
            cx="270"
            cy="155"
            rx="36"
            ry="11"
            fill="#090b10"
            stroke="#38bdf8"
            strokeWidth="2"
            filter={`url(#${id}-glow)`}
          />

          {/* Specular highlight arc on outer top rim */}
          <path
            d="M 200 152 C 230 144 310 144 340 152"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
            fill="none"
          />
        </g>

        {/* ── Signature DBDock Orbiting Restore Arc ── */}
        <g id="restore-orbit-loop">
          {/* Curved dashed restore stream */}
          <path
            d="M 360 175 C 430 205 435 295 348 308 C 322 312 300 300 286 286"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
            opacity="0.65"
          />
          {/* Arrowhead entering bottom tier */}
          <path
            d="M 296 280 L 286 286 L 293 294"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Moving photon particle along restore loop */}
          <circle fill="#38bdf8" r="3" filter={`url(#${id}-glow)`}>
            <animateMotion
              path="M 360 175 C 430 205 435 295 348 308 C 322 312 300 300 286 286"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              dur="3.2s"
              values="0;1;1;0"
              keyTimes="0;0.1;0.9;1"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Junction Nodes with Pulsing Glow */}
        <circle cx="315" cy="152" r="2.5" fill="#f87171">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="215" cy="240" r="2.5" fill="#FFB31F">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="205" cy="190" r="2.5" fill="#38bdf8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.1s" repeatCount="indefinite" />
        </circle>
        <circle cx="360" cy="175" r="3" fill="#38bdf8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* ── Monospace Telemetry Badges (HTML Overlay matching DBDock style) ── */}

      {/* Top Right: Migration / Schema Event */}
      <div
        className="pointer-events-none absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-xl transition-transform"
        style={{
          top: "13%",
          right: "2%",
          backgroundColor: "rgba(14, 16, 22, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#f87171", boxShadow: "0 0 6px #f87171" }}
        />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), 'Source Code Pro', monospace",
            fontSize: "11px",
            color: "#e2e8f0",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          DROP COLUMN plan_legacy
        </span>
      </div>

      {/* Mid Right: Restore Verification Loop */}
      <div
        className="pointer-events-none absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-xl"
        style={{
          top: "50%",
          right: "0%",
          backgroundColor: "rgba(14, 16, 22, 0.85)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }}
        />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), 'Source Code Pro', monospace",
            fontSize: "11px",
            color: "#f8fafc",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          restore drill
        </span>
      </div>

      {/* Mid Left: Sandbox Telemetry */}
      <div
        className="pointer-events-none absolute flex items-center gap-2 rounded-full px-3 py-1.5 shadow-xl"
        style={{
          top: "40%",
          left: "0%",
          backgroundColor: "rgba(14, 16, 22, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), 'Source Code Pro', monospace",
            fontSize: "11px",
            color: "#94a3b8",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          14:02 coding agent
        </span>
      </div>

      {/* Bottom Left: Checkpoint / Snapshot */}
      <div
        className="pointer-events-none absolute flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-xl"
        style={{
          bottom: "16%",
          left: "2%",
          backgroundColor: "rgba(14, 16, 22, 0.85)",
          border: "1px solid rgba(255, 179, 31, 0.25)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: "#FFB31F", boxShadow: "0 0 8px #FFB31F" }}
        />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), 'Source Code Pro', monospace",
            fontSize: "11px",
            color: "#f8fafc",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          14:01 checkpoint
        </span>
      </div>
    </div>
  );
}
