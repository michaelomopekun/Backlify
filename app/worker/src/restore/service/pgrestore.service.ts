import { spawn } from "child_process";

import { promises as fs } from "fs";

import path from "path";

import { logger } from "../../config/logger";


export interface PgRestoreOptions {

    backupFilePath: string;

    targetDatabaseUrl: string;

    jobId: string;

    timeout?: number;

}

export interface PgRestoreResult {

    success: boolean;

    duration?: number;

    error?: string;

}


export class PgRestoreService {

    async executePgRestore(options: PgRestoreOptions): Promise<PgRestoreResult> {

        const { backupFilePath, targetDatabaseUrl, jobId, timeout = 600000 } = options;

        const startTime = Date.now();

        try {

            // 1 verify the backup file exists before attempting restore
            await fs.access(backupFilePath);

            logger.info({ jobId, backupFilePath }, "Starting pg_restore process");

            // 2 run pg_restore
            const result = await this.spawnPgRestore(targetDatabaseUrl, backupFilePath, timeout);

            if (!result.success) {

                logger.error({ jobId, error: result.error }, "pg_restore process failed");

                return {

                    success: false,

                    error: result.error,

                    duration: Date.now() - startTime,

                };

            }

            const duration = Date.now() - startTime;

            logger.info({ jobId, duration }, "pg_restore process completed successfully");

            return {

                success: true,

                duration,

            };

        } catch (error) {

            logger.error({ jobId, error }, "pg_restore execution failed");

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

    private spawnPgRestore( targetDatabaseUrl: string, backupFilePath: string, timeout: number ): Promise<{ success: boolean; error?: string }> {

        return new Promise((resolve) => {

            const pgRestorePath = process.env.PG_RESTORE_PATH || 
                (process.platform === 'win32' ? 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_restore.exe' : 'pg_restore');

            const conn = this.parseConnectionString(targetDatabaseUrl);

            const args = [
                '-h', conn.host,

                '-p', conn.port,
                
                '-U', conn.user,
                
                '-d', conn.database,

                '--clean',

                '--if-exists',
                
                backupFilePath,
            ];
                
            // spawn pg_restore process
            const restoreProcess = spawn( pgRestorePath, args, {

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
            restoreProcess.stderr.on("data", (data: Buffer) => {

                stderr += data.toString();

            });

            // handle timeout
            const timeoutHandle = setTimeout(() => {

                timedOut = true;

                restoreProcess.kill("SIGTERM");

            }, timeout);

            // handle process close
            restoreProcess.on('close', (code: number | null) => {

                clearTimeout(timeoutHandle);

                if (timedOut) {
                
                    resolve({
                
                        success: false,
                
                        error: `pg_restore timed out after ${timeout}ms`,
                
                    });
                
                    return;
                
                }

                
                if (code === 0) {
                
                    resolve({ success: true });
                
                } else {
                
                    resolve({
                
                        success: false,
                
                        error: `pg_restore failed with code ${code}: ${stderr}`,
                
                    });
                
                }
                
            });
            
            
        });

    }

}
