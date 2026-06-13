import { promises as fs } from "fs";

import { createHash } from "crypto";

import path from "path";

import { v4 as uuidv4 } from "uuid";

import { logger } from "../../config/logger";

import { db } from "db";

import { backupFiles } from "db/schema/backup-file";


export interface BackupFileUploadOptions {

    jobId: string;

    filePath: string;

    fileSize: number;

}

export interface BackupFileUploadResult {

    success: boolean;

    backupFileId?: string;

    error?: string;

}


export class BackupFileUploadService {

    /**
     * After a successful pg_dump, save the backup file record to the database.
     * 
     * For now (Phase 4): stores the local temp path.
     * Phase 6: will upload to cloud storage (R2/S3) first, 
     *          then save the remote URL as filePath and cleanup the local temp file.
     */
    async saveBackupFile(options: BackupFileUploadOptions): Promise<BackupFileUploadResult> {

        const { jobId, filePath, fileSize } = options;

        try {

            // 1 verify file exists
            await fs.access(filePath);

            // 2 generate checksum for integrity verification
            const checksum = await this.generateChecksum(filePath);

            logger.info({ jobId, checksum }, "Generated backup file checksum");

            // 3 generate backup file id
            const backupFileId = `bkf-${uuidv4().substring(0, 12)}`;

            const fileName = path.basename(filePath);

            // 4 save record to database
            await db.insert(backupFiles).values({

                id: backupFileId,

                backupJobId: jobId,

                fileName,

                filePath,

                fileSize,

                storageProvider: "local",

                checksum,

            });

            logger.info({ jobId, backupFileId, fileName, fileSize }, "Backup file record saved");

            return {

                success: true,

                backupFileId,

            };

        } catch (error) {

            logger.error({ jobId, error }, "Failed to save backup file record");

            return {

                success: false,

                error: error instanceof Error ? error.message : String(error),

            };

        }

    }

    /**
     * Generate a SHA-256 checksum of the backup file.
     * Used for integrity verification during restore.
     */
    private async generateChecksum(filePath: string): Promise<string> {

        const fileBuffer = await fs.readFile(filePath);

        const hash = createHash("sha256");

        hash.update(fileBuffer);

        return hash.digest("hex");

    }

}
