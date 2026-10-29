"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Exact Matching Feature SVGs ── */

function AutomationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
      <circle cx="12" cy="12" r="7" />
      <path d="M13 8.5l-3 4h4l-2 3.5" />
    </svg>
  );
}

function AnalyticsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7 16l3.5-4.5 3 3L17 9" />
      <path d="M14 9h3v3" />
    </svg>
  );
}

function ApprovalsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M12 2l2.4 2.4 3.4-.4 1.4 3.1 3.1 1.4-.4 3.4 2.4 2.4-2.4 2.4.4 3.4-3.1 1.4-1.4 3.1-3.4-.4L12 22l-2.4-2.4-3.4.4-1.4-3.1-3.1-1.4.4-3.4L2 12l2.4-2.4-.4-3.4 3.1-1.4 1.4-3.1 3.4.4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <rect x="3" y="3" width="7" height="9" rx="2" />
      <rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" />
      <rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  );
}

function PermissionsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 7.5v5" />
      <path d="M6 15.5h12" />
      <path d="M6 15.5v2M18 15.5v2" />
      <circle cx="6" cy="19.5" r="2" />
      <circle cx="18" cy="19.5" r="2" />
    </svg>
  );
}

function IntegrationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M7 6a3 3 0 1 0 0 6h4a3 3 0 0 1 3 3v3a3 3 0 1 0 6 0v-3a3 3 0 0 0-3-3h-4a3 3 0 0 1-3-3V6a3 3 0 0 0-3-3z" />
      <circle cx="7" cy="9" r="1.5" />
      <circle cx="17" cy="15" r="1.5" />
    </svg>
  );
}

function SupportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      {...props}
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

/* ── 1:1 Exact Veyro Pro Card ── */

export function VeyroProCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[380px] rounded-[30px] p-8 overflow-hidden select-none",
        "border border-[#1e293b]/70",
        "shadow-[0_20px_60px_-15px_rgba(2,132,199,0.35),0_0_80px_rgba(3,105,161,0.2)]",
        className
      )}
      style={{
        background: `
          radial-gradient(130% 95% at 50% 108%, #0284c7 0%, #0369a1 28%, #082f49 55%, #08111e 75%, transparent 100%),
          #080b11
        `,
      }}
    >
      {/* Top micro-stipple / celestial stars texture */}
      <svg
        className="absolute inset-x-0 top-0 h-44 w-full pointer-events-none opacity-30"
        aria-hidden="true"
      >
        <defs>
          <pattern id="veyro-stipple" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="8" r="0.8" fill="#94a3b8" />
            <circle cx="22" cy="14" r="1.1" fill="#e2e8f0" />
            <circle cx="16" cy="26" r="0.7" fill="#64748b" />
            <circle cx="31" cy="30" r="0.9" fill="#94a3b8" />
            <circle cx="10" cy="34" r="0.6" fill="#e2e8f0" />
          </pattern>
          <linearGradient id="stipple-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="stipple-mask">
            <rect width="100%" height="100%" fill="url(#stipple-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#veyro-stipple)" mask="url(#stipple-mask)" />
      </svg>

      {/* Top subtle rim light */}
      <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

      {/* ── Eyebrow: // VEYRO PRO ── */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <span className="font-mono text-xs font-semibold text-[#38bdf8] tracking-widest">//</span>
        <span className="font-mono text-[11px] font-semibold text-[#f1f5f9] tracking-[0.2em] uppercase">
          VEYRO PRO
        </span>
      </div>

      {/* ── Price: $28 // MONTH ── */}
      <div className="flex items-baseline gap-3 mb-7 relative z-10">
        <span className="font-sans text-[56px] font-semibold tracking-[-0.03em] text-white leading-none">
          $28
        </span>
        <span className="font-mono text-xs text-[#64748b] tracking-wider uppercase font-medium">
          // MONTH
        </span>
      </div>

      {/* ── Action Button: Start with Pro > ── */}
      <button
        type="button"
        className="w-full h-12 rounded-full font-medium text-[15px] text-white flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative z-10 hover:brightness-110 active:scale-[0.99]"
        style={{
          background: "linear-gradient(180deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)",
          boxShadow:
            "0 0 25px rgba(56, 189, 248, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.3)",
        }}
      >
        <span>Start with Pro</span>
        <span className="text-[18px] font-normal leading-none ml-0.5">›</span>
      </button>

      {/* ── Divider: ── EVERYTHING IN STARER, PLUS: ── ── */}
      <div className="flex items-center gap-3 my-7 relative z-10">
        <div className="h-[1px] flex-1 bg-[#1e293b]" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#64748b] font-medium shrink-0">
          EVERYTHING IN STARER, PLUS:
        </span>
        <div className="h-[1px] flex-1 bg-[#1e293b]" />
      </div>

      {/* ── Feature List ── */}
      <ul className="space-y-4 text-xs relative z-10">
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <AutomationIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Advanced automation</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <AnalyticsIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Real-time analytics</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <ApprovalsIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Multi-step approvals</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <DashboardIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Custom dashboards</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <PermissionsIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Team permissions</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <IntegrationsIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Integrations</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#e2e8f0]">
          <SupportIcon className="text-[#94a3b8]" />
          <span className="text-[14px] leading-tight font-normal">Priority support</span>
        </li>
      </ul>
    </div>
  );
}

