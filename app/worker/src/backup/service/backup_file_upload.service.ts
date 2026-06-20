import { promises as fs } from "fs";

import { createHash } from "crypto";

import path from "path";

import { v4 as uuidv4 } from "uuid";

import { logger } from "shared/config/logger";

import { StorageService } from "shared/config/storage";

import { BackupFileRepository } from "db";

import { EncryptionService } from "../../shared/service/encryption.service";



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

    private storageService: StorageService;

    private encryptionService: EncryptionService;

    constructor() {

        this.storageService = new StorageService();

        this.encryptionService = new EncryptionService();

    }


    /**
     * After a successful pg_dump:
     * 1. Generate checksum
     * 2. Upload dump file to R2 cloud storage
     * 3. Save the cloud key as filePath in DB (storageProvider: "r2")
     * 4. Delete the local temp file
     * 
     * Falls back to local storage if cloud upload fails.
     */
    async saveBackupFile(options: BackupFileUploadOptions): Promise<BackupFileUploadResult> {

        const { jobId, filePath, fileSize } = options;

        try {

            // 1 verify file exists
            await fs.access(filePath);

            let finalFilePath = filePath;

            let finalFileSize = fileSize;

            let isEncrypted = false;

            let fileName = path.basename(filePath);


            // 1.5 Encrypt if enabled

            if (this.encryptionService.isEncryptionEnabled()) {

                const encryptedPath = `${filePath}.enc`;

                logger.info({ jobId, filePath, encryptedPath }, "Encrypting backup file");

                await this.encryptionService.encryptFile(filePath, encryptedPath);

                
                // Switch to using the encrypted file for upload and checksum

                finalFilePath = encryptedPath;

                fileName = `${fileName}.enc`;

                const stats = await fs.stat(encryptedPath);

                finalFileSize = stats.size;

                isEncrypted = true;

                
                // delete the original unencrypted file

                try {

                    await fs.unlink(filePath);

                } catch (e) {

                    logger.warn({ jobId, filePath, error: e }, "Failed to delete original unencrypted file");

                }

            }

            // 2 generate checksum for integrity verification
            const checksum = await this.generateChecksum(finalFilePath);

            logger.info({ jobId, checksum, isEncrypted }, "Generated backup file checksum");

            // 3 generate backup file id
            const backupFileId = `bkf-${uuidv4().substring(0, 12)}`;

            // 4 upload to cloud storage
            const cloudKey = `backups/${jobId}/${fileName}`;

            let storageProvider = "local";

            let storedPath = finalFilePath;

            try {

                logger.info({ jobId, cloudKey }, "Uploading backup file to cloud storage");

                await this.storageService.uploadFile(cloudKey, filePath);

                storageProvider = "r2";

                storedPath = cloudKey;

                logger.info({ jobId, cloudKey }, "Backup file uploaded to cloud storage");

                // 5 cleanup local temp file after successful upload
                try {

                    await fs.unlink(finalFilePath);

                    logger.info({ jobId, filePath: finalFilePath }, "Local temp file cleaned up");

                } catch (cleanupErr) {

                    logger.warn({ jobId, filePath, error: cleanupErr }, "Failed to cleanup local temp file (non-fatal)");

                }

            } catch (uploadErr) {

                logger.warn({ jobId, error: uploadErr }, "Cloud upload failed, falling back to local storage");

                // Keep local path as fallback
            }

            // 6 save record to database
            await BackupFileRepository.saveBackupFile({

                id: backupFileId,

                backupJobId: jobId,

                fileName,

                filePath: storedPath,

                fileSize: finalFileSize,

                storageProvider,

                checksum,

                isEncrypted,

            });

            logger.info({ jobId, backupFileId, fileName, fileSize, storageProvider }, "Backup file record saved");

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
