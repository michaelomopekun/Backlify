"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Exact Matching Feature SVGs (Fixed 17x17 Size) ── */

function AutomationIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
      <circle cx="12" cy="12" r="7" />
      <path d="M13 8.5l-3 4h4l-2 3.5" />
    </svg>
  );
}

function AnalyticsIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7 11.5l3-3 3 2.5 4-4" />
      <path d="M14.5 7H17v2.5" />
      <path d="M7.5 17v-2" />
      <path d="M11.5 17v-4" />
      <path d="M15.5 17v-6" />
    </svg>
  );
}

function ApprovalsIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M12 2l2.4 2.4 3.4-.4 1.4 3.1 3.1 1.4-.4 3.4 2.4 2.4-2.4 2.4.4 3.4-3.1 1.4-1.4 3.1-3.4-.4L12 22l-2.4-2.4-3.4.4-1.4-3.1-3.1-1.4.4-3.4L2 12l2.4-2.4-.4-3.4 3.1-1.4 1.4-3.1 3.4.4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function DashboardIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <rect x="3" y="3" width="7" height="9" rx="2" />
      <rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" />
      <rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  );
}

function PermissionsIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
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

function IntegrationsIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M7 6a3 3 0 1 0 0 6h4a3 3 0 0 1 3 3v3a3 3 0 1 0 6 0v-3a3 3 0 0 0-3-3h-4a3 3 0 0 1-3-3V6a3 3 0 0 0-3-3z" />
      <circle cx="7" cy="9" r="1.5" />
      <circle cx="17" cy="15" r="1.5" />
    </svg>
  );
}

function SupportIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

/* ── 1:1 Exact Veyro Pro Card (Pixel-Perfect Matching Reference Image) ── */

export interface VeyroCardProps {
  className?: string;
  patternVariant?: "exact" | "brand" | "blue" | "amber";
  patternOpacity?: number;
}

export function VeyroProCard({
  className,
  patternVariant = "exact",
  patternOpacity = 0.95,
}: VeyroCardProps) {
  const patternSrc =
    patternVariant === "brand" || patternVariant === "blue"
      ? "/pegboard-blue.png"
      : patternVariant === "amber"
      ? "/pegboard-amber.png"
      : "/pegboard-exact.png";

  return (
    <div
      className={cn(
        "relative w-[340px] sm:w-[360px] rounded-[28px] px-7 pt-7 pb-8 overflow-hidden select-none",
        "border border-[#1e293b]/70",
        className
      )}
      style={{
        background: `
          radial-gradient(130% 30% at 50% 80%, #0284c7 0%, #0369a1 26%, #082f49 52%, #08111e 72%, transparent 100%),
          #080b11
        `,
      }}
    >
      {/* Top Pegboard Dot-Matrix Texture with 3D Glowing Beads */}
      <div
        className="absolute inset-x-0 top-0 h-[180px] w-full pointer-events-none overflow-hidden select-none z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35) 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35) 82%, transparent 100%)",
        }}
      >
        <img
          src={patternSrc}
          alt=""
          className="w-full h-full object-cover object-top"
          style={{ opacity: patternOpacity }}
        />
      </div>

      {/* Top subtle rim light */}
      <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none z-10" />

      {/* ── Eyebrow: // VEYRO PRO ── */}
      <div className="flex items-center gap-2 mb-11 relative z-10">
        <span className="font-mono text-xs font-semibold text-[#38bdf8] tracking-widest">//</span>
        <span className="font-mono text-[11px] font-semibold text-[#f1f5f9] tracking-[0.18em] uppercase">
          VEYRO PRO
        </span>
      </div>

      {/* ── Price: $28 // MONTH ── */}
      <div className="flex items-baseline gap-3 mb-7 relative z-10">
        <span className="font-sans text-[48px] font-semibold tracking-[-0.03em] text-white leading-none">
          $28
        </span>
        <span className="font-mono text-[11px] text-[#64748b] tracking-wider uppercase font-medium">
          // MONTH
        </span>
      </div>

      {/* ── Action Button: Start with Pro > ── */}
      <button
        type="button"
        className="w-full h-[46px] rounded-full font-medium text-[14.5px] text-white flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative z-10 hover:brightness-110 active:scale-[0.99]"
        style={{
          background: "linear-gradient(180deg, #38bdf8 0%, #0ea5e9 55%, #0284c7 100%)",
        }}
      >
        <span>Start with Pro</span>
        <span className="text-[17px] font-normal leading-none ml-0.5">›</span>
      </button>

      {/* ── Divider: ── EVERYTHING IN STARER, PLUS: ── ── */}
      <div className="flex items-center gap-2.5 mt-10 mb-9 relative z-10">
        <div className="h-[1px] flex-1 bg-[#1e293b]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#64748b] font-medium shrink-0">
          EVERYTHING IN STARER, PLUS:
        </span>
        <div className="h-[1px] flex-1 bg-[#1e293b]" />
      </div>

      {/* ── Feature List (Exact Compact Spacing) ── */}
      <ul className="space-y-4.5 relative z-10">
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <AutomationIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Advanced automation</span>
        </li>
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <AnalyticsIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Real-time analytics</span>
        </li>
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <ApprovalsIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Multi-step approvals</span>
        </li>
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <DashboardIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Custom dashboards</span>
        </li>
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <PermissionsIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Team permissions</span>
        </li>
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <IntegrationsIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Integrations</span>
        </li>
        <li className="flex items-center gap-3 text-[#cbd5e1]">
          <SupportIcon className="text-[#94a3b8]" />
          <span className="text-[13.5px] leading-tight font-normal">Priority support</span>
        </li>
      </ul>
    </div>
  );
}

