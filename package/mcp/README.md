# @backlify/mcp

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for Backlify database backup automation.

Allows AI coding assistants (Claude Desktop, Cursor, Antigravity, Windsurf, Zed) to monitor backup health, trigger instant on-demand snapshots, manage backup schedules, and run restore drills directly from conversation prompts.

---

## 🛠️ Registered Tools

| Tool | Description |
| :--- | :--- |
| `create_backup` | Initiates an immediate on-demand database backup before migrations or deployments. |
| `get_job_status` | Real-time monitoring of backup and restore execution jobs. |
| `list_backups` | Lists recent backup snapshots, timestamps, storage sizes, and checksums. |
| `list_schedules` | Inspects automated cron schedules, next run dates, and retention rules. |
| `set_schedule_enabled` | Pauses or resumes an automated backup schedule before maintenance windows. |
| `restore_backup` | Triggers a database restore drill with explicit confirmation safeguards. |

---

## 🚀 Setup & Configuration

### Option 1: Claude Desktop

Add to your `claude_desktop_config.json`:

* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "backlify": {
      "command": "npx",
      "args": ["-y", "@backlify/mcp"],
      "env": {
        "BACKLIFY_API_KEY": "bk_live_your_api_key_here",
        "BACKLIFY_PROJECT_ID": "proj_your_project_id"
      }
    }
  }
}
```

### Option 2: Cursor IDE

In Cursor, open **Settings → Features → MCP Servers → Add New MCP Server**:

* **Name:** `backlify`
* **Type:** `command`
* **Command:** `npx -y @backlify/mcp`
* **Environment Variables:**
  * `BACKLIFY_API_KEY`: Your Backlify API Key
  * `BACKLIFY_PROJECT_ID`: Default project ID

---

## 💻 Local / Self-Hosted Docker Mode

If you are running Backlify self-hosted or testing locally with Docker:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/backlify \
REDIS_URL=redis://localhost:6379 \
BACKLIFY_PROJECT_ID=proj_local_db \
node ./dist/bin/backlify-mcp.js
```

---

## 💬 Example Agent Prompts

Once configured, you can talk to your AI assistant:
* *"Take a backup of our production database before I run `drizzle-kit push`."*
* *"What is the status of our latest backup snapshot?"*
* *"Pause our automated backup schedule while we perform database maintenance."*
* *"List all backups created this week for project acme-db."*
