import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingRailsLayout } from "@/components/marketing/layout-rails";
import { PreviewOpenSourceClient } from "./preview-open-source-client";

export const metadata: Metadata = {
  title: "Open Source Dot-Matrix Preview — Backlify",
  description: "Exact 1:1 LED dot-matrix digital counter and open source section for Backlify.",
};

export default function PreviewOpenSourcePage() {
  return (
    <MarketingRailsLayout>
      {/* ── Top Navigation Bar ── */}
      <SiteHeader containerMaxWidth="1240px" />

      {/* ── Client Preview Showcase with Amber LED Matrix ── */}
      <PreviewOpenSourceClient />
    </MarketingRailsLayout>
  );
}
