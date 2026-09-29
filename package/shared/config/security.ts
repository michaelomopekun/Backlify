import dns from "dns";
import net from "net";
import { logger } from "./logger";

/**
 * CIDR and IP range validation to prevent Server-Side Request Forgery (SSRF).
 * Blocks internal networks, loopback addresses, link-local metadata addresses,
 * carrier-grade NAT, and cloud metadata endpoints.
 */

// Prohibited IPv4 ranges: [startInt, endInt]
function ipToInt(ip: string): number {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

interface IPRange {
  name: string;
  start: number;
  end: number;
}

function cidrToRange(cidr: string, name: string): IPRange {
  const [ip, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  const ipInt = ipToInt(ip);
  const start = (ipInt & mask) >>> 0;
  const end = (start | ~mask) >>> 0;
  return { name, start, end };
}

const BLOCKED_IPV4_RANGES: IPRange[] = [
  cidrToRange("0.0.0.0/8", "Current network (RFC 1122)"),
  cidrToRange("10.0.0.0/8", "Private-Use network (RFC 1918)"),
  cidrToRange("100.64.0.0/10", "Shared Address Space / CGNAT (RFC 6598)"),
  cidrToRange("127.0.0.0/8", "Loopback address (RFC 1122)"),
  cidrToRange("169.254.0.0/16", "Link-Local / Cloud Metadata (RFC 3927)"),
  cidrToRange("172.16.0.0/12", "Private-Use network (RFC 1918)"),
  cidrToRange("192.0.0.0/24", "IETF Protocol Assignments (RFC 6890)"),
  cidrToRange("192.0.2.0/24", "TEST-NET-1 (RFC 5737)"),
  cidrToRange("192.88.99.0/24", "6to4 Relay Anycast (RFC 7526)"),
  cidrToRange("192.168.0.0/16", "Private-Use network (RFC 1918)"),
  cidrToRange("198.18.0.0/15", "Network Interconnect Device Benchmark (RFC 2544)"),
  cidrToRange("198.51.100.0/24", "TEST-NET-2 (RFC 5737)"),
  cidrToRange("203.0.113.0/24", "TEST-NET-3 (RFC 5737)"),
  cidrToRange("224.0.0.0/4", "Multicast (RFC 5771)"),
  cidrToRange("240.0.0.0/4", "Reserved for Future Use (RFC 1112)"),
  cidrToRange("255.255.255.255/32", "Limited Broadcast (RFC 919)"),
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
  "instance-data",
  "kubernetes.default",
  "kubernetes.default.svc",
]);

/**
 * Checks whether an IPv4 address falls into any blocked or private CIDR ranges.
 */
export function isBlockedIPv4(ip: string): { blocked: boolean; reason?: string } {
  const intVal = ipToInt(ip);
  for (const range of BLOCKED_IPV4_RANGES) {
    if (intVal >= range.start && intVal <= range.end) {
      return { blocked: true, reason: range.name };
    }
  }
  return { blocked: false };
}

/**
 * Checks whether an IPv6 address falls into blocked ranges (loopback, link-local, unique local).
 */
export function isBlockedIPv6(ip: string): { blocked: boolean; reason?: string } {
  const normalized = ip.toLowerCase();

  // Loopback (::1)
  if (normalized === "::1" || normalized === "0000:0000:0000:0000:0000:0000:0000:0001") {
    return { blocked: true, reason: "IPv6 Loopback" };
  }

  // Unspecified (::)
  if (normalized === "::" || normalized === "0000:0000:0000:0000:0000:0000:0000:0000") {
    return { blocked: true, reason: "IPv6 Unspecified" };
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.startsWith("::ffff:") || normalized.startsWith("0:0:0:0:0:ffff:")) {
    const ipv4Part = normalized.split(":").pop();
    if (ipv4Part && net.isIPv4(ipv4Part)) {
      return isBlockedIPv4(ipv4Part);
    }
  }

  // Unique Local Address (fc00::/7)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return { blocked: true, reason: "IPv6 Unique Local Address (RFC 4193)" };
  }

  // Link-Local (fe80::/10)
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return { blocked: true, reason: "IPv6 Link-Local Address (RFC 4291)" };
  }

  return { blocked: false };
}

/**
 * Resolves a hostname to its IP addresses and validates that none of the addresses
 * point to private, internal, or cloud metadata endpoints.
 */
