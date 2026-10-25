import dotenv from "dotenv";
dotenv.config();

export interface BacklifyClientConfig {
  baseUrl?: string;
  apiKey?: string;
  projectId?: string;
}

export interface BackupJobResult {
  jobId: string;
  status: string;
  projectId: string;
  databaseUrl?: string;
  message?: string;
  createdAt?: string;
}

export interface BackupItem {
  id: string;
  jobId: string;
  fileName?: string;
  fileSize?: number;
  status?: string;
  checksum?: string;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  projectId: string;
  cronExpression: string;
  timezone?: string;
  isActive: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
}

export interface RestoreJobResult {
  restoreId: string;
  status: string;
  backupFileId: string;
  targetDatabaseUrl?: string;
  message?: string;
}

export class BacklifyClient {
  private baseUrl: string;
  private apiKey: string | null;
  private defaultProjectId: string | null;

  constructor(config?: BacklifyClientConfig) {
    this.baseUrl =
      config?.baseUrl ||
      process.env.BACKLIFY_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";
    this.apiKey = config?.apiKey || process.env.BACKLIFY_API_KEY || null;
    this.defaultProjectId =
      config?.projectId || process.env.BACKLIFY_PROJECT_ID || null;
  }

  public resolveProjectId(projectId?: string): string {
    const id = projectId || this.defaultProjectId;
    if (!id) {
      throw new Error(
        "projectId was not provided and BACKLIFY_PROJECT_ID environment variable is not set."
      );
    }
    return id;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["x-api-key"] = this.apiKey;
    }
    return headers;
  }

  /**
   * Triggers an immediate on-demand backup for a project.
   */
  async createBackup(
    projectId?: string,
    label?: string
  ): Promise<BackupJobResult> {
    const targetProject = this.resolveProjectId(projectId);

    // If API mode
    try {
      const response = await fetch(`${this.baseUrl}/api/backups`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          projectId: targetProject,
          label: label || `mcp-trigger-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        return {
          jobId: data.jobId || data.id,
          status: data.status || "pending",
          projectId: targetProject,
          message: data.message || "Backup job enqueued successfully.",
          createdAt: new Date().toISOString(),
        };
      }

      const errText = await response.text();
      // If server returned an error, check if direct DB mode fallback is available
      if (!process.env.DATABASE_URL) {
        throw new Error(
          `Failed to trigger backup via API (${response.status}): ${errText}`
        );
      }
    } catch (err: any) {
      if (!process.env.DATABASE_URL) {
        throw new Error(`Backlify API connection error: ${err?.message || err}`);
      }
    }

    // Direct DB / Queue Fallback
    try {
      const { BackupRepository, ProjectRepository } = await import("db");
      const project = await ProjectRepository.getProjectById(targetProject);
      if (!project) {
        throw new Error(`Project with ID '${targetProject}' not found in database.`);
      }

      const jobId = `backlify-mcp-backupJob-${Date.now().toString(36)}`;
      await BackupRepository.saveBackupJob({
        jobId,
        databaseUrl: project.databaseUrl,
        projectId: targetProject,
        jobStatus: "pending",
        triggerType: "manual",
      });

      return {
        jobId,
        status: "pending",
        projectId: targetProject,
        message: "Backup job created directly in database.",
        createdAt: new Date().toISOString(),
      };
    } catch (dbErr: any) {
      throw new Error(
        `Failed to create backup (Direct DB mode): ${dbErr?.message || dbErr}`
      );
    }
  }

  /**
   * Retrieves the live execution status of a backup or restore job.
   */
  async getJobStatus(jobId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/jobs/${jobId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {}

    // Direct DB Fallback
    if (process.env.DATABASE_URL) {
      const { BackupRepository } = await import("db");
      const job = await BackupRepository.getJobById(jobId);
      if (job) return job;
    }

    throw new Error(`Job '${jobId}' not found or unreachable.`);
  }

  /**
   * Lists historical backups for a project.
   */
  async listBackups(projectId?: string, limit: number = 10): Promise<BackupItem[]> {
    const targetProject = this.resolveProjectId(projectId);

    try {
      const response = await fetch(
        `${this.baseUrl}/api/backups?projectId=${encodeURIComponent(targetProject)}&limit=${limit}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as any;
        const list = Array.isArray(data) ? data : data.backups || data.jobs || [];
        return list.map((item: any) => ({
          id: item.id || item.backupFileId || item.jobId,
          jobId: item.backupJobId || item.jobId || item.id,
          fileName: item.fileName || item.storageKey,
          fileSize: item.fileSize || item.sizeBytes,
          status: item.status || "completed",
          checksum: item.checksum,
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }
    } catch {}

    // Direct DB Fallback
    if (process.env.DATABASE_URL) {
      const { BackupRepository } = await import("db");
      const jobs = await BackupRepository.listBackups({
        projectId: targetProject,
        limit,
      });
      return (jobs || []).map((j: any) => ({
        id: j.id,
        jobId: j.id,
        fileName: j.fileName || undefined,
        fileSize: j.fileSize || undefined,
        status: j.status,
        checksum: j.checksum || undefined,
        createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    return [];
  }

  /**
   * Lists backup cron schedules for a project.
   */
  async listSchedules(projectId?: string): Promise<ScheduleItem[]> {
    const targetProject = this.resolveProjectId(projectId);

    try {
      const response = await fetch(
        `${this.baseUrl}/api/schedules?projectId=${encodeURIComponent(targetProject)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as any;
        const list = Array.isArray(data) ? data : data.schedules || [];
        return list.map((s: any) => ({
          id: s.id,
          projectId: s.projectId,
          cronExpression: s.cronExpression,
          timezone: s.timezone || "UTC",
          isActive: Boolean(s.isActive),
          lastRunAt: s.lastRunAt,
          nextRunAt: s.nextRunAt,
        }));
      }
    } catch {}

    // Direct DB Fallback
    if (process.env.DATABASE_URL) {
      const { ScheduleRepository } = await import("db");
      const schedules = await ScheduleRepository.getSchedulesByProjectId(targetProject);
      return (schedules || []).map((s: any) => ({
        id: s.id,
        projectId: s.projectId,
        cronExpression: s.cronExpression,
        timezone: s.timezone || "UTC",
        isActive: Boolean(s.isActive),
        lastRunAt: s.lastRunAt ? new Date(s.lastRunAt).toISOString() : null,
        nextRunAt: s.nextRunAt ? new Date(s.nextRunAt).toISOString() : null,
      }));
    }

    return [];
  }

  /**
   * Pauses or enables an automated backup schedule.
   */
  async setScheduleEnabled(
    scheduleId: string,
    enabled: boolean
  ): Promise<{ scheduleId: string; isActive: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ isActive: enabled }),
      });

      if (response.ok) {
        return { scheduleId, isActive: enabled };
      }
    } catch {}

    // Direct DB Fallback
    if (process.env.DATABASE_URL) {
      const { ScheduleRepository } = await import("db");
      await ScheduleRepository.updateSchedule(scheduleId, { isActive: enabled });
      return { scheduleId, isActive: enabled };
    }

    throw new Error(`Failed to update schedule '${scheduleId}'.`);
  }

  /**
   * Initiates a database restore from a verified backup file.
   */
  async restoreBackup(
    backupFileId: string,
    targetDatabaseUrl: string,
    confirmDestructive: boolean
  ): Promise<RestoreJobResult> {
    if (!confirmDestructive) {
      throw new Error(
        "Destructive action aborted: confirmDestructive must be explicitly set to true to restore a database."
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/restores`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          backupFileId,
          targetDatabaseUrl,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        return {
          restoreId: data.restoreId || data.id,
          status: data.status || "pending",
          backupFileId,
          targetDatabaseUrl,
          message: data.message || "Restore job enqueued successfully.",
        };
      }

      const errText = await response.text();
      throw new Error(`API restore trigger failed: ${errText}`);
    } catch (err: any) {
      if (!process.env.DATABASE_URL) {
        throw err;
      }
    }

    // Direct DB Fallback
    const { RestoreRepository } = await import("db");
    const restoreId = `backlify-mcp-restoreJob-${Date.now().toString(36)}`;
    await RestoreRepository.saveRestoreJob({
      jobId: restoreId,
      backupFileId,
      targetDatabaseUrl,
      jobStatus: "pending",
    });

    return {
      restoreId,
      status: "pending",
      backupFileId,
      targetDatabaseUrl,
      message: "Restore job created directly in database.",
    };
  }
}
