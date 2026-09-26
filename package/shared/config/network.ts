/**
 * Network configuration and static outbound egress IP for Backlify.
 * Used for customer firewall allowlists, AWS Security Groups, and pg_hba.conf rules.
 */

export const DEFAULT_BACKLIFY_EGRESS_IP = "52.204.14.88";

/**
 * Resolves Backlify's static public outbound IP address.
 * Priority:
 * 1. BACKLIFY_EGRESS_IP environment variable
 * 2. NEXT_PUBLIC_BACKLIFY_EGRESS_IP environment variable
 * 3. Default production fallback IP (52.204.14.88)
 */
export function getBacklifyEgressIp(): string {
  const customIp =
    (typeof process !== "undefined" && process.env?.BACKLIFY_EGRESS_IP) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BACKLIFY_EGRESS_IP);

  if (customIp && typeof customIp === "string" && customIp.trim().length > 0) {
    return customIp.trim();
  }

  return DEFAULT_BACKLIFY_EGRESS_IP;
}
