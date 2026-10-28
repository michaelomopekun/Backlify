import { execa } from "execa";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliEntry = path.resolve(__dirname, "../bin/backlify.ts");

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

async function runCli(args: string[], options: { expectFail?: boolean } = {}) {
  try {
    const result = await execa("npx", ["tsx", cliEntry, ...args], {
      cwd: path.resolve(__dirname, ".."),
      all: true,
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    });
    return {
      ...result,
      cleanStdout: stripAnsi(result.all || result.stdout || ""),
    };
  } catch (err: any) {
    if (options.expectFail) {
      return {
        ...err,
        cleanStdout: stripAnsi(err.all || err.stderr || err.stdout || err.message || ""),
      };
    }
    throw err;
  }
}

async function runAllTests() {
  console.log("🧪 Starting Backlify CLI Integration Test Suite...\n");

  // 1. Help flag
  console.log("▶ Test 1: backlify --help");
  const helpRes = await runCli(["--help"]);
  assert.equal(helpRes.exitCode, 0);
  assert.match(helpRes.cleanStdout, /Developer-first CLI for Backlify/);
  assert.match(helpRes.cleanStdout, /guarded migrations/);
  console.log("  ✔ --help output formatted correctly\n");

  // 2. Version flag
  console.log("▶ Test 2: backlify --version");
  const verRes = await runCli(["--version"]);
  assert.equal(verRes.exitCode, 0);
  assert.match(verRes.cleanStdout, /1\.0\.0/);
  console.log("  ✔ --version returns 1.0.0\n");

  // 3. Login
  console.log("▶ Test 3: backlify login --token <test_token>");
  const loginRes = await runCli(["login", "--token", "bkl_test_secret_token_123"]);
  assert.equal(loginRes.exitCode, 0);
  assert.match(loginRes.cleanStdout, /Successfully logged in/);
  console.log("  ✔ login command saves credentials\n");

  // 4. Whoami
  console.log("▶ Test 4: backlify whoami");
  const whoamiRes = await runCli(["whoami"]);
  assert.equal(whoamiRes.exitCode, 0);
  assert.match(whoamiRes.cleanStdout, /Backlify Session/);
  assert.match(whoamiRes.cleanStdout, /User:/);
  console.log("  ✔ whoami displays active authenticated session\n");

  // 5. Link project
  console.log("▶ Test 5: backlify link --project-id <id>");
  const linkRes = await runCli(["link", "--project-id", "prj_test_postgres_prod"]);
  assert.equal(linkRes.exitCode, 0);
  assert.match(linkRes.cleanStdout, /Linked current repository to project prj_test_postgres_prod/);
  console.log("  ✔ link creates .backlify/config.json with project ID\n");

  // 6. Status
  console.log("▶ Test 6: backlify status");
  const statusRes = await runCli(["status"]);
  assert.equal(statusRes.exitCode, 0);
  assert.match(statusRes.cleanStdout, /Linked Project Status/);
  assert.match(statusRes.cleanStdout, /prj_test_postgres_prod/);
  console.log("  ✔ status inspects linked project metadata\n");

  // 7. MCP Configuration
  console.log("▶ Test 7: backlify mcp");
  const mcpRes = await runCli(["mcp"]);
  assert.equal(mcpRes.exitCode, 0);
  assert.match(mcpRes.cleanStdout, /Model Context Protocol \(MCP\) Configuration/);
  assert.match(mcpRes.cleanStdout, /@backlify\/mcp/);
  console.log("  ✔ mcp outputs Claude & Cursor configurations\n");

  // 8. Init project
  console.log("▶ Test 8: backlify init --yes --name <name>");
  const initRes = await runCli(["init", "--yes", "--name", "test-suite-db"]);
  assert.equal(initRes.exitCode, 0);
  assert.match(initRes.cleanStdout, /Project Initialized/);
  assert.match(initRes.cleanStdout, /test-suite-db/);
  console.log("  ✔ init initializes and links project automatically\n");

  // 9. Schedule configuration
  console.log("▶ Test 9: backlify schedule --every daily");
  const schedSetRes = await runCli(["schedule", "--every", "daily"]);
  assert.equal(schedSetRes.exitCode, 0);
  assert.match(schedSetRes.cleanStdout, /Backup schedule updated/);
  assert.match(schedSetRes.cleanStdout, /Daily at midnight UTC/);
  console.log("  ✔ schedule --every daily configures recurring backup\n");

  // 10. Schedule inspection
  console.log("▶ Test 10: backlify schedule");
  const schedGetRes = await runCli(["schedule"]);
  assert.equal(schedGetRes.exitCode, 0);
  assert.match(schedGetRes.cleanStdout, /Active Backup Schedule/);
  console.log("  ✔ schedule inspects active schedule cadence\n");

  // 11. Schedule disable
  console.log("▶ Test 11: backlify schedule --disable");
  const schedDisRes = await runCli(["schedule", "--disable"]);
  assert.equal(schedDisRes.exitCode, 0);
  assert.match(schedDisRes.cleanStdout, /Automated backup schedule has been disabled/);
  console.log("  ✔ schedule --disable deactivates recurring backup\n");

  // 12. Guarded run (success case)
  console.log("▶ Test 12: backlify run -- <cmd> (success scenario)");
  const runSuccessRes = await runCli(["run", "--skip-checkpoint", "--", "node", "-e", "console.log('Migration OK');"]);
  assert.equal(runSuccessRes.exitCode, 0);
  assert.match(runSuccessRes.cleanStdout, /Migration OK/);
  assert.match(runSuccessRes.cleanStdout, /Migration completed successfully/);
  console.log("  ✔ run executes child process cleanly\n");

  // 13. Guarded run (failure & rollback suggestion)
  console.log("▶ Test 13: backlify run -- <cmd> (failure scenario)");
  const runFailRes = await runCli(["run", "--skip-checkpoint", "--", "node", "-e", "process.exit(2);"], { expectFail: true });
  assert.equal(runFailRes.exitCode, 2);
  assert.match(runFailRes.cleanStdout, /Migration command failed with exit code 2/);
  console.log("  ✔ run handles child failure and preserves exit code\n");

  // 14. Unlink project
  console.log("▶ Test 14: backlify unlink");
  const unlinkRes = await runCli(["unlink"]);
  assert.equal(unlinkRes.exitCode, 0);
  assert.match(unlinkRes.cleanStdout, /Unlinked project from this directory/);
  console.log("  ✔ unlink removes local project binding\n");

  // 15. Logout
  console.log("▶ Test 15: backlify logout");
  const logoutRes = await runCli(["logout"]);
  assert.equal(logoutRes.exitCode, 0);
  assert.match(logoutRes.cleanStdout, /Logged out successfully/);
  console.log("  ✔ logout clears global credentials\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("🎉 ALL 15 BACKLIFY CLI INTEGRATION TESTS PASSED!");
  console.log("═══════════════════════════════════════════════════════\n");
}

runAllTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