/* ── Backlify Purpose-Crafted Feature SVGs (17x17 Developer-First Icons) ── */

// 1. Hourly continuous backups: Circular sync history loop with clock
function BackupClockIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// 2. Automated TOC verification drills: Data integrity verification shield with check
function VerificationDrillIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// 3. 50 GB managed cloud storage: Cloud volume with upload/storage indicator
function CloudStorageIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
      <path d="M12 12v5" />
      <path d="m9.5 14.5 2.5-2.5 2.5 2.5" />
    </svg>
  );
}

// 4. 50 active database connections: Multi-tier database cylinders
function DatabaseIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

// 5. Unlimited BYO storage vaults: Reinforced safe vault with combination dial & spokes
function StorageVaultIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v2m0 4v2m-4-4h2m4 0h2" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

// 6. Discord & Slack incident webhooks: Incident alert bell with notification clapper
function IncidentWebhookIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
      <path d="M20 2c1.2 1.7 2 3.7 2 6" />
    </svg>
  );
}

// 7. Priority core engineer support: Direct engineer support headset with microphone
function CoreEngineerSupportIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      <path d="M19 19v1a2 2 0 0 1-2 2h-5" />
    </svg>
  );
}

// 8. 7-day retention: Calendar history
function CalendarHistoryIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

// 9. Local CLI toolchain & checkpoints
function TerminalIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

// 10. Community support & email alerts
function MailAlertIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// 11. Zero-knowledge security & encryption
function LockSecurityIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-[17px] h-[17px] min-w-[17px] min-h-[17px] shrink-0", className)}
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  );
}

/* ── Backlify Adaptation: Same Lighting & Depth in Brand Amber ── */

export interface BacklifyCardProps {
  className?: string;
  patternVariant?: "exact" | "brand" | "amber" | "blue";
  patternOpacity?: number;
  subtitle?: string;
}

