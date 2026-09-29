import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { backupQueue } from "@/lib/queues";
import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";
import { BackupJobStatusType } from "shared/constants/backupJobStatus";
import { BackupRepository, ProjectRepository, OrganizationRepository, ACTIVE_BACKUP_STATUSES } from "db";
import { BACKUP_JOB_STATUS_VALUES } from "shared/constants/backupJobStatus";
import { requireAuth, authorizeProject, getUserAuthorizedProjectIds } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse, attachRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CreateBackupInputSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    const body = await req.json().catch(() => ({}));
    const validated = CreateBackupInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error },
        { status: 400 }
      );
    }

    const { projectId } = validated.data;

    // Project-scoped authorization: User must have at least 'member' role in this project's organization
    const projectAuth = await authorizeProject(projectId, "member");
    if (!projectAuth.authorized) {
      return projectAuth.response;
    }

    // Rate limiting: max 15 backup triggers per 5 minutes per user/project
    const rateLimit = await checkRateLimit(`backup-trigger:${projectId}:${auth.user.id}`, 15, 300);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, "Too many backup triggers. Please wait before queuing another backup.");
    }

    const project = projectAuth.project;

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
        const orgProjectIds = orgProjects.map((p) => p.id);
        const stats = await BackupRepository.getActiveStorageStatsForProjects(orgProjectIds);
        currentStorageBytes = stats.totalBytes;
      } else {
        const stats = await BackupRepository.getActiveStorageStatsForProjects([projectId]);
        currentStorageBytes = stats.totalBytes;
      }
    } catch (err) {
      console.warn("Storage quota check failed, continuing backup:", err);
    }

    if (currentStorageBytes >= storageLimitBytes) {
      return NextResponse.json(
        {
          success: false,
          error: isPro
            ? "Pro tier storage limit reached (50 GB). Please clean up older backups or attach a custom S3 vault."
            : "Free tier storage limit reached (50 MB). Upgrade to Pro to unlock 50 GB storage.",
        },
        { status: 403 }
      );
    }

    const databaseUrl = project.databaseUrl;
    const jobId = `backlify-manual-backupJob-${uuidv4().substring(0, 12)}`;

    // Save metadata to database
    await BackupRepository.saveBackupJob({
      jobId,
      databaseUrl,
      projectId,
      jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
      triggerType: "manual",
    });

    // Create job payload
    const jobData = {
      jobId,
      databaseUrl,
      jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
      timestamp: Date.now(),
    };

    // Enqueue job
    const job = await backupQueue.add("backup", jobData, { jobId });

    // Update job status to queued
    await BackupRepository.updateJobStatus(
      jobId,
      BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,
      BACKUP_JOB_STATUS.QUEUED as BackupJobStatusType
    );

    const response = NextResponse.json(
      {
        success: true,
        jobId: job.id,
        status: BACKUP_JOB_STATUS.QUEUED,
        message: "Backup job created and added to queue",
      },
      { status: 201 }
    );

    return attachRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("Failed to create backup job:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") ?? undefined;
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    // If specific projectId requested, check authorization on that project
    let authorizedProjectIds: string[] | undefined;
    if (projectId) {
      const projectAuth = await authorizeProject(projectId, "member");
      if (!projectAuth.authorized) {
        return projectAuth.response;
      }
    } else {
      // Scoped listing: list backups only for projects the user has access to
      const access = await getUserAuthorizedProjectIds(auth.user.id);
      authorizedProjectIds = access.projectIds;
    }

    let statuses;
    if (status === "active") {
      statuses = ACTIVE_BACKUP_STATUSES;
    } else if (status) {
      const requested = status.split(",").map((s) => s.trim());
      const invalid = requested.filter((s) => !(BACKUP_JOB_STATUS_VALUES as readonly string[]).includes(s));
      if (invalid.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown status: ${invalid.join(", ")}`,
          },
          { status: 400 }
        );
      }
      statuses = requested as any;
    }

    const backups = await BackupRepository.listBackups({
      projectId,
      projectIds: projectId ? undefined : authorizedProjectIds,
      statuses,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      backups,
    });
  } catch (error) {
    console.error("Failed to list backup jobs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
