"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [activeModal, setActiveModal] = useState<"none" | "search" | "help" | "feedback">("none");
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
      const customEvent = e as CustomEvent<"none" | "search" | "help" | "feedback">;
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

  // Navigation search items
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

  return (
    <>
      {/* ── Floating Bottom Pill Dock (MOBILE ONLY: sm:hidden) ── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex sm:hidden items-center gap-1.5 p-1.5 rounded-full border border-[#2a2a2a] bg-[#111111]/90 backdrop-blur-md shadow-2xl shadow-black/80 transition-all hover:border-[#3a3a3a]">
        {/* Search button */}
        <button
          type="button"
          aria-label="Search and command menu"
          onClick={() => setActiveModal((prev) => (prev === "search" ? "none" : "search"))}
          className={`size-8 rounded-full flex items-center justify-center transition-all ${
            activeModal === "search"
              ? "bg-[#252525] text-white shadow-xs"
              : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <IconSearch className="size-4" />
        </button>

        {/* Help button */}
        <button
          type="button"
          aria-label="Help and support"
          onClick={() => setActiveModal((prev) => (prev === "help" ? "none" : "help"))}
          className={`size-8 rounded-full flex items-center justify-center transition-all ${
            activeModal === "help"
              ? "bg-[#252525] text-white shadow-xs"
              : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <IconHelp className="size-4" />
        </button>

        {/* Feedback button */}
        <button
          type="button"
          aria-label="Feedback and changelog"
          onClick={() => setActiveModal((prev) => (prev === "feedback" ? "none" : "feedback"))}
          className={`size-8 rounded-full flex items-center justify-center transition-all ${
            activeModal === "feedback"
              ? "bg-[#252525] text-white shadow-xs"
              : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <IconBulb className="size-4" />
        </button>

        {/* Active close button if any modal is open */}
        {activeModal !== "none" && (
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeAll}
            className="size-8 rounded-full flex items-center justify-center bg-[#252525] text-white hover:bg-[#333333] transition-all ml-0.5"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>

      {/* ── Overlay Backdrop for open modals ── */}
      {activeModal !== "none" && (
        <div
          onClick={closeAll}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-150"
        />
      )}

      {/* ── 1. HELP & SUPPORT DRAWER ── */}
      {activeModal === "help" && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-lg z-50 rounded-xl border border-[#222222] bg-[#111111] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-150">
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

      {/* ── 2. SEARCH & COMMAND PALETTE ── */}
      {activeModal === "search" && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[92vw] max-w-xl z-50 rounded-xl border border-[#222222] bg-[#111111] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-150">
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

      {/* ── 3. FEEDBACK & CHANGELOG MODAL ── */}
      {activeModal === "feedback" && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-md z-50 rounded-xl border border-[#222222] bg-[#111111] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 fade-in duration-150">
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