export function BacklifyProCardAdapted({
  className,
  patternVariant = "amber",
  patternOpacity = 0.45,
  subtitle = "Complete database disaster recovery, continuous verification drills & incident alerts.",
}: BacklifyCardProps) {
  const patternSrc =
    patternVariant === "exact"
      ? "/pegboard-exact.png"
      : patternVariant === "blue"
      ? "/pegboard-blue.png"
      : "/pegboard-amber.png";

  return (
    <div
      className={cn(
        "relative w-[340px] sm:w-[360px] rounded-[20px] px-7 pt-7 pb-8 select-none overflow-hidden",
        "border-4 border-[#272522]",
        className
      )}
      style={{
        background: `
          radial-gradient(130% 40% at 50% 108%, #d97706 0%, #b45309 16%, #78350f 12%, #1f1406 72%, transparent 100%),
          #0b0a08
        `,
      }}
    >
      {/* Top Pegboard Dot-Matrix Texture with 3D Glowing Beads */}
      <div
        className="absolute inset-x-0 top-0 h-[180px] w-full pointer-events-none overflow-hidden select-none z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35) 82%, transparent 10%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35) 82%, transparent 10%)",
        }}
      >
        <img
          src={patternSrc}
          alt=""
          className="w-full h-full object-cover object-top"
          style={{ opacity: patternOpacity }}
        />
      </div>

      {/* Top subtle rim light */}
      <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none z-10" />

      {/* ── Eyebrow: // BACKLIFY PRO ── */}
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <span className="font-mono text-xs font-semibold text-amber-400 tracking-widest">//</span>
        <span className="font-mono text-[11px] font-semibold text-[#fef3c7] tracking-[0.18em] uppercase">
          BACKLIFY PRO
        </span>
      </div>

      {/* ── 1-Line Value Subtitle (Clear Utility Context) ── */}
      {subtitle && (
        <p className="text-[12px] text-[#fef3c7]/70 leading-relaxed mb-6 relative z-10 font-normal">
          {subtitle}
        </p>
      )}

      {/* ── Price: $3 // MONTH ── */}
      <div className="flex items-baseline gap-3 mb-7 relative z-10">
        <span className="font-sans text-[48px] font-medium tracking-[-0.03em] text-white leading-none">
          $3
        </span>
        <span className="font-mono text-[11px] text-[#b45309] tracking-wider uppercase font-medium">
          // MONTH
        </span>
      </div>

      {/* ── Action Button: Start with Pro > ── */}
      <button
        type="button"
        className="w-full h-[46px] rounded-md font-semibold text-[14.5px] text-black flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative z-10 hover:brightness-105 active:scale-[0.99]"
        style={{
          background: "linear-gradient(180deg, #fcd34d 0%, #fbbf24 55%, #f59e0b 100%)",
        }}
      >
        <span>Start with Pro</span>
        <span className="text-[17px] font-bold leading-none ml-0.5">›</span>
      </button>

      {/* ── Divider: ── EVERYTHING IN STARTER, PLUS: ── ── */}
      <div className="flex items-center gap-2.5 mt-10 mb-10 relative z-10">
        <div className="h-[1px] flex-1 bg-[#291e0a]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#b45309] font-medium shrink-0">
          EVERYTHING IN STARTER, PLUS:
        </span>
        <div className="h-[1px] flex-1 bg-[#291e0a]" />
      </div>

      {/* ── Feature List ── */}
      <ul className="space-y-5 relative z-10">
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <BackupClockIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Hourly continuous backups</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <VerificationDrillIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Automated TOC verification drills</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <CloudStorageIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">50 GB managed cloud storage</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <DatabaseIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">50 active database connections</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <StorageVaultIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Unlimited BYO storage vaults</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <IncidentWebhookIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Discord & Slack incident webhooks</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]">
          <CalendarHistoryIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">30-day snapshot retention history</span>
        </li>
      </ul>
    </div>
  );
}

/* ── Backlify Starter Card: Free Plan (Without Pro Aesthetics) ── */

export interface BacklifyStarterCardProps {
  className?: string;
  subtitle?: string;
  patternVariant?: "exact" | "brand" | "amber" | "blue";
  patternOpacity?: number;
}

