"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { ProjectRepository, ScheduleRepository } from "db";

import { backupQueue } from "@/lib/queues";

/**
 * Schedule mutations.
 *
 * Order matters and mirrors `POST /api/schedules`: BullMQ gets the repeat
 * pattern first because it's the thing that validates the cron expression. Only
 * once it accepts do we write the row — otherwise a typo leaves a schedule in
 * the database that will never fire.
 */

const PRESETS: Record<string, string> = {
  hourly: "0 * * * *",
  daily: "0 2 * * *",
  weekly: "0 2 * * 0",
};

export async function createSchedule(formData: FormData) {
  const projectId = formData.get("projectId")?.toString();
  const raw = formData.get("cronExpression")?.toString().trim();
  const timezone = formData.get("timezone")?.toString().trim() || "UTC";

  if (!projectId) return { error: "Missing project." };
  if (!raw) return { error: "Choose how often this should run." };

  const cronExpression = PRESETS[raw.toLowerCase()] ?? raw;

  if (cronExpression.split(/\s+/).length !== 5) {
    return { error: "A cron expression needs five fields, e.g. 0 2 * * *." };
  }

  try {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) return { error: "That project no longer exists." };

    const id = `sch-${uuidv4().substring(0, 12)}`;

    try {
      await backupQueue.add(
        "scheduled-backup",
        { scheduleId: id, projectId },
        {
          repeat: { pattern: cronExpression, tz: timezone },
          jobId: `schedule-${id}`,
        }
      );
    } catch (queueError) {
      console.error("Queue rejected schedule:", queueError);
      return {
        error: `${cronExpression} isn't a schedule the runner accepts. Check the expression and timezone.`,
      };
    }

    await ScheduleRepository.createSchedule({
      id,
      projectId,
      cronExpression,
      timezone,
      isActive: true,
    });

    revalidatePath(`/dashboard/project/${projectId}/schedules`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { error: "Could not save the schedule. Try again in a moment." };
  }
}

export async function setScheduleActive(
  scheduleId: string,
  projectId: string,
  isActive: boolean
) {
  try {
    const schedule = await ScheduleRepository.getScheduleById(scheduleId);
    if (!schedule) return { error: "That schedule no longer exists." };

    // Keep the queue and the row in step — a row flipped to inactive while the
    // repeatable job still exists would keep firing backups invisibly.
    if (isActive) {
      await backupQueue.add(
        "scheduled-backup",
        { scheduleId, projectId },
        {
          repeat: { pattern: schedule.cronExpression, tz: schedule.timezone },
          jobId: `schedule-${scheduleId}`,
        }
      );
    } else {
      await removeRepeat(scheduleId, schedule.cronExpression, schedule.timezone);
    }

    await ScheduleRepository.updateSchedule(scheduleId, { isActive });

    revalidatePath(`/dashboard/project/${projectId}/schedules`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to change schedule state:", error);
    return { error: "Could not change the schedule." };
  }
}

export async function deleteSchedule(scheduleId: string, projectId: string) {
  try {
    const schedule = await ScheduleRepository.getScheduleById(scheduleId);
    if (schedule) {
      await removeRepeat(scheduleId, schedule.cronExpression, schedule.timezone);
    }

    await ScheduleRepository.deleteSchedule(scheduleId);

    revalidatePath(`/dashboard/project/${projectId}/schedules`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { error: "Could not delete the schedule." };
  }
}

/**
 * Same call shape the API routes use. A miss is logged, not thrown: if the
 * repeatable job was never registered, removing the row is still the right
 * outcome and failing here would strand it.
 */
async function removeRepeat(
  scheduleId: string,
  pattern: string,
  timezone: string
) {
  try {
    await backupQueue.removeRepeatable(
      "scheduled-backup",
      { pattern, tz: timezone },
      `schedule-${scheduleId}`
    );
  } catch (error) {
    console.warn("Could not remove repeatable job:", error);
  }
}
