"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { BackupRepository, ProjectRepository, ScheduleRepository } from "db";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";
import type { BackupJobStatusType } from "shared/constants/backupJobStatus";

import { backupQueue } from "@/lib/queues";

/**
 * Mutations for the dashboard.
 *
 * These duplicate what `POST /api/backups` and friends do rather than calling
 * them over HTTP — a server action fetching its own origin needs an absolute URL
 * and loses the error types. The API routes stay for external callers.
 *
 * Every action returns `{ error }` or `{ success: true }`, matching
 * `waitlist.actions.ts`, so the forms all read the same way.
 */

export async function triggerBackup(projectId: string) {
  if (!projectId) return { error: "Choose a project first." };

  try {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) return { error: "That project no longer exists." };

    const jobId = `backlify-backupJob-${uuidv4().substring(0, 12)}`;

    await BackupRepository.saveBackupJob({
      jobId,
      databaseUrl: project.databaseUrl,
      projectId,
      jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
    });

    await backupQueue.add(
      "backup",
      {
        jobId,
        databaseUrl: project.databaseUrl,
        jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
        timestamp: Date.now(),
      },
      { jobId }
    );

    await BackupRepository.updateJobStatus(
      jobId,
      BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
      BACKUP_JOB_STATUS.QUEUED as BackupJobStatusType
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/project/${projectId}/backups`);
    revalidatePath(`/dashboard/project/${projectId}`);

    return { success: true, jobId };
  } catch (error) {
    console.error("Failed to trigger backup:", error);
    return { error: "Could not start the backup. Try again in a moment." };
  }
}

export async function createProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const databaseUrl = formData.get("databaseUrl")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim() || "default-org";
  const cronExpression = formData.get("cronExpression")?.toString().trim() || "0 2 * * *";

  if (!name) return { error: "Give the project a name." };
  if (!databaseUrl) return { error: "A database connection string is required." };
  if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    return { error: "That doesn't look like a PostgreSQL connection string." };
  }

  try {
    const projectId = `proj-${uuidv4().substring(0, 8)}`;
    const project = await ProjectRepository.createProject({
      id: projectId,
      orgId,
      name,
      databaseUrl,
    });

    if (cronExpression) {
      const scheduleId = `sch-${uuidv4().substring(0, 8)}`;
      await ScheduleRepository.createSchedule({
        id: scheduleId,
        projectId,
        cronExpression,
        timezone: "UTC",
        isActive: true,
      });

      try {
        await backupQueue.add(
          "scheduled-backup",
          { scheduleId, projectId },
          {
            repeat: { pattern: cronExpression, tz: "UTC" },
            jobId: `schedule-${scheduleId}`,
          }
        );
      } catch (queueErr) {
        console.warn("Could not register repeatable backup job on project creation:", queueErr);
      }
    }

    revalidatePath(`/dashboard/project/${projectId}`);
    revalidatePath(`/dashboard/org/${orgId}`);
    revalidatePath("/dashboard");

    return { success: true, projectId };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { error: "Could not create the project. Try again in a moment." };
  }
}

export async function updateRetention(projectId: string, retentionCount: number) {
  if (!Number.isInteger(retentionCount) || retentionCount < 1) {
    return { error: "Keep at least one backup." };
  }

  try {
    await ProjectRepository.updateProject(projectId, { retentionCount });
    revalidatePath(`/dashboard/project/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update retention:", error);
    return { error: "Could not save the retention setting." };
  }
}
