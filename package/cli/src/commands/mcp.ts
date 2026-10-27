import pc from "picocolors";
import { globalConfig } from "../config/global-config.js";
import { projectConfig } from "../config/project-config.js";
import { logger } from "../ui/logger.js";

export async function mcpCommand() {
  logger.banner();

  const creds = globalConfig.get();
  const local = projectConfig.find();
  const apiKey = creds.apiKey || "YOUR_BACKLIFY_API_KEY";
  const projectId = local?.config.projectId || "YOUR_PROJECT_ID";
  const apiUrl = creds.apiUrl || "http://localhost:3000";

  console.log(pc.bold("Model Context Protocol (MCP) Configuration for Claude & Cursor\n"));

  logger.info("Add Backlify to Claude Desktop via command:");
  console.log(
    "  " +
      pc.bold(
        pc.green(
          `claude mcp add backlify -- npx @backlify/mcp`
        )
      ) +
      "\n"
  );

  logger.info("Or add this snippet to your Claude / Cursor config JSON:");
  const mcpConfigSnippet = {
    mcpServers: {
      backlify: {
        command: "npx",
        args: ["-y", "@backlify/mcp"],
        env: {
          BACKLIFY_API_KEY: apiKey,
          BACKLIFY_PROJECT_ID: projectId,
          BACKLIFY_BASE_URL: apiUrl,
        },
      },
    },
  };

  console.log(pc.cyan(JSON.stringify(mcpConfigSnippet, null, 2)) + "\n");

  logger.box("AI Agent Capabilities", [
    `• "@backlify take snapshot before deploy"`,
    `• "@backlify list recent backups"`,
    `• "@backlify trigger disaster recovery drill"`,
    `• "@backlify rollback staging database"`,
  ]);
}
