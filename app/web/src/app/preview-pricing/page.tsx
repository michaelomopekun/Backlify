import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingRailsLayout } from "@/components/marketing/layout-rails";
import { PricingSection } from "@/components/marketing/pricing-section";
import { PreviewPricingClient } from "./preview-pricing-client";

export const metadata: Metadata = {
  title: "Veyro Visual Preview — Backlify",
  description: "Exact 1:1 recreation of the Veyro Pro visual style alongside the Backlify adaptation.",
};

export default function PreviewPricingPage() {
  return (
    <MarketingRailsLayout>
      {/* ── Top Navigation Bar ── */}
      <SiteHeader containerMaxWidth="1240px" />

      {/* ── Exact Pricing Header ── */}
      <PricingSection showCards={false} />

      {/* ── Interactive Cards Showcase with Pegboard Texture ── */}
      <PreviewPricingClient />
    </MarketingRailsLayout>
  );
}
