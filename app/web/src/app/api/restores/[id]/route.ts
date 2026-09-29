import { NextRequest, NextResponse } from "next/server";
import { maskDatabaseUrl } from "shared/config/encryption";
import { authorizeRestoreJob } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    // Authorize: caller must have at least 'member' role in the project
    const auth = await authorizeRestoreJob(id, "member");
    if (!auth.authorized) {
      return auth.response;
    }

    const job = auth.restoreJob;

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        backupFileId: job.backupFileId,
        targetDatabaseUrl: maskDatabaseUrl(job.targetDatabaseUrl), // Mask sensitive credentials
        status: job.status,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to fetch restore job status:", error);
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
