import { db, eq } from "../../index";

import { backupSchedules } from "../../schema/backup-schedule";

import { logger } from "shared/config/logger";



export interface CreateScheduleParams {

  id: string;

  projectId: string;

  cronExpression: string;

  timezone?: string;

  isActive?: boolean;

}


export interface UpdateScheduleParams {

  cronExpression?: string;

  timezone?: string;

  isActive?: boolean;

  lastRunAt?: Date | null;

  nextRunAt?: Date | null;

}



export class ScheduleRepository {

  static async createSchedule(params: CreateScheduleParams) {

    try {

      logger.info({ scheduleId: params.id, projectId: params.projectId }, "Creating backup schedule");

      const result = await db.insert(backupSchedules).values({

        id: params.id,

        projectId: params.projectId,

        cronExpression: params.cronExpression,

        timezone: params.timezone || "UTC",

        isActive: params.isActive !== undefined ? params.isActive : true,

        createdAt: new Date(),

        updatedAt: new Date(),

      }).returning();


      logger.info({ scheduleId: params.id }, "Backup schedule created successfully");

      return result[0];

    } catch (error) {

      logger.error({ scheduleId: params.id, error }, "Failed to create backup schedule");

      throw error;

    }

  }


  static async getScheduleById(id: string) {

    try {

      logger.info({ scheduleId: id }, "Fetching backup schedule by ID");

      const result = await db.select().from(backupSchedules).where(eq(backupSchedules.id, id));

      if (!result || result.length === 0) {

        return null;

      }

      return result[0];

    } catch (error) {

      logger.error({ scheduleId: id, error }, "Failed to fetch backup schedule");

      throw error;

    }

  }


  static async getSchedulesByProjectId(projectId: string) {

    try {

      logger.info({ projectId }, "Fetching backup schedules for project");

      const result = await db.select().from(backupSchedules).where(eq(backupSchedules.projectId, projectId));

      return result;

    } catch (error) {

      logger.error({ projectId, error }, "Failed to fetch backup schedules for project");

      throw error;

    }

  }

  
  static async getAllActiveSchedules() {

    try {

      logger.info("Fetching all active backup schedules");

      const result = await db.select().from(backupSchedules).where(eq(backupSchedules.isActive, true));

      return result;

    } catch (error) {

      logger.error({ error }, "Failed to fetch active backup schedules");

      throw error;

    }

  }


  static async updateSchedule(id: string, params: UpdateScheduleParams) {

    try {

      logger.info({ scheduleId: id }, "Updating backup schedule");

      const result = await db.update(backupSchedules)

        .set({

          ...params,

          updatedAt: new Date(),

        })

        .where(eq(backupSchedules.id, id))

        .returning();

      
      logger.info({ scheduleId: id }, "Backup schedule updated successfully");
      
      return result[0];

    } catch (error) {

      logger.error({ scheduleId: id, error }, "Failed to update backup schedule");

      throw error;

    }

  }


  static async updateLastRunAt(id: string, timestamp: Date) {

    return this.updateSchedule(id, { lastRunAt: timestamp });

  }


  static async deleteSchedule(id: string) {

    try {

      logger.info({ scheduleId: id }, "Deleting backup schedule");

      const result = await db.delete(backupSchedules)

        .where(eq(backupSchedules.id, id))

        .returning();


      logger.info({ scheduleId: id }, "Backup schedule deleted successfully");
      
      return result[0];

    } catch (error) {

      logger.error({ scheduleId: id, error }, "Failed to delete backup schedule");

      throw error;

    }

  }

}
