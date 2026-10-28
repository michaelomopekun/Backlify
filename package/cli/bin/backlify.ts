#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load nearest .env searching upwards from current directory
let searchDir = process.cwd();
for (let i = 0; i < 5; i++) {
  const envFile = path.join(searchDir, ".env");
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    break;
  }
  const parent = path.dirname(searchDir);
  if (parent === searchDir) break;
  searchDir = parent;
}

import { loginCommand, logoutCommand, whoamiCommand } from "../src/commands/auth.js";
import { initCommand } from "../src/commands/init.js";
import { linkCommand, unlinkCommand, statusCommand } from "../src/commands/link.js";
import { backupCommand, listBackupsCommand } from "../src/commands/backup.js";
import { scheduleCommand } from "../src/commands/schedule.js";
import { runCommand } from "../src/commands/run.js";
import { restoreCommand, drillCommand } from "../src/commands/restore.js";
import { mcpCommand } from "../src/commands/mcp.js";
import { logger } from "../src/ui/logger.js";

const program = new Command();

program
  .name("backlify")
  .description("Developer-first CLI for Backlify — Database backups, recovery drills, and guarded migrations")
  .version("1.0.0")
  .action(() => {
    logger.banner();
    program.outputHelp();
  });

// ── Auth Commands ──
program
  .command("login")
  .description("Authenticate with your Backlify account")
  .option("-t, --token <token>", "Backlify API token")
  .option("-u, --url <url>", "Custom Backlify API URL")
  .action(loginCommand);

program
  .command("logout")
  .description("Log out and clear stored credentials")
  .action(logoutCommand);

program
  .command("whoami")
  .description("Show currently logged-in user and active configuration")
  .action(whoamiCommand);

// ── Project Initialization & Linking ──
program
  .command("init")
  .description("Initialize a new Backlify project and link this directory (auto-detects DATABASE_URL)")
  .option("-n, --name <name>", "Project name (defaults to current folder name)")
  .option("-d, --db <url>", "Database connection string")
  .option("-e, --engine <engine>", "Database engine (postgres, supabase, neon, timescaledb)")
  .option("-y, --yes", "Skip interactive prompts and use defaults", false)
  .action(initCommand);

program
  .command("link")
  .description("Link current repository/directory to a Backlify database project")
  .option("-p, --project-id <projectId>", "Backlify Project ID")
  .action(linkCommand);

program
  .command("unlink")
  .description("Unlink project from the current directory")
  .action(unlinkCommand);

program
  .command("status")
  .description("Check status of linked database project and latest backup")
  .action(statusCommand);

// ── Backup Commands ──
program
  .command("backup")
  .alias("snapshot")
  .description("Trigger an immediate on-demand database backup")
  .option("-l, --label <label>", "Optional label or description for the snapshot")
  .option("-w, --wait", "Wait and stream progress until completion", false)
  .option("-p, --project-id <projectId>", "Override linked project ID")
  .action(backupCommand);

program
  .command("list")
  .description("List recent database backup snapshots")
  .option("-n, --limit <number>", "Number of snapshots to display", "10")
  .option("-p, --project-id <projectId>", "Override linked project ID")
  .action(listBackupsCommand);

// ── Automated Backup Schedules ──
program
  .command("schedule")
  .description("Configure or inspect automated recurring backup schedules")
  .option("-e, --every <cadence>", "Schedule preset: hourly, daily, weekly")
  .option("-c, --cron <pattern>", "Custom 5-part cron expression (e.g. '0 2 * * *')")
  .option("-z, --tz <timezone>", "Timezone identifier (e.g. 'UTC', 'America/New_York')", "UTC")
  .option("-d, --disable", "Disable automated recurring backup schedule", false)
  .option("-p, --project-id <projectId>", "Override linked project ID")
  .action(scheduleCommand);

// ── Guarded Migration Runner ──
program
  .command("run")
  .description("Run a migration or schema command with automatic pre-checkpoint safety net")
  .allowUnknownOption(true)
  .argument("[command...]", "Migration command to execute (e.g. npx prisma migrate deploy)")
  .option("-p, --project-id <projectId>", "Override linked project ID")
  .option("--skip-checkpoint", "Skip taking a pre-migration safety checkpoint", false)
  .action((args, options) => {
    // If command was passed after --, commander places them in program.args
    const rawArgs = process.argv.slice(process.argv.indexOf("run") + 1);
    const filteredArgs = rawArgs.filter((a) => a !== "--" && !a.startsWith("--skip-checkpoint") && !a.startsWith("-p") && !a.startsWith("--project-id"));
    return runCommand(filteredArgs, options);
  });

// ── Restore & Drills ──
program
  .command("restore [backupId]")
  .description("Restore a database backup snapshot or rewind point-in-time")
  .option("-t, --target <url>", "Target database connection URI")
  .option("--to <timestamp>", "Point-in-time recovery target timestamp (ISO-8601)")
  .option("-y, --yes", "Skip confirmation prompt", false)
  .option("-p, --project-id <projectId>", "Override linked project ID")
  .action(restoreCommand);

program
  .command("drill")
  .description("Trigger an ephemeral disaster recovery test drill in an isolated sandbox")
  .option("-b, --backup-id <backupId>", "Specific backup snapshot to verify")
  .option("-p, --project-id <projectId>", "Override linked project ID")
  .action(drillCommand);

// ── AI & MCP Setup ──
program
  .command("mcp")
  .description("Configure Model Context Protocol (MCP) for Claude Desktop or Cursor")
  .action(mcpCommand);

program.parse(process.argv);
