import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroLeft } from "@/components/marketing/hero-left";
import { HeroRight } from "@/components/marketing/hero-right";

import { CoreFeaturesBento } from "@/components/marketing/core-features-bento";
import { SupportedEnginesStrip } from "@/components/marketing/supported-engines-strip";
import { CliShowcase } from "@/components/marketing/cli-showcase";
import { MarketingRailsLayout } from "@/components/marketing/layout-rails";

export const metadata: Metadata = {
  title: "Landing Hero Preview — Backlify",
  description: "Exact Supabase-proportioned Hero and Core Capabilities Bento Grid preview.",
};

export default function PreviewLandingPage() {
  return (
    <MarketingRailsLayout>
      {/* ── Top Navigation Bar ── */}
      <SiteHeader containerMaxWidth="1240px" />

      {/* ── Hero Section (Left + Interactive Right) ── */}
      <HeroLeft rightContent={<HeroRight />} />

      {/* ── Core Capabilities Bento Grid (Supabase 4-Column Layout) ── */}
      <CoreFeaturesBento />

      {/* ── Supported Database Engines Strip (Supabase Style) ── */}
      <div className="w-full mt-16 mb-20">
        <SupportedEnginesStrip />
      </div>

      {/* ── CLI Showcase (DBDock Developer Section) ── */}
      <CliShowcase />
    </MarketingRailsLayout>
  );
}

