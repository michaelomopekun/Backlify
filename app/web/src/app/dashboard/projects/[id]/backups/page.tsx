import { IconDatabase } from "@tabler/icons-react";

import { BackupRepository } from "db";

import { EmptyState } from "@/components/shared/empty-state";
import { LiveBackupsTable } from "@/components/projects/backups/live-backups-table";

export const dynamic = "force-dynamic";

/**
 * Every backup for one project.
 *
 * Capped at 50 rather than paginated: the repo takes an offset, but nothing on
 * screen would drive it yet, and a page control with one page is noise. When
 * projects routinely pass 50 backups, this is where the pager lands.
 */
const PAGE_SIZE = 50;

export default async function ProjectBackupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const backups = await BackupRepository.listBackups({
    projectId: id,
    limit: PAGE_SIZE,
  });

  if (backups.length === 0) {
    return (
      <EmptyState
        icon={IconDatabase}
        title="No backups for this project"
        description="Use Back up now to take the first one, or add a schedule so it happens on its own."
      />
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-foreground">
        {backups.length === PAGE_SIZE
          ? `Most recent ${PAGE_SIZE} backups`
          : backups.length === 1
            ? "1 backup"
            : `${backups.length} backups`}
      </h2>
      <LiveBackupsTable
        initialRows={backups}
        projectId={id}
        showProject={false}
      />
    </section>
  );
}
