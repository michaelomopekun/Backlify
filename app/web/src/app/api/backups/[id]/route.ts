import { NextRequest, NextResponse } from "next/server";

import { BackupRepository, BackupFileRepository } from "db";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {

        const { id } = await params;

        if (!id) {

            return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });

        }

        // fetch backup job from repo
        const job = await BackupRepository.getJobById(id);

        if (!job) {

            return NextResponse.json({ success: false, error: "Backup job not found" }, { status: 404 });

        }

        // if the job is completed, also fetch the associated file metadata
        let fileMetadata = null;

        if (job.status === "completed") {

            fileMetadata = await BackupFileRepository.getBackupFileByJobId(id);

        }

        return NextResponse.json({

            success: true,

            job: {

                id: job.id,

                projectId: job.projectId,

                databaseUrl: job.databaseUrl,

                status: job.status,

                startedAt: job.startedAt,

                completedAt: job.completedAt,

                failedAt: job.failedAt,

                errorMessage: job.errorMessage,

                createdAt: job.createdAt,

                updatedAt: job.updatedAt,

            },

            file: fileMetadata ? {

                id: fileMetadata.id,

                fileName: fileMetadata.fileName,

                fileSize: fileMetadata.fileSize,

                storageProvider: fileMetadata.storageProvider,

                createdAt: fileMetadata.createdAt,

            } : null

        });

    } catch (error) {

        console.error("Failed to fetch backup job status:", error);

        return NextResponse.json({

            success: false,

            message: "Internal server error",

            details: error instanceof Error ? error.message : String(error)

        }, { status: 500 });

    }

}
