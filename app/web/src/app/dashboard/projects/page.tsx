import Link from "next/link";
import {
  IconAlertTriangle,
  IconChevronRight,
  IconDatabase,
  IconStack2,
} from "@tabler/icons-react";

import { Topbar } from "@/components/dashboard/topbar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NewProjectForm } from "@/components/dashboard/new-project-form";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { listVisibleProjects } from "@/lib/current-user";
import { getProjectSummaries } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects: any[] = [];
  let summaries = new Map();
  try {
    const results = await Promise.all([
      listVisibleProjects().catch(() => []),
      getProjectSummaries().catch(() => new Map()),
    ]);
    projects = results[0] || [];
    summaries = results[1] || new Map();
  } catch (err) {
    console.warn("Database offline during projects query:", err);
  }

  return (
    <>
      <Topbar
        title="Projects"
        description="Each project is one database Backlify can back up."
        actions={projects.length > 0 ? <NewProjectForm /> : undefined}
      />

      <div className="space-y-4 px-6 py-6 lg:px-8">
        {projects.length === 0 ? (
          <>
            <EmptyState
              icon={IconStack2}
              title="No projects yet"
              description="Add a database connection and Backlify can start taking backups of it."
            />
            <NewProjectForm />
          </>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const summary = summaries.get(project.id);
              return (
                <li key={project.id}>
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    retentionCount={project.retentionCount}
                    total={summary?.total ?? 0}
                    failed={summary?.failed ?? 0}
                    bytes={summary?.bytes ?? 0}
                    lastBackupAt={summary?.lastBackupAt ?? null}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

/**
 * One project.
 *
 * The whole card is the link — a project's name is the only thing you ever want
 * to click here, so making the target the card rather than the four words of the
 * title keeps the hit area honest with the intent.
 *
 * `databaseUrl` is never rendered. It's a live credential, and nothing on this
 * page needs it.
 */
function ProjectCard({
  id,
  name,
  retentionCount,
  total,
  failed,
  bytes,
  lastBackupAt,
}: {
  id: string;
  name: string;
  retentionCount: number | null;
  total: number;
  failed: number;
  bytes: number;
  lastBackupAt: Date | string | null;
}) {
  return (
    <Link
      href={`/dashboard/projects/${id}`}
      className="group block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-foreground">{name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {lastBackupAt
              ? `Last backup ${formatRelativeTime(lastBackupAt)}`
              : "No backups yet"}
          </p>
        </div>
        <IconChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
        <Stat label="Backups" value={total.toLocaleString("en-US")} />
        <Stat label="Stored" value={formatBytes(bytes)} />
        <Stat
          label="Keeping"
          value={retentionCount ? `${retentionCount}` : "—"}
        />
      </dl>

      {failed > 0 ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-destructive">
          <IconAlertTriangle className="size-3.5" aria-hidden />
          {failed === 1 ? "1 failed backup" : `${failed} failed backups`}
        </p>
      ) : (
        total > 0 && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconDatabase className="size-3.5" aria-hidden />
            No failures
          </p>
        )
      )}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  );
}
