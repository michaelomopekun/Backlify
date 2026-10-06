"use client";

import { useState, useEffect } from "react";

export interface LocalizedPricing {
  currency: "NGN" | "USD";
  gateway: "paystack" | "stripe";
  price: number;
  symbol: string;
  priceFormatted: string; // e.g. "₦2,000" or "$3"
  priceWithPeriod: string; // e.g. "₦2,000 / month" or "$3 / month"
  priceShort: string; // e.g. "₦2,000/mo" or "$3/mo"
  isLoading: boolean;
}

let cachedPricing: {
  currency: "NGN" | "USD";
  gateway: "paystack" | "stripe";
  price: number;
  symbol: string;
  priceFormatted: string;
  priceWithPeriod: string;
  priceShort: string;
} | null = null;

function getInitialPricing(): Omit<LocalizedPricing, "isLoading"> {
  if (cachedPricing) return cachedPricing;

  if (typeof window !== "undefined") {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const isLagos = tz.toLowerCase().includes("lagos") || tz.toLowerCase().includes("africa/lagos");
      if (isLagos) {
        return {
          currency: "NGN",
          gateway: "paystack",
          price: 2000,
          symbol: "₦",
          priceFormatted: "₦2,000",
          priceWithPeriod: "₦2,000 / month",
          priceShort: "₦2,000/mo",
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    currency: "USD",
    gateway: "stripe",
    price: 3,
    symbol: "$",
    priceFormatted: "$3",
    priceWithPeriod: "$3 / month",
    priceShort: "$3/mo",
  };
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
          const resolved: typeof cachedPricing = {
            currency: isNigeria ? "NGN" : "USD",
            gateway: isNigeria ? "paystack" : "stripe",
            price: isNigeria ? 2000 : 3,
            symbol: isNigeria ? "₦" : "$",
            priceFormatted: isNigeria ? "₦2,000" : "$3",
            priceWithPeriod: isNigeria ? "₦2,000 / month" : "$3 / month",
            priceShort: isNigeria ? "₦2,000/mo" : "$3/mo",
          };
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
