import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { v4 as uuidv4 } from "uuid";

import { ProjectRepository, ScheduleRepository } from "db";

import { backupQueue } from "@/lib/queues";



const PRESET_CRON_MAP: Record<string, string> = {

  hourly: "0 * * * *",

  daily: "0 0 * * *",

  weekly: "0 0 * * 0",

};


const CreateScheduleInputSchema = z.object({

  projectId: z.string().min(1, "projectId is required"),

  cronExpression: z.string().min(1, "cronExpression is required"),

  timezone: z.string().max(100).optional().default("UTC"),

});


export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const validated = CreateScheduleInputSchema.safeParse(body);

    
    if (!validated.success) {
    
      return NextResponse.json(
    
        { success: false, error: "Validation failed", details: validated.error },
    
        { status: 400 }
    
      );
    
    }


    const { projectId, timezone } = validated.data;
    
    let { cronExpression } = validated.data;


    // Resolve preset shortcuts
    if (PRESET_CRON_MAP[cronExpression.toLowerCase()]) {
    
      cronExpression = PRESET_CRON_MAP[cronExpression.toLowerCase()];
    
    }


    // Verify project exists
    const project = await ProjectRepository.getProjectById(projectId);
    
    if (!project) {
    
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    
    }


    const id = `sch-${uuidv4().substring(0, 12)}`;


    // Try adding repeatable job to BullMQ first to validate cron pattern
    try {
    
      await backupQueue.add(
    
        "scheduled-backup",
    
        { scheduleId: id, projectId },
    
        {
    
          repeat: { pattern: cronExpression, tz: timezone },
    
          jobId: `schedule-${id}`,
    
        }
    
      );
    
    } catch (bullmqError) {
    
      console.error("BullMQ failed to accept schedule (likely invalid cron):", bullmqError);
    
      return NextResponse.json(
    
        {
    
          success: false,
    
          error: "Invalid cron expression or timezone",
    
          details: bullmqError instanceof Error ? bullmqError.message : String(bullmqError),
    
        },
    
        { status: 400 }
    
      );
    
    }


    // Save schedule to database
    const schedule = await ScheduleRepository.createSchedule({
    
      id,
    
      projectId,
    
      cronExpression,
    
      timezone,
    
      isActive: true,
    
    });


    return NextResponse.json(
    
      {
    
        success: true,
    
        schedule,
    
        message: "Backup schedule created and queued successfully",
    
      },
    
      { status: 201 }
    
    );
  
  } catch (error) {
  
    console.error("Failed to create backup schedule:", error);
  
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


export async function GET(req: NextRequest) {

  try {

    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");


    let schedules;
    
    if (projectId) {
    
      schedules = await ScheduleRepository.getSchedulesByProjectId(projectId);
    
    } else {
    
      // In the future we might want getAllSchedules, but we can list active or filter
      // For now, let's fetch all active schedules or just use getSchedulesByProjectId
      // Let's implement an endpoint that returns schedules
      // If we don't have a direct getAllSchedules in repo, let's list via project or fetch active
    
      schedules = await ScheduleRepository.getAllActiveSchedules();
    
    }

    return NextResponse.json({
    
      success: true,
    
      schedules,
    
    });
  
  } catch (error) {
  
    console.error("Failed to list schedules:", error);
  
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
