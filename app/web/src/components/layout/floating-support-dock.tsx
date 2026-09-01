"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  IconSearch,
  IconHelp,
  IconBulb,
  IconX,
  IconBook,
  IconTools,
  IconActivity,
  IconMail,
  IconChevronRight,
  IconBrandDiscord,
  IconDatabase,
  IconRotateClockwise,
  IconCalendar,
  IconShieldCheck,
  IconPlus,
  IconMenu2,
  IconFolder,
  IconUsers,
  IconLayoutDashboard,
  IconChartBar,
  IconCreditCard,
  IconSettings,
  IconDatabaseImport,
  IconCalendarClock,
  IconRestore,
} from "@tabler/icons-react";

interface SearchItem {
  name: string;
  href: string;
  icon: any;
  tag?: string;
}

interface SearchGroup {
  title: string;
  items: SearchItem[];
}

export function FloatingSupportDock() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<"none" | "search" | "help" | "feedback" | "sidebar">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Global hotkey listeners (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveModal((prev) => (prev === "search" ? "none" : "search"));
      } else if (e.key === "Escape") {
        setActiveModal("none");
      }
    };

    const handleCustomModal = (e: Event) => {
      const customEvent = e as CustomEvent<"none" | "search" | "help" | "feedback" | "sidebar">;
      if (customEvent.detail) {
        setActiveModal(customEvent.detail);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("backlify:open-modal", handleCustomModal);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("backlify:open-modal", handleCustomModal);
    };
  }, []);

  const closeAll = () => setActiveModal("none");

  // Determine current org or project ID from pathname
  const orgMatch = pathname.match(/\/dashboard\/org\/([^/]+)/);
  const orgId = orgMatch ? orgMatch[1] : "default-org";

  const projectMatch = pathname.match(/\/dashboard\/project\/([^/]+)/);
  const projectId = projectMatch ? projectMatch[1] : "proj-1";

  const isProjectRoute = pathname.startsWith("/dashboard/project") && !pathname.endsWith("/new");

  // Navigation items for the sidebar drawer
  const orgNavItems = [
    { label: "Projects", href: `/dashboard/org/${orgId}`, icon: IconFolder, exact: true },
    { label: "Team", href: `/dashboard/org/${orgId}/team`, icon: IconUsers },
    { label: "Integrations", href: `/dashboard/org/${orgId}/integrations`, icon: IconLayoutDashboard },
    { label: "Usage", href: `/dashboard/org/${orgId}/usage`, icon: IconChartBar },
    { label: "Billing", href: `/dashboard/org/${orgId}/billing`, icon: IconCreditCard },
    { label: "Organization settings", href: `/dashboard/org/${orgId}/settings`, icon: IconSettings },
  ];

  const projectNavItems = [
    { label: "Project Overview", href: `/dashboard/project/${projectId}`, icon: IconLayoutDashboard, exact: true },
    { label: "Backups", href: `/dashboard/project/${projectId}/backups`, icon: IconDatabaseImport },
    { label: "Schedules", href: `/dashboard/project/${projectId}/schedules`, icon: IconCalendarClock },
    { label: "Restores", href: `/dashboard/project/${projectId}/restores`, icon: IconRestore },
    { label: "Project Settings", href: `/dashboard/project/${projectId}/settings`, icon: IconSettings },
  ];

  const activeNavList = isProjectRoute ? projectNavItems : orgNavItems;

  // Search items
  const searchItems: SearchGroup[] = [
    {
      title: "Projects",
      items: [
        { name: "roadRescue's Project", href: "/dashboard/project/proj-1", icon: IconDatabase, tag: "PROD" },
        { name: "Create New Project", href: "/dashboard/project/new", icon: IconPlus, tag: "ACTION" },
      ],
    },
    {
      title: "Quick Navigation",
      items: [
        { name: "Snapshots & Backups", href: "/dashboard/project/proj-1/backups", icon: IconDatabase },
        { name: "Automated Schedules", href: "/dashboard/project/proj-1/schedules", icon: IconCalendar },
        { name: "Disaster Recovery & Restores", href: "/dashboard/project/proj-1/restores", icon: IconRotateClockwise },
        { name: "Security & Encryption Keys", href: "/dashboard/project/proj-1/settings", icon: IconShieldCheck },
      ],
    },
    {
      title: "Documentation & Playbooks",
      items: [
        { name: "Point-in-Time Recovery (PITR) Guide", href: "#", icon: IconBook },
        { name: "AWS KMS Hardware Key Setup", href: "#", icon: IconShieldCheck },
        { name: "pg_dump & WAL Archiving Architecture", href: "#", icon: IconBook },
      ],
    },
  ];

  const filteredSearch = searchItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isOrgSelection = pathname === "/dashboard/org" || pathname === "/dashboard/org/";
  const isNewOrg = pathname === "/dashboard/org/new";
  const isNewProject = pathname === "/dashboard/project/new";

  const hasSidebar =
    !isOrgSelection &&
    !isNewOrg &&
    !isNewProject &&
    (pathname.startsWith("/dashboard/org/") || pathname.startsWith("/dashboard/project/"));

  return (
    <>
      {/* ── Floating Bottom Pill Dock (MOBILE ONLY: sm:hidden) ── */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex sm:hidden items-center gap-1 p-1.5 rounded-full border border-[#3e3e3e] bg-[#222222]/95 backdrop-blur-xl shadow-2xl shadow-black/95 ring-1 ring-white/10 transition-all hover:border-[#505050] ${
          activeModal !== "none" ? "z-[90]" : "z-40"
        }`}
      >
        {/* Search button */}
        <button
          type="button"
          aria-label="Search"
          onClick={() => setActiveModal((prev) => (prev === "search" ? "none" : "search"))}
          className={`size-8.5 rounded-full flex items-center justify-center transition-all ${
            activeModal === "search"
              ? "bg-white text-black font-semibold shadow-xs"
              : "text-[#d1d1d1] hover:text-white hover:bg-white/10"
          }`}
        >
          <IconSearch className="size-4" />
        </button>

        {/* Help button */}
        <button
          type="button"
          aria-label="Help"
          onClick={() => setActiveModal((prev) => (prev === "help" ? "none" : "help"))}
          className={`size-8.5 rounded-full flex items-center justify-center transition-all ${
            activeModal === "help"
              ? "bg-white text-black font-semibold shadow-xs"
              : "text-[#d1d1d1] hover:text-white hover:bg-white/10"
          }`}
        >
          <IconHelp className="size-4" />
        </button>

        {/* Feedback button */}
        <button
          type="button"
          aria-label="Feedback"
          onClick={() => setActiveModal((prev) => (prev === "feedback" ? "none" : "feedback"))}
          className={`size-8.5 rounded-full flex items-center justify-center transition-all ${
            activeModal === "feedback"
              ? "bg-white text-black font-semibold shadow-xs"
              : "text-[#d1d1d1] hover:text-white hover:bg-white/10"
          }`}
        >
          <IconBulb className="size-4" />
        </button>

        {/* Sidebar Navigation Menu Button — only on pages with sidebar */}
        {hasSidebar && (
          <button
            type="button"
            aria-label="Toggle sidebar menu"
            onClick={() => setActiveModal((prev) => (prev === "sidebar" ? "none" : "sidebar"))}
            className={`size-8.5 rounded-full flex items-center justify-center transition-all ${
              activeModal === "sidebar"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-[#d1d1d1] hover:text-white hover:bg-white/10"
            }`}
          >
            <IconMenu2 className="size-4" />
          </button>
        )}

        {/* Active close button if any modal is open */}
        {activeModal !== "none" && (
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeAll}
            className="size-8.5 rounded-full flex items-center justify-center bg-[#333333] text-white hover:bg-[#444444] border border-white/10 transition-all ml-0.5 shadow-xs"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>

      {/* ── Overlay Backdrop for open modals ── */}
      {activeModal !== "none" && (
        <div
          onClick={closeAll}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] animate-in fade-in duration-150"
        />
      )}

      {/* ── 1. SIDEBAR NAVIGATION DRAWER (Slide-Up Menu) ── */}
      {activeModal === "sidebar" && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-sm z-[90] rounded-xl border border-[#222222] bg-[#111111] shadow-2xl p-2 animate-in zoom-in-95 fade-in duration-150">
          <div className="space-y-1">
            {activeNavList.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAll}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-[#202020] text-white shadow-xs"
                      : "text-[#888888] hover:text-white hover:bg-[#161616]"
                  }`}
                >
                  <Icon className={`size-4.5 shrink-0 ${isActive ? "text-primary" : "text-[#777777]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. HELP & SUPPORT DRAWER ── */}
      {activeModal === "help" && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-lg z-[90] rounded-xl border border-[#222222] bg-[#111111] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-150">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-tight">Help & Support</h3>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>

              <button
                type="button"
                onClick={closeAll}
                className="text-[#666666] hover:text-white transition-colors"
              >
                <IconX className="size-4" />
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-[#1c1c1c]">
            {[
              {
                title: "Docs",
                desc: "Browse guides, references, and pg_dump / WAL architecture.",
                icon: IconBook,
                href: "#",
              },
              {
                title: "Disaster Recovery Playbook",
                desc: "Step-by-step emergency point-in-time recovery & test drill guides.",
                icon: IconTools,
                href: "#",
              },
              {
                title: "Backlify Status",
                desc: "Check backup worker queues, S3 latency, and cluster uptime.",
                icon: IconActivity,
                href: "#",
              },
              {
                title: "Contact Emergency Rescue",
                desc: "Reach our database reliability engineers for restore assistance.",
                icon: IconMail,
                href: "mailto:support@backlify.dev",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={closeAll}
                  className="px-5 py-3.5 flex items-center justify-between group hover:bg-[#161616] transition-colors"
                >
                  <div className="flex items-start gap-3.5 pr-2">
                    <Icon className="size-4 text-[#777777] group-hover:text-white mt-0.5 transition-colors shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-medium text-white group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11.5px] text-[#666666] leading-snug mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className="size-4 text-[#444444] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* Community banner card */}
          <div className="p-5 border-t border-[#1e1e1e] bg-[#0d0d0d] space-y-3">
            <div>
              <h5 className="text-[12.5px] font-medium text-white">Community support</h5>
              <p className="text-[11.5px] text-[#666666] mt-0.5 leading-relaxed">
                Our Discord community can help with database-related questions. DBAs and engineers are active 24/7.
              </p>
            </div>

            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-xs transition-colors shadow-xs"
            >
              <IconBrandDiscord className="size-4" />
              <span>Join us on Discord</span>
            </a>
          </div>
        </div>
      )}

      {/* ── 3. SEARCH & COMMAND PALETTE ── */}
      {activeModal === "search" && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[92vw] max-w-xl z-[90] rounded-xl border border-[#222222] bg-[#111111] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-150">
          {/* Search input bar */}
          <div className="p-3 border-b border-[#1e1e1e] flex items-center gap-2.5">
            <IconSearch className="size-4 text-[#666666] ml-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, backups, docs, or actions..."
              className="w-full bg-transparent text-sm text-white placeholder-[#555555] focus:outline-none"
              autoFocus
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#2a2a2a] bg-[#181818] text-[#777777]">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-3">
            {filteredSearch.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#666666] font-mono">
                No matching results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredSearch.map((group) => (
                <div key={group.title} className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#555555] px-3 py-1 block">
                    {group.title}
                  </span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          closeAll();
                          if (item.href.startsWith("/")) {
                            router.push(item.href);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-left hover:bg-[#181818] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="size-4 text-[#777777] group-hover:text-primary transition-colors" />
                          <span className="text-[12.5px] text-white font-medium">{item.name}</span>
                        </div>
                        {item.tag && (
                          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded border border-[#2a2a2a] bg-[#141414] text-[#888888]">
                            {item.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── 4. FEEDBACK & CHANGELOG MODAL ── */}
      {activeModal === "feedback" && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-md z-[90] rounded-xl border border-[#222222] bg-[#111111] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBulb className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-white">Share Feedback</h3>
            </div>
            <button
              type="button"
              onClick={closeAll}
              className="text-[#666666] hover:text-white transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>

          <p className="text-[12px] text-[#777777] leading-relaxed">
            Have an idea to improve Backlify, or noticed an issue with your database backups? Let our team know.
          </p>

          {feedbackSent ? (
            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono text-center">
              Thank you! Your feedback has been shared with the Backlify team.
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What can we improve? (e.g. S3 region support, custom webhook triggers...)"
                rows={3}
                className="w-full p-3 rounded-lg border border-[#222222] bg-[#0c0c0c] text-xs text-white placeholder-[#555555] focus:outline-none focus:border-primary transition-colors resize-none"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAll}
                  className="px-3 py-1.5 rounded-md text-xs text-[#777777] hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!feedbackText.trim()}
                  onClick={() => {
                    setFeedbackSent(true);
                    setTimeout(() => {
                      setFeedbackSent(false);
                      setFeedbackText("");
                      closeAll();
                    }, 1400);
                  }}
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
