import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { v4 as uuidv4 } from "uuid";

import { restoreQueue } from "@/lib/queues";

import { RESTORE_JOB_STATUS } from "shared/constants/restoreJobStatus";

import { RestoreRepository, BackupFileRepository } from "db";


const CreateRestoreInputSchema = z.object({

    backupFileId: z.string().min(1, "Backup File ID is required"),

    targetDatabaseUrl: z.string().url("Invalid database URL format"),

});


export async function POST(req: NextRequest) {

    try {

        const body = await req.json();

        const validated = CreateRestoreInputSchema.safeParse(body);


        if (!validated.success) {

            return NextResponse.json({ success: false, error: "Validation failed", details: validated.error }, { status: 400 });

        }


        const { backupFileId, targetDatabaseUrl } = validated.data;


        // Verify that the backup file exists in the database

        const fileResult = await BackupFileRepository.getBackupFileById(backupFileId);

        if (!fileResult) {

            return NextResponse.json({ success: false, error: "Backup file not found" }, { status: 404 });

        }


        const jobId = `backlify-restoreJob-${uuidv4().substring(0, 12)}`;


        // save metadata to database

        await RestoreRepository.saveRestoreJob({ jobId, backupFileId, targetDatabaseUrl });


        // create job payload

        const jobData = {

            jobId,

            backupFileId,

            targetDatabaseUrl,

            jobStatus: RESTORE_JOB_STATUS.PENDING as any,

            timestamp: Date.now(),

        };


        // enqueue job

        const job = await restoreQueue.add("restore", jobData, { jobId });


        // update job status to queued

        await RestoreRepository.updateJobStatus(jobId, RESTORE_JOB_STATUS.PENDING as any, RESTORE_JOB_STATUS.QUEUED as any);


        return NextResponse.json({

            success: true,

            jobId: job.id,

            status: RESTORE_JOB_STATUS.QUEUED,

            message: "Restore job created and added to queue",

        }, { status: 201 });


    } catch (error) {

        console.error("Failed to create restore job:", error);

        return NextResponse.json({

            success: false,

            message: "Internal server error",

            details: error instanceof Error ? error.message : String(error)

        }, { status: 500 });

    }

}
