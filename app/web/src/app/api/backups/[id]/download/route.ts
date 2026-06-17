import { NextRequest, NextResponse } from "next/server";

import { BackupRepository, BackupFileRepository } from "db";

import { StorageService } from "shared/config/storage";

import { promises as fs } from "fs";

import { createReadStream } from "fs";



export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {

        const { id } = await params;

        if (!id) {

            return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });

        }

        // 1 verify the backup job exists and is completed
        const job = await BackupRepository.getJobById(id);

        if (!job) {

            return NextResponse.json({ success: false, error: "Backup job not found" }, { status: 404 });

        }

        if (job.status !== "completed") {

            return NextResponse.json(
                { success: false, error: `Backup is not ready for download. Current status: ${job.status}` },
                { status: 400 }
            );

        }

        // 2 fetch backup file record
        const backupFile = await BackupFileRepository.getBackupFileByJobId(id);

        if (!backupFile) {

            return NextResponse.json({ success: false, error: "Backup file record not found" }, { status: 404 });

        }

        // 3 stream the file based on storage provider
        const headers = new Headers();

        headers.set("Content-Type", "application/octet-stream");

        headers.set("Content-Disposition", `attachment; filename="${backupFile.fileName}"`);

        if (backupFile.fileSize) {

            headers.set("Content-Length", String(backupFile.fileSize));

        }


        if (backupFile.storageProvider === "local") {

            // Local file: stream from disk
            try {

                await fs.access(backupFile.filePath);

            } catch {

                return NextResponse.json({ success: false, error: "Local backup file not found on disk" }, { status: 404 });

            }

            const nodeStream = createReadStream(backupFile.filePath);

            const webStream = new ReadableStream({

                start(controller) {

                    nodeStream.on("data", (chunk) => {

                        controller.enqueue(new Uint8Array(Buffer.from(chunk)));

                    });

                    nodeStream.on("end", () => {

                        controller.close();

                    });

                    nodeStream.on("error", (err) => {

                        controller.error(err);

                    });

                },

                cancel() {

                    nodeStream.destroy();

                },

            });

            return new Response(webStream, { headers });

        } else {

            // Cloud storage (R2/S3): stream from cloud
            const storageService = new StorageService();

            const { stream, contentLength } = await storageService.getFileStream(backupFile.filePath);

            if (contentLength) {

                headers.set("Content-Length", String(contentLength));

            }

            const webStream = new ReadableStream({

                start(controller) {

                    stream.on("data", (chunk) => {

                        controller.enqueue(new Uint8Array(Buffer.from(chunk)));

                    });

                    stream.on("end", () => {

                        controller.close();

                    });

                    stream.on("error", (err) => {

                        controller.error(err);

                    });

                },

                cancel() {

                    stream.destroy();

                },

            });

            return new Response(webStream, { headers });

        }

    } catch (error) {

        console.error("Failed to download backup:", error);

        return NextResponse.json({

            success: false,

            message: "Internal server error",

            details: error instanceof Error ? error.message : String(error)

        }, { status: 500 });

    }

}
