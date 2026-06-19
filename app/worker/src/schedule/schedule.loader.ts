import { backupQueue } from "../backup/queue/backup.queue";

import { ScheduleRepository } from "db";

import { logger } from "shared/config/logger";



export async function loadSchedules() {

  try {

    logger.info("Loading active backup schedules into BullMQ...");

    
    // 1. Fetch all active schedules from DB
    const activeSchedules = await ScheduleRepository.getAllActiveSchedules();
    
    logger.info({ count: activeSchedules.length }, "Found active schedules to load");


    // 2. Clean up existing repeatable jobs on the queue first to avoid stale schedules
    const repeatableJobs = await backupQueue.getRepeatableJobs();
    
    for (const job of repeatableJobs) {
    
      if (job.name === "scheduled-backup") {
    
        logger.debug({ key: job.key }, "Removing old repeatable job");
    
        await backupQueue.removeRepeatableByKey(job.key);
    
      }
    
    }

    
    // 3. Add each active schedule as a repeatable job
    for (const schedule of activeSchedules) {
    
      logger.info(
    
        { scheduleId: schedule.id, cron: schedule.cronExpression, projectId: schedule.projectId },
    
        "Adding repeatable backup job"
    
      );

      await backupQueue.add(
    
        "scheduled-backup",
    
        { scheduleId: schedule.id, projectId: schedule.projectId },
    
        {
    
          repeat: { pattern: schedule.cronExpression, tz: schedule.timezone },
    
          jobId: `schedule-${schedule.id}`,
    
        }
    
      );
    
    }

    logger.info("Backup schedules successfully loaded");
  
  } catch (error) {
  
    logger.error({ error }, "Failed to load active backup schedules");
  
  }

}
