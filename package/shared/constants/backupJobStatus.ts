// Backup job status constants
export const BACKUP_JOB_STATUS = {

  PENDING: 'pending',

  QUEUED: 'queued',

  IN_PROGRESS: 'in_progress',

  COMPLETED: 'completed',

  FAILED: 'failed',

} as const;


export type BackupJobStatusType = typeof BACKUP_JOB_STATUS[keyof typeof BACKUP_JOB_STATUS];


// Array for Drizzle enum
export const BACKUP_JOB_STATUS_VALUES = [

  'pending',

  'queued',

  'in_progress',

  'completed',

  'failed',

] as const;