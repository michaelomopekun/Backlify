"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ShieldCheck, Clock, Bell, RefreshCw, HardDrive } from "lucide-react";
import { IsometricQueueIllustration } from "@/components/marketing/isometric-queue-illustration";
import { IsometricReplicationIllustration } from "@/components/marketing/isometric-replication-illustration";
import { IsometricStorageIllustration } from "@/components/marketing/isometric-storage-illustration";
import { IsometricCronIllustration } from "@/components/marketing/isometric-cron-illustration";
import { IsometricAlertIllustration } from "@/components/marketing/isometric-alert-illustration";

export interface CoreFeaturesBentoProps {
  className?: string;
}

export function CoreFeaturesBento({ className }: CoreFeaturesBentoProps) {
  return (
    <section className={cn("relative w-full max-w-[1240px] mx-auto px-17 py-5", className)}>

      {/* ── 4-Column Supabase Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
        {/* ══════════════════════════════════════════════════════════
            CARD 1 (Row 1, 2 Cols): Automated Restore Drills
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 group relative rounded-2xl bg-[#0c0d12]/90 border border-[#1b1e24] p-7 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div className="w-full md:w-[48%] flex flex-col justify-start shrink-0">
            <div className="flex items-center gap-2.5 text-[#f9fafb] font-medium text-lg mb-2">
              <ShieldCheck className="w-5 h-5 text-[#94a3b8] shrink-0" />
              <h3>Automated Restore Drills</h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-10">
              Never wonder if your backup actually works. Backlify automatically spins up isolated
              sandbox containers, restores dumps, and validates data integrity.
            </p>
            <ul className="space-y-2.5 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>Ephemeral Docker &amp; Firecracker sandboxes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>Automated checksum &amp; schema verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
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
        <div className="lg:col-span-1 group relative rounded-2xl bg-[#0c0d12]/90 border border-[#1b1e24] p-7 flex flex-col justify-between overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 text-[#f9fafb] font-medium text-base mb-2">
              <Clock className="w-5 h-5 text-[#94a3b8] shrink-0" />
              <h3>Precision Cron</h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Sub-hourly cron schedules with GFS (Grandfather-Father-Son) retention policies.
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
        <div className="lg:col-span-1 group relative rounded-2xl bg-[#0c0d12]/90 border border-[#1b1e24] p-7 flex flex-col justify-between overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 text-[#f9fafb] font-medium text-base mb-2">
              <Bell className="w-5 h-5 text-[#94a3b8] shrink-0" />
              <h3>Incident Alerts</h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Instant alerts to Slack, Discord, Telegram, and Webhooks when backups lag or fail.
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
            CARD 4 (Row 2, 2 Cols): Continuous WAL Streaming & PITR
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 group relative rounded-2xl bg-[#0c0d12]/90 border border-[#1b1e24] p-7 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div className="w-full md:w-[48%] flex flex-col justify-start shrink-0">
            <div className="flex items-center gap-2.5 text-[#f9fafb] font-medium text-lg mb-2">
              <RefreshCw className="w-5 h-5 text-[#94a3b8] shrink-0" />
              <h3>Point In Time Recovery</h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-10">
              Stream write-ahead logs in real-time. Rewind your PostgreSQL database to any exact
              second with point-in-time recovery.
            </p>
            <ul className="space-y-2.5 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>Sub-second RPO streaming replication</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>Non-blocking pg_receivewal log shipping</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>Automated standby replica synchronization</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-[52%] flex items-center justify-center self-center">
            <IsometricReplicationIllustration
              playOnHover={true}
              accentColor="#FFB31F"
              className="w-full max-w-[390px]"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CARD 5 (Row 2, 2 Cols): Zero-Knowledge BYOS Storage
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 group relative rounded-2xl bg-[#0c0d12]/90 border border-[#1b1e24] p-7 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 overflow-hidden hover:border-[#2a2f3a] transition-all duration-300">
          <div className="w-full md:w-[48%] flex flex-col justify-start shrink-0">
            <div className="flex items-center gap-2.5 text-[#f9fafb] font-medium text-lg mb-2">
              <HardDrive className="w-5 h-5 text-[#94a3b8] shrink-0" />
              <h3>BYOS Storage</h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-10">
              Bring your own S3, Cloudflare R2, GCS, or MinIO. Encrypted client-side with
              AES-256-GCM before chunks ever leave your servers.
            </p>
            <ul className="space-y-2.5 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>AES-256-GCM client-side encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                <span>AWS S3, Cloudflare R2, GCS &amp; MinIO</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
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
    </section>
  );
}
