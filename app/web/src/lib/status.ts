import {
  BACKUP_JOB_STATUS,
  type BackupJobStatusType,
} from "shared/constants/backupJobStatus";
import { type RestoreJobStatusType } from "shared/constants/restoreJobStatus";

/**
 * The status -> presentation contract (DESIGN_SYSTEM.md §1.3).
 *
 * Every badge, dot and row in the product reads its colours from here. Colours
 * are expressed as Tailwind classes bound to semantic tokens — never raw hex in
 * markup — so a token change in globals.css propagates everywhere.
 *
 * `label` is not optional: status is never communicated by colour alone (§7).
 */
export type JobStatus = BackupJobStatusType | RestoreJobStatusType;

export interface StatusPresentation {
  label: string;
  /** Text colour for the badge label. */
  text: string;
  /** 12%-opacity tinted background behind the badge. */
  tint: string;
  /** Solid fill for the leading dot. */
  dot: string;
  /** Whether the dot should pulse — true while work is genuinely in flight. */
  active: boolean;
}

const STATUS_PRESENTATION: Record<JobStatus, StatusPresentation> = {
  [BACKUP_JOB_STATUS.PENDING]: {
    label: "Pending",
    text: "text-muted-foreground",
    tint: "bg-muted-foreground/12",
    dot: "bg-muted-foreground",
    active: false,
  },
  [BACKUP_JOB_STATUS.QUEUED]: {
    label: "Queued",
    text: "text-primary",
    tint: "bg-primary/12",
    dot: "bg-primary",
    active: false,
  },
  [BACKUP_JOB_STATUS.IN_PROGRESS]: {
    label: "In progress",
    text: "text-info",
    tint: "bg-info/12",
    dot: "bg-info",
    active: true,
  },
  [BACKUP_JOB_STATUS.UPLOADING]: {
    label: "Uploading",
    text: "text-chart-4",
    tint: "bg-chart-4/12",
    dot: "bg-chart-4",
    active: true,
  },
  [BACKUP_JOB_STATUS.COMPLETED]: {
    label: "Completed",
    text: "text-success",
    tint: "bg-success/12",
    dot: "bg-success",
    active: false,
  },
  [BACKUP_JOB_STATUS.FAILED]: {
    label: "Failed",
    text: "text-destructive",
    tint: "bg-destructive/12",
    dot: "bg-destructive",
    active: false,
  },
};

/** Falls back to the neutral "pending" treatment rather than throwing, so an
 *  unrecognised status from an older row can still render. */
export function getStatusPresentation(status: string): StatusPresentation {
  return (
    STATUS_PRESENTATION[status as JobStatus] ??
    STATUS_PRESENTATION[BACKUP_JOB_STATUS.PENDING]
  );
}

const ACTIVE_STATUSES: readonly string[] = [
  BACKUP_JOB_STATUS.PENDING,
  BACKUP_JOB_STATUS.QUEUED,
  BACKUP_JOB_STATUS.IN_PROGRESS,
  BACKUP_JOB_STATUS.UPLOADING,
];

/** True while a job is still moving — drives whether the client keeps polling. */
export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.includes(status);
}
