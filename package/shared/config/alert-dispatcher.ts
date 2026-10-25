import { ProjectRepository, OrganizationRepository } from "db";
import { logger } from "./logger";
import {
  buildIncidentAlertEmailHtml,
  buildBackupSuccessEmailHtml,
  buildDrillVerifiedEmailHtml,
} from "./email-templates";
export { buildIncidentAlertEmailHtml, buildBackupSuccessEmailHtml, buildDrillVerifiedEmailHtml };


export interface IncidentAlertPayload {
  event: "backlify.backup_failed" | "backlify.restore_failed" | "backlify.drill_drift";
  timestamp: string;
  project: {
    id: string;
    name: string;
    environment: string;
  };
  incident: {
    jobId: string;
    type: "backup" | "restore" | "drill";
    error: string;
    attemptsMade?: number;
    severity: "CRITICAL" | "HIGH" | "WARNING";
    dashboardUrl: string;
    metadata?: Record<string, any>;
  };
}

export interface DispatchIncidentAlertOptions {
  jobId: string;
  projectId: string;
  type: "backup" | "restore" | "drill";
  errorMessage: string;
  attemptsMade?: number;
  metadata?: Record<string, any>;
}

export interface AlertDispatchResult {
  webhookDelivered: boolean;
  webhookStatusCode?: number;
  emailDelivered: boolean;
  recipientsCount?: number;
  error?: string;
}

/**
 * Formats webhook body based on target webhook service (Discord, Slack, or generic).
 */
function buildWebhookPayload(
  url: string,
  payload: IncidentAlertPayload
): { body: string; contentType: string } {
  // Discord Webhook
  if (url.includes("discord.com/api/webhooks") || url.includes("discordapp.com/api/webhooks")) {
    const typeLabel =
      payload.incident.type === "drill"
        ? "Recovery Drill"
        : payload.incident.type === "restore"
        ? "Restore Operation"
        : "Backup Snapshot";

    return {
      contentType: "application/json",
      body: JSON.stringify({
        username: "Backlify",
        avatar_url: "https://backlify.space/backlify-logo-wrapped.png",
        embeds: [
          {
            title: `🚨 ${typeLabel} Failed`,
            description: `A critical incident occurred for **${payload.project.name}** (${payload.project.environment}).`,
            color: 15548997, // #ed4245 (red)
            url: payload.incident.dashboardUrl,
            fields: [
              { name: "Project", value: payload.project.name, inline: true },
              { name: "Environment", value: payload.project.environment.toUpperCase(), inline: true },
              { name: "Job ID", value: `\`${payload.incident.jobId.slice(0, 16)}...\``, inline: true },
              {
                name: "Error",
                value: `\`\`\`${payload.incident.error.slice(0, 900)}\`\`\``,
                inline: false,
              },
            ],
            footer: { text: "Backlify Database Reliability · Automated Alert" },
            timestamp: payload.timestamp,
          },
        ],
      }),
    };
  }

  // Slack Webhook
  if (url.includes("hooks.slack.com/services") || url.includes("slack.com/api/chat.postMessage")) {
    const typeLabel =
      payload.incident.type === "drill"
        ? "Recovery Drill"
        : payload.incident.type === "restore"
        ? "Restore"
        : "Backup";

    return {
      contentType: "application/json",
      body: JSON.stringify({
        text: `🚨 Backlify Incident: ${typeLabel} failed for ${payload.project.name}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `🚨 ${typeLabel} Failed: ${payload.project.name}`,
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Environment:*\n\`${payload.project.environment.toUpperCase()}\``,
              },
              {
                type: "mrkdwn",
                text: `*Job ID:*\n\`${payload.incident.jobId.slice(0, 16)}...\``,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Error:*\n\`\`\`${payload.incident.error.slice(0, 800)}\`\`\``,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Failed Job in Backlify →",
                  emoji: true,
                },
                url: payload.incident.dashboardUrl,
                style: "danger",
              },
            ],
          },
        ],
      }),
    };
  }

  // Generic JSON Webhook
  return {
    contentType: "application/json",
    body: JSON.stringify(payload),
  };
}

/**
 * Dispatches automated failure and incident alerts across Webhook and Resend Email channels.
 */
