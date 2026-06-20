import { backupFiles } from "../../schema/backup-file";

import { db, eq } from "../../index";

import { logger } from "shared/config/logger";


export interface BackupFile {

    id: string;

    backupJobId: string;

    fileName: string;

    filePath: string;

    fileSize: number;

    storageProvider: string;

    checksum: string;

    isEncrypted?: boolean;

}


export class BackupFileRepository {

    static async saveBackupFile(backupFile: BackupFile) {

        try {

            logger.info({backupFileId: backupFile.id}, "Saving backup file to database");

            const result = await db.insert(backupFiles).values({

                id: backupFile.id,

                backupJobId: backupFile.backupJobId,

                fileName: backupFile.fileName,

                filePath: backupFile.filePath,

                fileSize: backupFile.fileSize,

                storageProvider: backupFile.storageProvider,

                checksum: backupFile.checksum,

                isEncrypted: backupFile.isEncrypted ?? false,

                createdAt: new Date(),

                updatedAt: new Date(),

            }).returning({

                id: backupFiles.id,

                backupJobId: backupFiles.backupJobId,

                fileName: backupFiles.fileName,

                filePath: backupFiles.filePath,

                fileSize: backupFiles.fileSize,

                storageProvider: backupFiles.storageProvider,

                checksum: backupFiles.checksum,
                
                isEncrypted: backupFiles.isEncrypted,

                createdAt: backupFiles.createdAt,

                updatedAt: backupFiles.updatedAt,

            });

            logger.info({backupFileId: backupFile.id}, "Backup file saved");

            return result[0];

        } catch (error) {

            logger.error({backupFileId: backupFile.id, error}, "Failed to save backup file");

            throw error;

        }

    }


    static async getBackupFileById(backupFileId: string) {

        try {

            logger.info({backupFileId}, "Fetching backup file from database");

            const result = await db.select().from(backupFiles).where(eq(backupFiles.id, backupFileId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            logger.error({backupFileId, error}, "Failed to fetch backup file");

            throw error;

        }

    }

    static async getBackupFileByJobId(backupJobId: string) {

        try {

            logger.info({backupJobId}, "Fetching backup file by job ID");

            const result = await db.select().from(backupFiles).where(eq(backupFiles.backupJobId, backupJobId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            logger.error({backupJobId, error}, "Failed to fetch backup file");

            throw error;

        }

    }

    static async deleteBackupFileByJobId(backupJobId: string) {

        try {

            logger.info({ backupJobId }, "Deleting backup file record by job ID");

            const result = await db.delete(backupFiles).where(eq(backupFiles.backupJobId, backupJobId)).returning();

            return result[0];

        } catch (error) {

            logger.error({ backupJobId, error }, "Failed to delete backup file");

            throw error;

        }

    }

}