export function BacklifyStarterCard({
  className,
  patternOpacity = 0.20,
  patternVariant = "brand",
  subtitle = "Local database checkpoints, daily schedules & essential recovery drills.",
}: BacklifyStarterCardProps) {
  const patternSrc =
    patternVariant === "exact"
      ? "/pegboard-exact.png"
      : patternVariant === "blue"
      ? "/pegboard-blue.png"
      : "/pegboard-amber.png";
  return (
    <div
      className={cn(
        "relative w-[340px] sm:w-[360px] rounded-[20px] px-7 pt-7 pb-8 select-none overflow-hidden",
        "bg-[#0b0a08] border border-[#222328] hover:border-[#2e3038] transition-colors duration-200",
        className
      )}
    >

      {/* Top Pegboard Dot-Matrix Texture with 3D Glowing Beads */}
      <div
        className="absolute inset-x-0 top-0 h-[180px] w-full pointer-events-none overflow-hidden select-none z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35) 82%, transparent 10%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35) 82%, transparent 10%)",
        }}
      >
        <img
          src={patternSrc}
          alt=""
          className="w-full h-full object-cover object-top"
          style={{ opacity: patternOpacity }}
        />
      </div>

     {/* Top subtle rim light */}
      <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none z-10" />


      {/* ── Eyebrow: // BACKLIFY STARTER ── */}
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <span className="font-mono text-xs font-semibold text-[#FFFFFF] tracking-widest">//</span>
        <span className="font-mono text-[11px] font-semibold text-[#FFFFFF] tracking-[0.18em] uppercase">
          BACKLIFY STARTER
        </span>
      </div>

      {/* ── 1-Line Value Subtitle ── */}
      {subtitle && (
        <p className="text-[12px] text-[#FFFFFF]/60 leading-relaxed mb-6 relative z-10 font-normal">
          {subtitle}
        </p>
      )}

      {/* ── Price: $0 // FOREVER ── */}
      <div className="flex items-baseline gap-3 mb-7 relative z-10">
        <span className="font-sans text-[48px] font-medium tracking-[-0.03em] text-[#f1f5f9] leading-none">
          $0
        </span>
        <span className="font-mono text-[11px] text-[#b45309] tracking-wider uppercase font-medium">
          // FOREVER
        </span>
      </div>

      {/* ── Action Button: Deploy for free (Clean secondary dark styling) ── */}
      <button
        type="button"
        className="w-full h-[46px] rounded-md font-medium text-[14.5px] text-[#f1f5f9] bg-[#121316]/50 hover:bg-[#22242b] border border-[#2d2f38] hover:border-[#3b3e4a] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative z-10 active:scale-[0.99]"
      >
        <span>Get started free</span>
        <span className="text-[17px] font-normal leading-none ml-0.5 text-[#ffffff]">›</span>
      </button>

      {/* ── Divider: ── INCLUDED IN STARTER: ── ── */}
      <div className="flex items-center gap-2.5 mt-10 mb-10 relative z-10">
        <div className="h-[1px] flex-1 bg-[#1e2026]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#b45309] font-medium shrink-0">
          INCLUDED IN STARTER:
        </span>
        <div className="h-[1px] flex-1 bg-[#1e2026]" />
      </div>

      {/* ── Feature List (Clean Muted Slate Icons) ── */}
      <ul className="space-y-5 relative z-10">
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <BackupClockIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Daily automated backup schedules</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <VerificationDrillIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">1 recovery verification drill / mo</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <CloudStorageIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">50 MB cloud storage & BYO vaults</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <DatabaseIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">2 active database connections</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <CalendarHistoryIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">7-day snapshot retention history</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <TerminalIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Local checkpoints & CLI toolchain</span>
        </li>
        <li className="flex items-center gap-3 text-[#fef3c7]/80">
          <LockSecurityIcon className="text-amber-400" />
          <span className="text-[13.5px] leading-tight font-normal">Client-side AES-256 encryption</span>
        </li>
      </ul>
    </div>
  );
}
