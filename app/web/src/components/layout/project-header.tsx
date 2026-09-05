"use client";

import Link from "next/link";
import {
  IconSelector,
  IconPlugConnected,
  IconLayoutSidebar,
  IconGitBranch,
} from "@tabler/icons-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrgPickerClientActions } from "./org-picker-client-actions";

interface Props {
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  userInitials: string;
}

export function ProjectHeader({
  orgId,
  orgName,
  projectId,
  projectName,
  userInitials,
}: Props) {
  const triggerMobileMenu = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("backlify:open-modal", { detail: "sidebar" }));
    }
  };

  const projectInitial = projectName ? projectName.charAt(0).toUpperCase() : "P";

  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center justify-between px-3.5 sm:px-4 border-b border-border/80 bg-[#0e0e0e] text-xs w-full">
      {/* ── MOBILE HEADER (sm:hidden) ── */}
      <div className="flex sm:hidden items-center justify-between w-full">
        {/* Left: Project square avatar + Name + branch */}
        <Link
          href={`/dashboard/project/${projectId}`}
          className="flex items-center gap-2.5 min-w-0 pr-2"
        >
          <div className="size-8 rounded-md bg-[#181818] border border-[#262626] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {projectInitial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white text-[13px] truncate">
                {projectName}
              </span>
              <IconSelector className="size-3 text-muted-foreground shrink-0" />
            </div>
            <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground font-mono">
              <IconGitBranch className="size-3 text-amber-400" />
              <span>main</span>
            </div>
          </div>
        </Link>

        {/* Right: Connect icon + Avatar + Sidebar trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Connect database"
            className="size-8 rounded-full border border-border bg-[#181818] hover:bg-[#222222] flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
          >
            <IconPlugConnected className="size-4" />
          </button>

          <div className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
            {userInitials}
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={triggerMobileMenu}
            className="size-8 rounded-md border border-border/80 bg-[#161616] hover:bg-[#222222] flex items-center justify-center text-muted-foreground hover:text-white transition-colors ml-0.5"
          >
            <IconLayoutSidebar className="size-4" />
          </button>
        </div>
      </div>

      {/* ── DESKTOP HEADER (hidden sm:flex) ── */}
      <div className="hidden sm:flex items-center gap-2.5 w-full">
        {/* Brand Logo */}
        <Link href="/dashboard/org" className="flex items-center shrink-0 pr-1 hover:opacity-85 transition-opacity">
          <img
            src="/backlify-logo.svg"
            alt="Backlify"
            className="size-5 object-contain"
          />
        </Link>

        <span className="text-muted-foreground/40 font-light text-sm">/</span>

        {/* Org Selector */}
        <Link
          href={`/dashboard/org/${orgId}`}
          className="flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors font-medium text-sm"
        >
          <span className="size-4 rounded flex items-center justify-center text-muted-foreground shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
              <path d="M4 4h16v16H4z M9 9h6v6H9z" />
            </svg>
          </span>
          <span>{orgName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border/80 bg-muted/40 text-muted-foreground font-mono uppercase tracking-wider">
            FREE
          </span>
          <IconSelector className="size-3 text-muted-foreground shrink-0" />
        </Link>

        <span className="text-muted-foreground/40 font-light text-sm">/</span>

        {/* Project Selector */}
        <Link
          href={`/dashboard/project/${projectId}`}
          className="flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors font-medium text-sm truncate max-w-[200px]"
        >
          <span className="truncate">{projectName}</span>
          <IconSelector className="size-3 text-muted-foreground shrink-0" />
        </Link>

        <span className="text-muted-foreground/40 font-light text-sm">/</span>

        {/* Branch / Env Selector */}
        <div className="flex items-center gap-1.5 text-foreground text-sm">
          <span className="text-muted-foreground text-xs font-mono">main</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 uppercase font-mono tracking-wider">
            PRODUCTION
          </span>
          <IconSelector className="size-3 text-muted-foreground shrink-0" />
        </div>

        {/* Sidebar Trigger */}
        <SidebarTrigger className="size-7 text-muted-foreground hover:text-foreground ml-1" />

        {/* Connect CTA Pill */}
        <button
          type="button"
          className="hidden md:flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-[#181818] hover:border-border/80 hover:bg-[#202020] text-foreground transition-colors ml-2 font-medium cursor-pointer"
        >
          <IconPlugConnected className="size-3.5 text-muted-foreground" />
          <span>Connect</span>
        </button>

        {/* Right Desktop actions */}
        <div className="ml-auto">
          <OrgPickerClientActions userInitials={userInitials} />
        </div>
      </div>
    </header>
  );
}
