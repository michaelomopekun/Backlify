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
    <Sidebar collapsible="icon" className="border-r border-border bg-[#0d0d0d] top-12 h-[calc(100svh-3rem)]">
      {/* Nav */}
      <SidebarContent className="pt-2.5 px-2 group-data-[collapsible=icon]:px-1.5">
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            {orgNav.map((item) => {
              const href = `${base}${item.href}`;
              const isActive =
                item.href === "" ? pathname === base : pathname.startsWith(href);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      "text-sm gap-3 h-9 rounded-md transition-all group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                      isActive
                        ? "bg-[#202020] text-white font-medium border border-[#2c2c2c] shadow-xs"
                        : "text-[#777777] hover:text-white hover:bg-[#161616]"
                    )}
                  >
                    <Link href={href}>
                      <item.icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-2.5 group-data-[collapsible=icon]:p-1.5">
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
          <IconChevronRight className="ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
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
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const base = `/dashboard/project/${projectId}`;

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-[#0d0d0d] top-12 h-[calc(100svh-3rem)]">
      {/* Nav */}
      <SidebarContent className="pt-2.5 px-2 group-data-[collapsible=icon]:px-1.5">
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            {projectNav.map((item) => {
              const href = `${base}${item.href}`;
              const isActive =
                item.href === "" ? pathname === base : pathname.startsWith(href);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      "text-sm gap-3 h-9 rounded-md transition-all group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                      isActive
                        ? "bg-[#202020] text-white font-medium border border-[#2c2c2c] shadow-xs"
                        : "text-[#777777] hover:text-white hover:bg-[#161616]"
                    )}
                  >
                    <Link href={href}>
                      <item.icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(`${base}/settings`)}
                tooltip="Project Settings"
                className={cn(
                  "text-sm gap-3 h-9 rounded-md transition-all group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                  pathname.startsWith(`${base}/settings`)
                    ? "bg-[#202020] text-white font-medium border border-[#2c2c2c] shadow-xs"
                    : "text-[#777777] hover:text-white hover:bg-[#161616]"
                )}
              >
                <Link href={`${base}/settings`}>
                  <IconSettings className="size-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Project Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-2.5 group-data-[collapsible=icon]:p-1.5">
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
          <IconChevronRight className="ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
