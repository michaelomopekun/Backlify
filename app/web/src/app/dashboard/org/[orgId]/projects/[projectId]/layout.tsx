import Link from "next/link";
import { ProjectRepository, OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectSidebar } from "@/components/dashboard/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
  IconHelp,
  IconBell,
  IconPlugConnected,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
  params: Promise<{ orgId: string; projectId: string }>;
}

export default async function ProjectLayout({ children, params }: Props) {
  const { orgId, projectId } = await params;
  const user = await getCurrentUser();

  let org: { id: string; name: string; slug: string } | null = null;
  let project: { id: string; name: string; databaseUrl: string } | null = null;

  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  try {
    project = await ProjectRepository.getProjectById(projectId);
  } catch {}

  const orgName = org?.name ?? `${user.name}'s Org`;
  const projectName = project?.name ?? "roadRescue's Project";

  return (
    <SidebarProvider>
      <ProjectSidebar
        user={user}
        orgId={orgId}
        orgName={orgName}
        projectId={projectId}
        projectName={projectName}
      />

      <SidebarInset>
        {/* Supabase-faithful Topbar */}
        <header className="flex h-12 items-center gap-2.5 px-4 border-b border-border/80 shrink-0 bg-[#0e0e0e] text-xs">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground" />

          {/* Org Selector */}
          <Link
            href={`/dashboard/org/${orgId}`}
            className="flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors font-medium"
          >
            <span>{orgName}</span>
            <span className="text-[10px] px-1 py-0.2 rounded border border-border bg-muted/40 text-muted-foreground font-mono uppercase">
              FREE
            </span>
            <IconSelector className="size-3 text-muted-foreground" />
          </Link>

          <span className="text-muted-foreground/60 text-sm">/</span>

          {/* Project Selector */}
          <Link
            href={`/dashboard/org/${orgId}/projects/${projectId}`}
            className="flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors font-medium truncate max-w-[180px]"
          >
            <span className="truncate">{projectName}</span>
            <IconSelector className="size-3 text-muted-foreground shrink-0" />
          </Link>

          <span className="text-muted-foreground/60 text-sm hidden sm:inline">/</span>

          {/* Branch / Env Selector */}
          <div className="hidden sm:flex items-center gap-1.5 text-foreground">
            <span className="text-muted-foreground">main</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 uppercase font-mono tracking-wider">
              PRODUCTION
            </span>
            <IconSelector className="size-3 text-muted-foreground" />
          </div>

          {/* Connect CTA Pill */}
          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-[#181818] hover:border-border/80 hover:bg-[#202020] text-foreground transition-colors ml-1 font-medium"
          >
            <IconPlugConnected className="size-3.5 text-muted-foreground" />
            <span>Connect</span>
          </button>

          {/* Right Topbar actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs h-7 hidden lg:flex"
            >
              Feedback
            </Button>

            <button
              type="button"
              className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-md border border-border/80 bg-muted/30 text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <IconSearch className="size-3" />
              <span>Search...</span>
              <kbd className="ml-1 text-[9px] border border-border/80 rounded px-1">Ctrl K</kbd>
            </button>

            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
              <IconHelp className="size-3.5" />
            </Button>

            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
              <IconBell className="size-3.5" />
            </Button>

            <Avatar className="size-6 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-7 bg-[#0c0c0c]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
