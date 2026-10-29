"use client";

import { useState, useEffect } from "react";

export type BillingPeriod = "monthly" | "annual";

export const CLIENT_BILLING_CONFIG = {
  STRIPE: {
    PRO_MONTHLY_PRICE_USD: 3,
    PRO_ANNUAL_PRICE_USD: 30,
    CURRENCY: "usd",
  },
  PAYSTACK: {
    PRO_MONTHLY_PRICE_NGN: 2000,
    PRO_ANNUAL_PRICE_NGN: 20000,
    CURRENCY: "NGN",
  },
} as const;

export interface PlanIntervalPricing {
  price: number;
  priceFormatted: string;
  priceWithPeriod: string;
  priceShort: string;
}

export interface AnnualPlanPricing extends PlanIntervalPricing {
  effectiveMonthlyPrice: number;
  effectiveMonthlyFormatted: string;
  savingsBadge: string;
  savingsPercentage: string;
}

export interface LocalizedPricing {
  currency: "NGN" | "USD";
  gateway: "paystack" | "stripe";
  symbol: string;
  // Backwards-compatible shortcuts (default monthly)
  price: number;
  priceFormatted: string;
  priceWithPeriod: string;
  priceShort: string;
  // Detailed intervals
  monthly: PlanIntervalPricing;
  annual: AnnualPlanPricing;
  isLoading: boolean;
}

const NGN_CONFIG: Omit<LocalizedPricing, "isLoading"> = {
  currency: "NGN",
  gateway: "paystack",
  symbol: "₦",
  price: CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN,
  priceFormatted: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN.toLocaleString()}`,
  priceWithPeriod: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN.toLocaleString()} / month`,
  priceShort: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN.toLocaleString()}/mo`,
  monthly: {
    price: CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN,
    priceFormatted: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN.toLocaleString()}`,
    priceWithPeriod: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN.toLocaleString()} / month`,
    priceShort: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_NGN.toLocaleString()}/mo`,
  },
  annual: {
    price: CLIENT_BILLING_CONFIG.PAYSTACK.PRO_ANNUAL_PRICE_NGN,
    effectiveMonthlyPrice: Math.round(CLIENT_BILLING_CONFIG.PAYSTACK.PRO_ANNUAL_PRICE_NGN / 12),
    priceFormatted: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_ANNUAL_PRICE_NGN.toLocaleString()}`,
    priceWithPeriod: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_ANNUAL_PRICE_NGN.toLocaleString()} / year`,
    priceShort: `₦${CLIENT_BILLING_CONFIG.PAYSTACK.PRO_ANNUAL_PRICE_NGN.toLocaleString()}/yr`,
    effectiveMonthlyFormatted: `₦${Math.round(CLIENT_BILLING_CONFIG.PAYSTACK.PRO_ANNUAL_PRICE_NGN / 12).toLocaleString()}/mo`,
    savingsBadge: "2 months free",
    savingsPercentage: "-17%",
  },
};

const USD_CONFIG: Omit<LocalizedPricing, "isLoading"> = {
  currency: "USD",
  gateway: "stripe",
  symbol: "$",
  price: CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD,
  priceFormatted: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD}`,
  priceWithPeriod: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD} / month`,
  priceShort: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD}/mo`,
  monthly: {
    price: CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD,
    priceFormatted: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD}`,
    priceWithPeriod: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD} / month`,
    priceShort: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD}/mo`,
  },
  annual: {
    price: CLIENT_BILLING_CONFIG.STRIPE.PRO_ANNUAL_PRICE_USD,
    effectiveMonthlyPrice: 2.5,
    priceFormatted: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_ANNUAL_PRICE_USD}`,
    priceWithPeriod: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_ANNUAL_PRICE_USD} / year`,
    priceShort: `$${CLIENT_BILLING_CONFIG.STRIPE.PRO_ANNUAL_PRICE_USD}/yr`,
    effectiveMonthlyFormatted: "$2.50/mo",
    savingsBadge: "2 months free",
    savingsPercentage: "-17%",
  },
};

let cachedPricing: Omit<LocalizedPricing, "isLoading"> | null = null;

function getInitialPricing(): Omit<LocalizedPricing, "isLoading"> {
  if (cachedPricing) return cachedPricing;

  if (typeof window !== "undefined") {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const isLagos = tz.toLowerCase().includes("lagos") || tz.toLowerCase().includes("africa/lagos");
      if (isLagos) {
        return NGN_CONFIG;
      }
    } catch {
      // fallback
    }
  }

  return USD_CONFIG;
}

export function useLocalizedPricing(): LocalizedPricing {
  const [pricing, setPricing] = useState(() => getInitialPricing());
  const [isLoading, setIsLoading] = useState(!cachedPricing);

  useEffect(() => {
    if (cachedPricing) {
      setPricing(cachedPricing);
      setIsLoading(false);
      return;
    }

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      fetch(`/api/billing/detect-currency?tz=${encodeURIComponent(tz)}`)
        .then((res) => res.json())
        .then((data) => {
          const isNigeria = data.currency === "NGN";
          const resolved = isNigeria ? NGN_CONFIG : USD_CONFIG;
          cachedPricing = resolved;
          setPricing(resolved);
        })
        .catch(() => {
          // fallback to initial
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch {
      setIsLoading(false);
    }
  }, []);

  return {
    ...pricing,
    isLoading,
  };
}
