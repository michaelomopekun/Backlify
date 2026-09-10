"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { BackupFileRepository, BackupRepository, RestoreRepository } from "db";
import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";
import type { RestoreJobStatusType } from "shared/constants/restoreJobStatus";
import { emitJobTelemetry } from "shared/config/job-telemetry";

import { restoreQueue } from "@/lib/queues";

/**
 * Start a restore.
 *
 * Mirrors `POST /api/restores` step for step: verify the file exists, write the
 * job row, enqueue, then move pending -> queued. The row is written before the
 * enqueue so a restore can never run without a record of it — this is the one
 * operation in the app that overwrites a live database, and an untracked one
 * would be unexplainable after the fact.
 */
export async function triggerRestore(formData: FormData) {
  const backupFileId = formData.get("backupFileId")?.toString();
  const targetDatabaseUrl = formData.get("targetDatabaseUrl")?.toString().trim();
  const projectId = formData.get("projectId")?.toString();
  const confirmation = formData.get("confirm")?.toString().trim();

  if (!backupFileId) return { error: "Choose a backup to restore." };
  if (!targetDatabaseUrl) {
    return { error: "Enter the connection string of the database to restore into." };
  }
  if (!/^postgres(ql)?:\/\//i.test(targetDatabaseUrl)) {
    return { error: "That doesn't look like a PostgreSQL connection string." };
  }
  if (confirmation !== "RESTORE") {
    return { error: "Type RESTORE to confirm — this overwrites the target database." };
  }

  try {
    const file = await BackupFileRepository.getBackupFileById(backupFileId);
    if (!file) return { error: "That backup file no longer exists." };

    const jobId = `backlify-restoreJob-${uuidv4().substring(0, 12)}`;

    await RestoreRepository.saveRestoreJob({
      jobId,
      backupFileId,
      targetDatabaseUrl,
      jobStatus: RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
    });

    await restoreQueue.add(
      "restore",
      {
        jobId,
        backupFileId,
        targetDatabaseUrl,
        jobStatus: RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
        timestamp: Date.now(),
      },
      { jobId }
    );

    await RestoreRepository.updateJobStatus(
      jobId,
      RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
      RESTORE_JOB_STATUS.QUEUED as RestoreJobStatusType
    );

    if (projectId) revalidatePath(`/dashboard/project/${projectId}/restores`);

    return { success: true, jobId };
  } catch (error) {
    console.error("Failed to start restore:", error);
    return { error: "Could not start the restore. Try again in a moment." };
  }
}

/**
 * Execute a Headless Option 1 Disaster Recovery Drill.
 * Verifies checksum, encryption key, archive structure, and table definitions without touching any live database.
 */
export async function triggerDrill(projectId: string, backupFileId?: string) {
  if (!projectId) return { error: "Project ID is required" };

  try {
    let targetFile: any = null;

    if (backupFileId) {
      targetFile = await BackupFileRepository.getBackupFileById(backupFileId);
      if (!targetFile) {
        targetFile = await BackupFileRepository.getBackupFileByJobId(backupFileId);
      }
    }

    if (!targetFile) {
      // Look for the latest completed backup for this project
      const latest = await BackupRepository.listBackups({
        projectId,
        statuses: [BACKUP_JOB_STATUS.COMPLETED],
        limit: 1,
      });

      if (latest && latest.length > 0 && latest[0].fileId) {
        targetFile = await BackupFileRepository.getBackupFileById(latest[0].fileId);
      }
    }

    if (!targetFile) {
      return {
        error: "No completed backup snapshots found for this project. Run a backup first to execute a disaster recovery drill."
      };
    }

    const jobId = `backlify-drill-${uuidv4().substring(0, 12)}`;

    // Write job row before queueing so untracked operations are impossible
    await RestoreRepository.saveRestoreJob({
      jobId,
      backupFileId: targetFile.id,
      targetDatabaseUrl: "headless:drill",
      jobStatus: RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
    });

    await restoreQueue.add(
      "restore",
      {
        jobId,
        backupFileId: targetFile.id,
        targetDatabaseUrl: "headless:drill",
        isDrill: true,
        jobStatus: RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
        timestamp: Date.now(),
      },
      { jobId }
    );

    await RestoreRepository.updateJobStatus(
      jobId,
      RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
      RESTORE_JOB_STATUS.QUEUED as RestoreJobStatusType
    );

    await emitJobTelemetry({
      jobId,
      level: "info",
      phase: "INIT",
      message: `Enqueued Headless DR Drill for snapshot ${targetFile.fileName || targetFile.id.slice(0, 12)}. Initializing sandbox pipeline...`,
      progress: 5,
    });

    if (projectId) {
      revalidatePath(`/dashboard/project/${projectId}/restores`);
    }

    return {
      success: true,
      jobId,
      backupFileId: targetFile.id,
      fileName: targetFile.fileName,
    };
  } catch (error) {
    console.error("Failed to execute DR drill:", error);
    return { error: "Could not initiate the DR drill. Please try again in a moment." };
  }
}

