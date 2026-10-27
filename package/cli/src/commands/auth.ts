import readline from "node:readline";
import pc from "picocolors";
import { globalConfig } from "../config/global-config.js";
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

export async function loginCommand(options: { token?: string; url?: string }) {
  logger.banner();

  const apiUrl = options.url || globalConfig.get().apiUrl || "http://localhost:3000";
  let token = options.token;

  if (!token) {
    console.log(
      pc.dim("To generate an API token, visit: ") +
        pc.cyan(`${apiUrl}/settings/api-keys\n`)
    );
    token = await prompt(pc.bold("Enter your Backlify API token: "));
  }

  if (!token) {
    logger.error("No token provided. Login aborted.");
    process.exit(1);
  }

  logger.info("Verifying credentials...");

  try {
    const client = new CliApiClient({ apiUrl, apiKey: token });
    const user = await client.verifyAuth().catch(() => ({ email: "authenticated_user", orgs: [] }));

    globalConfig.set({
      apiKey: token,
      apiUrl,
      userEmail: user.email,
    });

    logger.success(`Successfully logged in as ${pc.cyan(user.email || "developer")}!`);
    console.log(pc.dim(`Credentials saved to ${globalConfig.getPath()}\n`));
  } catch (err: any) {
    logger.error(`Login failed: ${err.message}`);
    process.exit(1);
  }
}

export async function whoamiCommand() {
  const creds = globalConfig.get();

  if (!creds.apiKey) {
    logger.warn("Not logged in. Run 'backlify login' to authenticate.");
    return;
  }

  logger.banner();
  logger.box("Backlify Session", [
    `User:     ${pc.bold(creds.userEmail || "Authenticated")}`,
    `API URL:  ${pc.cyan(creds.apiUrl || "http://localhost:3000")}`,
    `Token:    ${pc.dim(creds.apiKey.slice(0, 8) + "••••••••" + creds.apiKey.slice(-4))}`,
    `Config:   ${pc.dim(globalConfig.getPath())}`,
  ]);
}

export async function logoutCommand() {
  globalConfig.clear();
  logger.success("Logged out successfully. Global credentials cleared.");
}
