"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { BackupRepository, OrganizationRepository, ProjectRepository, ScheduleRepository } from "db";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";
import type { BackupJobStatusType } from "shared/constants/backupJobStatus";
import { getOrganizationMaxProjects, isOrganizationPro, isCronAllowedForPlan } from "shared";
import { validateSafeDatabaseUrl } from "shared/config/security";
import { getCurrentUser } from "@/lib/current-user";
import { getUserOrgRole, hasMinRole } from "@/lib/auth-guard";
import { checkRateLimit } from "@/lib/rate-limit";

import { backupQueue } from "@/lib/queues";

/**
 * Mutations for the dashboard.
 * Scoped with authenticated sessions, RBAC permissions, and SSRF validation.
 */

export async function triggerBackup(projectId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required to trigger backups." };

  if (!projectId) return { error: "Choose a project first." };

  try {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) return { error: "That project no longer exists." };

    // Authorize: user must belong to the organization
    const membership = await getUserOrgRole(user.id, user.email, project.orgId);
    if (!membership) {
      return { error: "Forbidden: You are not authorized to trigger backups for this project." };
    }

    // Rate limiting: max 15 triggers per 5 min
    const rateLimit = await checkRateLimit(`backup-trigger:${projectId}:${user.id}`, 15, 300);
    if (!rateLimit.allowed) {
      return { error: "Too many backup triggers queued. Please wait a few moments." };
    }

    // Enforce Tier Storage Quota (50 MB on Free, 50 GB on Pro)
    let isPro = false;
    let storageLimitBytes = 50 * 1024 * 1024; // 50 MB Free tier
    try {
      if (project.orgId) {
        const org = await OrganizationRepository.getOrganizationById(project.orgId);
        if (org && (org as any).plan === "pro") {
          isPro = true;
          storageLimitBytes = 50 * 1024 * 1024 * 1024; // 50 GB Pro tier
        }
      }
    } catch {}

    let currentStorageBytes = 0;
    try {
      if (project.orgId) {
        const orgProjects = (await ProjectRepository.getAllProjects()).filter((p) => p.orgId === project.orgId);
        const orgProjectIds = new Set(orgProjects.map((p) => p.id));
        const allBackups = await BackupRepository.listBackups({});
        currentStorageBytes = allBackups
          .filter((b) => b.projectId && orgProjectIds.has(b.projectId))
          .reduce((sum, b) => sum + (b.fileSize || 0), 0);
      } else {
        const projectBackups = await BackupRepository.listBackups({ projectId });
        currentStorageBytes = projectBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
      }
    } catch (err) {
      console.warn("Storage quota check failed, continuing backup:", err);
    }

    if (currentStorageBytes >= storageLimitBytes) {
      return {
        error: isPro
          ? "Pro tier storage limit reached (50 GB). Please clean up older backups or attach a custom S3 vault."
          : "Free tier storage limit reached (50 MB). Upgrade to Pro to unlock 50 GB storage.",
      };
    }

    const jobId = `backlify-manual-backupJob-${uuidv4().substring(0, 12)}`;

    await BackupRepository.saveBackupJob({
      jobId,
      databaseUrl: project.databaseUrl,
      projectId,
      jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
      triggerType: "manual",
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
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required to create a project." };

  const name = formData.get("name")?.toString().trim();
  const databaseUrl = formData.get("databaseUrl")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim() || "default-org";
  const cronExpression = formData.get("cronExpression")?.toString().trim() || "0 2 * * *";

  if (!name) return { error: "Give the project a name." };
  if (!databaseUrl) return { error: "A database connection string is required." };
  if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    return { error: "That doesn't look like a PostgreSQL connection string." };
  }

  // SSRF Defense
  const ssrfCheck = await validateSafeDatabaseUrl(databaseUrl);
  if (!ssrfCheck.safe) {
    return { error: ssrfCheck.error || "Restricted database target." };
  }

  try {
    const existingOrg = await OrganizationRepository.getOrganizationById(orgId);
    if (!existingOrg) {
      return { error: "Organization not found. Please create an organization first." };
    }

    // Authorize: user must have admin or owner role in the org
    const membership = await getUserOrgRole(user.id, user.email, orgId);
    if (!membership || !hasMinRole(membership.role, "admin")) {
      return { error: "Forbidden: Only organization admins and owners can add databases." };
    }

    // Enforce Plan Database Quota (2 on Free, 50 on Pro)
    const orgProjects = (await ProjectRepository.getAllProjects()).filter((p) => p.orgId === orgId);
    const maxProjects = getOrganizationMaxProjects(existingOrg);
    if (orgProjects.length >= maxProjects) {
      return {
        error: isOrganizationPro(existingOrg)
          ? `Pro tier project limit reached (${maxProjects} max). Contact support for enterprise scale.`
          : `Free plan limit reached (${maxProjects} databases max). Upgrade to Pro to connect up to 50 databases.`,
      };
    }

    const projectId = `proj-${uuidv4().substring(0, 8)}`;
    await ProjectRepository.createProject({
      id: projectId,
      orgId,
      name,
      databaseUrl,
    });

    if (cronExpression) {
      if (!isCronAllowedForPlan(cronExpression, existingOrg)) {
        return {
          error: "Sub-daily / hourly backup frequencies require a Pro plan subscription ($3 or ₦2,000/mo). Free plans support daily backups.",
        };
      }

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
  const user = await getCurrentUser();
  if (!user) return { error: "Authentication required." };

  if (!Number.isInteger(retentionCount) || retentionCount < 1) {
    return { error: "Keep at least one backup." };
  }

  try {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) return { error: "Project not found." };

    const membership = await getUserOrgRole(user.id, user.email, project.orgId);
    if (!membership || !hasMinRole(membership.role, "admin")) {
      return { error: "Forbidden: Only admins and owners can adjust retention policies." };
    }

    const org = project.orgId ? await OrganizationRepository.getOrganizationById(project.orgId) : null;
    if (!isOrganizationPro(org) && retentionCount > 7) {
      return {
        error: "Free plan retention is limited to 7 backups. Upgrade to Pro for up to 90 days retention.",
      };
    }

    await ProjectRepository.updateProject(projectId, { retentionCount });
    revalidatePath(`/dashboard/project/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update retention:", error);
    return { error: "Could not save the retention setting." };
  }
}
