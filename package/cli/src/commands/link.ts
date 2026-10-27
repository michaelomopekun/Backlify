import readline from "node:readline";
import pc from "picocolors";
import { projectConfig } from "../config/project-config.js";
import { CliApiClient } from "../client/api-client.js";
import { logger } from "../ui/logger.js";

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function linkCommand(options: { projectId?: string }) {
  logger.banner();

  const client = new CliApiClient();
  let projectId = options.projectId;

  if (!projectId) {
    logger.info("Fetching available projects...");
    try {
      const projects = await client.listProjects().catch(() => []);
      if (projects.length > 0) {
        console.log("\n" + pc.bold("Available Projects:"));
        projects.forEach((p, idx) => {
          console.log(`  [${idx + 1}] ${pc.cyan(p.name)} (${pc.dim(p.id)}) - ${pc.yellow(p.engine)}`);
        });
        console.log("");
        const selection = await prompt("Select a project number or paste Project ID: ");
        const num = parseInt(selection, 10);
        if (!isNaN(num) && projects[num - 1]) {
          projectId = projects[num - 1].id;
        } else {
          projectId = selection;
        }
      } else {
        projectId = await prompt("Enter Backlify Project ID: ");
      }
    } catch {
      projectId = await prompt("Enter Backlify Project ID: ");
    }
  }

  if (!projectId) {
    logger.error("No project ID specified. Link aborted.");
    process.exit(1);
  }

  const savedPath = projectConfig.save({
    projectId,
    createdAt: new Date().toISOString(),
  });

  logger.success(`Linked current repository to project ${pc.cyan(projectId)}!`);
  console.log(pc.dim(`Configuration saved to ${savedPath}\n`));
}

export async function unlinkCommand() {
  const removed = projectConfig.remove();
  if (removed) {
    logger.success("Unlinked project from this directory.");
  } else {
    logger.warn("No active Backlify link found in this directory.");
  }
}

export async function statusCommand() {
  logger.banner();

  const local = projectConfig.find();
  if (!local) {
    logger.warn("No linked project in this directory.");
    console.log(pc.dim("Run 'backlify link' to link a database project.\n"));
    return;
  }

  const { config, dir } = local;
  const client = new CliApiClient();

  logger.info(`Checking project status for ${pc.cyan(config.projectId)}...`);

  let lastBackup = "Unknown";
  try {
    const backups = await client.listBackups(config.projectId, 1).catch(() => []);
    if (backups.length > 0) {
      lastBackup = `${backups[0].id} (${new Date(backups[0].createdAt).toLocaleString()})`;
    } else {
      lastBackup = "No backups recorded yet";
    }
  } catch {
    lastBackup = "Direct API mode";
  }

  logger.box("Linked Project Status", [
    `Project ID:   ${pc.bold(pc.cyan(config.projectId))}`,
    `Directory:    ${pc.dim(dir)}`,
    `Latest Dump:  ${pc.green(lastBackup)}`,
    `Linked At:    ${pc.dim(config.createdAt || "Active")}`,
  ]);
}
