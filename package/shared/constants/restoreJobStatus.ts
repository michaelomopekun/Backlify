export const RESTORE_JOB_STATUS = {

    PENDING: 'pending',

    QUEUED: 'queued',

    IN_PROGRESS: 'in_progress',

    COMPLETED: 'completed',

    FAILED: 'failed',

} as const;


export type RestoreJobStatusType = typeof RESTORE_JOB_STATUS[keyof typeof RESTORE_JOB_STATUS];


export const RESTORE_JOB_STATUS_VALUES = [

    'pending',

    'queued',

    'in_progress',

    'completed',

    'failed',

] as const;
