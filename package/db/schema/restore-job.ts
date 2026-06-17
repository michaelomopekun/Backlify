import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

import { backupFiles } from './backup-file';

import { RESTORE_JOB_STATUS_VALUES } from 'shared/constants/restoreJobStatus';



export const restoreJobStatus = pgEnum('restore_job_status', RESTORE_JOB_STATUS_VALUES);

export const restoreJobs = pgTable('restore_jobs', {

  id: text('id').primaryKey(),

  backupFileId: text('backup_file_id')

    .notNull()
  
    .references(() => backupFiles.id),
  
  targetDatabaseUrl: text('target_database_url').notNull(),
  
  status: restoreJobStatus('status').notNull().default('pending'),
  
  startedAt: timestamp('started_at'),
  
  completedAt: timestamp('completed_at'),
  
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),

});
