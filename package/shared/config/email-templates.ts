/**
 * Vercel-inspired Minimal Email Templates for Backlify
 * 
 * Design specifications:
 * - Ultra-clean light canvas (#ffffff) with 520px container
 * - Modern system font typography (-apple-system, BlinkMacSystemFont, 'Segoe UI')
 * - Tight letter spacing (-0.4px on headings)
 * - Monospace accents (SFMono-Regular, Consolas, Menlo)
 * - Subtle #eaeaea dividers and #f4f4f5 / #f6f8fa card containers
 * - Solid black #000000 high-contrast primary buttons
 * - Refined status badges (emerald for verified/success, rose for failure, violet for drill)
 */

export interface EmailWrapperOptions {
  preheader?: string;
  contentHtml: string;
  footerNote?: string;
  settingsUrl?: string;
}

export function wrapVercelEmailTemplate(opts: EmailWrapperOptions): string {
  const { preheader, contentHtml, footerNote, settingsUrl } = opts;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Backlify</title>
    <style type="text/css">
      body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #000000;
        -webkit-font-smoothing: antialiased;
      }
      table {
        border-collapse: separate;
      }
      a {
        color: #000000;
        text-decoration: underline;
      }
      @media only screen and (max-width: 480px) {
        .email-table {
          width: 100% !important;
          padding: 24px 16px !important;
          margin: 10px auto !important;
        }
        .header-logo {
          width: 36px !important;
          height: 36px !important;
        }
        .main-heading {
          font-size: 20px !important;
        }
        .cta-button {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          text-align: center !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
    ${preheader ? `<span style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</span>` : ""}
    <table class="email-table" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 40px auto; padding: 24px 28px; background-color: #ffffff;">
      <!-- Logo Header -->
      <tr>
        <td align="left" style="padding-bottom: 28px;">
          <a href="https://backlify.space" target="_blank" style="text-decoration: none; display: inline-block;">
            <img class="header-logo" src="https://backlify.space/backlify-logo-wrapped.png" width="40" height="40" alt="Backlify" style="display: block; border: 0; border-radius: 8px;" />
          </a>
        </td>
      </tr>

      <!-- Content Body -->
      <tr>
        <td align="left" style="padding-bottom: 24px;">
          ${contentHtml}
        </td>
      </tr>

      <!-- Divider & Footer -->
      <tr>
        <td style="border-top: 1px solid #eaeaea; padding-top: 24px;">
          <p style="font-size: 12px; color: #666666; line-height: 1.6; margin: 0 0 10px;">
            ${footerNote || "You received this email because you are registered on Backlify for automated database reliability."}
          </p>
          <p style="font-size: 12px; color: #999999; line-height: 1.6; margin: 0;">
            Backlify Inc. · <a href="${settingsUrl || "https://backlify.space"}" style="color: #666666; text-decoration: underline;">Notification Preferences</a> · <a href="https://backlify.space" style="color: #666666; text-decoration: underline;">https://backlify.space</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface IncidentEmailParams {
  projectName: string;
  environment: string;
  type: "backup" | "restore" | "drill";
  jobId: string;
  errorMessage: string;
  attemptsMade?: number;
  dashboardUrl: string;
  timestamp?: string;
}

/**
 * Builds a Vercel-style clean incident failure email
 */
export function buildIncidentAlertEmailHtml(params: IncidentEmailParams): string {
  const typeLabel = params.type === "drill" ? "Recovery Drill" : params.type === "restore" ? "Restore" : "Backup";
  const dateStr = params.timestamp || new Date().toUTCString();

  const contentHtml = `
    <!-- Status Badge -->
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background-color: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
        ● ${typeLabel.toUpperCase()} FAILED
      </span>
    </div>

    <!-- Heading -->
    <h1 class="main-heading" style="font-size: 22px; font-weight: 700; color: #000000; margin: 0 0 12px; letter-spacing: -0.4px; line-height: 1.3;">
      ${typeLabel} failed for ${params.projectName}
    </h1>

    <p style="font-size: 14px; color: #444444; margin: 0 0 24px; line-height: 1.6;">
      A scheduled ${params.type} operation encountered an error and could not complete.
    </p>

    <!-- Key-Value Metadata Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 20px; font-size: 13px; overflow: hidden; background-color: #fafafa;">
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Project</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #000000; text-align: right; border-bottom: 1px solid #eaeaea;">${params.projectName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Environment</td>
        <td style="padding: 10px 14px; text-align: right; border-bottom: 1px solid #eaeaea;">
          <span style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 11px; background-color: #ffffff; border: 1px solid #e5e5e5; padding: 2px 6px; border-radius: 4px; color: #333333; text-transform: uppercase;">
            ${params.environment}
          </span>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Job ID</td>
        <td style="padding: 10px 14px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12px; color: #444444; text-align: right; border-bottom: 1px solid #eaeaea;">
          ${params.jobId.slice(0, 16)}...
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #666666;">Timestamp</td>
        <td style="padding: 10px 14px; color: #444444; text-align: right; font-size: 12px;">${dateStr}</td>
      </tr>
    </table>

    <!-- Monospace Error Snippet Box -->
    <div style="margin-bottom: 28px;">
      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #777777; letter-spacing: 0.5px; margin-bottom: 8px;">
        Error Output
      </div>
      <div style="background-color: #0c0c0c; border: 1px solid #262626; border-radius: 6px; padding: 14px 16px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12px; color: #fca5a5; line-height: 1.5; word-break: break-all; white-space: pre-wrap;">
${params.errorMessage}
      </div>
    </div>

    <!-- CTA Button -->
    <div style="margin-bottom: 8px;">
      <a class="cta-button" href="${params.dashboardUrl}" target="_blank" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 6px; display: inline-block; letter-spacing: -0.2px;">
        View Failed Job in Backlify →
      </a>
    </div>
  `;

  return wrapVercelEmailTemplate({
    preheader: `[Alert] ${typeLabel} failed for ${params.projectName}: ${params.errorMessage.slice(0, 80)}`,
    contentHtml,
    footerNote: "This critical alert was sent because failure notifications are enabled for this project.",
    settingsUrl: params.dashboardUrl,
  });
}

export interface SuccessEmailParams {
  projectName: string;
  environment: string;
  jobId: string;
  sizeFormatted: string;
  durationFormatted: string;
  storageProvider?: string;
  dashboardUrl: string;
  timestamp?: string;
}

/**
 * Builds a Vercel-style clean backup completion email
 */
export function buildBackupSuccessEmailHtml(params: SuccessEmailParams): string {
  const dateStr = params.timestamp || new Date().toUTCString();

  const contentHtml = `
    <!-- Status Badge -->
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
        ● BACKUP COMPLETED
      </span>
    </div>

    <!-- Heading -->
    <h1 class="main-heading" style="font-size: 22px; font-weight: 700; color: #000000; margin: 0 0 12px; letter-spacing: -0.4px; line-height: 1.3;">
      Backup successful for ${params.projectName}
    </h1>

    <p style="font-size: 14px; color: #444444; margin: 0 0 24px; line-height: 1.6;">
      Your scheduled database snapshot has been successfully dumped, encrypted, and stored.
    </p>

    <!-- Metrics Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 28px; font-size: 13px; overflow: hidden; background-color: #fafafa;">
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Project</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #000000; text-align: right; border-bottom: 1px solid #eaeaea;">${params.projectName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Snapshot Size</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #000000; text-align: right; border-bottom: 1px solid #eaeaea;">${params.sizeFormatted}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Duration</td>
        <td style="padding: 10px 14px; color: #444444; text-align: right; border-bottom: 1px solid #eaeaea;">${params.durationFormatted}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Storage Vault</td>
        <td style="padding: 10px 14px; text-align: right; border-bottom: 1px solid #eaeaea;">
          <span style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 11px; background-color: #ffffff; border: 1px solid #e5e5e5; padding: 2px 6px; border-radius: 4px; color: #333333; text-transform: uppercase;">
            ${params.storageProvider || "Encrypted Vault"}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #666666;">Completed At</td>
        <td style="padding: 10px 14px; color: #444444; text-align: right; font-size: 12px;">${dateStr}</td>
      </tr>
    </table>

    <!-- CTA Button -->
    <div style="margin-bottom: 8px;">
      <a class="cta-button" href="${params.dashboardUrl}" target="_blank" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 6px; display: inline-block; letter-spacing: -0.2px;">
        View Snapshot in Backlify →
      </a>
    </div>
  `;

  return wrapVercelEmailTemplate({
    preheader: `Backup completed successfully for ${params.projectName} (${params.sizeFormatted})`,
    contentHtml,
    footerNote: "Automated snapshot confirmation from Backlify Database Reliability.",
    settingsUrl: params.dashboardUrl,
  });
}

export interface DrillVerifiedEmailParams {
  projectName: string;
  environment: string;
  jobId: string;
  durationFormatted: string;
  tableCount?: number;
  dashboardUrl: string;
  timestamp?: string;
}

/**
 * Builds a Vercel-style clean recovery drill verification email
 */
export function buildDrillVerifiedEmailHtml(params: DrillVerifiedEmailParams): string {
  const dateStr = params.timestamp || new Date().toUTCString();

  const contentHtml = `
    <!-- Status Badge -->
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background-color: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px;">
        ● DISASTER RECOVERY DRILL PASSED
      </span>
    </div>

    <!-- Heading -->
    <h1 class="main-heading" style="font-size: 22px; font-weight: 700; color: #000000; margin: 0 0 12px; letter-spacing: -0.4px; line-height: 1.3;">
      Restore verified for ${params.projectName}
    </h1>

    <p style="font-size: 14px; color: #444444; margin: 0 0 24px; line-height: 1.6;">
      An automated disaster recovery drill successfully restored your latest snapshot into an isolated sandbox and verified schema integrity.
    </p>

    <!-- Metrics Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 28px; font-size: 13px; overflow: hidden; background-color: #fafafa;">
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Project</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #000000; text-align: right; border-bottom: 1px solid #eaeaea;">${params.projectName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Restore Time</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #000000; text-align: right; border-bottom: 1px solid #eaeaea;">${params.durationFormatted}</td>
      </tr>
      ${params.tableCount !== undefined ? `
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Verified Tables</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #000000; text-align: right; border-bottom: 1px solid #eaeaea;">${params.tableCount} tables</td>
      </tr>
      ` : ""}
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 14px; color: #666666; border-bottom: 1px solid #eaeaea;">Data Integrity</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #15803d; text-align: right; border-bottom: 1px solid #eaeaea;">100% Validated</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #666666;">Drill Date</td>
        <td style="padding: 10px 14px; color: #444444; text-align: right; font-size: 12px;">${dateStr}</td>
      </tr>
    </table>

    <!-- CTA Button -->
    <div style="margin-bottom: 8px;">
      <a class="cta-button" href="${params.dashboardUrl}" target="_blank" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; border-radius: 6px; display: inline-block; letter-spacing: -0.2px;">
        View Drill Certificate →
      </a>
    </div>
  `;

  return wrapVercelEmailTemplate({
    preheader: `Recovery Drill passed for ${params.projectName} — restore verified in ${params.durationFormatted}`,
    contentHtml,
    footerNote: "Automated Disaster Recovery verification drill by Backlify.",
    settingsUrl: params.dashboardUrl,
  });
}
