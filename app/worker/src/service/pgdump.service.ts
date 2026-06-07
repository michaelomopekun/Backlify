import { spawn } from "child_process";

import { promises as fs } from "fs";

import path from "path";

import { logger } from "../config/logger";


export interface PgDumpOptions {

    databaseUrl: string;

    jobId: string;

    timeout?: number;

}

export interface PgDumpResult {

    success: boolean;

    filePath?: string;

    fileSize?: number;

    duration?: number;

    error?: string;

}


export class PgDumpService {

    private readonly tempDir = path.join(process.cwd(), "src", "temp");

    async ensureTempDir() {

        try {

            await fs.mkdir(this.tempDir, { recursive: true});


        } catch (error) {

            logger.error(error, "Failed to create temp directory");

            throw new Error("Failed to create temp directory");

        }

    }

    private generateBackupPath(jobId: string): string {

        return path.join(this.tempDir, `backup_${jobId}.dump`);

    }

    async executePgDump(options: PgDumpOptions): Promise<PgDumpResult> {

        const { databaseUrl, jobId, timeout = 300000 } = options;

        const backUpPath = this.generateBackupPath(jobId);

        const startTime = Date.now();

        try {

            await this.ensureTempDir();

            logger.info({ jobId, databaseUrl }, "Starting pg_dump process");

            const result = await this.spawnPgDump(databaseUrl, backUpPath, timeout);

            if (!result.success) {

                logger.error({ jobId, error: result.error }, "pg_dump process failed");

                return {

                    success: false,

                    error: result.error,

                    duration: Date.now() - startTime,

                };

            }

            // fetch file size
            const stats = await fs.stat(backUpPath);

            const duration = Date.now() - startTime;

            logger.info({ jobId, filePath: backUpPath, fileSize: stats.size, duration }, "pg_dump process completed successfully");

            return {

                success: true,

                filePath: backUpPath,

                fileSize: stats.size,

                duration,

            };

        } catch (error) {

            logger.error({ jobId, error }, "pg_dump execution failed");

            try {

                await fs.unlink(backUpPath);

                logger.info({ jobId, filePath: backUpPath }, "Cleaned up backup file after failure");

            } catch (error) {

                logger.error("failed to cleanup backup file after failed execution")

            }

            return {

                success: false,

                error: error instanceof Error ? error.message : String(error),

                duration: Date.now() - startTime,

            }

        }

    }

    private parseConnectionString(dbUrl: string): { host: string; port: string; database: string; user: string; password: string } {

        const url = new URL(dbUrl);
        
        return {
        
            host: url.hostname,
        
            port: url.port,
        
            database: url.pathname.slice(1),
        
            user: url.username,
        
            password: url.password,
        
        };
    
    }

    private spawnPgDump( databaseUrl: string, outputFile: string, timeout: number ): Promise<{ success: boolean; error?: string }> {

        return new Promise((resolve) => {

            const pgDumpPath = process.env.PG_DUMP_PATH || 
                (process.platform === 'win32' ? 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe' : 'pg_dump');

            const conn = this.parseConnectionString(databaseUrl);

            const args = [
                '-h', conn.host,

                '-p', conn.port,
                
                '-U', conn.user,
                
                '-Fc',
                
                '-f', outputFile,
                
                conn.database,
            ];
                
            // spawn pg_dump process
            const backupProcess = spawn( pgDumpPath, args, {

                stdio: ["ignore", "pipe", "pipe"],

                timeout,

                env: {

                    ...process.env,

                    PGPASSWORD: conn.password,

                },

            });

            let stderr = "";

            let timedOut = false;

            // capture stderr
            backupProcess.stderr.on("data", (data: Buffer) => {

                stderr += data.toString();

            });

            // handle timeout
            const timeoutHandle = setTimeout(() => {

                timedOut = true;

                backupProcess.kill("SIGTERM");

            }, timeout);

            // handle process close
            backupProcess.on('close', (code: number | null) => {

                clearTimeout(timeoutHandle);

                if (timedOut) {
                
                    resolve({
                
                        success: false,
                
                        error: `pg_dump timed out after ${timeout}ms`,
                
                    });
                
                    return;
                
                }

                
                if (code === 0) {
                
                    resolve({ success: true });
                
                } else {
                
                    resolve({
                
                        success: false,
                
                        error: `pg_dump failed with code ${code}: ${stderr}`,
                
                    });
                
                }
                
            });
            
            
        });

    }

}

