"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ShieldCheck, Clock, Bell, RefreshCw, HardDrive, Terminal } from "lucide-react";
import { IsometricQueueIllustration } from "@/components/marketing/isometric-queue-illustration";
import { IsometricReplicationIllustration } from "@/components/marketing/isometric-replication-illustration";
import { IsometricStorageIllustration } from "@/components/marketing/isometric-storage-illustration";
import { IsometricCronIllustration } from "@/components/marketing/isometric-cron-illustration";
import { IsometricAlertIllustration } from "@/components/marketing/isometric-alert-illustration";
import { TerminalMcpIllustration } from "@/components/marketing/terminal-mcp-illustration";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CoreFeaturesBentoProps {
  className?: string;
}

export function CoreFeaturesBento({ className }: CoreFeaturesBentoProps) {
  const isMobile = useIsMobile();
  return (
    <section
      id="features"
      className={cn(
        `relative w-full max-w-[1152px] mx-auto ${isMobile ? 'px-5' : 'px-6'} py-5 scroll-mt-20`,
        className
      )}
    >

      {/* ── 4-Column Supabase Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
        {/* ══════════════════════════════════════════════════════════
            CARD 1 (Row 1, 2 Cols): Automated Restore Drills
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 group relative rounded-2xl bg-[#101010ff]/90 border border-[#1b1e24] p-7 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div className="w-full md:w-[48%] flex flex-col justify-start shrink-0">
            <div className="flex items-center gap-2.5 text-[#f9fafb] text-lg mb-2">
              <ShieldCheck className="w-5 h-5 text-[#f9fafb] shrink-0" />
              <h3 className="font-sans text-[16px] text-[#f9fafb] tracking-tight">Automated Restore Drills</h3>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed mb-10">
              Never wonder if your backup actually works. Backlify automatically spins up <span className="text-[#f9fafb]">isolated sandbox containers</span>, restores dumps, and <span className="text-[#f9fafb]">validates data integrity</span>.
            </p>
            <ul className="space-y-2.5 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#f9fafb] shrink-0" />
                <span>Ephemeral Docker &amp; Firecracker sandboxes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#f9fafb] shrink-0" />
                <span>Automated checksum &amp; schema verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#f9fafb] shrink-0" />
                <span>Audit-ready compliance reports</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-[52%] flex items-center justify-center self-center">
            <IsometricQueueIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[390px]"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 2 (Row 1, 1 Col): Precision Cron & Retention
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-1 group relative rounded-2xl bg-[#101010ff]/90 border border-[#1b1e24] p-7 flex flex-col justify-between overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 text-[#f9fafb] text-base mb-2">
              <Clock className="w-5 h-5 text-[#f9fafb] shrink-0" />
              <h3 className="font-sans text-[16px] text-[#f9fafb] tracking-tight">Precision Cron</h3>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              <span className="text-[#f9fafb]">Sub-hourly cron schedules</span> with GFS (Grandfather-Father-Son) <span className="text-[#f9fafb]">retention policies</span>.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <IsometricCronIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[310px]"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 3 (Row 1, 1 Col): Multi-Channel Incident Alerts
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-1 group relative rounded-2xl bg-[#101010ff]/90 border border-[#1b1e24] p-7 flex flex-col justify-between overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 text-[#f9fafb] text-base mb-2">
              <Bell className="w-5 h-5 text-[#f9fafb] shrink-0" />
              <h3 className="font-sans text-[16px] text-[#f9fafb] tracking-tight">Incident Alerts</h3>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              <span className="text-[#f9fafb]">Instant alerts</span> to Slack, Discord, Telegram, and Webhooks <span className="text-[#f9fafb]">when backups lag or fail</span>.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <IsometricAlertIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[310px]"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 4 (Row 2, 1 Col): Model Context Protocol (MCP)
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-1 group relative rounded-2xl bg-[#101010ff]/90 border border-[#1b1e24] p-7 flex flex-col justify-between overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 text-[#f9fafb] text-base mb-2">
              <Terminal className="w-5 h-5 text-[#f9fafb] shrink-0" />
              <h3 className="font-sans text-[16px] text-[#f9fafb] tracking-tight">MCP</h3>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              <span className="text-[#f9fafb]">Control backups and restore drills</span> directly from <span className="text-[#f9fafb]">Claude, Cursor, and AI agents</span>.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <TerminalMcpIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[310px]"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 5 (Row 2, 1 Col): Continuous WAL Streaming & PITR
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-1 group relative rounded-2xl bg-[#101010ff]/90 border border-[#1b1e24] p-7 flex flex-col justify-between overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 text-[#f9fafb] text-base mb-2">
              <RefreshCw className="w-5 h-5 text-[#f9fafb] shrink-0" />
              <h3 className="font-sans text-[16px] text-[#f9fafb] tracking-tight">Point In Time Recovery</h3>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              <span className="text-[#f9fafb]">Stream write-ahead logs</span> in real-time. Rewind your database to <span className="text-[#f9fafb]">any exact second</span>.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <IsometricReplicationIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[310px]"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 6 (Row 2, 2 Cols): Zero-Knowledge BYOS Storage
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 group relative rounded-2xl bg-[#101010ff]/90 border border-[#1b1e24] p-7 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div className="w-full md:w-[48%] flex flex-col justify-start shrink-0">
            <div className="flex items-center gap-2.5 text-[#f9fafb] text-lg mb-2">
              <HardDrive className="w-5 h-5 text-[#f9fafb] shrink-0" />
              <h3 className="font-sans text-[16px] text-[#f9fafb] tracking-tight">BYOS Storage</h3>
            </div>
            <p className="text-xs text-[#8a8f98] leading-relaxed mb-10">
              Bring your own <span className="text-[#f9fafb]">S3, Cloudflare R2, GCS, or MinIO</span>. Encrypted client-side with <span className="text-[#f9fafb]">AES-256-GCM</span> before chunks ever leave your servers.
            </p>
            <ul className="space-y-2.5 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#f9fafb] shrink-0" />
                <span>AES-256-GCM client-side encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#f9fafb] shrink-0" />
                <span>AWS S3, Cloudflare R2, GCS &amp; MinIO</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#f9fafb] shrink-0" />
                <span>Zero vendor lock-in &amp; zero egress markup</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-[52%] flex items-center justify-center self-center">
            <IsometricStorageIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[390px]"
            />
          </div>
        </div>
      </div>

      {/* ── Sub-Bento Tagline (Supabase Style) ── */}
      <div className="mt-12 sm:mt-16 text-left">
        <p className="font-sans text-xl sm:text-2xl text-[#8a8f98] tracking-tight">
          <span className="text-[#f9fafb] font-medium">Backup, verify, restore.</span>{" "}
          Battle tested database disaster recovery.
        </p>
      </div>
    </section>
  );
}
