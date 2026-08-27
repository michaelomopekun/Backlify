"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconLayoutDashboard,
  IconFolder,
  IconDatabaseImport,
  IconCalendarClock,
  IconRestore,
  IconSettings,
  IconBuilding,
  IconUsers,
  IconChartBar,
  IconCreditCard,
  IconChevronRight,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/current-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Org-level nav (matches Supabase's Projects page sidebar) ──────────────

const orgNav = [
  { label: "Projects", href: "", icon: IconFolder },
  { label: "Team", href: "/team", icon: IconUsers },
  { label: "Integrations", href: "/integrations", icon: IconLayoutDashboard },
  { label: "Usage", href: "/usage", icon: IconChartBar },
  { label: "Billing", href: "/billing", icon: IconCreditCard },
  { label: "Organization Settings", href: "/settings", icon: IconSettings },
];

// ─── Project-level nav (matches Supabase's project sidebar) ───────────────

const projectNav = [
  { label: "Project Overview", href: "", icon: IconLayoutDashboard },
  { label: "Backups", href: "/backups", icon: IconDatabaseImport },
  { label: "Schedules", href: "/schedules", icon: IconCalendarClock },
  { label: "Restores", href: "/restores", icon: IconRestore },
];

// ─── Brand Mark ────────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <img
      src="/backlify-logo.svg"
      alt="Backlify"
      className="size-7 object-contain pointer-events-none shrink-0"
    />
  );
}

// ─── Org Sidebar ──────────────────────────────────────────────────────────

interface OrgSidebarProps {
  user: CurrentUser;
  orgId: string;
  orgName: string;
}

export function OrgSidebar({ user, orgId, orgName }: OrgSidebarProps) {
  const pathname = usePathname();
  const base = `/dashboard/org/${orgId}`;

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border">
      {/* Header */}
      <SidebarHeader className="h-12 flex flex-row items-center gap-3 px-4 border-b border-border">
        <Link href="/dashboard/org" className="flex items-center gap-2.5 min-w-0">
          <BrandMark />
          <span className="text-sm font-semibold text-foreground truncate">
            {orgName}
          </span>
        </Link>
        <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 uppercase tracking-wide">
          Free
        </span>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarMenu>
            {orgNav.map((item) => {
              const href = `${base}${item.href}`;
              const isActive =
                item.href === ""
                  ? pathname === base || pathname.startsWith(`${base}/projects`)
                  : pathname.startsWith(href);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "text-sm gap-3 h-9 rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Link href={href}>
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
          <IconChevronRight className="ml-auto size-4 text-muted-foreground shrink-0" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// ─── Project Sidebar ───────────────────────────────────────────────────────

interface ProjectSidebarProps {
  user: CurrentUser;
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
}

export function ProjectSidebar({
  user,
  orgId,
  orgName,
  projectId,
  projectName,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const base = `/dashboard/project/${projectId}`;

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border">
      {/* Header — logo + org breadcrumb */}
      <SidebarHeader className="h-12 flex flex-row items-center gap-2 px-4 border-b border-border">
        <Link href="/dashboard/org" className="shrink-0">
          <BrandMark />
        </Link>
        <span className="text-muted-foreground text-sm">/</span>
        <Link
          href={`/dashboard/org/${orgId}`}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors flex items-center gap-1.5 min-w-0"
        >
          <IconBuilding className="size-3.5 shrink-0" />
          <span className="truncate">{orgName}</span>
        </Link>
        <span className="ml-1 shrink-0 text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 uppercase tracking-wide">
          Free
        </span>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarMenu>
            {projectNav.map((item) => {
              const href = `${base}${item.href}`;
              const isActive =
                item.href === "" ? pathname === base : pathname.startsWith(href);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "text-sm gap-3 h-9 rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Link href={href}>
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(`${base}/settings`)}
                className={cn(
                  "text-sm gap-3 h-9 rounded-md transition-colors",
                  pathname.startsWith(`${base}/settings`)
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Link href={`${base}/settings`}>
                  <IconSettings className="size-4 shrink-0" />
                  Project Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
          <IconChevronRight className="ml-auto size-4 text-muted-foreground shrink-0" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
