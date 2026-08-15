"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArchive,
  IconLayoutDashboard,
  IconStack2,
  type Icon,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/current-user";

/**
 * The 240px rail (SVG: 240×1024, active pill 192×48 at a 24px inset).
 *
 * Three destinations, per the agreed IA — Schedules and Restore are tabs inside
 * a project, not top-level places, because neither means anything without a
 * project selected.
 *
 * Below `lg` the rail becomes a horizontal row rather than a drawer. Three items
 * fit in a row, and a drawer would add an open/closed state that buys nothing at
 * this count.
 */

interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: IconStack2 },
  { href: "/dashboard/backups", label: "Backups", icon: IconArchive },
];

/** `/dashboard` must match exactly or it would light up on every child route. */
function useIsActive(href: string) {
  const pathname = usePathname();
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ className }: { className?: string }) {
  // Inlined rather than <img src="backlify-logo.svg"> so it inherits the
  // surface's amber instead of hardcoding the marketing orange.
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Backlify"
      fill="currentColor"
    >
      <rect x="15" y="20" width="70" height="14" rx="2" />
      <rect x="15" y="45" width="70" height="14" rx="2" />
      <rect x="15" y="70" width="28" height="14" rx="2" />
    </svg>
  );
}

function NavLink({ item, compact }: { item: NavItem; compact?: boolean }) {
  const active = useIsActive(item.href);
  const { icon: IconComponent } = item;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none",
        compact ? "h-10 px-3" : "h-12 px-4",
        active ? "" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
      style={
        active
          ? { background: 'rgba(100, 116, 139, 0.5)', borderRadius: '15px', color: '#FFB31F' }
          : undefined
      }
    >
      <IconComponent className="size-5 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

export function AppSidebar({ user }: { user: CurrentUser }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:flex" style={{width: '240px', background: '#0F172A', boxShadow: '0px 16px 44px rgba(0, 0, 0, 0.07)', borderRadius: '16px', borderRight: '1px solid var(--sidebar-border)'}}>
        <Link
          href="/dashboard"
          className="flex h-[104px] shrink-0 items-center gap-2.5 px-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <BrandMark className="size-6 text-primary" />
          <span className="text-base font-semibold tracking-tight text-foreground">
            Backlify
          </span>
        </Link>

        <nav aria-label="Main" className="flex flex-col gap-1 px-6">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="mt-auto p-4" style={{ borderTop: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center text-xs font-semibold"
              style={{ background: '#FFB31F', borderRadius: '99px', color: '#080B14' }}
            >
              {user.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </div>
        </div>
      </aside>

      <nav
        aria-label="Main"
        className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-4 py-2 lg:hidden"
      >
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} compact />
        ))}
      </nav>
    </>
  );
}
