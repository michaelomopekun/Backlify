"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { BackupFileRepository, RestoreRepository } from "db";
import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";
import type { RestoreJobStatusType } from "shared/constants/restoreJobStatus";

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

    if (projectId) revalidatePath(`/dashboard/projects/${projectId}/restore`);

    return { success: true, jobId };
  } catch (error) {
    console.error("Failed to start restore:", error);
    return { error: "Could not start the restore. Try again in a moment." };
  }
}
