import { ProjectRepository, OrganizationRepository } from "db";
import { logger } from "./logger";

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

    const appUrl = process.env.APP_URL || "http://localhost:3000";
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

    // ─── 1. Dispatch Webhook ───
    if (project.webhookUrl && (project.webhookUrl.startsWith("http://") || project.webhookUrl.startsWith("https://"))) {
      try {
        const start = Date.now();
        const res = await fetch(project.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Backlify-Alert-Dispatcher/1.0",
          },
          body: JSON.stringify(payload),
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

    // ─── 2. Dispatch Email via Resend ───
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

        const subject = `🚨 [ALERT] ${opts.type.toUpperCase()} Failed — ${project.name} (${project.environment})`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0c; color: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #222;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Backlify Incident Alert</h2>
            </div>
            
            <div style="background-color: #1a0808; border: 1px solid #4a1515; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <div style="color: #f87171; font-weight: 600; font-size: 14px; margin-bottom: 6px;">
                ${opts.type.toUpperCase()} EXECUTION FAILURE
              </div>
              <div style="color: #fca5a5; font-size: 13px; font-family: monospace; word-break: break-all;">
                ${opts.errorMessage}
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <tr style="border-bottom: 1px solid #1f1f1f;">
                <td style="padding: 8px 0; color: #888;">Project</td>
                <td style="padding: 8px 0; font-weight: 500; text-align: right; color: #fff;">${project.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1f1f1f;">
                <td style="padding: 8px 0; color: #888;">Environment</td>
                <td style="padding: 8px 0; font-weight: 500; text-align: right; color: #fff; text-transform: uppercase;">${project.environment}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1f1f1f;">
                <td style="padding: 8px 0; color: #888;">Job ID</td>
                <td style="padding: 8px 0; font-family: monospace; text-align: right; color: #fff;">${opts.jobId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Timestamp</td>
                <td style="padding: 8px 0; text-align: right; color: #fff;">${new Date().toUTCString()}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${dashboardUrl}" style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 6px; display: inline-block;">
                View Failure in Dashboard →
              </a>
            </div>

            <div style="margin-top: 32px; font-size: 11px; color: #555; text-align: center; border-top: 1px solid #1c1c1c; padding-top: 16px;">
              Automated alert sent by Backlify Disaster Recovery Engine. Manage notification settings in Project Settings.
            </div>
          </div>
        `;

        // Send via Resend REST endpoint
        // For testing/sandbox with unverified domains, Resend allows sending to the account email or onboarding@resend.dev
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Backlify Incident Alerts <onboarding@resend.dev>",
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
          "Incident alert email dispatched via Resend"
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
