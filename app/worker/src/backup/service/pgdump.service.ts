import { spawn } from "child_process";

import { promises as fs } from "fs";

import path from "path";

import { logger } from "shared/config/logger";


export interface PgDumpOptions {

    databaseUrl: string;

    jobId: string;

    timeout?: number;

    onLog?: (line: string) => void;

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

        const { databaseUrl, jobId, timeout = 300000, onLog } = options;

        const backUpPath = this.generateBackupPath(jobId);

        const startTime = Date.now();

        try {

            await this.ensureTempDir();

            logger.info({ jobId, databaseUrl }, "Starting pg_dump process");

            const result = await this.spawnPgDump(databaseUrl, backUpPath, timeout, onLog);

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

    private parseConnectionString(dbUrl: string): { 
        host: string; 
        port: string; 
        database: string; 
        user: string; 
        password: string;
        sslmode?: string;
    } {

        const url = new URL(dbUrl);

        const sslmode = url.searchParams.get("sslmode") || undefined;
        
        return {
        
            host: url.hostname,
        
            port: url.port || "5432",
        
            database: decodeURIComponent(url.pathname.slice(1)),
        
            user: decodeURIComponent(url.username),
        
            password: decodeURIComponent(url.password),

            sslmode,
        
        };
    
    }

    private spawnPgDump( databaseUrl: string, outputFile: string, timeout: number, onLog?: (line: string) => void ): Promise<{ success: boolean; error?: string }> {

        return new Promise((resolve) => {

            let settled = false;

            const settle = (result: { success: boolean; error?: string }) => {

                if (settled) {

                    return;

                }

                settled = true;

                clearTimeout(timeoutHandle);

                resolve(result);

            };

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
                
            const spawnEnv: NodeJS.ProcessEnv = {

                ...process.env,
                
                PGPASSWORD: conn.password,
            
            };

            if (conn.sslmode) {
                
                spawnEnv.PGSSLMODE = conn.sslmode;
            
            }

            // spawn pg_dump process
            const backupProcess = spawn( pgDumpPath, args, {

                stdio: ["ignore", "pipe", "pipe"],

                timeout,

                env: spawnEnv,

            });

            let stderr = "";

            let timedOut = false;

            // capture stderr
            backupProcess.stderr.on("data", (data: Buffer) => {

                const text = data.toString();
                stderr += text;
                if (onLog) {
                    text.split(/\r?\n/).forEach((line) => {
                        const trimmed = line.trim();
                        if (trimmed) onLog(trimmed);
                    });
                }

            });

            // handle timeout
            const timeoutHandle = setTimeout(() => {

                timedOut = true;

                backupProcess.kill("SIGTERM");

            }, timeout);

            backupProcess.on("error", (error) => {

                settle({

                    success: false,

                    error: `failed to start pg_dump: ${error.message}`,

                });

            });

            // handle process close
            backupProcess.on('close', (code: number | null) => {

                if (timedOut) {

                    settle({
                
                        success: false,
                
                        error: `pg_dump timed out after ${timeout}ms`,
                
                    });
                
                    return;
                
                }

                
                if (code === 0) {

                    settle({ success: true });
                
                } else {

                    settle({
                
                        success: false,
                
                        error: `pg_dump failed with code ${code}: ${stderr}`,
                
                    });
                
                }
                
            });
            
            
        });

    }

}

export function parsePgDumpError(rawError: string): string {

    if (/could not translate host name/i.test(rawError) || /getaddrinfo/i.test(rawError)) {
    
        return "Database host not found (DNS error). Please verify your host in Project Settings.";
    
    }
    
    if (/password authentication failed/i.test(rawError)) {
    
        return "Database authentication failed. Please verify your database username and password.";
    
    }
    
    if (/Connection refused/i.test(rawError)) {
    
        return "Connection refused. Please ensure PostgreSQL is running and port 5432 is accessible.";
    
    }
    
    if (/SSL/i.test(rawError) && (/no pg_hba.conf/i.test(rawError) || /does not support SSL/i.test(rawError))) {
    
        return "SSL connection error. Check if your database requires ?sslmode=require.";
    
    }
    
    if (/database ".*" does not exist/i.test(rawError)) {
    
        return "Database name not found on the PostgreSQL server.";
    
    }
    
    return rawError;
    
}

