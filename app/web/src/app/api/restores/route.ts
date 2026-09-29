import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { restoreQueue } from "@/lib/queues";
import { RESTORE_JOB_STATUS, RestoreJobStatusType } from "shared/constants/restoreJobStatus";
import { RestoreRepository } from "db";
import { validateSafeDatabaseUrl } from "shared/config/security";
import { authorizeBackupFile } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse, attachRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CreateRestoreInputSchema = z.object({
  backupFileId: z.string().min(1, "Backup File ID is required"),
  targetDatabaseUrl: z.string().url("Invalid database URL format"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = CreateRestoreInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error },
        { status: 400 }
      );
    }

    const { backupFileId, targetDatabaseUrl } = validated.data;

    // 1. Authorize: Restoring overwrites database tables and requires 'admin' or 'owner' role on the backup file's project
    const fileAuth = await authorizeBackupFile(backupFileId, "admin");
    if (!fileAuth.authorized) {
      return fileAuth.response;
    }

    // 2. Rate limiting: max 5 restore triggers per 5 minutes per user
    const rateLimit = await checkRateLimit(`restore-trigger:${fileAuth.user.id}`, 5, 300);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, "Too many restore operations initiated. Please wait before triggering another restore.");
    }

    // 3. SSRF Protection: Ensure target database destination is not localhost, private IP, or cloud metadata
    const ssrfCheck = await validateSafeDatabaseUrl(targetDatabaseUrl);
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        {
          success: false,
          error: ssrfCheck.error || "Restricted restore target: private networks, loopback, and cloud metadata services are blocked.",
        },
        { status: 400 }
      );
    }

    const jobId = `backlify-restoreJob-${uuidv4().substring(0, 12)}`;

    // Save metadata to database before enqueueing
    await RestoreRepository.saveRestoreJob({
      jobId,
      backupFileId,
      targetDatabaseUrl,
      jobStatus: RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
    });

    // Create job payload
    const jobData = {
      jobId,
      backupFileId,
      targetDatabaseUrl,
      jobStatus: RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
      timestamp: Date.now(),
    };

    // Enqueue job
    const job = await restoreQueue.add("restore", jobData, { jobId });

    // Update job status to queued
    await RestoreRepository.updateJobStatus(
      jobId,
      RESTORE_JOB_STATUS.PENDING as RestoreJobStatusType,
      RESTORE_JOB_STATUS.QUEUED as RestoreJobStatusType
    );

    const response = NextResponse.json(
      {
        success: true,
        jobId: job.id,
        status: RESTORE_JOB_STATUS.QUEUED,
        message: "Restore job created and added to queue",
      },
      { status: 201 }
    );

    return attachRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("Failed to create restore job:", error);
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
