import Link from "next/link";
import { IconSearch, IconLayoutGrid, IconList, IconDotsVertical, IconHelp, IconBell } from "@tabler/icons-react";
import { ProjectRepository, OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrgProjectsPage({ params }: Props) {
  const { orgId } = await params;
  const user = await getCurrentUser();

  let org: { id: string; name: string; slug: string } | null = null;
  try {
    org = await OrganizationRepository.getOrganizationById(orgId);
  } catch {}

  const orgName = org?.name ?? `${user.name}'s Org`;

  let projects: Array<{ id: string; name: string; databaseUrl: string; createdAt: Date }> = [];
  try {
    projects = await ProjectRepository.getAllProjects();
  } catch {}

  return (
    <SidebarProvider>
      <OrgSidebar user={user} orgId={orgId} orgName={orgName} />

      <SidebarInset>
        {/* Topbar */}
        <header className="flex h-12 items-center gap-2 px-4 border-b border-border shrink-0 bg-background">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/org"
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Backlify
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-medium text-foreground">
                  {orgName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs h-7 hidden md:flex"
            >
              Feedback
            </Button>
            <button
              type="button"
              className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-md border border-border bg-muted/40 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <IconSearch className="size-3" />
              <span>Search...</span>
              <kbd className="ml-1 text-[9px] border border-border rounded px-1">⌘K</kbd>
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

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="flex gap-6">
            {/* Main project list */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-foreground mb-6">Projects</h1>

              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for a project"
                    className="h-9 w-56 pl-9 pr-3 rounded-md border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <Button variant="outline" size="sm" className="h-9 text-xs border-border text-muted-foreground hover:text-foreground">
                  Status
                </Button>
                <Button variant="outline" size="sm" className="h-9 text-xs border-border text-muted-foreground hover:text-foreground">
                  Sorted by name
                </Button>

                <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
                  <button className="p-2 hover:bg-accent transition-colors text-foreground">
                    <IconLayoutGrid className="size-4" />
                  </button>
                  <button className="p-2 hover:bg-accent transition-colors text-muted-foreground">
                    <IconList className="size-4" />
                  </button>
                </div>

                <Button asChild className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                  <Link href={`/dashboard/org/${orgId}/projects/new`}>
                    + New project
                  </Link>
                </Button>
              </div>

              {/* Project grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {projects.length === 0 ? (
                  <Link
                    href="/dashboard/project/proj-1"
                    className="group relative flex flex-col p-4 rounded-md border border-border bg-card hover:border-border/80 hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        roadRescue&apos;s Project
                      </p>
                      <span className="p-0.5 rounded text-muted-foreground">
                        <IconDotsVertical className="size-4" />
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 font-mono">
                      Postgres 16 · eu-central-1
                    </p>

                    <div className="mt-auto">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0.5 border-border text-muted-foreground uppercase tracking-wide"
                      >
                        Free · Active
                      </Badge>
                    </div>
                  </Link>
                ) : (
                  projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/project/${project.id}`}
                      className="group relative flex flex-col p-4 rounded-md border border-border bg-card hover:border-border/80 hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </p>
                        <span className="p-0.5 rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconDotsVertical className="size-4" />
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 font-mono">
                        PostgreSQL · Direct connection
                      </p>

                      <div className="mt-auto">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5 border-border text-muted-foreground uppercase tracking-wide"
                        >
                          Free
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Right usage panel */}
            <aside className="w-64 shrink-0 hidden xl:block">
              <div className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Free plan usage</p>
                    <p className="text-[11px] text-muted-foreground">Current billing cycle</p>
                  </div>
                  <Button size="sm" className="h-7 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90">
                    Upgrade
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: "Projects", value: `${Math.max(projects.length, 1)}`, limit: "2" },
                    { label: "Total backups", value: "18", limit: "50" },
                    { label: "Storage used", value: "1.2 GB", limit: "5 GB" },
                    { label: "Active schedules", value: "1", limit: "3" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide flex-1 truncate">
                        {row.label}
                      </span>
                      <span className="text-xs text-foreground font-medium tabular-nums">
                        {row.value}
                        {row.limit !== "—" && (
                          <span className="text-muted-foreground"> / {row.limit}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
