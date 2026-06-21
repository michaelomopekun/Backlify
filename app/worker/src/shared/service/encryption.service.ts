import crypto from "crypto";
 
import { createReadStream, createWriteStream } from "fs";
 
import { promises as fs } from "fs";
 
import { pipeline } from "stream/promises";
 
 
 
export class EncryptionService {
 
    private algorithm = "aes-256-gcm";
 
    private key: Buffer;
 
 
    constructor() {
 
        const keyString = process.env.BACKUP_ENCRYPTION_KEY;
 
        if (keyString) {
 
            // Must be 32 bytes for aes-256-gcm
 
            if (Buffer.from(keyString, 'hex').length !== 32) {
 
                throw new Error("BACKUP_ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters).");
 
            }
 
            this.key = Buffer.from(keyString, 'hex');
 
        } else {
 
            this.key = Buffer.alloc(0); // Will not be used if not configured
 
        }
 
    }
 
 
    public isEncryptionEnabled(): boolean {
 
        return this.key.length > 0;
 
    }
 
 
    /**
     * Encrypts a file using aes-256-gcm.
     * Appends the 16-byte IV and 16-byte Auth Tag to the end of the encrypted file.
     */
    public async encryptFile(inputPath: string, outputPath: string): Promise<void> {
 
        if (!this.isEncryptionEnabled()) {
 
            throw new Error("Encryption is not enabled. Missing BACKUP_ENCRYPTION_KEY.");
 
        }
 
 
        const iv = crypto.randomBytes(16);
 
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;
 
 
        const inputStream = createReadStream(inputPath);
 
        const outputStream = createWriteStream(outputPath);
 
 
        await pipeline(inputStream, cipher, outputStream);
 
 
        // Get auth tag after pipeline finishes (cipher must be closed)
 
        const authTag = cipher.getAuthTag();
 
 
        // Append IV and Auth Tag to the output file
 
        await fs.appendFile(outputPath, iv);
 
        await fs.appendFile(outputPath, authTag);
 
    }
 
 
    /**
     * Decrypts a file using aes-256-gcm.
     * Extracts the 16-byte IV and 16-byte Auth Tag from the end of the encrypted file.
     */
    public async decryptFile(inputPath: string, outputPath: string): Promise<void> {
 
        if (!this.isEncryptionEnabled()) {
 
            throw new Error("Encryption is not enabled. Missing BACKUP_ENCRYPTION_KEY.");
 
        }
 
 
        const stats = await fs.stat(inputPath);
 
        const fileSize = stats.size;
 
        
        if (fileSize < 32) {
 
            throw new Error("Encrypted file is too small to contain IV and Auth Tag.");
 
        }
 
 
        const ivBuffer = Buffer.alloc(16);
 
        const authTagBuffer = Buffer.alloc(16);
 
 
        // Read IV and Auth Tag from the end of the file
 
        const fileHandle = await fs.open(inputPath, 'r');
 
        await fileHandle.read(ivBuffer, 0, 16, fileSize - 32);
 
        await fileHandle.read(authTagBuffer, 0, 16, fileSize - 16);
 
        await fileHandle.close();
 
 
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer) as crypto.DecipherGCM;
 
        decipher.setAuthTag(authTagBuffer);
 
 
        // We need to read only the encrypted data, excluding IV and Auth Tag
 
        const inputStream = createReadStream(inputPath, { end: fileSize - 33 });
 
        const outputStream = createWriteStream(outputPath);
 
 
        await pipeline(inputStream, decipher, outputStream);
 
    }
 
}
 
