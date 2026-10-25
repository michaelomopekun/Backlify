import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { PgDumpService } from "./pgdump.service";

export interface EngineDumpOptions {
  engine?: string;
  databaseUrl: string;
  jobId: string;
  timeout?: number;
  onLog?: (line: string) => void;
}

export interface EngineDumpResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  duration?: number;
  error?: string;
  engine: string;
}

export class EngineDumpService {
  private readonly tempDir = path.join(process.cwd(), "src", "temp");
  private readonly pgDumpService = new PgDumpService();

  async ensureTempDir() {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async inspectDatabaseSize(engine: string, databaseUrl: string): Promise<number | null> {
    if (engine === "postgres") {
      return this.pgDumpService.inspectDatabaseSize(databaseUrl);
    }

    // Default to null for other engines (will use standard fallback timeout)
    return null;
  }

  async executeDump(opts: EngineDumpOptions): Promise<EngineDumpResult> {
    await this.ensureTempDir();
    const engine = opts.engine || "postgres";

    if (engine === "postgres") {
      const pgResult = await this.pgDumpService.executePgDump({
        databaseUrl: opts.databaseUrl,
        jobId: opts.jobId,
        timeout: opts.timeout,
        onLog: opts.onLog,
      });

      return {
        ...pgResult,
        engine: "postgres",
      };
    }

    if (engine === "mysql") {
      return this.executeMysqlDump(opts);
    }

    if (engine === "mongodb") {
      return this.executeMongoDump(opts);
    }

    return {
      success: false,
      error: `Unsupported database engine for backup: ${engine}`,
      engine,
    };
  }

  /**
   * Executes MySQL dump using mysqldump.
   */
  private async executeMysqlDump(opts: EngineDumpOptions): Promise<EngineDumpResult> {
    const startTime = Date.now();
    const filePath = path.join(this.tempDir, `backup_${opts.jobId}.sql`);

    if (opts.onLog) opts.onLog(`[MySQL] Spawning mysqldump with --single-transaction --quick...`);

    const parsed = new URL(opts.databaseUrl.replace(/^mysqlx?:\/\//i, "http://"));
    const host = parsed.hostname;
    const port = parsed.port || "3306";
    const user = decodeURIComponent(parsed.username || "root");
    const password = decodeURIComponent(parsed.password || "");
    const database = parsed.pathname.replace(/^\//, "");

    const args = [
      `--host=${host}`,
      `--port=${port}`,
      `--user=${user}`,
      `--password=${password}`,
      "--single-transaction",
      "--quick",
      "--routines",
      "--triggers",
      "--hex-blob",
      database,
      `--result-file=${filePath}`,
    ];

    return new Promise((resolve) => {
      let stderr = "";
      const proc = spawn("mysqldump", args);

      proc.stderr.on("data", (d) => {
        const text = d.toString();
        stderr += text;
        if (opts.onLog) opts.onLog(text.trim());
      });

      proc.on("error", (err) => {
        resolve({
          success: false,
          error: `mysqldump binary not available or failed to execute: ${err.message}`,
          engine: "mysql",
        });
      });

      proc.on("close", async (code) => {
        if (code === 0) {
          try {
            const stat = await fs.stat(filePath);
            resolve({
              success: true,
              filePath,
              fileSize: stat.size,
              duration: Date.now() - startTime,
              engine: "mysql",
            });
          } catch (statErr: any) {
            resolve({ success: false, error: statErr.message, engine: "mysql" });
          }
        } else {
          resolve({
            success: false,
            error: stderr || `mysqldump failed with code ${code}`,
            engine: "mysql",
          });
        }
      });
    });
  }

  /**
   * Executes MongoDB dump using mongodump.
   */
  private async executeMongoDump(opts: EngineDumpOptions): Promise<EngineDumpResult> {
    const startTime = Date.now();
    const filePath = path.join(this.tempDir, `backup_${opts.jobId}.archive.gz`);

    if (opts.onLog) opts.onLog(`[MongoDB] Spawning mongodump with gzip archive stream...`);

    const args = [
      `--uri=${opts.databaseUrl}`,
      `--archive=${filePath}`,
      "--gzip",
    ];

    return new Promise((resolve) => {
      let stderr = "";
      const proc = spawn("mongodump", args);

      proc.stderr.on("data", (d) => {
        const text = d.toString();
        stderr += text;
        if (opts.onLog) opts.onLog(text.trim());
      });

      proc.on("error", (err) => {
        resolve({
          success: false,
          error: `mongodump binary not available: ${err.message}`,
          engine: "mongodb",
        });
      });

      proc.on("close", async (code) => {
        if (code === 0) {
          try {
            const stat = await fs.stat(filePath);
            resolve({
              success: true,
              filePath,
              fileSize: stat.size,
              duration: Date.now() - startTime,
              engine: "mongodb",
            });
          } catch (statErr: any) {
            resolve({ success: false, error: statErr.message, engine: "mongodb" });
          }
        } else {
          resolve({
            success: false,
            error: stderr || `mongodump failed with code ${code}`,
            engine: "mongodb",
          });
        }
      });
    });
  }
}
