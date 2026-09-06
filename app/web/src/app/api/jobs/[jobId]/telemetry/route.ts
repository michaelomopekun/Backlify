import { NextRequest } from "next/server";
import { redis } from "shared/config/redis";
import {
  getJobTelemetryHistory,
  getTelemetryChannelKey,
  JobTelemetryEntry,
} from "shared/config/job-telemetry";

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

  const channelKey = getTelemetryChannelKey(jobId);
  const subscriber = redis.duplicate();

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

      // 2. Fetch and replay all historical logs buffered in Redis
      try {
        const history = await getJobTelemetryHistory(jobId);
        for (const entry of history) {
          sendLog(entry);
        }
      } catch (err) {
        console.error("Failed to read telemetry history:", err);
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
      } catch (subErr) {
        console.error("Failed to subscribe to redis telemetry channel:", subErr);
      }

      // 5. Handle abort / client disconnection
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        subscriber.unsubscribe(channelKey).catch(() => {});
        subscriber.disconnect();
      };

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      subscriber.disconnect();
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
