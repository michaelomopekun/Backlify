import { backupFiles } from "db/schema/backup-file";

import { db } from "db";

import { logger } from "../../config/logger";



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

        try{

            logger.info({ backupFile }, "Saving backup file to database");

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

            logger.info({ backupFile }, "Backup file saved");

            return result[0];

        } catch (error) {

            logger.error({ error, backupFile }, "Failed to save backup file");

            throw error;

        }

    }

}