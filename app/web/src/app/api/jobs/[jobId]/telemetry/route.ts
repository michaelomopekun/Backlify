import { NextRequest } from "next/server";
import { redis } from "shared/config/redis";
import {
  getJobTelemetryHistory,
  getTelemetryChannelKey,
  JobTelemetryEntry,
} from "shared/config/job-telemetry";
import { authorizeBackupJob, authorizeRestoreJob } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return new Response(JSON.stringify({ error: "Job ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Authorize: Ensure user has permission to inspect this job's telemetry
  const backupAuth = await authorizeBackupJob(jobId, "member").catch(() => null);
  if (!backupAuth?.authorized) {
    const restoreAuth = await authorizeRestoreJob(jobId, "member").catch(() => null);
    if (!restoreAuth?.authorized) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You do not have access to view this job's telemetry stream." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  const channelKey = getTelemetryChannelKey(jobId);

  // Create isolated subscriber with fast timeout and error catcher to avoid unhandled error event crashes
  const subscriber = redis.duplicate({
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    retryStrategy: () => null, // Don't retry indefinitely on dead connection
  });

  subscriber.on("error", (err) => {
    // Suppress unhandled EventEmitter crash when Redis is offline or DNS fails
    console.warn("Telemetry subscriber connection notice:", err?.message || err);
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Stream might have closed
        }
      };

      const sendLog = (entry: JobTelemetryEntry) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(entry)}\n\n`)
          );
        } catch {
          // Stream might have closed
        }
      };

      // 1. Send connection established banner
      sendEvent("connected", { jobId, timestamp: new Date().toISOString() });

      // 2. Fetch and replay all historical logs buffered in Redis (if accessible)
      try {
        const history = await getJobTelemetryHistory(jobId);
        for (const entry of history) {
          sendLog(entry);
        }
      } catch (err) {
        console.warn("Failed to read telemetry history from Redis:", err);
      }

      // 3. Keepalive heartbeat interval (every 15s)
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // 4. Setup Redis pub/sub listener for live streaming events
      try {
        await subscriber.connect().catch((connErr) => {
          console.warn("Redis subscriber failed to connect:", connErr?.message || connErr);
        });

        if (subscriber.status === "ready") {
          await subscriber.subscribe(channelKey);

          subscriber.on("message", (channel, message) => {
            if (channel === channelKey) {
              try {
                const entry: JobTelemetryEntry = JSON.parse(message);
                sendLog(entry);

                // If job completed or errored, announce completion after a short buffer
                if (entry.phase === "COMPLETE" || entry.phase === "ERROR") {
                  sendEvent("done", { phase: entry.phase, timestamp: entry.timestamp });
                }
              } catch {
                // Raw text fallback
                controller.enqueue(encoder.encode(`data: ${message}\n\n`));
              }
            }
          });
        }
      } catch (subErr) {
        console.warn("Failed to subscribe to redis telemetry channel:", subErr);
      }

      // 5. Handle abort / client disconnection
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        try {
          subscriber.unsubscribe(channelKey).catch(() => {});
          subscriber.disconnect();
        } catch {}
      };

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      try {
        subscriber.disconnect();
      } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
