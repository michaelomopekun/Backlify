import {
  validateSafeHost,
  validateSafeDatabaseUrl,
  validateSafeWebhookUrl,
  isBlockedIPv4,
  isBlockedIPv6,
} from "../package/shared/config/security.ts";
import crypto from "crypto";

async function runTests() {
  console.log("=== Backlify Security & Defensive Backend Engineering Suite ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // --- 1. SSRF Protection Tests ---
  console.log("\n--- Testing SSRF & IP Validation ---");

  // Loopback
  assert(isBlockedIPv4("127.0.0.1").blocked, "IPv4 127.0.0.1 is blocked (Loopback)");
  assert(isBlockedIPv4("127.255.255.254").blocked, "IPv4 127.255.255.254 is blocked (Loopback CIDR)");
  assert(isBlockedIPv6("::1").blocked, "IPv6 ::1 is blocked (Loopback)");

  // Cloud Metadata
  assert(isBlockedIPv4("169.254.169.254").blocked, "AWS/GCP Metadata 169.254.169.254 is blocked");
  assert(isBlockedIPv4("169.254.1.1").blocked, "Link-Local 169.254.1.1 is blocked");

  // Private RFC 1918 Networks
  assert(isBlockedIPv4("10.0.0.1").blocked, "10.0.0.1 is blocked (RFC 1918 10/8)");
  assert(isBlockedIPv4("172.16.0.1").blocked, "172.16.0.1 is blocked (RFC 1918 172.16/12)");
  assert(isBlockedIPv4("172.31.255.254").blocked, "172.31.255.254 is blocked (RFC 1918 172.16/12)");
  assert(isBlockedIPv4("192.168.1.1").blocked, "192.168.1.1 is blocked (RFC 1918 192.168/16)");

  // CGNAT & Multicast
  assert(isBlockedIPv4("100.64.0.1").blocked, "100.64.0.1 is blocked (CGNAT RFC 6598)");
  assert(isBlockedIPv4("224.0.0.1").blocked, "224.0.0.1 is blocked (Multicast)");

  // Public IP
  assert(!isBlockedIPv4("8.8.8.8").blocked, "8.8.8.8 is allowed (Public DNS)");
  assert(!isBlockedIPv4("104.21.5.1").blocked, "104.21.5.1 is allowed (Public Cloudflare)");

  // Database URL SSRF Validation
  const localDbCheck = await validateSafeDatabaseUrl("postgresql://user:pass@127.0.0.1:5432/test");
  assert(!localDbCheck.safe, "Localhost database URL is rejected by SSRF validator");

  const metadataDbCheck = await validateSafeDatabaseUrl("postgresql://user:pass@169.254.169.254:5432/test");
  assert(!metadataDbCheck.safe, "Cloud metadata database URL is rejected by SSRF validator");

  const privateDbCheck = await validateSafeDatabaseUrl("postgresql://user:pass@10.0.1.50:5432/mydb");
  assert(!privateDbCheck.safe, "Internal RFC 1918 database URL is rejected by SSRF validator");

  const publicDbCheck = await validateSafeDatabaseUrl("postgresql://postgres:secret@cloudflare.com:5432/mydb");
  assert(publicDbCheck.safe, "Public database URL (cloudflare.com) is allowed");

  // Webhook URL SSRF Validation
  const localWebhook = await validateSafeWebhookUrl("http://127.0.0.1:8080/hook");
  assert(!localWebhook.safe, "Localhost webhook URL is rejected");

  const metadataWebhook = await validateSafeWebhookUrl("http://169.254.169.254/latest/meta-data/");
  assert(!metadataWebhook.safe, "AWS metadata webhook URL is rejected");

  const publicWebhook = await validateSafeWebhookUrl("https://discord.com/api/webhooks/123/xyz");
  assert(publicWebhook.safe, "Public Discord webhook URL is allowed");

  // --- 2. Constant-Time Webhook Verification ---
  console.log("\n--- Testing Constant-Time Webhook Verification ---");
  const secretKey = "test_paystack_secret_key_12345";
  const payload = JSON.stringify({ event: "charge.success", data: { reference: "ref_123" } });
  const validHash = crypto.createHmac("sha512", secretKey).update(payload).digest("hex");

  function verifyPaystackSignature(body, signature, secret) {
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    const hashBuf = Buffer.from(hash, "utf-8");
    const sigBuf = Buffer.from(signature, "utf-8");
    return hashBuf.length === sigBuf.length && crypto.timingSafeEqual(hashBuf, sigBuf);
  }

  assert(verifyPaystackSignature(payload, validHash, secretKey), "Valid webhook signature passes");
  assert(!verifyPaystackSignature(payload, "invalid_sig", secretKey), "Invalid webhook signature rejected");
  assert(
    !verifyPaystackSignature(payload, validHash.slice(0, -2) + "aa", secretKey),
    "Tampered signature rejected constant-time"
  );

  // --- 3. RBAC Hierarchy Tests ---
  console.log("\n--- Testing RBAC Role Hierarchy ---");
  const ROLE_HIERARCHY = { member: 1, admin: 2, owner: 3 };
  function hasMinRole(userRole, minRole) {
    return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 1);
  }

  assert(hasMinRole("owner", "owner"), "Owner has Owner privileges");
  assert(hasMinRole("owner", "admin"), "Owner has Admin privileges");
  assert(hasMinRole("owner", "member"), "Owner has Member privileges");

  assert(!hasMinRole("admin", "owner"), "Admin does not have Owner privileges");
  assert(hasMinRole("admin", "admin"), "Admin has Admin privileges");
  assert(hasMinRole("admin", "member"), "Admin has Member privileges");

  assert(!hasMinRole("member", "owner"), "Member does not have Owner privileges");
  assert(!hasMinRole("member", "admin"), "Member does not have Admin privileges");
  assert(hasMinRole("member", "member"), "Member has Member privileges");

  console.log(`\n==========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
