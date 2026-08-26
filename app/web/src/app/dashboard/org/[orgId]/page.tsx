import Link from "next/link";
import { IconSearch, IconLayoutGrid, IconList, IconDotsVertical } from "@tabler/icons-react";
import { ProjectRepository } from "db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrgProjectsPage({ params }: Props) {
  const { orgId } = await params;

  let projects: Array<{ id: string; name: string; databaseUrl: string; createdAt: Date }> = [];
  try {
    // TODO: filter by orgId once migration is applied
    projects = await ProjectRepository.getAllProjects();
  } catch {
    // DB unavailable
  }

  return (
    <div className="flex gap-6">
      {/* Main content */}
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
            /* Empty state card */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm mb-3">No projects yet.</p>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={`/dashboard/org/${orgId}/projects/new`}>
                  Create your first project
                </Link>
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/org/${orgId}/projects/${project.id}`}
                className="group relative flex flex-col p-4 rounded-md border border-border bg-card hover:border-border/80 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IconDotsVertical className="size-4" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
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

      {/* Right usage panel — matches Supabase's "Free plan usage" panel */}
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
              { label: "Projects", value: `${projects.length}`, limit: "—" },
              { label: "Total backups", value: "0", limit: "—" },
              { label: "Storage used", value: "0 GB", limit: "—" },
              { label: "Active schedules", value: "0", limit: "—" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
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
  );
}
