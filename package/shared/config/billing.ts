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
    },
    PRO: {
      STORAGE_LIMIT_BYTES: 50 * 1024 * 1024 * 1024, // 50 GB
      STORAGE_LIMIT_LABEL: "50 GB",
      MAX_PROJECTS: 50,
      MAX_DAILY_BACKUPS: 24, // Hourly backups allowed
      RETENTION_DAYS: 30,
      CUSTOM_VAULT_ENABLED: true,
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
 * Returns human-readable storage quota string.
 */
export function getOrganizationStorageLimitLabel(org?: SubscriptionOwner | null): string {
  return isOrganizationPro(org)
    ? BILLING_CONFIG.QUOTAS.PRO.STORAGE_LIMIT_LABEL
    : BILLING_CONFIG.QUOTAS.FREE.STORAGE_LIMIT_LABEL;
}
