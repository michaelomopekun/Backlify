import pc from "picocolors";

export const logger = {
  banner: () => {
    console.log(
      pc.bold(pc.yellow("⚡ Backlify CLI")) +
        pc.dim(" v1.0.0 — Database Recovery & Guarded Migrations\n")
    );
  },

  info: (msg: string) => {
    console.log(pc.cyan("ℹ") + " " + msg);
  },

  success: (msg: string) => {
    console.log(pc.green("✔") + " " + pc.bold(msg));
  },

  warn: (msg: string) => {
    console.log(pc.yellow("▲") + " " + pc.yellow(msg));
  },

  error: (msg: string) => {
    console.error(pc.red("✖") + " " + pc.red(msg));
  },

  step: (step: number, total: number, msg: string) => {
    console.log(
      pc.dim(`[${step}/${total}]`) + " " + pc.bold(msg)
    );
  },

  box: (title: string, lines: string[]) => {
    const maxLen = Math.max(title.length, ...lines.map((l) => l.length)) + 4;
    const border = pc.dim("─".repeat(maxLen));
    console.log("\n" + pc.dim("┌─ ") + pc.bold(pc.yellow(title)) + " " + pc.dim("─".repeat(Math.max(0, maxLen - title.length - 4)) + "┐"));
    for (const line of lines) {
      console.log(pc.dim("│ ") + line + " ".repeat(Math.max(0, maxLen - line.length - 2)) + pc.dim("│"));
    }
    console.log(pc.dim("└" + border.slice(1) + "┘\n"));
  },
};
