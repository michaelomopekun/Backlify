import { pgTable, text, timestamp, boolean, varchar, index } from 'drizzle-orm/pg-core';

import { projects } from './project';



export const backupSchedules = pgTable('backup_schedules', {

  id: text('id').primaryKey(),

  projectId: text('project_id')

    .notNull()

    .references(() => projects.id, { onDelete: 'cascade' }),

  cronExpression: text('cron_expression').notNull(),

  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),

  isActive: boolean('is_active').notNull().default(true),

  lastRunAt: timestamp('last_run_at'),

  nextRunAt: timestamp('next_run_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

}, (table) => ({
  projectIdActiveIdx: index('idx_backup_schedules_project_active').on(table.projectId, table.isActive),
}));