export async function dispatchIncidentAlert(
  opts: DispatchIncidentAlertOptions
): Promise<AlertDispatchResult> {
  const result: AlertDispatchResult = {
    webhookDelivered: false,
    emailDelivered: false,
  };

  try {
    const project = await ProjectRepository.getProjectById(opts.projectId);
    if (!project) {
      logger.warn({ projectId: opts.projectId }, "Cannot dispatch alert: project not found");
      return result;
    }

    // Check notification policy
    const isDrill = opts.type === "drill";
    if (isDrill && project.notifyOnDrill === false) {
      logger.info({ projectId: project.id }, "Drill drift alert skipped by project policy");
      return result;
    }

    if (!isDrill && project.notifyOnFailure === false) {
      logger.info({ projectId: project.id }, "Failure alert skipped by project policy");
      return result;
    }

    const appUrl = process.env.APP_URL || "https://backlify.space";
    const dashboardUrl = `${appUrl}/dashboard/project/${project.id}/${
      opts.type === "restore" || opts.type === "drill" ? "restores" : "backups"
    }`;

    const eventName = isDrill
      ? "backlify.drill_drift"
      : opts.type === "restore"
      ? "backlify.restore_failed"
      : "backlify.backup_failed";

    const payload: IncidentAlertPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        environment: project.environment || "production",
      },
      incident: {
        jobId: opts.jobId,
        type: opts.type,
        error: opts.errorMessage,
        attemptsMade: opts.attemptsMade,
        severity: "CRITICAL",
        dashboardUrl,
        metadata: opts.metadata,
      },
    };

    // ─── 1. Dispatch Webhook (Generic, Discord, or Slack) ───
    if (
      project.webhookUrl &&
      (project.webhookUrl.startsWith("http://") || project.webhookUrl.startsWith("https://"))
    ) {
      try {
        const start = Date.now();
        const formatted = buildWebhookPayload(project.webhookUrl, payload);

        const res = await fetch(project.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": formatted.contentType,
            "User-Agent": "Backlify-Alert-Dispatcher/1.0",
          },
          body: formatted.body,
          signal: AbortSignal.timeout(5000),
        });

        const durationMs = Date.now() - start;
        result.webhookStatusCode = res.status;
        result.webhookDelivered = res.ok;

        logger.info(
          {
            projectId: project.id,
            webhookUrl: project.webhookUrl,
            status: res.status,
            durationMs,
          },
          "Incident webhook dispatched"
        );
      } catch (webhookErr) {
        logger.error(
          { projectId: project.id, error: webhookErr },
          "Failed to deliver incident webhook"
        );
      }
    }

    // ─── 2. Dispatch Email via Resend with Vercel Layout ───
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        // Collect recipient emails from organization members
        let recipients: string[] = [];
        if (project.orgId) {
          const members = await OrganizationRepository.getOrganizationMembers(project.orgId);
          recipients = members
            .filter((m) => m.role === "owner" || m.role === "admin")
            .map((m) => m.email)
            .filter(Boolean);
        }

        if (recipients.length === 0) {
          recipients = ["alerts@backlify.dev"];
        }

        result.recipientsCount = recipients.length;

        const typeLabel = opts.type === "drill" ? "Recovery Drill" : opts.type === "restore" ? "Restore" : "Backup";
        const subject = `🚨 [ALERT] ${typeLabel} Failed — ${project.name} (${project.environment})`;

        const html = buildIncidentAlertEmailHtml({
          projectName: project.name,
          environment: project.environment || "production",
          type: opts.type,
          jobId: opts.jobId,
          errorMessage: opts.errorMessage,
          attemptsMade: opts.attemptsMade,
          dashboardUrl,
        });

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "Backlify Incident Alerts <alerts@mail.backlify.space>",
            to: recipients,
            subject,
            html,
          }),
          signal: AbortSignal.timeout(6000),
        });

        const emailData = (await emailRes.json()) as any;
        result.emailDelivered = emailRes.ok;

        logger.info(
          {
            projectId: project.id,
            recipients,
            ok: emailRes.ok,
            resendId: emailData?.id,
          },
          "Incident alert email dispatched via Resend (Vercel layout)"
        );
      } catch (emailErr) {
        logger.error(
          { projectId: project.id, error: emailErr },
          "Failed to dispatch incident email via Resend"
        );
      }
    } else {
      logger.warn("RESEND_API_KEY is not configured; skipping email dispatch");
    }

    return result;
  } catch (err) {
    logger.error({ error: err, jobId: opts.jobId }, "Error in dispatchIncidentAlert");
    result.error = err instanceof Error ? err.message : String(err);
    return result;
  }
}

export interface DispatchSuccessAlertOptions {
  jobId: string;
  projectId: string;
  fileSize: number;
  durationSeconds: number;
  storageProvider?: string;
}

/**
 * Dispatches notification when a backup snapshot completes successfully.
 */
