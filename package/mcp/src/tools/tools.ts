import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BacklifyClient } from "../client/backlify-client.js";

export function registerTools(server: McpServer, client: BacklifyClient) {
  // ── 1. create_backup ──
  server.tool(
    "create_backup",
    "Initiates an immediate on-demand database backup for a Backlify project (e.g. before schema migrations or code deployments).",
    {
      projectId: z
        .string()
        .optional()
        .describe(
          "Backlify project ID. If omitted, falls back to the BACKLIFY_PROJECT_ID environment variable."
        ),
      label: z
        .string()
        .optional()
        .describe(
          "Optional human-readable label or reason for the backup, e.g. 'pre-migration-v2'."
        ),
    },
    async ({ projectId, label }) => {
      try {
        const result = await client.createBackup(projectId, label);
        return {
          content: [
            {
              type: "text",
              text: `✅ Backup Job Enqueued Successfully!\n\n• Job ID: ${result.jobId}\n• Project ID: ${result.projectId}\n• Status: ${result.status}\n• Message: ${result.message || "Processing in background queue"}\n\nTo check the progress, use get_job_status with jobId: "${result.jobId}".`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ Failed to create backup: ${err?.message || err}`,
            },
          ],
        };
      }
    }
  );

  // ── 2. get_job_status ──
  server.tool(
    "get_job_status",
    "Checks the real-time execution status of an active or completed Backlify backup or restore job.",
    {
      jobId: z
        .string()
        .describe("The unique ID of the backup or restore job to inspect."),
    },
    async ({ jobId }) => {
      try {
        const status = await client.getJobStatus(jobId);
        return {
          content: [
            {
              type: "text",
              text: `📋 Job Status for [${jobId}]:\n\n${JSON.stringify(status, null, 2)}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ Could not retrieve status for job "${jobId}": ${err?.message || err}`,
            },
          ],
        };
      }
    }
  );

  // ── 3. list_backups ──
  server.tool(
    "list_backups",
    "Lists recent historical backups and snapshots for a project with timestamps, sizes, and checksums.",
    {
      projectId: z
        .string()
        .optional()
        .describe(
          "Backlify project ID. If omitted, uses the BACKLIFY_PROJECT_ID environment variable."
        ),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Maximum number of backup snapshots to return (default: 10)."),
    },
    async ({ projectId, limit }) => {
      try {
        const backups = await client.listBackups(projectId, limit);
        if (backups.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No backups found for project. You can run 'create_backup' to take your first snapshot.`,
              },
            ],
          };
        }

        const lines = backups.map((b, i) => {
          const sizeMb = b.fileSize
            ? `${(b.fileSize / (1024 * 1024)).toFixed(2)} MB`
            : "Unknown size";
          return `${i + 1}. [${b.id}] Status: ${b.status} | Size: ${sizeMb} | Created: ${b.createdAt}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `📦 Found ${backups.length} Backup Snapshots:\n\n${lines.join("\n")}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ Error listing backups: ${err?.message || err}`,
            },
          ],
        };
      }
    }
  );

  // ── 4. list_schedules ──
  server.tool(
    "list_schedules",
    "Lists automated cron backup schedules, next scheduled run times, and active statuses for a project.",
    {
      projectId: z
        .string()
        .optional()
        .describe(
          "Backlify project ID. If omitted, uses the BACKLIFY_PROJECT_ID environment variable."
        ),
    },
    async ({ projectId }) => {
      try {
        const schedules = await client.listSchedules(projectId);
        if (schedules.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No automated backup schedules configured for this project.",
              },
            ],
          };
        }

        const lines = schedules.map((s, i) => {
          return `${i + 1}. Schedule [${s.id}]:\n   • Cron: "${s.cronExpression}" (${s.timezone || "UTC"})\n   • Active: ${s.isActive ? "🟢 Enabled" : "⚪ Paused"}\n   • Last Run: ${s.lastRunAt || "Never"}\n   • Next Run: ${s.nextRunAt || "Pending computation"}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `⏰ Active Backup Schedules (${schedules.length}):\n\n${lines.join("\n\n")}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ Error fetching schedules: ${err?.message || err}`,
            },
          ],
        };
      }
    }
  );

  // ── 5. set_schedule_enabled ──
  server.tool(
    "set_schedule_enabled",
    "Pauses or enables an automated backup schedule (useful before maintenance windows).",
    {
      scheduleId: z
        .string()
        .describe("The unique ID of the backup schedule to toggle."),
      enabled: z
        .boolean()
        .describe("Set to true to activate the schedule, or false to pause it."),
    },
    async ({ scheduleId, enabled }) => {
      try {
        const result = await client.setScheduleEnabled(scheduleId, enabled);
        return {
          content: [
            {
              type: "text",
              text: `✅ Schedule [${result.scheduleId}] is now ${result.isActive ? "🟢 ENABLED" : "⚪ PAUSED"}.`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ Failed to update schedule: ${err?.message || err}`,
            },
          ],
        };
      }
    }
  );

  // ── 6. restore_backup ──
  server.tool(
    "restore_backup",
    "Triggers a database restore drill from a verified backup checkpoint. Requires explicit confirmation.",
    {
      backupFileId: z
        .string()
        .describe("The ID of the verified backup file or snapshot to restore from."),
      targetDatabaseUrl: z
        .string()
        .describe("The PostgreSQL connection URL of the destination database."),
      confirmDestructive: z
        .boolean()
        .describe(
          "Must be explicitly set to true. Confirms that you understand this will overwrite tables in the target database."
        ),
    },
    async ({ backupFileId, targetDatabaseUrl, confirmDestructive }) => {
      if (!confirmDestructive) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "⚠️ Restore aborted: confirmDestructive was false. You must explicitly confirm before restoring database contents.",
            },
          ],
        };
      }

      try {
        const result = await client.restoreBackup(
          backupFileId,
          targetDatabaseUrl,
          confirmDestructive
        );
        return {
          content: [
            {
              type: "text",
              text: `🚀 Restore Drill Enqueued!\n\n• Restore Job ID: ${result.restoreId}\n• Backup Snapshot: ${result.backupFileId}\n• Status: ${result.status}\n• Note: ${result.message || "Worker processing restore"}\n\nTrack progress with get_job_status using jobId: "${result.restoreId}".`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `❌ Restore failed to start: ${err?.message || err}`,
            },
          ],
        };
      }
    }
  );
}
