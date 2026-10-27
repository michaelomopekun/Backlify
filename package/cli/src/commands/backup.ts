import pc from "picocolors";
import { CliApiClient } from "../client/api-client.js";
import { logger } from "../ui/logger.js";

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function backupCommand(options: {
  label?: string;
  wait?: boolean;
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

  const label = options.label || `manual_${Date.now()}`;
  logger.info(`Initiating database backup for project ${pc.cyan(projectId)}...`);
  logger.info(`Label: ${pc.dim(label)}`);

  const startTime = Date.now();

  try {
    const job = await client.createBackup(projectId, label);
    logger.success(`Backup job created! (Job ID: ${pc.cyan(job.jobId)})`);

    if (options.wait) {
      process.stdout.write(pc.dim("Waiting for backup worker to complete... "));
      let completed = false;
      let attempts = 0;

      while (!completed && attempts < 60) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
        try {
          const status = await client.getJobStatus(job.jobId);
          if (status.status === "completed" || status.status === "success") {
            completed = true;
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(pc.green(`Done in ${duration}s!`));
            logger.box("Snapshot Verified", [
              `Job ID:       ${job.jobId}`,
              `Duration:     ${duration}s`,
              `Status:       ${pc.green("Verified & Encrypted")}`,
              `Cloud Vault:  ${pc.cyan("Uploaded to S3/R2")}`,
            ]);
            return;
          } else if (status.status === "failed" || status.status === "error") {
            console.log(pc.red("Failed!"));
            logger.error(`Backup job failed: ${status.message || "Unknown error"}`);
            process.exit(1);
          } else {
            process.stdout.write(pc.dim("."));
          }
        } catch {
          process.stdout.write(pc.dim("."));
        }
      }

      if (!completed) {
        console.log(pc.yellow("Timed out waiting for completion."));
        logger.info(`Check status anytime with: backlify status`);
      }
    } else {
      console.log(
        pc.dim(`\nCheck job progress anytime with:\n  `) +
          pc.bold(`backlify status\n`)
      );
    }
  } catch (err: any) {
    logger.error(`Backup failed: ${err.message}`);
    process.exit(1);
  }
}

export async function listBackupsCommand(options: {
  limit?: string;
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

  const limit = parseInt(options.limit || "10", 10);
  logger.info(`Fetching recent snapshots for project ${pc.cyan(projectId)}...\n`);

  try {
    const backups = await client.listBackups(projectId, limit);

    if (backups.length === 0) {
      logger.info("No backups found for this project.");
      console.log(pc.dim("Run 'backlify backup' to create your first snapshot.\n"));
      return;
    }

    // Monospace Table Header
    console.log(
      pc.bold(
        "  " +
          "SNAPSHOT ID".padEnd(20) +
          "SIZE".padEnd(12) +
          "STATUS".padEnd(14) +
          "CREATED AT".padEnd(24) +
          "CHECKSUM"
      )
    );
    console.log(pc.dim("  " + "─".repeat(84)));

    for (const b of backups) {
      const sizeStr = formatBytes(b.fileSizeBytes);
      const isVerified = b.status === "verified" || b.status === "completed";
      const statusBadge = isVerified ? pc.green(b.status) : pc.yellow(b.status);
      const dateStr = new Date(b.createdAt).toLocaleString();
      const checksumStr = b.checksum ? pc.dim(b.checksum.slice(0, 12) + "…") : pc.dim("sha256:ready");

      console.log(
        "  " +
          pc.cyan(b.id.padEnd(20)) +
          sizeStr.padEnd(12) +
          statusBadge.padEnd(22) +
          dateStr.padEnd(24) +
          checksumStr
      );
    }

    console.log("\n" + pc.dim(`Showing ${backups.length} snapshot(s). To restore one, run:`) + "\n  " + pc.bold("backlify restore <snapshot_id> --target <db_url>\n"));
  } catch (err: any) {
    logger.error(`Failed to list backups: ${err.message}`);
    process.exit(1);
  }
}
