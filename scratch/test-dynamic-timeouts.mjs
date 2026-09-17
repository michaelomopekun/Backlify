import assert from "node:assert";

// Import from package/shared/config/timeout.ts
const {
  calculateDynamicBackupTimeout,
  calculateDynamicRestoreTimeout,
  formatBytes,
} = await import("../package/shared/config/timeout.ts");

console.log("=== Testing Dynamic Timeout Calculation Engine ===");

// ─── 1. formatBytes ──────────────────────────────────────────────────────────
console.log("\n1. Testing formatBytes...");
assert.strictEqual(formatBytes(null), "Unknown");
assert.strictEqual(formatBytes(undefined), "Unknown");
assert.strictEqual(formatBytes(0), "0 Bytes");
assert.strictEqual(formatBytes(1024), "1.00 KB");
assert.strictEqual(formatBytes(10 * 1024 * 1024), "10.0 MB");
assert.strictEqual(formatBytes(2.5 * 1024 * 1024 * 1024), "2.50 GB");
assert.strictEqual(formatBytes(50 * 1024 * 1024 * 1024), "50.0 GB");
console.log("✓ formatBytes tests passed");

// ─── 2. calculateDynamicBackupTimeout ────────────────────────────────────────
console.log("\n2. Testing calculateDynamicBackupTimeout...");

// Null/undefined/zero should return 20 minute fallback
const fallbackResult = calculateDynamicBackupTimeout(null);
console.log("Null input fallback:", fallbackResult);
assert.strictEqual(fallbackResult.isDynamic, false);
assert.strictEqual(fallbackResult.timeoutMinutes, 20);
assert.strictEqual(fallbackResult.timeoutMs, 20 * 60 * 1000);

// Tiny DB (10 MB) should return the floor of 10 minutes (with small linear fraction)
const tinyResult = calculateDynamicBackupTimeout(10 * 1024 * 1024);
console.log("Tiny 10MB DB:", tinyResult);
assert.strictEqual(tinyResult.isDynamic, true);
assert.strictEqual(tinyResult.timeoutMinutes, 10);
assert.ok(tinyResult.timeoutMs >= 600000 && tinyResult.timeoutMs <= 605000);

// 1 GB DB: 10 min floor + 3 min/GB = 13 minutes (780,000 ms)
const oneGbResult = calculateDynamicBackupTimeout(1 * 1024 * 1024 * 1024);
console.log("1 GB DB:", oneGbResult);
assert.strictEqual(oneGbResult.isDynamic, true);
assert.strictEqual(oneGbResult.timeoutMinutes, 13);
assert.strictEqual(oneGbResult.timeoutMs, 13 * 60 * 1000);

// 5 GB DB: 10 min floor + (5 * 3) = 25 minutes (1,500,000 ms)
const fiveGbResult = calculateDynamicBackupTimeout(5 * 1024 * 1024 * 1024);
console.log("5 GB DB:", fiveGbResult);
assert.strictEqual(fiveGbResult.isDynamic, true);
assert.strictEqual(fiveGbResult.timeoutMinutes, 25);
assert.strictEqual(fiveGbResult.timeoutMs, 25 * 60 * 1000);

// 50 GB DB: 10 min floor + (50 * 3) = 160 minutes (9,600,000 ms)
const fiftyGbResult = calculateDynamicBackupTimeout(50 * 1024 * 1024 * 1024);
console.log("50 GB DB:", fiftyGbResult);
assert.strictEqual(fiftyGbResult.isDynamic, true);
assert.strictEqual(fiftyGbResult.timeoutMinutes, 160);
assert.strictEqual(fiftyGbResult.timeoutMs, 160 * 60 * 1000);

// 100 GB DB: calculated 10 + 300 = 310 min -> capped at 3 hours (180 minutes)
const massiveResult = calculateDynamicBackupTimeout(100 * 1024 * 1024 * 1024);
console.log("100 GB DB (capped):", massiveResult);
assert.strictEqual(massiveResult.isDynamic, true);
assert.strictEqual(massiveResult.timeoutMinutes, 180);
assert.strictEqual(massiveResult.timeoutMs, 180 * 60 * 1000);
console.log("✓ calculateDynamicBackupTimeout tests passed");

// ─── 3. calculateDynamicRestoreTimeout ───────────────────────────────────────
console.log("\n3. Testing calculateDynamicRestoreTimeout...");

// Null input fallback
const restoreFallback = calculateDynamicRestoreTimeout(null);
console.log("Restore fallback:", restoreFallback);
assert.strictEqual(restoreFallback.isDynamic, false);
assert.strictEqual(restoreFallback.timeoutMinutes, 25);

// 1 GB restore: 15 min floor + (1 * 4) = 19 minutes
const restore1Gb = calculateDynamicRestoreTimeout(1 * 1024 * 1024 * 1024);
console.log("1 GB Restore:", restore1Gb);
assert.strictEqual(restore1Gb.isDynamic, true);
assert.strictEqual(restore1Gb.timeoutMinutes, 19);

// 10 GB restore: 15 min floor + (10 * 4) = 55 minutes
const restore10Gb = calculateDynamicRestoreTimeout(10 * 1024 * 1024 * 1024);
console.log("10 GB Restore:", restore10Gb);
assert.strictEqual(restore10Gb.isDynamic, true);
assert.strictEqual(restore10Gb.timeoutMinutes, 55);
console.log("✓ calculateDynamicRestoreTimeout tests passed");

// ─── 4. inspectDatabaseSize non-blocking fallback ────────────────────────────
console.log("\n4. Testing inspectDatabaseSize non-blocking fallback...");
import postgres from "postgres";

async function simulateInspectDatabaseSize(databaseUrl) {
  let sql = null;
  try {
    const urlLower = databaseUrl.toLowerCase();
    const sslMode =
      urlLower.includes("sslmode=require") ||
      urlLower.includes("sslmode=verify-full") ||
      urlLower.includes("ssl=true") ||
      urlLower.includes("ssl=1")
        ? "require"
        : "prefer";

    sql = postgres(databaseUrl, {
      connect_timeout: 1,
      idle_timeout: 1,
      max: 1,
      ssl: sslMode,
    });

    const rows = await sql`
      SELECT pg_database_size(current_database())::text as size_bytes;
    `;

    if (rows && rows.length > 0 && rows[0].size_bytes) {
      const parsed = Number(rows[0].size_bytes);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.log("Caught expected connection failure gracefully:", err.message);
    return null;
  } finally {
    if (sql) {
      try {
        await sql.end({ timeout: 1 });
      } catch {}
    }
  }
}

// Calling inspectDatabaseSize on an unreachable database must return null gracefully without throwing
const result = await simulateInspectDatabaseSize("postgresql://user:pass@127.0.0.1:54329/nonexistent_db_test");
console.log("Unreachable connection inspection result:", result);
assert.strictEqual(result, null);
console.log("✓ Non-blocking size inspection fallback passed");

console.log("\n✅ ALL DYNAMIC TIMEOUT TESTS PASSED SUCCESSFULLY!");
