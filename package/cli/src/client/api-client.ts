import { globalConfig } from "../config/global-config.js";
import { projectConfig } from "../config/project-config.js";

export interface ProjectSummary {
  id: string;
  name: string;
  engine: string;
  status: string;
  lastBackupAt?: string | null;
}

export interface BackupRecord {
  id: string;
  jobId: string;
  fileName?: string;
  fileSizeBytes?: number;
  status: string;
  checksum?: string;
  createdAt: string;
}

export class CliApiClient {
  private apiUrl: string;
  private apiKey?: string;

  constructor(options?: { apiUrl?: string; apiKey?: string }) {
    const creds = globalConfig.get();
    this.apiUrl = options?.apiUrl || creds.apiUrl || "http://localhost:3000";
    this.apiKey = options?.apiKey || creds.apiKey;
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

  public resolveProjectId(explicitProjectId?: string): string {
    if (explicitProjectId) return explicitProjectId;
    if (process.env.BACKLIFY_PROJECT_ID) return process.env.BACKLIFY_PROJECT_ID;
    const local = projectConfig.find();
    if (local?.config.projectId) return local.config.projectId;
    throw new Error(
      "No project linked. Run 'backlify link' or pass --project-id <id>."
    );
  }

  async verifyAuth(): Promise<{ email: string; orgs: Array<{ id: string; name: string }> }> {
    if (!this.apiKey) {
      throw new Error("Not logged in. Run 'backlify login' first.");
    }
    const res = await fetch(`${this.apiUrl}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Invalid or expired API token. Run 'backlify login' again.");
      }
      throw new Error(`Auth verification failed (${res.status} ${res.statusText})`);
    }
    return (await res.json()) as any;
  }

  async listProjects(orgId?: string): Promise<ProjectSummary[]> {
    const url = new URL(`${this.apiUrl}/api/projects`);
    if (orgId) url.searchParams.set("orgId", orgId);

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to list projects: ${res.statusText}`);
    }
    const data = (await res.json()) as any;
    return Array.isArray(data) ? data : data.projects || [];
  }

  async createBackup(projectId?: string, label?: string): Promise<{ jobId: string; status: string; message?: string }> {
    const targetProject = this.resolveProjectId(projectId);
    const res = await fetch(`${this.apiUrl}/api/backups`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        projectId: targetProject,
        label: label || `cli_${Date.now()}`,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Failed to create backup: ${err}`);
    }
    return (await res.json()) as any;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const res = await fetch(`${this.apiUrl}/api/jobs/${jobId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to get job status: ${res.statusText}`);
    }
    return await res.json();
  }

  async listBackups(projectId?: string, limit: number = 10): Promise<BackupRecord[]> {
    const targetProject = this.resolveProjectId(projectId);
    const url = new URL(`${this.apiUrl}/api/projects/${targetProject}/backups`);
    url.searchParams.set("limit", limit.toString());

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to list backups: ${res.statusText}`);
    }
    const data = (await res.json()) as any;
    return Array.isArray(data) ? data : data.backups || [];
  }

  async triggerRestore(options: {
    backupId: string;
    targetDatabaseUrl?: string;
    pointInTime?: string;
  }): Promise<{ restoreId: string; status: string; message?: string }> {
    const res = await fetch(`${this.apiUrl}/api/restores`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Failed to trigger restore: ${err}`);
    }
    return (await res.json()) as any;
  }

  async triggerDrill(projectId?: string, backupId?: string): Promise<any> {
    const targetProject = this.resolveProjectId(projectId);
    const res = await fetch(`${this.apiUrl}/api/dr-drills`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        projectId: targetProject,
        backupId,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Failed to trigger disaster recovery drill: ${err}`);
    }
    return await res.json();
  }
}
