import fs from "node:fs";
import path from "node:path";

export interface ProjectConfig {
  projectId: string;
  projectName?: string;
  orgId?: string;
  databaseEngine?: string;
  environment?: string;
  createdAt?: string;
}

const CONFIG_DIR_NAME = ".backlify";
const CONFIG_FILE_NAME = "config.json";

export const projectConfig = {
  /**
   * Searches for .backlify/config.json in cwd or any ancestor directory.
   */
  find: (startDir: string = process.cwd()): { config: ProjectConfig; dir: string } | null => {
    let current = path.resolve(startDir);
    while (true) {
      const configPath = path.join(current, CONFIG_DIR_NAME, CONFIG_FILE_NAME);
      if (fs.existsSync(configPath)) {
        try {
          const raw = fs.readFileSync(configPath, "utf-8");
          const parsed = JSON.parse(raw);
          return { config: parsed, dir: current };
        } catch {
          return null;
        }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return null;
  },

  /**
   * Saves project configuration to .backlify/config.json in cwd.
   */
  save: (config: ProjectConfig, targetDir: string = process.cwd()): string => {
    const dirPath = path.join(targetDir, CONFIG_DIR_NAME);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, CONFIG_FILE_NAME);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
    return filePath;
  },

  /**
   * Removes local project link.
   */
  remove: (targetDir: string = process.cwd()): boolean => {
    const configPath = path.join(targetDir, CONFIG_DIR_NAME, CONFIG_FILE_NAME);
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      return true;
    }
    return false;
  },
};