/* ── Backlify Adaptation: Same Lighting & Depth in Backlify Brand Amber ── */

export function BacklifyProCardAdapted({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[380px] rounded-[30px] p-8 overflow-hidden select-none",
        "border border-amber-500/25",
        "shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3),0_0_80px_rgba(217,119,6,0.18)]",
        className
      )}
      style={{
        background: `
          radial-gradient(130% 95% at 50% 108%, #d97706 0%, #b45309 28%, #78350f 55%, #1f1406 75%, transparent 100%),
          #0b0a08
        `,
      }}
    >
      {/* Top micro-stipple / celestial stars texture */}
      <svg
        className="absolute inset-x-0 top-0 h-44 w-full pointer-events-none opacity-30"
        aria-hidden="true"
      >
        <defs>
          <pattern id="backlify-stipple" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="8" r="0.8" fill="#d97706" />
            <circle cx="22" cy="14" r="1.1" fill="#fde68a" />
            <circle cx="16" cy="26" r="0.7" fill="#78350f" />
            <circle cx="31" cy="30" r="0.9" fill="#f59e0b" />
            <circle cx="10" cy="34" r="0.6" fill="#fef3c7" />
          </pattern>
          <linearGradient id="stipple-fade-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="stipple-mask-amber">
            <rect width="100%" height="100%" fill="url(#stipple-fade-amber)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#backlify-stipple)" mask="url(#stipple-mask-amber)" />
      </svg>

      {/* Top subtle rim light */}
      <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

      {/* ── Eyebrow: // BACKLIFY PRO ── */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <span className="font-mono text-xs font-semibold text-amber-400 tracking-widest">//</span>
        <span className="font-mono text-[11px] font-semibold text-[#fef3c7] tracking-[0.2em] uppercase">
          BACKLIFY PRO
        </span>
      </div>

      {/* ── Price: $3 // MONTH ── */}
      <div className="flex items-baseline gap-3 mb-7 relative z-10">
        <span className="font-sans text-[56px] font-semibold tracking-[-0.03em] text-white leading-none">
          $3
        </span>
        <span className="font-mono text-xs text-[#92400e] tracking-wider uppercase font-medium">
          // MONTH
        </span>
      </div>

      {/* ── Action Button: Start with Pro > ── */}
      <button
        type="button"
        className="w-full h-12 rounded-full font-semibold text-[15px] text-black flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative z-10 hover:brightness-105 active:scale-[0.99]"
        style={{
          background: "linear-gradient(180deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)",
          boxShadow:
            "0 0 25px rgba(245, 158, 11, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.2)",
        }}
      >
        <span>Start with Pro</span>
        <span className="text-[18px] font-bold leading-none ml-0.5">›</span>
      </button>

      {/* ── Divider: ── EVERYTHING IN STARTER, PLUS: ── ── */}
      <div className="flex items-center gap-3 my-7 relative z-10">
        <div className="h-[1px] flex-1 bg-[#291e0a]" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#92400e] font-medium shrink-0">
          EVERYTHING IN STARTER, PLUS:
        </span>
        <div className="h-[1px] flex-1 bg-[#291e0a]" />
      </div>

      {/* ── Feature List ── */}
      <ul className="space-y-4 text-xs relative z-10">
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <AutomationIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">Hourly continuous backups</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <AnalyticsIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">Automated TOC verification drills</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <ApprovalsIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">50 GB managed cloud storage</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <DashboardIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">50 active database connections</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <PermissionsIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">Unlimited BYO storage vaults</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <IntegrationsIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">Discord & Slack incident webhooks</span>
        </li>
        <li className="flex items-center gap-3.5 text-[#fef3c7]">
          <SupportIcon className="text-amber-400" />
          <span className="text-[14px] leading-tight font-normal">Priority core engineer support</span>
        </li>
      </ul>
    </div>
  );
}
