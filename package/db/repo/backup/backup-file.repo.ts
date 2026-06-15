import { backupFiles } from "../../schema/backup-file";

import { db, eq } from "../../index";


export interface BackupFile {

    id: string;

    backupJobId: string;

    fileName: string;

    filePath: string;

    fileSize: number;

    storageProvider: string;

    checksum: string;

}


export class BackupFileRepository {

    static async saveBackupFile(backupFile: BackupFile) {

        try {

            console.log(`[DB] Saving backup file to database: ${backupFile.id}`);

            const result = await db.insert(backupFiles).values({

                id: backupFile.id,

                backupJobId: backupFile.backupJobId,

                fileName: backupFile.fileName,

                filePath: backupFile.filePath,

                fileSize: backupFile.fileSize,

                storageProvider: backupFile.storageProvider,

                checksum: backupFile.checksum,

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

                createdAt: backupFiles.createdAt,

                updatedAt: backupFiles.updatedAt,

            });

            console.log(`[DB] Backup file saved: ${backupFile.id}`);

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to save backup file ${backupFile.id}:`, error);

            throw error;

        }

    }


    static async getBackupFileById(backupFileId: string) {

        try {

            console.log(`[DB] Fetching backup file from database: ${backupFileId}`);

            const result = await db.select().from(backupFiles).where(eq(backupFiles.id, backupFileId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to fetch backup file ${backupFileId}:`, error);

            throw error;

        }

    }

    static async getBackupFileByJobId(backupJobId: string) {

        try {

            console.log(`[DB] Fetching backup file by job ID: ${backupJobId}`);

            const result = await db.select().from(backupFiles).where(eq(backupFiles.backupJobId, backupJobId));

            if (!result || result.length === 0) {

                return null;

            }

            return result[0];

        } catch (error) {

            console.error(`[DB] Failed to fetch backup file for job ${backupJobId}:`, error);

            throw error;

        }

    }

}
