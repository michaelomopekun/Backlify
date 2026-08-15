import Link from "next/link";
import { IconDatabase } from "@tabler/icons-react";

import { BackupRepository } from "db";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";
import type { BackupJobStatusType } from "shared/constants/backupJobStatus";

import { Topbar } from "@/components/dashboard/topbar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LiveBackupsTable } from "@/components/dashboard/live-backups-table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

/**
 * Filters are links, not a client-side control.
 *
 * The list is server-rendered, so a filter is a different URL — which also means
 * a filtered view can be shared, bookmarked and reloaded. "In flight" groups the
 * four statuses that are still moving, because that's the question people
 * actually arrive with.
 */
const FILTERS = {
  all: { label: "All", statuses: undefined },
  active: {
    label: "In flight",
    statuses: [
      BACKUP_JOB_STATUS.PENDING,
      BACKUP_JOB_STATUS.QUEUED,
      BACKUP_JOB_STATUS.IN_PROGRESS,
      BACKUP_JOB_STATUS.UPLOADING,
    ] as BackupJobStatusType[],
  },
  completed: {
    label: "Completed",
    statuses: [BACKUP_JOB_STATUS.COMPLETED] as BackupJobStatusType[],
  },
  failed: {
    label: "Failed",
    statuses: [BACKUP_JOB_STATUS.FAILED] as BackupJobStatusType[],
  },
} as const;

type FilterKey = keyof typeof FILTERS;

/** The same filter expressed as the `status` param `/api/backups` understands. */
const POLL_STATUS: Record<FilterKey, string | undefined> = {
  all: undefined,
  active: "active",
  completed: BACKUP_JOB_STATUS.COMPLETED,
  failed: BACKUP_JOB_STATUS.FAILED,
};

function isFilterKey(value: string | undefined): value is FilterKey {
  return value !== undefined && value in FILTERS;
}

export default async function BackupsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active: FilterKey = isFilterKey(status) ? status : "all";

  const backups = await BackupRepository.listBackups({
    statuses: FILTERS[active].statuses,
    limit: PAGE_SIZE,
  });

  return (
    <>
      <Topbar
        title="Backups"
        description="Every backup run, newest first."
      />

      <div className="space-y-4 px-6 py-6 lg:px-8">
        <nav aria-label="Filter backups">
          <ul className="flex flex-wrap items-center gap-1">
            {(Object.keys(FILTERS) as FilterKey[]).map((key) => {
              const isActive = key === active;
              return (
                <li key={key}>
                  <Link
                    href={
                      key === "all"
                        ? "/dashboard/backups"
                        : `/dashboard/backups?status=${key}`
                    }
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-8 items-center rounded-lg px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isActive
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {FILTERS[key].label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {backups.length > 0 ? (
          <LiveBackupsTable
            initialRows={backups}
            statusParam={active === "all" ? undefined : POLL_STATUS[active]}
          />
        ) : (
          <EmptyState
            icon={IconDatabase}
            title={
              active === "all"
                ? "No backups yet"
                : `No ${FILTERS[active].label.toLowerCase()} backups`
            }
            description={
              active === "all"
                ? "Runs appear here as soon as a backup starts — scheduled or on demand."
                : "Nothing matches this filter right now."
            }
          />
        )}
      </div>
    </>
  );
}
