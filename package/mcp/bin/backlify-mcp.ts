#!/usr/bin/env node
import { startMcpServer } from "../src/index.js";

startMcpServer().catch((err) => {
  console.error("Fatal error starting Backlify MCP server:", err);
  process.exit(1);
});
