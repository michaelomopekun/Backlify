import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ScheduleRepository } from "db";

import { backupQueue } from "@/lib/queues";

import { logger } from "shared/config/logger";


const PRESET_CRON_MAP: Record<string, string> = {

  hourly: "0 * * * *",

  daily: "0 0 * * *",

  weekly: "0 0 * * 0",

};


const UpdateScheduleInputSchema = z.object({

  cronExpression: z.string().min(1).optional(),

  timezone: z.string().max(100).optional(),

  isActive: z.boolean().optional(),

});


export async function GET(

  req: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    const { id } = await params;

    if (!id) {

      return NextResponse.json({ success: false, error: "Schedule ID is required" }, { status: 400 });

    }


    
    const schedule = await ScheduleRepository.getScheduleById(id);

    if (!schedule) {

      return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });

    }

    return NextResponse.json({

      success: true,

      schedule,

    });

  } catch (error) {

    logger.error(error, "Failed to fetch schedule");

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

      return NextResponse.json({ success: false, error: "Schedule ID is required" }, { status: 400 });

    }


    const body = await req.json();

    const validated = UpdateScheduleInputSchema.safeParse(body);


    if (!validated.success) {

      return NextResponse.json(

        { success: false, error: "Validation failed", details: validated.error },

        { status: 400 }

      );

    }


    const existingSchedule = await ScheduleRepository.getScheduleById(id);

    if (!existingSchedule) {

      return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });

    }


    let { cronExpression, timezone, isActive } = validated.data;

    
    // Resolve presets
    if (cronExpression && PRESET_CRON_MAP[cronExpression.toLowerCase()]) {

      cronExpression = PRESET_CRON_MAP[cronExpression.toLowerCase()];

    }


    const finalCron = cronExpression !== undefined ? cronExpression : existingSchedule.cronExpression;

    const finalTimezone = timezone !== undefined ? timezone : existingSchedule.timezone;

    const finalActive = isActive !== undefined ? isActive : existingSchedule.isActive;


    // 1. Remove old repeatable job from BullMQ
    try {

      await backupQueue.removeRepeatable(

        "scheduled-backup",

        { pattern: existingSchedule.cronExpression, tz: existingSchedule.timezone },

        `schedule-${id}`

      );

    } catch (bullmqRemoveErr) {

      logger.warn(bullmqRemoveErr, "Failed to remove old repeatable job (it might not have been registered)");

    }

    
    // 2. Add new repeatable job to BullMQ if the updated state is active
    if (finalActive) {

      try {

        await backupQueue.add(

          "scheduled-backup",

          { scheduleId: id, projectId: existingSchedule.projectId },

          {

            repeat: { pattern: finalCron, tz: finalTimezone },

            jobId: `schedule-${id}`,

          }

        );

      } catch (bullmqAddErr) {

        logger.error(bullmqAddErr, "Failed to add updated repeatable job to BullMQ");

        // Put the old repeatable job back to keep it in sync

        if (existingSchedule.isActive) {

          await backupQueue.add(

            "scheduled-backup",

            { scheduleId: id, projectId: existingSchedule.projectId },

            {

              repeat: { pattern: existingSchedule.cronExpression, tz: existingSchedule.timezone },

              jobId: `schedule-${id}`,

            }

          ).catch((e) => logger.error(e, "Critical: failed to restore old schedule"));

        }

        return NextResponse.json(

          {

            success: false,

            error: "Invalid cron expression or timezone update",

            details: bullmqAddErr instanceof Error ? bullmqAddErr.message : String(bullmqAddErr),

          },

          { status: 400 }

        );

      }

    }


    // 3. Save updates to database
    const updatedSchedule = await ScheduleRepository.updateSchedule(id, {
    
      cronExpression: finalCron,
    
      timezone: finalTimezone,
    
      isActive: finalActive,
    
    });


    return NextResponse.json({
    
      success: true,
    
      schedule: updatedSchedule,
    
      message: "Backup schedule updated successfully",
    
    });

  } catch (error) {

    logger.error(error, "Failed to update schedule");

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

      return NextResponse.json({ success: false, error: "Schedule ID is required" }, { status: 400 });

    }


    const schedule = await ScheduleRepository.getScheduleById(id);
    
    if (!schedule) {
    
      return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });
    
    }

    // 1. Remove repeatable job from BullMQ
    try {
    
      await backupQueue.removeRepeatable(
    
        "scheduled-backup",
    
        { pattern: schedule.cronExpression, tz: schedule.timezone },
    
        `schedule-${id}`
    
      );
    
    } catch (bullmqErr) {
    
      logger.warn(bullmqErr, "Failed to remove repeatable job from BullMQ during deletion");
    
    }

    // 2. Delete from database
    const deletedSchedule = await ScheduleRepository.deleteSchedule(id);

    return NextResponse.json({
    
      success: true,
    
      schedule: deletedSchedule,
    
      message: "Backup schedule deleted successfully",
    
    });

  } catch (error) {

    logger.error(error, "Failed to delete schedule");

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
