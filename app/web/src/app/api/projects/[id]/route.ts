import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ProjectRepository, ScheduleRepository, BackupFileRepository, OrganizationRepository } from "db";
import { backupQueue } from "@/lib/queues";
import { StorageService } from "shared/config/storage";
import { logger } from "shared/config/logger";
import { isOrganizationPro } from "shared";
import { maskDatabaseUrl } from "shared/config/encryption";
import { validateSafeDatabaseUrl, validateSafeWebhookUrl } from "shared/config/security";
import { authorizeProject } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const UpdateProjectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  environment: z.string().max(50).optional(),
  databaseUrl: z.string().url("Invalid database URL format").optional(),
  vaultProvider: z.string().max(50).optional(),
  vaultBucket: z.string().max(255).optional(),
  vaultRegion: z.string().max(50).optional(),
  kmsKeyArn: z.string().max(255).optional(),
  retentionCount: z.number().int().positive().optional(),
  keepWeekly: z.boolean().optional(),
  keepMonthly: z.boolean().optional(),
  webhookUrl: z.string().url("Invalid webhook URL").or(z.literal("")).optional(),
  notifyOnFailure: z.boolean().optional(),
  notifyOnDrill: z.boolean().optional(),
  notifyOnStorage: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    // Project-scoped authorization (member, admin, or owner)
    const auth = await authorizeProject(id, "member");
    if (!auth.authorized) {
      return auth.response;
    }

    const project = await ProjectRepository.getProjectWithMaskedUrl(id);

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    logger.error(error, "Failed to fetch project");
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    // Project-scoped authorization: Requires admin or owner role
    const auth = await authorizeProject(id, "admin");
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await req.json().catch(() => ({}));
    const validated = UpdateProjectInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error },
        { status: 400 }
      );
    }

    // SSRF validation if databaseUrl is updated
    if (validated.data.databaseUrl) {
      const ssrfCheck = await validateSafeDatabaseUrl(validated.data.databaseUrl);
      if (!ssrfCheck.safe) {
        return NextResponse.json(
          { success: false, error: ssrfCheck.error || "Restricted database destination." },
          { status: 400 }
        );
      }
    }

    // SSRF validation if webhookUrl is updated
    if (validated.data.webhookUrl && validated.data.webhookUrl.trim() !== "") {
      const ssrfCheck = await validateSafeWebhookUrl(validated.data.webhookUrl);
      if (!ssrfCheck.safe) {
        return NextResponse.json(
          { success: false, error: ssrfCheck.error || "Restricted webhook destination." },
          { status: 400 }
        );
      }
    }

    // Verify Organization Plan Restrictions
    const org = auth.org;
    const isPro = isOrganizationPro(org);

    if (!isPro) {
      if (
        (validated.data.vaultProvider && validated.data.vaultProvider !== "backlify_default") ||
        validated.data.vaultBucket
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Custom cloud storage vaults (AWS S3, Cloudflare R2, GCS) require a Pro plan subscription ($3 or ₦2,000/mo). Upgrade to Pro to connect custom vaults.",
          },
          { status: 403 }
        );
      }

      if (validated.data.webhookUrl && validated.data.webhookUrl.trim() !== "") {
        return NextResponse.json(
          {
            success: false,
            error: "Webhook, Slack, Discord, and Telegram notifications require a Pro plan subscription ($3 or ₦2,000/mo). Free plan supports email alerts on failure.",
          },
          { status: 403 }
        );
      }

      if (validated.data.retentionCount && validated.data.retentionCount > 7) {
        return NextResponse.json(
          {
            success: false,
            error: "Free plan retention is limited to 7 backups. Upgrade to Pro for up to 90 days retention.",
          },
          { status: 403 }
        );
      }
    }

    const updatedProject = await ProjectRepository.updateProject(id, validated.data);

    return NextResponse.json({
      success: true,
      project: {
        ...updatedProject,
        databaseUrl: maskDatabaseUrl(updatedProject.databaseUrl),
      },
      message: "Project updated successfully",
    });
  } catch (error) {
    logger.error(error, "Failed to update project");
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    // Project-scoped authorization: Requires admin or owner role to delete project and cloud storage dumps
    const auth = await authorizeProject(id, "admin");
    if (!auth.authorized) {
      return auth.response;
    }

    // 1. Clean up BullMQ repeatable schedules in Redis
    const schedules = await ScheduleRepository.getSchedulesByProjectId(id);

    for (const schedule of schedules) {
      try {
        await backupQueue.removeRepeatable(
          "scheduled-backup",
          { pattern: schedule.cronExpression, tz: schedule.timezone },
          `schedule-${schedule.id}`
        );
        logger.info({ scheduleId: schedule.id, projectId: id }, "Removed BullMQ repeatable schedule during project deletion");
      } catch (bullmqErr) {
        logger.warn({ scheduleId: schedule.id, error: bullmqErr }, "Failed to remove BullMQ schedule (it may not have been registered)");
      }
    }

    // 2. Delete physical backup dump files from S3 / R2 storage
    try {
      const backupFiles = await BackupFileRepository.getBackupFilesByProjectId(id);
      if (backupFiles.length > 0) {
        const storageService = new StorageService();
        for (const file of backupFiles) {
          if (file.storageProvider === "r2" || file.storageProvider === "aws") {
            try {
              await storageService.deleteFile(file.filePath);
              logger.info({ filePath: file.filePath, projectId: id }, "Deleted backup file from cloud storage");
            } catch (storageErr) {
              logger.error({ filePath: file.filePath, error: storageErr }, "Failed to delete backup file from storage during project deletion");
            }
          }
        }
      }
    } catch (storageCleanupErr) {
      logger.error({ projectId: id, error: storageCleanupErr }, "Failed during storage cleanup for project deletion");
    }

    // 3. Delete project from database (PostgreSQL cascade will delete backup_schedules, backup_jobs, backup_files, and restore_jobs)
    const deletedProject = await ProjectRepository.deleteProject(id);

    return NextResponse.json({
      success: true,
      project: {
        ...deletedProject,
        databaseUrl: maskDatabaseUrl(deletedProject.databaseUrl),
      },
      message: "Project deleted successfully",
    });
  } catch (error) {
    logger.error(error, "Failed to delete project");
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
