import { NextRequest, NextResponse } from "next/server";
import { BackupFileRepository, BackupRepository } from "db";
import { maskDatabaseUrl } from "shared/config/encryption";
import { StorageService } from "shared";
import { authorizeBackupJob } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    // Authorize: caller must have at least 'member' role in the backup job's project
    const auth = await authorizeBackupJob(id, "member");
    if (!auth.authorized) {
      return auth.response;
    }

    const job = auth.job;

    // If the job is completed, also fetch the associated file metadata
    let fileMetadata = null;
    if (job.status === "completed") {
      fileMetadata = await BackupFileRepository.getBackupFileByJobId(id);
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        projectId: job.projectId,
        databaseUrl: maskDatabaseUrl(job.databaseUrl), // Masked for defense-in-depth
        status: job.status,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        failedAt: job.failedAt,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
      file: fileMetadata
        ? {
            id: fileMetadata.id,
            fileName: fileMetadata.fileName,
            fileSize: fileMetadata.fileSize,
            storageProvider: fileMetadata.storageProvider,
            createdAt: fileMetadata.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch backup job status:", error);
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    // Authorize: caller must have at least 'admin' role (owner or admin)
    const auth = await authorizeBackupJob(id, "admin");
    if (!auth.authorized) {
      return auth.response;
    }

    // Try deleting cloud storage file if exists
    try {
      const file = await BackupFileRepository.getBackupFileByJobId(id);
      if (file && file.filePath) {
        const storageService = new StorageService();
        await storageService.deleteFile(file.filePath);
      }
    } catch (storageErr) {
      console.warn("Storage deletion skipped or failed for snapshot:", id, storageErr);
    }

    // Delete backup job (cascades to backupFiles & restoreJobs in database)
    await BackupRepository.deleteBackupJob(id);

    return NextResponse.json({
      success: true,
      message: "Snapshot deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete snapshot:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
