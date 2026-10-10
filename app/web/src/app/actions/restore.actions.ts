"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { BackupFileRepository, BackupRepository, RestoreRepository, ProjectRepository, OrganizationRepository } from "db";
import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";
import type { RestoreJobStatusType } from "shared/constants/restoreJobStatus";
import { emitJobTelemetry, getJobTelemetryHistory } from "shared/config/job-telemetry";
import { isOrganizationPro } from "shared/config/billing";
import { validateSafeDatabaseUrl } from "shared/config/security";
import { getCurrentUser } from "@/lib/current-user";
import { getUserOrgRole, hasMinRole } from "@/lib/auth-guard";
import { checkRateLimit } from "@/lib/rate-limit";

import { restoreQueue } from "@/lib/queues";

/**
 * Start a restore.
 * Requires authenticated session, admin/owner role, and SSRF validation.
 */
export async function triggerRestore(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required to trigger a restore." };

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

  // Rate limiting: max 5 restores per 5 min
  const rateLimit = await checkRateLimit(`restore-trigger:${user.id}`, 5, 300);
  if (!rateLimit.allowed) {
    return { error: "Too many restore operations initiated. Please wait before triggering another restore." };
  }

  // SSRF Protection: ensure destination is not localhost, private IP, or metadata endpoint
  const ssrfCheck = await validateSafeDatabaseUrl(targetDatabaseUrl);
  if (!ssrfCheck.safe) {
    return { error: ssrfCheck.error || "Restricted restore target: private networks, loopback, and metadata endpoints are blocked." };
  }

  try {
    const file = await BackupFileRepository.getBackupFileById(backupFileId);
    if (!file) return { error: "That backup file no longer exists." };

    // Resolve project and authorize admin or owner role
    let targetProjectId = projectId;
    if (!targetProjectId && file.backupJobId) {
      const job = await BackupRepository.getJobById(file.backupJobId);
      if (job?.projectId) targetProjectId = job.projectId;
    }

    if (!targetProjectId) {
      return { error: "Cannot verify project authorization for this backup file." };
    }

    const project = await ProjectRepository.getProjectById(targetProjectId);
    if (!project) return { error: "Associated project not found." };

    const membership = await getUserOrgRole(user.id, user.email, project.orgId);
    if (!membership || !hasMinRole(membership.role, "admin")) {
      return { error: "Forbidden: Restoring requires admin or owner permissions in the organization." };
    }

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

    await emitJobTelemetry({
      jobId,
      level: "info",
      phase: "INIT",
      message: `Enqueued database restore job ${jobId}. Initializing recovery pipeline...`,
      progress: 5,
    });

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
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required to run DR drills." };

  if (!projectId) return { error: "Project ID is required" };

  try {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) return { error: "Project not found" };

    // Authorize: user must belong to project's org
    const membership = await getUserOrgRole(user.id, user.email, project.orgId);
    if (!membership) {
      return { error: "Forbidden: You do not have permission to run DR drills for this project." };
    }

    // Enforce Disaster Recovery Drill Quotas (1/mo on Free, Unlimited on Pro)
    const org = project.orgId ? await OrganizationRepository.getOrganizationById(project.orgId) : null;
    if (!isOrganizationPro(org)) {
      const startOfMonth = new Date();
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);

      const drillsThisMonth = org
        ? await RestoreRepository.countMonthlyDrillsForOrg(org.id, startOfMonth)
        : await RestoreRepository.countMonthlyDrillsForProject(projectId, startOfMonth);

      if (drillsThisMonth >= 1) {
        return {
          error: "Free plan limit reached (1 Disaster Recovery drill per calendar month). Upgrade to Pro for unlimited manual drills & automated verification on every backup.",
        };
      }
    }

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

/**
 * Retrieves the full console telemetry log stream for a restore or drill job.
 * Reads directly from Redis telemetry history buffer, falling back to database records.
 */
export async function getRestoreLogs(jobId: string): Promise<string[]> {
  if (!jobId) return [];

  try {
    const history = await getJobTelemetryHistory(jobId);
    if (history && history.length > 0) {
      return history.map((entry) => `[${entry.phase || entry.level?.toUpperCase() || "INFO"}] ${entry.message}`);
    }
  } catch (err) {
    console.warn("Failed to fetch logs from Redis telemetry:", err);
  }

  // Fallback to database record
  try {
    const job = await RestoreRepository.getJobById(jobId);
    if (job?.errorMessage) {
      try {
        const parsed = JSON.parse(job.errorMessage);
        if (Array.isArray(parsed.logs) && parsed.logs.length > 0) return parsed.logs;
      } catch {
        return [`[ERROR] ${job.errorMessage}`];
      }
    }
    if (job?.status === "completed") {
      return [
        `[INIT] Operation initialized successfully`,
        `[RESTORE] Database restored to target instance`,
        `[COMPLETE] Database successfully restored and verified`,
      ];
    }
  } catch {}

  return [];
}
