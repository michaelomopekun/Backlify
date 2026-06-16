import { NextRequest, NextResponse } from "next/server";

import { RestoreRepository } from "db";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {

        const { id } = await params;

        if (!id) {

            return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });

        }

        // fetch restore job from repo
        const job = await RestoreRepository.getJobById(id);

        if (!job) {

            return NextResponse.json({ success: false, error: "Restore job not found" }, { status: 404 });

        }

        return NextResponse.json({

            success: true,

            job: {

                id: job.id,

                backupFileId: job.backupFileId,

                targetDatabaseUrl: job.targetDatabaseUrl,

                status: job.status,

                startedAt: job.startedAt,

                completedAt: job.completedAt,

                errorMessage: job.errorMessage,

                createdAt: job.createdAt,

            }

        });

    } catch (error) {

        console.error("Failed to fetch restore job status:", error);

        return NextResponse.json({

            success: false,

            message: "Internal server error",

            details: error instanceof Error ? error.message : String(error)

        }, { status: 500 });

    }

}
