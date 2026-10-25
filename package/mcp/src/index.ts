import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BacklifyClient } from "./client/backlify-client.js";
import { registerTools } from "./tools/tools.js";

export { BacklifyClient } from "./client/backlify-client.js";
export { registerTools } from "./tools/tools.js";

export async function createBacklifyMcpServer() {
  const server = new McpServer({
    name: "backlify",
    version: "1.0.0",
  });

  const client = new BacklifyClient();
  registerTools(server, client);

  return { server, client };
}

export async function startMcpServer() {
  const { server } = await createBacklifyMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Note: Only use stderr for diagnostics in stdio MCP mode to prevent JSON-RPC corruption
  console.error("Backlify MCP Server connected via stdio transport");
}
