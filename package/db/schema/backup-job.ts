import { pgTable, text, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core';

export const backupJobStatus = pgEnum('backup_job_status', [
  'pending',
  'in_progress',
  'completed',
  'failed',
]);

export const backupJobs = pgTable('backup_jobs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  databaseUrl: text('database_url').notNull(),
  status: backupJobStatus('status').notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
