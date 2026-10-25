/**
 * Backlify Billing & Monetization Constants and Helpers
 * Purchasing Power Parity (PPP):
 * - International: $3 / month via Stripe
 * - Nigeria: ₦2,000 / month via Paystack
 */

export const BILLING_CONFIG = {
  STRIPE: {
    PRO_MONTHLY_PRICE_USD: 3, // $3.00
    CURRENCY: "usd",
  },
  PAYSTACK: {
    PRO_MONTHLY_PRICE_NGN: 2000, // ₦2,000
    PRO_MONTHLY_PRICE_KOBO: 200000, // Paystack operates in kobo (1 NGN = 100 Kobo)
    CURRENCY: "NGN",
  },
  QUOTAS: {
    FREE: {
      STORAGE_LIMIT_BYTES: 50 * 1024 * 1024, // 50 MB
      STORAGE_LIMIT_LABEL: "50 MB",
      MAX_PROJECTS: 2,
      MAX_DAILY_BACKUPS: 1,
      RETENTION_DAYS: 7,
      CUSTOM_VAULT_ENABLED: false,
      MAX_MONTHLY_DRILLS: 1, // 1 manual drill per calendar month for Free
      AUTO_DRILL_ON_BACKUP: false,
    },
    PRO: {
      STORAGE_LIMIT_BYTES: 50 * 1024 * 1024 * 1024, // 50 GB
      STORAGE_LIMIT_LABEL: "50 GB",
      MAX_PROJECTS: 50,
      MAX_DAILY_BACKUPS: 24, // Hourly backups allowed
      RETENTION_DAYS: 30,
      CUSTOM_VAULT_ENABLED: true,
      MAX_MONTHLY_DRILLS: Infinity, // Unlimited manual drills
      AUTO_DRILL_ON_BACKUP: true, // Automatic verification drill on every successful backup
    },
  },
} as const;

export interface SubscriptionOwner {
  plan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | string | null;
}

/**
 * Checks whether an organization is on the active Pro subscription plan.
 */
export function isOrganizationPro(org?: SubscriptionOwner | null): boolean {
  if (!org) return false;
  if (org.plan !== "pro") return false;

  // If status is explicitly canceled or past_due with past expiration date
  if (org.subscriptionStatus === "canceled") {
    if (org.subscriptionEndsAt) {
      const endsAt = new Date(org.subscriptionEndsAt).getTime();
      return endsAt > Date.now();
    }
    return false;
  }

  return true;
}

/**
 * Returns the effective storage quota limit in bytes for an organization.
 */
export function getOrganizationStorageLimitBytes(org?: SubscriptionOwner | null): number {
  return isOrganizationPro(org)
    ? BILLING_CONFIG.QUOTAS.PRO.STORAGE_LIMIT_BYTES
    : BILLING_CONFIG.QUOTAS.FREE.STORAGE_LIMIT_BYTES;
}

/**
 * Returns the maximum allowed connected projects/databases for an organization.
 */
export function getOrganizationMaxProjects(org?: SubscriptionOwner | null): number {
  return isOrganizationPro(org)
    ? BILLING_CONFIG.QUOTAS.PRO.MAX_PROJECTS
    : BILLING_CONFIG.QUOTAS.FREE.MAX_PROJECTS;
}

/**
 * Returns the maximum allowed disaster recovery drills per month for an organization.
 * Free tier includes 1 drill per calendar month; Pro is unlimited.
 */
export function getOrganizationMaxMonthlyDrills(org?: SubscriptionOwner | null): number {
  return isOrganizationPro(org) ? Infinity : 1;
}

/**
 * Checks whether an organization is entitled to automatic post-backup verification drills.
 * Exclusively available for Pro subscribers.
 */
export function canOrganizationAutoDrill(org?: SubscriptionOwner | null): boolean {
  return isOrganizationPro(org);
}

/**
 * Checks whether an organization is allowed to bring custom cloud storage (AWS S3, R2, GCS).
 */
export function canOrganizationUseCustomVault(org?: SubscriptionOwner | null): boolean {
  return isOrganizationPro(org);
}

/**
 * Checks whether an organization can invite team members (Solo Owner on Free, Unlimited on Pro).
 */
export function canOrganizationInviteMembers(org?: SubscriptionOwner | null): boolean {
  return isOrganizationPro(org);
}

/**
 * Validates whether a cron expression is permitted on the organization's plan.
 * Free plan permits daily (e.g. "0 2 * * *") or weekly/monthly runs, but disallows hourly ("0 * * * *", "* / 30", etc.).
 */
export function isCronAllowedForPlan(cronExpression: string, org?: SubscriptionOwner | null): boolean {
  if (isOrganizationPro(org)) return true;

  const trimmed = cronExpression.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) return false;

  const [, hour] = parts;
  // If hour field is "*" or has a step (like "*/2", "*/6"), it runs more than once a day -> requires Pro!
  if (hour === "*" || hour.includes("/") || hour.includes(",")) {
    return false;
  }

  // Daily or slower is allowed
  return true;
}
