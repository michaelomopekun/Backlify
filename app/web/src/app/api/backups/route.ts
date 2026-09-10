import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { v4 as uuidv4 } from "uuid";

import { backupQueue } from "@/lib/queues";

import { BACKUP_JOB_STATUS } from "shared/constants/backupJobStatus";

import { BackupJobStatusType } from "shared/constants/backupJobStatus";

import { BackupRepository, ProjectRepository, ACTIVE_BACKUP_STATUSES } from "db";

import { BACKUP_JOB_STATUS_VALUES } from "shared/constants/backupJobStatus";


export const dynamic = "force-dynamic";


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

        // Enforce 50 MB Free Tier Storage Quota
        const FREE_TIER_STORAGE_LIMIT_BYTES = 50 * 1024 * 1024; // 50 MB
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

        if (currentStorageBytes >= FREE_TIER_STORAGE_LIMIT_BYTES) {
            return NextResponse.json({
                success: false,
                error: "Free tier storage limit reached (50 MB). Upgrade to Pro to continue backing up.",
            }, { status: 403 });
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


export async function GET(req: NextRequest) {

    try {

        const { searchParams } = new URL(req.url);

        const projectId = searchParams.get("projectId") ?? undefined;

        const status = searchParams.get("status");

        const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

        const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);


        // `status=active` is the shorthand the polling client uses; otherwise a
        // comma-separated list of concrete statuses.
        let statuses;

        if (status === "active") {

            statuses = ACTIVE_BACKUP_STATUSES;

        } else if (status) {

            const requested = status.split(",").map((s) => s.trim());

            const invalid = requested.filter(

                (s) => !(BACKUP_JOB_STATUS_VALUES as readonly string[]).includes(s)

            );

            if (invalid.length > 0) {

                return NextResponse.json({

                    success: false,

                    error: `Unknown status: ${invalid.join(", ")}`

                }, { status: 400 });

            }

            statuses = requested as any;

        }


        const backups = await BackupRepository.listBackups({ projectId, statuses, limit, offset });


        return NextResponse.json({

            success: true,

            backups,

        });


    } catch (error) {

        console.error("Failed to list backup jobs:", error);

        return NextResponse.json({

            success: false,

            message: "Internal server error",

            details: error instanceof Error ? error.message : String(error)

        }, { status: 500 });

    }

}
