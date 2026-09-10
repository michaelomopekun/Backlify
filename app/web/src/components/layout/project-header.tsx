"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconSelector,
  IconPlugConnected,
  IconLayoutSidebar,
  IconGitBranch,
  IconSearch,
  IconCheck,
  IconPlus,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrgPickerClientActions } from "./org-picker-client-actions";
import { Boxes } from "lucide-react";

function WireframeCubeIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  const [orgSearch, setOrgSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [isSlideComplete, setIsSlideComplete] = useState(false);

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
              <IconGitBranch className="size-3 text-muted-foreground" />
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

          <div className="size-7 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-foreground text-xs font-medium flex items-center justify-center shrink-0">
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
      <div className="hidden sm:flex items-center gap-2 w-full">
        {/* Brand Logo */}
        <Link href="/dashboard/org" className="flex items-center shrink-0 pr-0.5 hover:opacity-85 transition-opacity">
          <img
            src="/backlify-logo.svg"
            alt="Backlify"
            width={28}
            height={28}
            className="size-7 object-contain shrink-0"
          />
        </Link>

        <span className="text-[#444444] text-[13px] font-light select-none">/</span>

        {/* ── Org Selector + Dropdown ── */}
        <div className="flex items-center gap-1.5 shrink-0 relative z-10 bg-[#0e0e0e]">
          <Link
            href={`/dashboard/org/${orgId}`}
            className="flex items-center gap-1.5 text-[#dddddd] hover:text-white transition-colors text-[13px] font-normal"
          >
            <Boxes className="size-3.5 text-[#888888] shrink-0" />
            <span>{orgName}</span>
          </Link>

          <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#2d2d2d] bg-[#141414] text-[#888888] font-mono uppercase tracking-wider select-none">
            FREE
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Switch organization"
                className="size-6 rounded flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1f1f1f] border border-transparent hover:border-[#2e2e2e] data-[state=open]:bg-[#1c1c1c] data-[state=open]:border-[#2e2e2e] data-[state=open]:text-white transition-all cursor-pointer outline-none"
              >
                <IconSelector className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={6}
              className="w-64 bg-[#171717] border border-[#2c2c2c] rounded-lg shadow-2xl p-0 text-xs text-white z-50 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#262626]" onClick={(e) => e.stopPropagation()}>
                <IconSearch className="size-3.5 text-[#666666] shrink-0" />
                <input
                  type="text"
                  placeholder="Find organization..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="bg-transparent text-xs text-white placeholder-[#666666] outline-none w-full font-sans"
                  autoFocus
                />
              </div>

              {/* Organization List */}
              <div className="py-1 max-h-52 overflow-y-auto">
                {orgName.toLowerCase().includes(orgSearch.toLowerCase()) && (
                  <Link
                    href={`/dashboard/org/${orgId}`}
                    className="flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-[#222222] rounded-sm mx-1 cursor-pointer font-medium transition-colors"
                  >
                    <span className="truncate">{orgName}</span>
                    <IconCheck className="size-3.5 text-white shrink-0 ml-2" />
                  </Link>
                )}

                <Link
                  href="/dashboard/org"
                  className="flex items-center px-3 py-2 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm mx-1 cursor-pointer transition-colors"
                >
                  <span>All Organizations</span>
                </Link>
              </div>

              {/* Separator */}
              <div className="h-px bg-[#262626]" />

              {/* New Organization Action */}
              <div className="p-1">
                <Link
                  href="/dashboard/org/new"
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm cursor-pointer transition-colors"
                >
                  <IconPlus className="size-3.5 text-[#888888]" />
                  <span>New organization</span>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Nested Project & Branch Breadcrumb Segment (Sliding out from Org) ── */}
        <div
          key={projectId}
          className="grid grid-cols-[0fr] animate-project-slide-open shrink-0"
        >
          <div
            onAnimationEnd={() => setIsSlideComplete(true)}
            className={`flex items-center min-w-0 ${isSlideComplete ? "overflow-visible" : "overflow-hidden"}`}
          >
            <div className="flex items-center gap-2 shrink-0 animate-project-slide-content">
              <span className="text-[#444444] text-[13px] font-light select-none">/</span>

              {/* ── Project Selector + Dropdown ── */}
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/dashboard/project/${projectId}`}
                  className="flex items-center gap-1.5 text-[#dddddd] hover:text-white transition-colors text-[13px] font-normal truncate max-w-[200px]"
                >
                  <WireframeCubeIcon className="size-3.5 text-[#888888] shrink-0" />
                  <span className="truncate">{projectName}</span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Switch project"
                      className="size-6 rounded flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1f1f1f] border border-transparent hover:border-[#2e2e2e] data-[state=open]:bg-[#1c1c1c] data-[state=open]:border-[#2e2e2e] data-[state=open]:text-white transition-all cursor-pointer outline-none"
                    >
                      <IconSelector className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={6}
                    className="w-64 bg-[#171717] border border-[#2c2c2c] rounded-lg shadow-2xl p-0 text-xs text-white z-50 overflow-hidden"
                  >
                    {/* Search input */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#262626]" onClick={(e) => e.stopPropagation()}>
                      <IconSearch className="size-3.5 text-[#666666] shrink-0" />
                      <input
                        type="text"
                        placeholder="Find project..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="bg-transparent text-xs text-white placeholder-[#666666] outline-none w-full font-sans"
                        autoFocus
                      />
                    </div>

                    {/* Project List */}
                    <div className="py-1 max-h-52 overflow-y-auto">
                      {projectName.toLowerCase().includes(projectSearch.toLowerCase()) && (
                        <Link
                          href={`/dashboard/project/${projectId}`}
                          className="flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-[#222222] rounded-sm mx-1 cursor-pointer font-medium transition-colors"
                        >
                          <span className="truncate">{projectName}</span>
                          <IconCheck className="size-3.5 text-white shrink-0 ml-2" />
                        </Link>
                      )}

                      <Link
                        href={`/dashboard/org/${orgId}`}
                        className="flex items-center px-3 py-2 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm mx-1 cursor-pointer transition-colors"
                      >
                        <span>All Projects</span>
                      </Link>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-[#262626]" />

                    {/* New Project Action */}
                    <div className="p-1">
                      <Link
                        href={`/dashboard/project/new`}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm cursor-pointer transition-colors"
                      >
                        <IconPlus className="size-3.5 text-[#888888]" />
                        <span>New project</span>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <span className="text-[#444444] text-[13px] font-light select-none">/</span>

              {/* ── Branch / Env Selector + Dropdown ── */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#dddddd] text-[13px] font-normal font-sans">main</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] font-mono tracking-wider select-none">
                  PRODUCTION
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Switch branch"
                      className="size-6 rounded flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1f1f1f] border border-transparent hover:border-[#2e2e2e] data-[state=open]:bg-[#1c1c1c] data-[state=open]:border-[#2e2e2e] data-[state=open]:text-white transition-all cursor-pointer outline-none"
                    >
                      <IconSelector className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={6}
                    className="w-56 bg-[#171717] border border-[#2c2c2c] rounded-lg shadow-2xl p-1 text-xs text-white z-50"
                  >
                    <div className="px-2.5 py-1.5 text-[11px] font-medium text-[#777777] uppercase tracking-wider">
                      Branches
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-white bg-[#222222] rounded cursor-pointer font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">main</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[#f59e0b] uppercase font-mono">
                          PRODUCTION
                        </span>
                      </div>
                      <IconCheck className="size-3.5 text-white shrink-0" />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Trigger */}
        <SidebarTrigger className="size-7 text-muted-foreground hover:text-foreground ml-1 shrink-0" />

        {/* Connect CTA Pill */}
        <button
          type="button"
          className="hidden md:flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-[#181818] hover:border-border/80 hover:bg-[#202020] text-foreground transition-colors ml-2 font-medium cursor-pointer shrink-0 animate-project-connect"
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
