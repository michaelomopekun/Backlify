import { redis } from "./redis";
import { logger } from "./logger";

export type TelemetryPhase =
  | "INIT"
  | "DUMP"
  | "DOWNLOAD"
  | "CHECKSUM"
  | "UPLOAD"
  | "RESTORE"
  | "INDEX"
  | "COMPLETE"
  | "ERROR";

export type TelemetryLevel = "info" | "warn" | "error" | "success";

export interface JobTelemetryEntry {
  jobId: string;
  timestamp: string;
  level: TelemetryLevel;
  phase: TelemetryPhase;
  message: string;
  progress?: number;
  metadata?: Record<string, any>;
}

export function getTelemetryHistoryKey(jobId: string): string {
  return `job-telemetry:${jobId}:history`;
}

export function getTelemetryChannelKey(jobId: string): string {
  return `job-telemetry:${jobId}:stream`;
}

/**
 * Emits a telemetry event: stores it in the Redis history buffer (24h retention)
 * and publishes it to the real-time pub/sub channel for live streaming SSE subscribers.
 */
export async function emitJobTelemetry(
  entry: Omit<JobTelemetryEntry, "timestamp"> & { timestamp?: string }
): Promise<void> {
  const fullEntry: JobTelemetryEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  const payload = JSON.stringify(fullEntry);
  const historyKey = getTelemetryHistoryKey(fullEntry.jobId);
  const channelKey = getTelemetryChannelKey(fullEntry.jobId);

  try {
    // 1. Append to history buffer and ensure 24h TTL
    await redis.rpush(historyKey, payload);
    await redis.expire(historyKey, 86400); // 24 hours

    // 2. Broadcast to live SSE subscribers
    await redis.publish(channelKey, payload);
  } catch (error) {
    logger.warn({ error, jobId: fullEntry.jobId }, "Failed to emit job telemetry to Redis");
  }
}

/**
 * Retrieves all buffered telemetry events for a given job.
 */
export async function getJobTelemetryHistory(jobId: string): Promise<JobTelemetryEntry[]> {
  const historyKey = getTelemetryHistoryKey(jobId);
  try {
    const rawList = await redis.lrange(historyKey, 0, -1);
    return rawList.map((item) => JSON.parse(item) as JobTelemetryEntry);
  } catch (error) {
    logger.warn({ error, jobId }, "Failed to fetch job telemetry history from Redis");
    return [];
  }
}
