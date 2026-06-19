import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { v4 as uuidv4 } from "uuid";

import { backupQueue } from "@/lib/queues";

import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { BackupJobStatusType } from "shared/constants/backupJobStatus";

import { BackupRepository, ProjectRepository } from "db";


const CreateBackupInputSchema = z.object({

    projectId: z.string().min(1, "projectId is required"),

});


export async function POST(req: NextRequest) {

    try {

        const body = await req.json();

        const validated = CreateBackupInputSchema.safeParse(body);


        if (!validated.success) {

            return NextResponse.json({ success: false, error: "Validation failed", details: validated.error }, { status: 400 });

        }


        const { projectId } = validated.data;

        // Resolve databaseUrl from the project
        const project = await ProjectRepository.getProjectById(projectId);

        if (!project) {

            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

        }

        const databaseUrl = project.databaseUrl;

        const jobId = `backlify-backupJob-${uuidv4().substring(0, 12)}`;


        // save metadata to database

        await BackupRepository.saveBackupJob({ jobId, databaseUrl, projectId, jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType});


        // create job payload

        const jobData = {

            jobId,

            databaseUrl,

            jobStatus: BACKUP_JOB_STATUS.PENDING as BackupJobStatusType,

            timestamp: Date.now(),

        };


        // enqueue job

        const job = await backupQueue.add("backup", jobData, { jobId });


        // update job status to queued

        await BackupRepository.updateJobStatus(jobId, BACKUP_JOB_STATUS.PENDING as BackupJobStatusType, BACKUP_JOB_STATUS.QUEUED as BackupJobStatusType);


        return NextResponse.json({

            success: true,

            jobId: job.id,

            status: BACKUP_JOB_STATUS.QUEUED,

            message: "Backup job created and added to queue",

        }, { status: 201 });


    } catch (error) {

        console.error("Failed to create backup job:", error);

        return NextResponse.json({

            success: false,

            message: "Internal server error",

            details: error instanceof Error ? error.message : String(error)

        }, { status: 500 });

    }

}
