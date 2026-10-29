import pc from "picocolors";
import { CliApiClient } from "../client/api-client.js";
import { logger } from "../ui/logger.js";

const PRESET_MAP: Record<string, { cron: string; label: string }> = {
  hourly: { cron: "0 * * * *", label: "Hourly (at minute 0)" },
  daily: { cron: "0 0 * * *", label: "Daily at midnight UTC" },
  weekly: { cron: "0 0 * * 0", label: "Weekly (Sundays at midnight UTC)" },
};

export async function scheduleCommand(options: {
  every?: string;
  cron?: string;
  tz?: string;
  disable?: boolean;
  projectId?: string;
}) {
  logger.banner();

  const client = new CliApiClient();
  let projectId: string;
  try {
    projectId = client.resolveProjectId(options.projectId);
  } catch (err: any) {
    logger.error(err.message);
    process.exit(1);
  }

  // ── Action 1: Disable Schedule ──
  if (options.disable) {
    logger.info(`Disabling automated backup schedule for project ${pc.cyan(projectId)}...`);
    try {
      await client.disableSchedule(projectId);
      logger.success("Automated backup schedule has been disabled.");
      console.log(pc.dim("Run 'backlify schedule --every daily' to re-enable anytime.\n"));
      return;
    } catch (err: any) {
      logger.error(`Failed to disable schedule: ${err.message}`);
      process.exit(1);
    }
  }

  // ── Action 2: Set New Schedule ──
  let targetCron = options.cron;
  let scheduleLabel = options.cron;

  if (options.every) {
    const key = options.every.toLowerCase().trim();
    const preset = PRESET_MAP[key];
    if (!preset) {
      logger.error(
        `Invalid preset '${options.every}'. Supported presets: hourly, daily, weekly.`
      );
      console.log(pc.dim("Example: backlify schedule --every daily\n"));
      process.exit(1);
    }
    targetCron = preset.cron;
    scheduleLabel = preset.label;
  }

  if (targetCron) {
    const tz = options.tz || "UTC";
    logger.info(`Configuring automated backup schedule for project ${pc.cyan(projectId)}...`);

    try {
      const schedule = await client.setSchedule({
        projectId,
        cronExpression: targetCron,
        timezone: tz,
      });

      logger.success("Backup schedule updated!");
      logger.box("Automated Backup Schedule", [
        `Project ID:  ${pc.bold(pc.cyan(projectId))}`,
        `Cadence:     ${pc.green(scheduleLabel || schedule.cronExpression)}`,
        `Cron Syntax: ${pc.dim(schedule.cronExpression)}`,
        `Timezone:    ${pc.dim(schedule.timezone || tz)}`,
        `Status:      ${pc.green("ACTIVE")}`,
        ``,
        `Trigger manual backup anytime: ${pc.bold("backlify backup")}`,
      ]);
      return;
    } catch (err: any) {
      logger.error(`Failed to configure schedule: ${err.message}`);
      process.exit(1);
    }
  }

  // ── Action 3: Inspect Existing Schedule ──
  logger.info(`Checking backup schedule for project ${pc.cyan(projectId)}...`);

  try {
    const existing = await client.getSchedule(projectId);

    if (existing && existing.isActive) {
      let label = existing.cronExpression;
      for (const p of Object.values(PRESET_MAP)) {
        if (p.cron === existing.cronExpression) {
          label = p.label;
          break;
        }
      }

      logger.box("Active Backup Schedule", [
        `Project ID:  ${pc.bold(pc.cyan(projectId))}`,
        `Frequency:   ${pc.green(label)}`,
        `Cron Syntax: ${pc.dim(existing.cronExpression)}`,
        `Timezone:    ${pc.dim(existing.timezone || "UTC")}`,
        `Status:      ${pc.green("ACTIVE & ENQUEUED")}`,
      ]);
    } else {
      logger.info("No active backup schedule configured for this project.");
      console.log(
        pc.dim("\nTo configure an automated schedule, run:\n") +
          `  ${pc.bold("backlify schedule --every daily")}\n` +
          `  ${pc.bold("backlify schedule --every hourly")}\n` +
          `  ${pc.bold("backlify schedule --cron \"0 2 * * *\"")}\n`
      );
    }
  } catch (err: any) {
    logger.error(`Failed to fetch schedule: ${err.message}`);
    process.exit(1);
  }
}