export async function validateSafeHost(
  hostname: string,
  options?: { allowLocalInDev?: boolean }
): Promise<{ safe: boolean; error?: string; resolvedIp?: string }> {
  const allowLocal =
    options?.allowLocalInDev ??
    (process.env.NODE_ENV === "development" && process.env.ALLOW_LOCAL_TARGETS === "true");

  if (!hostname || typeof hostname !== "string") {
    return { safe: false, error: "Missing or invalid hostname." };
  }

  const cleanHost = hostname.trim().toLowerCase();

  // Remove bracket notation for IPv6: [::1] -> ::1
  const strippedHost = cleanHost.replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTNAMES.has(strippedHost)) {
    if (allowLocal && (strippedHost === "localhost" || strippedHost === "localhost.localdomain")) {
      return { safe: true, resolvedIp: "127.0.0.1" };
    }
    return {
      safe: false,
      error: `Security violation: connection to host "${cleanHost}" is restricted (cloud metadata / loopback).`,
    };
  }

  // 1. Direct IP check
  if (net.isIPv4(strippedHost)) {
    const check = isBlockedIPv4(strippedHost);
    if (check.blocked) {
      if (allowLocal && strippedHost.startsWith("127.")) {
        return { safe: true, resolvedIp: strippedHost };
      }
      return {
        safe: false,
        error: `Security violation: IP ${strippedHost} is restricted (${check.reason}). Targets must be publicly routable.`,
      };
    }
    return { safe: true, resolvedIp: strippedHost };
  }

  if (net.isIPv6(strippedHost)) {
    const check = isBlockedIPv6(strippedHost);
    if (check.blocked) {
      if (allowLocal && strippedHost === "::1") {
        return { safe: true, resolvedIp: strippedHost };
      }
      return {
        safe: false,
        error: `Security violation: IPv6 ${strippedHost} is restricted (${check.reason}).`,
      };
    }
    return { safe: true, resolvedIp: strippedHost };
  }

  // 2. DNS Resolution check (prevents DNS rebinding and private domain routing like 127.0.0.1.nip.io)
  try {
    const lookups = await dns.promises.lookup(strippedHost, { all: true });

    if (!lookups || lookups.length === 0) {
      return { safe: false, error: `Could not resolve hostname "${cleanHost}".` };
    }

    for (const record of lookups) {
      const { address, family } = record;
      if (family === 4) {
        const check = isBlockedIPv4(address);
        if (check.blocked) {
          if (allowLocal && address.startsWith("127.")) {
            continue;
          }
          return {
            safe: false,
            error: `Security violation: hostname "${cleanHost}" resolves to restricted IP ${address} (${check.reason}).`,
            resolvedIp: address,
          };
        }
      } else if (family === 6) {
        const check = isBlockedIPv6(address);
        if (check.blocked) {
          if (allowLocal && address === "::1") {
            continue;
          }
          return {
            safe: false,
            error: `Security violation: hostname "${cleanHost}" resolves to restricted IPv6 ${address} (${check.reason}).`,
            resolvedIp: address,
          };
        }
      }
    }

    return { safe: true, resolvedIp: lookups[0]?.address };
  } catch (dnsErr: any) {
    logger.warn({ host: cleanHost, error: dnsErr?.message }, "DNS lookup failed during SSRF validation");
    return {
      safe: false,
      error: `Could not resolve database/webhook hostname "${cleanHost}": ${dnsErr?.message || "DNS lookup failed"}`,
    };
  }
}

/**
 * Validates a PostgreSQL connection URL against SSRF and unauthorized network destinations.
 */
export async function validateSafeDatabaseUrl(
  databaseUrl: string,
  options?: { allowLocalInDev?: boolean }
): Promise<{ safe: boolean; error?: string; hostname?: string }> {
  try {
    if (!databaseUrl || typeof databaseUrl !== "string") {
      return { safe: false, error: "Database URL is required." };
    }

    const trimmed = databaseUrl.trim();
    if (!/^postgres(ql)?:\/\//i.test(trimmed)) {
      return {
        safe: false,
        error: "Invalid protocol. Connection string must begin with postgresql:// or postgres://",
      };
    }

    // Parse URL safely
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname;

    if (!hostname) {
      return { safe: false, error: "Database URL must include a valid hostname." };
    }

    const hostCheck = await validateSafeHost(hostname, options);
    if (!hostCheck.safe) {
      return { safe: false, error: hostCheck.error, hostname };
    }

    return { safe: true, hostname };
  } catch (err: any) {
    return { safe: false, error: err?.message || "Invalid database connection URL structure." };
  }
}

/**
 * Validates an HTTP/HTTPS Webhook URL against SSRF and internal routing.
 */
export async function validateSafeWebhookUrl(
  webhookUrl: string,
  options?: { allowLocalInDev?: boolean }
): Promise<{ safe: boolean; error?: string; parsedUrl?: URL }> {
  try {
    if (!webhookUrl || typeof webhookUrl !== "string") {
      return { safe: false, error: "Webhook URL is required." };
    }

    const trimmed = webhookUrl.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { safe: false, error: "Invalid webhook URL format. Must start with https:// or http://" };
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, error: "Webhook URL protocol must be http: or https:" };
    }

    const hostCheck = await validateSafeHost(parsed.hostname, options);
    if (!hostCheck.safe) {
      return { safe: false, error: hostCheck.error };
    }

    return { safe: true, parsedUrl: parsed };
  } catch (err: any) {
    return { safe: false, error: err?.message || "Invalid webhook URL." };
  }
}
