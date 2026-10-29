<div align="center">

# DBDock / Backlify CLI

**The developer-first database toolkit for automated backups, point-in-time restores, guarded migrations, and disaster recovery drills — with zero-knowledge encryption, compression, and multi-cloud storage built in.**

[![npm version](https://img.shields.io/npm/v/backlify-cli.svg)](https://www.npmjs.com/package/backlify-cli)
[![npm downloads](https://img.shields.io/npm/dm/backlify-cli.svg)](https://www.npmjs.com/package/backlify-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Documentation](https://img.shields.io/badge/docs-docs.backlify.com-23517c)](https://docs.backlify.com)

[Documentation](https://docs.backlify.com) &nbsp;·&nbsp; [Dashboard](https://backlify.com) &nbsp;·&nbsp; [Discussions](https://github.com/michaelomopekun/Backlify/discussions) &nbsp;·&nbsp; [Report a bug](https://github.com/michaelomopekun/Backlify/issues)

</div>

---

Stop writing throwaway backup shell scripts. Stop running production schema migrations without a rollback safety net. One CLI, one command.

```bash
npx backlify init                                # Auto-detects DATABASE_URL from .env
npx backlify backup --wait                       # Instant snapshot with streaming progress
npx backlify drill                               # Ephemeral sandbox recovery verification
npx backlify run -- npx prisma migrate deploy    # Guarded migration with automatic pre-checkpoint
npx backlify restore                             # Interactive point-in-time recovery
npx backlify schedule --every daily              # Automated recurring cron schedule
npx backlify mcp                                 # Connect to Claude Desktop or Cursor IDE
```

> **Two ways to use Backlify / DBDock.** The CLI is the open-source, local-first engine you run in your terminal and CI/CD pipelines. There's also the **[Backlify Cloud Dashboard](https://backlify.com)** — a managed platform offering automated telemetry, scheduled jobs, team collaboration, multi-cloud storage vaults, and instant incident alerts. Only non-secret metadata ever syncs to the cloud.

---

## Table of contents

- [Install](#install)
- [Prerequisites](#prerequisites)
- [Features](#features)
- [Quick start](#quick-start)
- [Commands Reference](#commands-reference)
- [Guarded Migrations (`run`)](#guarded-migrations-run)
- [Automated DR Drills (`drill`)](#automated-dr-drills-drill)
- [AI Agent MCP Server (`mcp`)](#ai-agent-mcp-server-mcp)
- [Backup Schedules (`schedule`)](#backup-schedules-schedule)
- [Storage Providers & BYO Vaults](#storage-providers--byo-vaults)
- [Security & Zero-Knowledge Architecture](#security--zero-knowledge-architecture)
- [Programmatic Usage](#programmatic-usage)
- [Contributing](#contributing)
- [License](#license)

---

## Install

**With npx (no installation required):**

```bash
npx backlify --help
# Or alias:
npx dbdock --help
```

**Global installation via npm:**

```bash
npm install -g backlify-cli
```

---

## Prerequisites

- **Node.js:** `v18.0.0` or higher.
- **Database Engine Client Tools:**
  - **PostgreSQL / Supabase / Neon / TimescaleDB:** Requires standard client utilities (`pg_dump`, `pg_restore`, `psql`).
  - **MySQL / MariaDB:** `mysqldump`, `mysql`.
  - **Redis:** `redis-cli`.

<details>
<summary><b>Install PostgreSQL client utilities</b></summary>

`pg_dump` requires a version equal to or newer than your target database server major version:

```bash
# macOS (Homebrew)
brew install postgresql

# Ubuntu / Debian
sudo apt-get install -y postgresql-client

# RedHat / Fedora / CentOS
sudo dnf install -y postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

If your PostgreSQL binary lives in a custom directory, set the path in your environment:

```bash
export BACKLIFY_PG_BIN_DIR=/usr/lib/postgresql/16/bin
```
</details>

---

## Features

- **Automated Checkpoints** — Stream compressed snapshots of PostgreSQL, Supabase, Neon, TimescaleDB, MySQL, and Docker database fleets.
- **Guarded Migrations** — Automatically triggers a safety checkpoint *before* executing schema migrations (Prisma, Drizzle, TypeORM, Flyway).
- **Ephemeral DR Drills** — Spins up isolated test sandboxes in the background to verify table checksums, foreign keys, and restore readiness without touching production.
- **Point-in-Time Recovery (PITR)** — Rewind databases to specific timestamps or snapshot IDs in seconds.
- **Multi-Cloud Storage & BYO Vaults** — Stream to Backlify Cloud Storage, or bring your own private AWS S3, Cloudflare R2, MinIO, or Wasabi buckets.
- **Local Checkpoints** — Free forever on local disk and customer buckets, completely outside cloud storage limits.
- **AI Agent MCP Server** — Native Model Context Protocol server for Claude Desktop and Cursor IDE to manage database snapshots via natural language.
- **Zero-Knowledge Security** — Client-side AES-256-GCM encryption with your private key before transmission. Passwords and credentials never leave your host.
- **Automated Cron Schedules** — Manage hourly, daily, weekly, or custom 5-part cron schedules directly from the terminal.

---

## Quick start

### 1. Authenticate with Backlify

```bash
npx backlify login
```
*(Prompts for your Backlify API token or opens the browser sign-in flow).*

### 2. Initialize in your project repository

Run `init` in your project root. It will traverse upwards to detect your `.env` file and resolve `DATABASE_URL`:

```bash
npx backlify init
```

Backlify auto-detects your database engine (`postgres`, `supabase`, `neon`, etc.) and creates a `.backlify/config.json` file in your repository.

### 3. Create your first snapshot

```bash
npx backlify backup --wait
```

### 4. Restore interactively

```bash
npx backlify restore
```

---

## Commands Reference

| Command | Arguments / Flags | Description |
|---|---|---|
| [`init`](#init) | `[-n name] [-d db_url] [-e engine] [-y]` | Interactive setup wizard; auto-detects `DATABASE_URL` from `.env` |
| [`login`](#auth) | `[-t token] [-u url]` | Authenticate CLI with your Backlify account |
| [`logout`](#auth) | — | Clear stored local authentication tokens |
| [`whoami`](#auth) | — | Display active user, organization, and API configuration |
| [`status`](#status) | — | Show linked project health, schedule, and latest backup |
| [`link`](#link) | `[-p projectId]` | Link current directory to an existing Backlify Cloud project |
| [`unlink`](#link) | — | Unlink project from the current directory |
| [`backup`](#backup) | `[-l label] [-w] [-p projectId]` | Create an on-demand database backup snapshot (`--wait` streams progress) |
| [`list`](#list) | `[-n limit] [-p projectId]` | List recent database snapshots with sizes, status, and timestamps |
| [`restore`](#restore) | `[backupId] [-t target] [--to time] [-y]` | Restore a database snapshot or rewind point-in-time |
| [`run`](#guarded-migrations-run) | `[--skip-checkpoint] -- <cmd>` | Execute a migration command with an automatic pre-migration checkpoint |
| [`drill`](#automated-dr-drills-drill) | `[-b backupId] [-p projectId]` | Run an ephemeral disaster recovery test drill in an isolated sandbox |
| [`schedule`](#backup-schedules-schedule) | `[-e cadence] [-c cron] [-z tz] [-d]` | Configure automated recurring backup schedules |
| [`mcp`](#ai-agent-mcp-server-mcp) | — | Generate Model Context Protocol (MCP) configuration for Claude & Cursor |

---

## Guarded Migrations (`run`)

Running database migrations in production without a pre-migration snapshot is risky. The `run` command wraps any migration tool, taking an instant snapshot before executing the child command.

```bash
# Prisma
npx backlify run -- npx prisma migrate deploy

# Drizzle ORM
npx backlify run -- pnpm drizzle-kit migrate

# Custom npm scripts
npx backlify run -- npm run db:migrate
```

### How it works:

```
[1/2] Creating pre-migration safety checkpoint (guard_pre_mig_179328)...
      ✔ Pre-migration snapshot enqueued: cp_01HQ8A79B1...
[2/2] Executing: npx prisma migrate deploy
      ------------------------------------------------------------
      Applying migration `20261029140000_add_vault_keys`...
      ✔ 1 migration deployed.
      ------------------------------------------------------------
✔ Command executed successfully (exit code: 0)
```

If your migration throws an error or aborts mid-transaction, you have an uncorrupted snapshot ready for immediate 1-click rollback:

```bash
npx backlify restore cp_01HQ8A79B1 --yes
```

To bypass checkpoint creation in CI test runs:
```bash
npx backlify run --skip-checkpoint -- npx prisma migrate deploy
```

---

## Automated DR Drills (`drill`)

> **"An untested backup is not a backup — it is merely a wish."**

Backlify's `drill` command solves the silent backup corruption dilemma. It triggers a headless audit in an isolated, ephemeral sandbox environment:

```bash
# Drill test the latest snapshot
npx backlify drill

# Drill test a specific backup archive
npx backlify drill --backup-id cp_01HQ8A79B1
```

### What a Recovery Drill checks:
1. **Archive Decryption & Decompression:** Ensures encryption keys and gzip streams are valid.
2. **Schema & Table Checksums:** Verifies table definitions, indexes, sequences, and foreign keys.
3. **Transaction Log Replay:** Confirms zero corrupt WAL / LSN records.
4. **Readiness Report:** Logs a tamper-evident audit entry confirming recovery time objective (RTO) metrics.

---

## AI Agent MCP Server (`mcp`)

Backlify includes a native **Model Context Protocol (MCP)** server. Connect your database recovery toolchain directly to AI coding agents like **Claude Desktop** and **Cursor IDE**.

```bash
npx backlify mcp
```

### Quick Claude Desktop Setup:

```bash
claude mcp add backlify -- npx @backlify/mcp
```

### Or add to `claude_desktop_config.json` / `cursor.json`:

```json
{
  "mcpServers": {
    "backlify": {
      "command": "npx",
      "args": ["-y", "@backlify/mcp"],
      "env": {
        "BACKLIFY_API_KEY": "bk_live_your_api_key_here",
        "BACKLIFY_PROJECT_ID": "proj_your_project_id",
        "BACKLIFY_BASE_URL": "https://api.backlify.com"
      }
    }
  }
}
```

### Natural Language Prompt Examples:
- *"Take a database snapshot before I push this migration."*
- *"Check if our 2:00 AM daily backup passed its restore verification drill."*
- *"Restore yesterday's checkpoint into my local Docker PostgreSQL container."*
- *"List the last 5 database snapshots and their sizes."*

---

## Backup Schedules (`schedule`)

Configure automated recurring snapshots directly from your command line:

```bash
# Hourly schedule
npx backlify schedule --every hourly

# Daily schedule at midnight UTC
npx backlify schedule --every daily

# Custom cron expression (Every weekday at 3:30 AM America/New_York)
npx backlify schedule --cron "30 3 * * 1-5" --tz "America/New_York"

# Disable automated scheduling
npx backlify schedule --disable
```

---

## Storage Providers & BYO Vaults

Backlify supports flexible storage destinations:

1. **Backlify Cloud Storage (Managed):**
   - Zero-configuration cloud storage included with your plan.
   - High-durability storage network (AES-256 encryption at rest).
   - Instant web downloads and dashboard restore controls.

2. **Customer-Bucket BYO Storage Vaults:**
   - Stream snapshots directly into your own private cloud buckets:
     - **AWS S3**
     - **Cloudflare R2** (zero egress fees)
     - **MinIO** (self-hosted S3)
     - **Wasabi / DigitalOcean Spaces**
   - *Note: Customer-bucket snapshots are outside Backlify Cloud storage limits on every plan.*

3. **Local Disk Checkpoints:**
   - Keep snapshots on local disk or private Docker volumes.
   - Free forever on all tiers.

---

## Security & Zero-Knowledge Architecture

- **Client-Side Encryption:** Snapshots can be encrypted with AES-256-GCM before leaving your server. Backlify has zero access to your unencrypted database dumps.
- **Environment Variable Isolation:** Database connection strings and master keys reside in `.env`, never written to unencrypted configuration files.
- **Masked Telemetry:** Passwords and credentials in connection URIs are scrubbed before logging (`postgres://user:***@host:5432/db`).
- **TLS / SSL Enforcement:** All communications between the CLI, the database host, and the cloud API are encrypted via TLS 1.3.

---

## Programmatic Usage

You can also integrate Backlify services into custom Node.js / TypeScript scripts:

```typescript
import { CliApiClient } from "backlify-cli";

const client = new CliApiClient({
  apiKey: process.env.BACKLIFY_API_KEY,
  apiUrl: "https://api.backlify.com",
});

// Trigger an immediate snapshot
const job = await client.createBackup("proj_01HQ8", "pre-deployment-audit");
console.log(`Snapshot enqueued with Job ID: ${job.jobId}`);

// Query recent backups
const backups = await client.listBackups("proj_01HQ8", 5);
backups.forEach((b) => {
  console.log(`- ${b.id} (${b.formattedSize}) [${b.status}]`);
});
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository: `https://github.com/michaelomopekun/Backlify`
2. Create a feature branch: `git checkout -b feat/my-new-command`
3. Run tests: `pnpm --filter backlify-cli test`
4. Submit a pull request.

---

## License

[MIT](LICENSE) — Free forever, open-source, self-hosted, with zero vendor lock-in.

