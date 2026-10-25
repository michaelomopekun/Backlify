import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

import { Readable } from "stream";
import { promises as fs } from "fs";
import { createReadStream, createWriteStream } from "fs";

/**
 * Storage configuration for custom Bring-Your-Own-Storage (BYOS) vaults.
 */
export interface CustomVaultConfig {
    provider?: string | null;
    endpoint?: string | null;
    region?: string | null;
    bucket?: string | null;
    accessKeyId?: string | null;
    secretAccessKey?: string | null;
}

// HMR-safe global singleton for Backlify managed storage
const globalForStorage = globalThis as unknown as {
    __storageClient?: S3Client;
};

function getManagedStorageClient(): S3Client {
    if (!globalForStorage.__storageClient) {
        const endpoint = process.env.STORAGE_ENDPOINT;
        const region = process.env.STORAGE_REGION || "auto";
        const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
        const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

        if (!endpoint || !accessKeyId || !secretAccessKey) {
            throw new Error(
                "Missing managed storage config. Set STORAGE_ENDPOINT, STORAGE_ACCESS_KEY_ID, and STORAGE_SECRET_ACCESS_KEY."
            );
        }

        globalForStorage.__storageClient = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            requestHandler: new NodeHttpHandler({
                connectionTimeout: 15000,
                requestTimeout: 300000,
            }),
        });
    }

    return globalForStorage.__storageClient;
}

function getManagedBucket(): string {
    const bucket = process.env.STORAGE_BUCKET;
    if (!bucket) {
        throw new Error("Missing STORAGE_BUCKET env var.");
    }
    return bucket;
}

export class StorageService {
    private client: S3Client;
    private bucket: string;
    public isCustom: boolean;

    constructor(customConfig?: CustomVaultConfig | null) {
        if (
            customConfig &&
            customConfig.bucket &&
            customConfig.accessKeyId &&
            customConfig.secretAccessKey
        ) {
            this.isCustom = true;
            this.bucket = customConfig.bucket;

            const provider = (customConfig.provider || "s3").toLowerCase();
            const isMinio = provider === "minio";

            const clientConfig: any = {
                region: customConfig.region || (provider === "r2" ? "auto" : "us-east-1"),
                credentials: {
                    accessKeyId: customConfig.accessKeyId,
                    secretAccessKey: customConfig.secretAccessKey,
                },
                requestHandler: new NodeHttpHandler({
                    connectionTimeout: 15000,
                    requestTimeout: 300000,
                }),
            };

            if (customConfig.endpoint && customConfig.endpoint.trim().length > 0) {
                clientConfig.endpoint = customConfig.endpoint.trim();
            }

            // MinIO or custom path-style endpoints
            if (isMinio || (clientConfig.endpoint && !clientConfig.endpoint.includes("amazonaws.com"))) {
                clientConfig.forcePathStyle = true;
            }

            this.client = new S3Client(clientConfig);
        } else {
            this.isCustom = false;
            this.client = getManagedStorageClient();
            this.bucket = getManagedBucket();
        }
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

    /**
     * Live test probe to verify bucket access, credentials, and connectivity.
     */
    static async testVaultConnection(
        config: CustomVaultConfig
    ): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
        const start = Date.now();
        try {
            if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
                return {
                    success: false,
                    error: "Bucket name, Access Key ID, and Secret Access Key are required.",
                };
            }

            const provider = (config.provider || "s3").toLowerCase();
            const clientConfig: any = {
                region: config.region || (provider === "r2" ? "auto" : "us-east-1"),
                credentials: {
                    accessKeyId: config.accessKeyId.trim(),
                    secretAccessKey: config.secretAccessKey.trim(),
                },
                requestHandler: new NodeHttpHandler({
                    connectionTimeout: 8000,
                    requestTimeout: 10000,
                }),
            };

            if (config.endpoint && config.endpoint.trim().length > 0) {
                clientConfig.endpoint = config.endpoint.trim();
            }

            if (provider === "minio" || (clientConfig.endpoint && !clientConfig.endpoint.includes("amazonaws.com"))) {
                clientConfig.forcePathStyle = true;
            }

            const client = new S3Client(clientConfig);

            // Test bucket connectivity with HeadBucket or ListObjectsV2
            try {
                await client.send(
                    new HeadBucketCommand({
                        Bucket: config.bucket.trim(),
                    })
                );
            } catch {
                // Some providers restrict HeadBucket; attempt ListObjects with limit 1 as fallback
                await client.send(
                    new ListObjectsV2Command({
                        Bucket: config.bucket.trim(),
                        MaxKeys: 1,
                    })
                );
            }

            const latencyMs = Date.now() - start;
            return { success: true, latencyMs };
        } catch (err: any) {
            const raw = err?.message || String(err);
            let friendlyError = raw;
            if (raw.includes("SignatureDoesNotMatch") || raw.includes("InvalidAccessKeyId")) {
                friendlyError = "Invalid Access Key ID or Secret Access Key. Check your credentials.";
            } else if (raw.includes("NoSuchBucket") || raw.includes("NotFound")) {
                friendlyError = `Bucket "${config.bucket}" does not exist or is not in this region/account.`;
            } else if (raw.includes("AccessDenied") || raw.includes("Forbidden")) {
                friendlyError = `Access Denied for bucket "${config.bucket}". Ensure your IAM user/token has s3:PutObject and s3:GetObject permissions.`;
            } else if (raw.includes("ENOTFOUND") || raw.includes("ECONNREFUSED")) {
                friendlyError = `Could not reach endpoint "${config.endpoint}". Verify the URL and network firewall.`;
            }

            return {
                success: false,
                latencyMs: Date.now() - start,
                error: friendlyError,
            };
        }
    }
}
