import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ProjectRepository, ScheduleRepository, BackupFileRepository } from "db";

import { backupQueue } from "@/lib/queues";

import { StorageService } from "shared/config/storage";

import { logger } from "shared/config/logger";


const UpdateProjectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  databaseUrl: z.string().url("Invalid database URL format").optional(),
  retentionCount: z.number().int().positive().optional(),
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


    const project = await ProjectRepository.getProjectById(id);


    if (!project) {

      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    }


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


    const body = await req.json();


    const validated = UpdateProjectInputSchema.safeParse(body);


    if (!validated.success) {

      return NextResponse.json(

        { success: false, error: "Validation failed", details: validated.error },

        { status: 400 }

      );

    }


    // Check project existence
    const project = await ProjectRepository.getProjectById(id);


    if (!project) {

      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    }


    const updatedProject = await ProjectRepository.updateProject(id, validated.data);


    return NextResponse.json({

      success: true,

      project: updatedProject,

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


    // Check project existence
    const project = await ProjectRepository.getProjectById(id);


    if (!project) {

      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

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

      project: deletedProject,

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
