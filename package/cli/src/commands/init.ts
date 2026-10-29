import readline from "node:readline";
import path from "node:path";
import pc from "picocolors";
import { globalConfig } from "../config/global-config.js";
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

function inferEngine(dbUrl: string): string {
  const lower = dbUrl.toLowerCase();
  if (lower.includes("supabase.co") || lower.includes("supabase.com")) return "supabase";
  if (lower.includes("neon.tech")) return "neon";
  if (lower.includes("timescale")) return "timescaledb";
  if (lower.startsWith("mysql://")) return "mysql";
  if (lower.startsWith("mongodb://") || lower.startsWith("mongodb+srv://")) return "mongodb";
  return "postgres";
}

export async function initCommand(options: {
  name?: string;
  db?: string;
  engine?: string;
  yes?: boolean;
}) {
  logger.banner();

  // Authentication check: Must be logged in before initializing a project
  const creds = globalConfig.get();
  if (!creds.apiKey && !process.env.BACKLIFY_API_KEY) {
    logger.error("Not logged in. Run 'backlify login' first to authenticate.");
    console.log(pc.dim("A Backlify account is required to initialize and manage projects.\n"));
    process.exit(1);
  }

  const existing = projectConfig.find();
  if (existing && !options.yes) {
    logger.warn(`Current directory is already linked to project: ${pc.cyan(existing.config.projectId)}`);
    const overwrite = await prompt("Do you want to re-initialize and link a new project? [y/N]: ");
    if (overwrite.toLowerCase() !== "y" && overwrite.toLowerCase() !== "yes") {
      logger.info("Init aborted. Keeping existing project link.");
      return;
    }
  }

  // 1. Resolve Project Name
  const defaultName = path.basename(process.cwd()) || "my-database-project";
  let projectName = options.name;
  if (!projectName) {
    if (options.yes) {
      projectName = defaultName;
    } else {
      const input = await prompt(`Enter Project Name (${pc.cyan(defaultName)}): `);
      projectName = input || defaultName;
    }
  }

  // 2. Resolve Database Connection URL
  let dbUrl = options.db;
  const envDbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    if (envDbUrl) {
      if (options.yes) {
        dbUrl = envDbUrl;
      } else {
        const masked = envDbUrl.slice(0, 14) + "••••••••" + envDbUrl.slice(-10);
        console.log(pc.green("✔") + ` Detected DATABASE_URL in .env: ${pc.dim(masked)}`);
        const useEnv = await prompt("Use this connection string? [Y/n]: ");
        if (useEnv.toLowerCase() === "n" || useEnv.toLowerCase() === "no") {
          dbUrl = await prompt("Enter your Database Connection URI: ");
        } else {
          dbUrl = envDbUrl;
        }
      }
    } else if (!options.yes) {
      dbUrl = await prompt("Enter your Database Connection URI: ");
    }
  }

  if (!dbUrl) {
    dbUrl = "postgresql://localhost:5432/postgres";
  }

  // 3. Resolve Engine
  const engine = options.engine || inferEngine(dbUrl);

  logger.info(`Creating Backlify project ${pc.bold(pc.cyan(projectName))} (${pc.yellow(engine)})...`);

  const client = new CliApiClient();

  try {
    const project = await client.createProject({
      name: projectName,
      databaseUrl: dbUrl,
      databaseEngine: engine,
    });

    const savedPath = projectConfig.save({
      projectId: project.id,
      createdAt: new Date().toISOString(),
    });

    logger.success(`Project created & linked to this repository!`);

    logger.box("Project Initialized", [
      `Project Name:  ${pc.bold(project.name)}`,
      `Project ID:    ${pc.cyan(project.id)}`,
      `Engine:        ${pc.yellow(project.engine)}`,
      `Config Saved:  ${pc.dim(savedPath)}`,
      ``,
      `Next steps:`,
      `  • Take first backup snapshot:    ${pc.bold("backlify backup")}`,
      `  • Put daily backups on schedule: ${pc.bold("backlify schedule --every daily")}`,
      `  • Guard migrations:              ${pc.bold("backlify run -- npx prisma migrate deploy")}`,
    ]);
  } catch (err: any) {
    logger.error(`Failed to initialize project: ${err.message}`);
    process.exit(1);
  }
}
