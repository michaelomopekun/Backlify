import {

    S3Client,

    PutObjectCommand,

    GetObjectCommand,

    DeleteObjectCommand,

} from "@aws-sdk/client-s3";

import { Readable } from "stream";

import { promises as fs } from "fs";

import { createReadStream, createWriteStream } from "fs";



/**
 * S3-compatible storage client for Cloudflare R2.
 * 
 * Required env vars:
 *   STORAGE_ENDPOINT      — R2 endpoint (e.g. https://<account_id>.r2.cloudflarestorage.com)
 *   STORAGE_REGION        — "auto" for R2
 *   STORAGE_ACCESS_KEY_ID
 *   STORAGE_SECRET_ACCESS_KEY
 *   STORAGE_BUCKET        — bucket name
 */


// HMR-safe global singleton (same pattern as redis.ts)
const globalForStorage = globalThis as unknown as {

    __storageClient?: S3Client;

};


function getStorageClient(): S3Client {

    if (!globalForStorage.__storageClient) {

        const endpoint = process.env.STORAGE_ENDPOINT;

        const region = process.env.STORAGE_REGION || "auto";

        const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;

        const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;


        if (!endpoint || !accessKeyId || !secretAccessKey) {

            throw new Error(
                "Missing storage config. Set STORAGE_ENDPOINT, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY."
            );

        }

        globalForStorage.__storageClient = new S3Client({

            endpoint,

            region,

            credentials: {

                accessKeyId,

                secretAccessKey,

            },

        });

    }

    return globalForStorage.__storageClient;

}


function getBucket(): string {

    const bucket = process.env.STORAGE_BUCKET;

    if (!bucket) {

        throw new Error("Missing STORAGE_BUCKET env var.");

    }

    return bucket;

}



export class StorageService {

    private client: S3Client;

    private bucket: string;


    constructor() {

        this.client = getStorageClient();

        this.bucket = getBucket();

    }


    /**
     * Upload a local file to cloud storage.
     * Uses streaming to handle large dump files without loading into memory.
     */
    async uploadFile(key: string, localFilePath: string): Promise<void> {

        const fileStream = createReadStream(localFilePath);

        const stats = await fs.stat(localFilePath);

        await this.client.send(
            new PutObjectCommand({

                Bucket: this.bucket,

                Key: key,

                Body: fileStream,

                ContentLength: stats.size,

                ContentType: "application/octet-stream",

            })
        );

    }


    /**
     * Download a file from cloud storage to a local path.
     * Streams directly to disk — safe for large dump files.
     */
    async downloadFile(key: string, destPath: string): Promise<void> {

        const response = await this.client.send(
            new GetObjectCommand({

                Bucket: this.bucket,

                Key: key,

            })
        );

        if (!response.Body) {

            throw new Error(`Empty response body for key: ${key}`);

        }

        const readableStream = response.Body as Readable;

        return new Promise((resolve, reject) => {

            const writeStream = createWriteStream(destPath);

            readableStream.pipe(writeStream);

            writeStream.on("finish", resolve);

            writeStream.on("error", reject);

            readableStream.on("error", reject);

        });

    }


    /**
     * Get a readable stream for a cloud object.
     * Used by the download API to stream to the HTTP response.
     */
    async getFileStream(key: string): Promise<{ stream: Readable; contentLength?: number }> {

        const response = await this.client.send(
            new GetObjectCommand({

                Bucket: this.bucket,

                Key: key,

            })
        );

        if (!response.Body) {

            throw new Error(`Empty response body for key: ${key}`);

        }

        return {

            stream: response.Body as Readable,

            contentLength: response.ContentLength,

        };

    }


    /**
     * Delete an object from cloud storage.
     */
    async deleteFile(key: string): Promise<void> {

        await this.client.send(
            new DeleteObjectCommand({

                Bucket: this.bucket,

                Key: key,

            })
        );

    }

}
