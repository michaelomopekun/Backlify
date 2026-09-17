/**
 * Utilities for calculating dynamic, size-aware timeouts for PostgreSQL backups and restores.
 * Replaces hardcoded static timeouts with adaptive scaling to prevent kills on multi-gigabyte databases.
 */

export interface DynamicTimeoutResult {
  /** Allocated timeout in milliseconds */
  timeoutMs: number;
  /** Allocated timeout in human-readable minutes */
  timeoutMinutes: number;
  /** Formatted size string e.g. "2.45 GB" or "Unknown" */
  estimatedSizeFormatted: string;
  /** Size in bytes if determined */
  sizeBytes?: number | null;
  /** Whether the timeout was dynamically calculated from an inspected database/archive size */
  isDynamic: boolean;
}

// ─── Default Configuration Constants ───────────────────────────────────────
// Backup defaults
const DEFAULT_BACKUP_MIN_MS = 10 * 60 * 1000;       // 10 minutes minimum floor
const DEFAULT_BACKUP_MS_PER_GB = 3 * 60 * 1000;     // +3 minutes per GB (~5.5 MB/s transfer)
const DEFAULT_BACKUP_FALLBACK_MS = 20 * 60 * 1000;   // 20 minutes if size query fails
const DEFAULT_BACKUP_MAX_MS = 3 * 60 * 60 * 1000;   // 3 hours maximum safety cap

// Restore defaults (restores are typically slower due to index builds and foreign key checks)
const DEFAULT_RESTORE_MIN_MS = 15 * 60 * 1000;      // 15 minutes minimum floor
const DEFAULT_RESTORE_MS_PER_GB = 4 * 60 * 1000;    // +4 minutes per GB archive
const DEFAULT_RESTORE_FALLBACK_MS = 25 * 60 * 1000;  // 25 minutes fallback
const DEFAULT_RESTORE_MAX_MS = 4 * 60 * 60 * 1000;  // 4 hours maximum cap

const ONE_GB_BYTES = 1024 * 1024 * 1024;

/**
 * Formats byte count to a clean human-readable string (B, KB, MB, GB, TB).
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || isNaN(bytes) || bytes < 0) return "Unknown";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);

  return `${val.toFixed(val >= 10 || i === 0 ? 1 : 2)} ${sizes[i]}`;
}

/**
 * Calculates a dynamic execution timeout for `pg_dump` based on source database size.
 *
 * Formula:
 *   timeout = MIN(MAX_CAP, MAX(MIN_FLOOR, MIN_FLOOR + (sizeGB * MS_PER_GB)))
 *
 * If size cannot be determined, falls back to `DEFAULT_BACKUP_FALLBACK_MS`.
 */
export function calculateDynamicBackupTimeout(
  sizeBytes?: number | null
): DynamicTimeoutResult {
  const minFloorMs = Number(process.env.BACKUP_MIN_TIMEOUT_MS) || DEFAULT_BACKUP_MIN_MS;
  const maxCapMs = Number(process.env.BACKUP_MAX_TIMEOUT_MS) || DEFAULT_BACKUP_MAX_MS;
  const fallbackMs = Number(process.env.BACKUP_DEFAULT_TIMEOUT_MS) || DEFAULT_BACKUP_FALLBACK_MS;
  const msPerGb = Number(process.env.BACKUP_MS_PER_GB) || DEFAULT_BACKUP_MS_PER_GB;

  if (sizeBytes == null || isNaN(sizeBytes) || sizeBytes <= 0) {
    const timeoutMs = Math.min(maxCapMs, Math.max(minFloorMs, fallbackMs));
    return {
      timeoutMs,
      timeoutMinutes: Math.round(timeoutMs / 60000),
      estimatedSizeFormatted: "Unknown",
      sizeBytes: null,
      isDynamic: false,
    };
  }

  const sizeGB = sizeBytes / ONE_GB_BYTES;
  const calculatedMs = Math.round(minFloorMs + sizeGB * msPerGb);
  const timeoutMs = Math.min(maxCapMs, Math.max(minFloorMs, calculatedMs));

  return {
    timeoutMs,
    timeoutMinutes: Math.round(timeoutMs / 60000),
    estimatedSizeFormatted: formatBytes(sizeBytes),
    sizeBytes,
    isDynamic: true,
  };
}

/**
 * Calculates a dynamic execution timeout for `pg_restore` based on snapshot archive size.
 */
export function calculateDynamicRestoreTimeout(
  archiveSizeBytes?: number | null
): DynamicTimeoutResult {
  const minFloorMs = Number(process.env.RESTORE_MIN_TIMEOUT_MS) || DEFAULT_RESTORE_MIN_MS;
  const maxCapMs = Number(process.env.RESTORE_MAX_TIMEOUT_MS) || DEFAULT_RESTORE_MAX_MS;
  const fallbackMs = Number(process.env.RESTORE_DEFAULT_TIMEOUT_MS) || DEFAULT_RESTORE_FALLBACK_MS;
  const msPerGb = Number(process.env.RESTORE_MS_PER_GB) || DEFAULT_RESTORE_MS_PER_GB;

  if (archiveSizeBytes == null || isNaN(archiveSizeBytes) || archiveSizeBytes <= 0) {
    const timeoutMs = Math.min(maxCapMs, Math.max(minFloorMs, fallbackMs));
    return {
      timeoutMs,
      timeoutMinutes: Math.round(timeoutMs / 60000),
      estimatedSizeFormatted: "Unknown",
      sizeBytes: null,
      isDynamic: false,
    };
  }

  const sizeGB = archiveSizeBytes / ONE_GB_BYTES;
  const calculatedMs = Math.round(minFloorMs + sizeGB * msPerGb);
  const timeoutMs = Math.min(maxCapMs, Math.max(minFloorMs, calculatedMs));

  return {
    timeoutMs,
    timeoutMinutes: Math.round(timeoutMs / 60000),
    estimatedSizeFormatted: formatBytes(archiveSizeBytes),
    sizeBytes: archiveSizeBytes,
    isDynamic: true,
  };
}
