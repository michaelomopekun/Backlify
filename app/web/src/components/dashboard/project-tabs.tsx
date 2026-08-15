"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Tabs for a project's detail pages.
 *
 * These are routes, not panels — each tab is a separate server-rendered page
 * with its own data, so this is a link bar styled as tabs rather than a
 * Radix Tabs root. `aria-current` carries the state; the underline is the
 * visual echo of it, not the whole message.
 */

const TABS = [
  { segment: "", label: "Overview" },
  { segment: "backups", label: "Backups" },
  { segment: "schedules", label: "Schedules" },
  { segment: "restore", label: "Restore" },
] as const;

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/projects/${projectId}`;

  // Everything after the project id, first segment only — a deeper path (a
  // single backup, say) should still light up the tab it lives under.
  const active = pathname.startsWith(base)
    ? pathname.slice(base.length).split("/").filter(Boolean)[0] ?? ""
    : "";

  return (
    <nav
      aria-label="Project sections"
      className="-mx-6 overflow-x-auto border-b border-border px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="flex min-w-max items-center gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.segment;
          return (
            <li key={tab.segment || "overview"}>
              <Link
                href={tab.segment ? `${base}/${tab.segment}` : base}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-10 items-center border-b-2 px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isActive
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
