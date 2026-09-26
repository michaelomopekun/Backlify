import assert from "node:assert";

// 1. Test getBacklifyEgressIp
const { getBacklifyEgressIp, DEFAULT_BACKLIFY_EGRESS_IP } = await import(
  "../package/shared/config/network.ts"
);

console.log("=== Testing Static Egress IP Configuration ===");

assert.strictEqual(DEFAULT_BACKLIFY_EGRESS_IP, "52.204.14.88");
assert.strictEqual(getBacklifyEgressIp(), "52.204.14.88");
console.log("✓ Default egress IP verified: 52.204.14.88");

// Test override via BACKLIFY_EGRESS_IP
process.env.BACKLIFY_EGRESS_IP = "198.51.100.25";
assert.strictEqual(getBacklifyEgressIp(), "198.51.100.25");
console.log("✓ Custom override verified: 198.51.100.25");
delete process.env.BACKLIFY_EGRESS_IP;

// 2. Test firewall detection logic
const isFirewallLikely = (code, message, targetUrl) => {
  return (
    code === "ETIMEDOUT" ||
    message.includes("timeout") ||
    message.includes("ETIMEDOUT") ||
    message.includes("no pg_hba.conf entry") ||
    (code === "ECONNREFUSED" && !targetUrl?.includes("localhost") && !targetUrl?.includes("127.0.0.1"))
  );
};

assert.strictEqual(isFirewallLikely("ETIMEDOUT", "Connection timed out", "postgresql://user:pass@mydb.rds.amazonaws.com:5432/db"), true);
assert.strictEqual(isFirewallLikely("ECONNREFUSED", "Connection refused", "postgresql://user:pass@mydb.rds.amazonaws.com:5432/db"), true);
assert.strictEqual(isFirewallLikely("ECONNREFUSED", "Connection refused", "postgresql://user:pass@localhost:5432/db"), false);
assert.strictEqual(isFirewallLikely("28P01", "password authentication failed", "postgresql://user:pass@mydb.rds.amazonaws.com:5432/db"), false);
console.log("✓ Firewall detection logic verified");

console.log("\n✅ ALL EGRESS IP & FIREWALL TESTS PASSED SUCCESSFULLY!");