export async function dispatchBackupSuccessAlert(
  opts: DispatchSuccessAlertOptions
): Promise<AlertDispatchResult> {
  const result: AlertDispatchResult = {
    webhookDelivered: false,
    emailDelivered: false,
  };

  try {
    const project = await ProjectRepository.getProjectById(opts.projectId);
    if (!project) return result;

    const appUrl = process.env.APP_URL || "https://backlify.space";
    const dashboardUrl = `${appUrl}/dashboard/project/${project.id}/backups`;

    // Format size
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const sizeFormatted = formatBytes(opts.fileSize);
    const durationFormatted = `${opts.durationSeconds}s`;

    // Webhook dispatch
    if (project.webhookUrl) {
      try {
        const isDiscord =
          project.webhookUrl.includes("discord.com/api/webhooks") ||
          project.webhookUrl.includes("discordapp.com/api/webhooks");

        let bodyPayload: string;
        if (isDiscord) {
          bodyPayload = JSON.stringify({
            username: "Backlify",
            avatar_url: "https://backlify.space/backlify-logo-wrapped.png",
            embeds: [
              {
                title: "✅ Backup Snapshot Completed",
                description: `Successfully dumped and stored backup for **${project.name}**.`,
                color: 5763719, // #57F287 (green)
                url: dashboardUrl,
                fields: [
                  { name: "Snapshot Size", value: sizeFormatted, inline: true },
                  { name: "Duration", value: durationFormatted, inline: true },
                  { name: "Vault", value: (opts.storageProvider || "Encrypted Vault").toUpperCase(), inline: true },
                ],
                footer: { text: "Backlify Database Reliability" },
                timestamp: new Date().toISOString(),
              },
            ],
          });
        } else {
          bodyPayload = JSON.stringify({
            event: "backlify.backup_succeeded",
            timestamp: new Date().toISOString(),
            project: { id: project.id, name: project.name, environment: project.environment },
            backup: { jobId: opts.jobId, size: opts.fileSize, durationSeconds: opts.durationSeconds },
          });
        }

        await fetch(project.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: bodyPayload,
          signal: AbortSignal.timeout(5000),
        });
        result.webhookDelivered = true;
      } catch (err) {
        logger.warn({ error: err }, "Failed to send backup success webhook");
      }
    }

    return result;
  } catch (err) {
    logger.error({ error: err }, "Error in dispatchBackupSuccessAlert");
    return result;
  }
}

export interface DispatchDrillSuccessAlertOptions {
  jobId: string;
  projectId: string;
  durationMs: number;
  tableCount?: number;
}

/**
 * Dispatches notification when an automated disaster recovery drill passes (Pro feature).
 */
export async function dispatchDrillSuccessAlert(
  opts: DispatchDrillSuccessAlertOptions
): Promise<AlertDispatchResult> {
  const result: AlertDispatchResult = {
    webhookDelivered: false,
    emailDelivered: false,
  };

  try {
    const project = await ProjectRepository.getProjectById(opts.projectId);
    if (!project) return result;

    if (project.notifyOnDrill === false) {
      return result;
    }

    const appUrl = process.env.APP_URL || "https://backlify.space";
    const dashboardUrl = `${appUrl}/dashboard/project/${project.id}/restores`;
    const durationFormatted = `${(opts.durationMs / 1000).toFixed(1)}s`;

    // 1. Webhook (Discord or generic)
    if (project.webhookUrl) {
      try {
        const isDiscord =
          project.webhookUrl.includes("discord.com/api/webhooks") ||
          project.webhookUrl.includes("discordapp.com/api/webhooks");

        let bodyPayload: string;
        if (isDiscord) {
          bodyPayload = JSON.stringify({
            username: "Backlify",
            avatar_url: "https://backlify.space/backlify-logo-wrapped.png",
            embeds: [
              {
                title: "🛡️ Disaster Recovery Drill Passed",
                description: `Archive integrity & schema verification validated for **${project.name}**. Zero bit-rot detected. Safe to restore.`,
                color: 7419530, // #7122ea (violet)
                url: dashboardUrl,
                fields: [
                  { name: "Verification Time", value: durationFormatted, inline: true },
                  { name: "Schema Tables", value: opts.tableCount !== undefined ? `${opts.tableCount} tables` : "Verified", inline: true },
                  { name: "Status", value: "100% Disaster-Ready", inline: true },
                ],
                footer: { text: "Backlify Pro · Automated Recovery Engine" },
                timestamp: new Date().toISOString(),
              },
            ],
          });
        } else {
          bodyPayload = JSON.stringify({
            event: "backlify.drill_passed",
            timestamp: new Date().toISOString(),
            project: { id: project.id, name: project.name, environment: project.environment },
            drill: { jobId: opts.jobId, durationMs: opts.durationMs, tableCount: opts.tableCount },
          });
        }

        await fetch(project.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: bodyPayload,
          signal: AbortSignal.timeout(5000),
        });
        result.webhookDelivered = true;
      } catch (err) {
        logger.warn({ error: err }, "Failed to send drill success webhook");
      }
    }

    // 2. Email via Resend with Vercel minimal layout
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        let recipients: string[] = [];
        if (project.orgId) {
          const members = await OrganizationRepository.getOrganizationMembers(project.orgId);
          recipients = members
            .filter((m) => m.role === "owner" || m.role === "admin")
            .map((m) => m.email)
            .filter(Boolean);
        }

        if (recipients.length > 0) {
          const html = buildDrillVerifiedEmailHtml({
            projectName: project.name,
            environment: project.environment || "production",
            jobId: opts.jobId,
            durationFormatted,
            tableCount: opts.tableCount,
            dashboardUrl,
          });

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "Backlify Drill Verification <alerts@mail.backlify.space>",
              to: recipients,
              subject: `🛡️ [VERIFIED] Recovery Drill Passed — ${project.name} (${project.environment})`,
              html,
            }),
            signal: AbortSignal.timeout(6000),
          });
          result.emailDelivered = true;
        }
      } catch (emailErr) {
        logger.warn({ error: emailErr }, "Failed to send drill success email");
      }
    }

    return result;
  } catch (err) {
    logger.error({ error: err }, "Error in dispatchDrillSuccessAlert");
    return result;
  }
}

