import { execa } from "execa";
import pc from "picocolors";
import { CliApiClient } from "../client/api-client.js";
import { logger } from "../ui/logger.js";

export async function runCommand(args: string[], options: { projectId?: string; skipCheckpoint?: boolean }) {
  if (!args || args.length === 0) {
    logger.error("No command provided to run.");
    console.log(
      pc.dim("\nUsage:\n  ") +
        pc.bold("backlify run -- <migration_command>\n\n") +
        pc.dim("Examples:\n  ") +
        "backlify run -- npx prisma migrate deploy\n  " +
        "backlify run -- pnpm drizzle-kit migrate\n  " +
        "backlify run -- npm run db:migrate\n"
    );
    process.exit(1);
  }

  logger.banner();

  const client = new CliApiClient();
  let projectId: string;
  try {
    projectId = client.resolveProjectId(options.projectId);
  } catch (err: any) {
    logger.error(err.message);
    process.exit(1);
  }

  const commandStr = args.join(" ");
  let snapshotId: string | null = null;

  // ── Step 1: Pre-Migration Checkpoint ──
  if (!options.skipCheckpoint) {
    logger.step(1, 2, "Creating pre-migration safety checkpoint...");
    const label = `guard_pre_mig_${Date.now()}`;

    try {
      const job = await client.createBackup(projectId, label);
      snapshotId = job.jobId;
      logger.success(
        `Pre-migration snapshot enqueued: ${pc.cyan(snapshotId)}`
      );
    } catch (err: any) {
      logger.warn(`Could not save pre-migration snapshot: ${err.message}`);
      logger.warn("Proceeding with command execution without snapshot protection...\n");
    }
  } else {
    logger.info("Skipping safety checkpoint (--skip-checkpoint set)");
  }

  // ── Step 2: Execute Child Migration Command ──
  console.log("");
  logger.step(2, 2, `Executing: ${pc.bold(pc.cyan(commandStr))}\n`);
  console.log(pc.dim("─".repeat(60)));

  const startTime = Date.now();
  let exitCode = 0;

  try {
    const [executable, ...cmdArgs] = args;
    await execa(executable, cmdArgs, {
      stdio: "inherit",
      env: process.env,
    });
  } catch (err: any) {
    exitCode = err.exitCode || 1;
  }

  console.log(pc.dim("─".repeat(60)));
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // ── Step 3: Handle Outcome ──
  if (exitCode === 0) {
    logger.success(`Migration completed successfully in ${duration}s!`);
    if (snapshotId) {
      console.log(
        pc.dim(`Safety checkpoint ${pc.cyan(snapshotId)} is safely archived in your storage vault.\n`)
      );
    }
    process.exit(0);
  } else {
    logger.error(`Migration command failed with exit code ${exitCode}!`);

    if (snapshotId) {
      logger.box("MIGRATION ROLLBACK READY", [
        `Command failed:  ${pc.red(commandStr)}`,
        `Database state:  ${pc.yellow("Potentially partial or inconsistent")}`,
        ``,
        `To instantly rollback to the pre-migration snapshot, run:`,
        `  ${pc.bold(pc.green(`backlify restore ${snapshotId} --yes`))}`,
      ]);
    }

    process.exit(exitCode);
  }
}
