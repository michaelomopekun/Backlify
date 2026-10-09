"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconSelector,
  IconPlugConnected,
  IconLayoutSidebar,
  IconGitBranch,
  IconSearch,
  IconCheck,
  IconPlus,
  IconSettings,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrgPickerClientActions } from "./org-picker-client-actions";
import { ConnectDialog } from "@/components/projects/connect-dialog";
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

function WireframeCubeIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface ProjectItem {
  id: string;
  name: string;
  orgId?: string | null;
}

export interface OrgItem {
  id: string;
  name: string;
}

interface Props {
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  userInitials: string;
  userEmail?: string;
  userName?: string;
  environment?: string | null;
  databaseUrl?: string | null;
  projects?: ProjectItem[];
  organizations?: OrgItem[];
}

export function ProjectHeader({
  orgId,
  orgName,
  projectId,
  projectName,
  userInitials,
  userEmail,
  userName,
  environment,
  databaseUrl,
  projects = [],
  organizations = [],
}: Props) {
  const router = useRouter();
  const [orgSearch, setOrgSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [isSlideComplete, setIsSlideComplete] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [currentEnv, setCurrentEnv] = useState(environment ?? "production");

  useEffect(() => {
    if (environment) {
      setCurrentEnv(environment);
    }
  }, [environment]);

  const handleSelectEnv = async (env: string) => {
    if (env.toLowerCase() === currentEnv.toLowerCase()) return;
    setCurrentEnv(env);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: env }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to switch environment:", err);
    }
  };

  const getEnvBadgeStyles = (env: string) => {
    const lower = env.toLowerCase();
    if (lower === "production") {
      return "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]";
    }
    if (lower === "staging") {
      return "border-sky-500/30 bg-sky-500/10 text-sky-400";
    }
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  };

  const triggerMobileMenu = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("backlify:open-modal", { detail: "sidebar" }));
    }
  };

  const projectInitial = projectName ? projectName.charAt(0).toUpperCase() : "P";

  const orgsList = organizations.length > 0
    ? organizations
    : [{ id: orgId, name: orgName }];

  const projectListToUse = projects.length > 0
    ? projects
    : [{ id: projectId, name: projectName, orgId }];

  const orgNameMap = new Map(orgsList.map((o) => [o.id, o.name]));

  const query = projectSearch.toLowerCase().trim();
  const currentOrgProjects = projectListToUse.filter((p) => (p.orgId ?? orgId) === orgId);
  const otherOrgProjects = projectListToUse.filter((p) => p.orgId && p.orgId !== orgId);

  const filteredCurrentProjects = currentOrgProjects.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  const filteredOtherProjects = otherOrgProjects.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  const totalFilteredProjects = filteredCurrentProjects.length + filteredOtherProjects.length;

  const orgQuery = orgSearch.toLowerCase().trim();
  const filteredOrgs = orgsList.filter((o) =>
    o.name.toLowerCase().includes(orgQuery)
  );

  const projectDropdownContent = (
    <>
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
      <div className="py-1 max-h-56 overflow-y-auto">
        {filteredCurrentProjects.map((p) => {
          const isCurrent = p.id === projectId;
          return (
            <Link
              key={p.id}
              href={`/dashboard/project/${p.id}`}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs rounded-sm mx-1 cursor-pointer font-medium transition-colors",
                isCurrent
                  ? "text-white bg-[#222222]"
                  : "text-[#bbbbbb] hover:text-white hover:bg-[#1c1c1c]"
              )}
            >
              <span className="truncate">{p.name}</span>
              {isCurrent && <IconCheck className="size-3.5 text-white shrink-0 ml-2" />}
            </Link>
          );
        })}

        {filteredOtherProjects.length > 0 && (
          <>
            <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-[#666666] uppercase tracking-wider">
              Other Organizations
            </div>
            {filteredOtherProjects.map((p) => {
              const isCurrent = p.id === projectId;
              const oName = p.orgId ? orgNameMap.get(p.orgId) : null;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/project/${p.id}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs rounded-sm mx-1 cursor-pointer font-medium transition-colors",
                    isCurrent
                      ? "text-white bg-[#222222]"
                      : "text-[#bbbbbb] hover:text-white hover:bg-[#1c1c1c]"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{p.name}</span>
                    {oName && (
                      <span className="text-[9.5px] text-[#777777] px-1.5 py-0.2 rounded border border-[#2d2d2d] bg-[#141414] font-mono shrink-0">
                        {oName}
                      </span>
                    )}
                  </div>
                  {isCurrent && <IconCheck className="size-3.5 text-white shrink-0 ml-2" />}
                </Link>
              );
            })}
          </>
        )}

        {totalFilteredProjects === 0 && (
          <div className="px-3 py-3 text-xs text-[#666666] italic text-center">
            No projects found
          </div>
        )}

        <Link
          href={`/dashboard/org/${orgId}`}
          className="flex items-center px-3 py-2 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm mx-1 cursor-pointer transition-colors mt-0.5"
        >
          <span>All Projects</span>
        </Link>
      </div>

      {/* Separator */}
      <div className="h-px bg-[#262626]" />

      {/* New Project Action */}
      <div className="p-1">
        <Link
          href={`/dashboard/project/new?orgId=${orgId}`}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm cursor-pointer transition-colors"
        >
          <IconPlus className="size-3.5 text-[#888888]" />
          <span>New project</span>
        </Link>
      </div>
    </>
  );

  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center justify-between px-3.5 sm:px-4 border-b border-border/80 bg-[#0e0e0e] text-xs w-full">
      {/* ── MOBILE HEADER (sm:hidden) ── */}
      <div className="flex sm:hidden items-center justify-between w-full">
        {/* Left: Project square avatar + Name + branch (with dropdown to switch projects) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 min-w-0 pr-2 text-left outline-none cursor-pointer group"
            >
              <div className="size-8 rounded-md bg-[#181818] border border-[#262626] group-hover:border-[#383838] flex items-center justify-center text-xs font-bold text-white shrink-0 transition-colors">
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
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="w-72 bg-[#171717] border border-[#2c2c2c] rounded-lg shadow-2xl p-0 text-xs text-white z-50 overflow-hidden"
          >
            {projectDropdownContent}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Connect icon + Avatar + Sidebar trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Connect database"
            onClick={() => setConnectOpen(true)}
            className="size-8 rounded-full border border-border bg-[#181818] hover:bg-[#222222] flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <IconPlugConnected className="size-4" />
          </button>

          {/* User profile picture with Dropdown Menu on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open user menu"
                className="outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full cursor-pointer shrink-0"
              >
                <Avatar className="size-7 border border-[#2a2a2a] hover:border-neutral-500 transition-colors">
                  <AvatarFallback className="bg-[#1f1f1f] text-foreground text-[11px] font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 bg-[#111111] border border-[#262626] text-neutral-200 z-50"
            >
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold leading-none text-white">{userName || "Account"}</p>
                  {userEmail ? (
                    <p className="text-[11px] leading-none text-neutral-400 truncate">{userEmail}</p>
                  ) : null}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#262626]" />
              <DropdownMenuItem asChild className="text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] cursor-pointer gap-2">
                <Link href="/account">
                  <IconUser className="size-3.5" />
                  <span>Account Preferences</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#262626]" />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/login" })}
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer focus:text-red-300 focus:bg-red-950/30 gap-2"
              >
                <IconLogout className="size-3.5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                {filteredOrgs.map((o) => {
                  const isCurrent = o.id === orgId;
                  return (
                    <Link
                      key={o.id}
                      href={`/dashboard/org/${o.id}`}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs rounded-sm mx-1 cursor-pointer font-medium transition-colors",
                        isCurrent
                          ? "text-white bg-[#222222]"
                          : "text-[#bbbbbb] hover:text-white hover:bg-[#1c1c1c]"
                      )}
                    >
                      <span className="truncate">{o.name}</span>
                      {isCurrent && (
                        <IconCheck className="size-3.5 text-white shrink-0 ml-2" />
                      )}
                    </Link>
                  );
                })}

                {filteredOrgs.length === 0 && (
                  <div className="px-3 py-3 text-xs text-[#666666] italic text-center">
                    No organizations found
                  </div>
                )}

                <Link
                  href="/dashboard/org"
                  className="flex items-center px-3 py-2 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded-sm mx-1 cursor-pointer transition-colors mt-0.5"
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
                    {projectDropdownContent}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <span className="text-[#444444] text-[13px] font-light select-none">/</span>

              {/* ── Branch / Env Selector + Dropdown ── */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#dddddd] text-[13px] font-normal font-sans">main</span>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono tracking-wider uppercase select-none transition-colors",
                  getEnvBadgeStyles(currentEnv)
                )}>
                  {currentEnv}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Switch branch or environment"
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
                    <div className="px-2.5 py-1.5 text-[10.5px] font-medium text-[#777777] uppercase tracking-wider">
                      Environment Tier
                    </div>

                    {[
                      { key: "production", label: "Production", badgeClass: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/25" },
                      { key: "staging", label: "Staging", badgeClass: "text-sky-400 bg-sky-500/10 border-sky-500/25" },
                      { key: "development", label: "Development", badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
                    ].map((tier) => {
                      const isSelected = currentEnv.toLowerCase() === tier.key;
                      return (
                        <button
                          key={tier.key}
                          type="button"
                          onClick={() => handleSelectEnv(tier.key)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded cursor-pointer font-medium transition-colors",
                            isSelected
                              ? "text-white bg-[#222222]"
                              : "text-[#bbbbbb] hover:text-white hover:bg-[#1c1c1c]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{tier.label}</span>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase font-mono", tier.badgeClass)}>
                              {tier.key}
                            </span>
                          </div>
                          {isSelected && <IconCheck className="size-3.5 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}

                    <div className="h-px bg-[#262626] my-1" />

                    <Link
                      href={`/dashboard/project/${projectId}/settings`}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#999999] hover:text-white hover:bg-[#202020] rounded cursor-pointer transition-colors"
                    >
                      <IconSettings className="size-3.5 text-[#777777]" />
                      <span>Project Settings</span>
                    </Link>
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
          onClick={() => setConnectOpen(true)}
          className="hidden md:flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-[#181818] hover:border-border/80 hover:bg-[#202020] text-foreground transition-colors ml-2 font-medium cursor-pointer shrink-0 animate-project-connect"
        >
          <IconPlugConnected className="size-3.5 text-muted-foreground" />
          <span>Connect</span>
        </button>

        {/* Right Desktop actions */}
        <div className="ml-auto">
          <OrgPickerClientActions
            userInitials={userInitials}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      </div>

      {/* Connect Database Dialog (Supabase / Neon Style) */}
      <ConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        projectId={projectId}
        projectName={projectName}
        databaseUrl={databaseUrl || ""}
      />
    </header>
  );
}
