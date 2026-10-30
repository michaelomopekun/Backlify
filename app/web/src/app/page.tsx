import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroLeft } from "@/components/marketing/hero-left";
import { HeroRight } from "@/components/marketing/hero-right";

import { CoreFeaturesBento } from "@/components/marketing/core-features-bento";
import { SupportedEnginesStrip } from "@/components/marketing/supported-engines-strip";
import { CliShowcase } from "@/components/marketing/cli-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { OpenSourceSection } from "@/components/marketing/open-source-section";
import { QaSection } from "@/components/marketing/qa-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { SecurityTrustStrip } from "@/components/marketing/security-trust-strip";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingRailsLayout } from "@/components/marketing/layout-rails";

export const metadata: Metadata = {
  title: "Backlify — The Developer-First Database Backup & Recovery Platform",
  description:
    "Automated backups, guarded migrations, point-in-time recovery, and disaster recovery drills with zero-knowledge encryption.",
};

export default function HomePage() {
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

      {/* ── Pricing Section with Starter & Pro Cards ── */}
      <div className="relative w-full border-t border-[#22252b]">
        <PricingSection />
      </div>

      {/* ── Open Source from Day One Section ── */}
      <div className="relative w-full border-t border-[#22252b]">
        <OpenSourceSection />
      </div>

      {/* ── Questions on the record, restores, and limits (Q&A Section) ── */}
      <div className="relative w-full border-t border-[#22252b]">
        <QaSection />
      </div>

      {/* ── Final Call to Action (CTA Section) ── */}
      <div className="relative w-full border-t border-[#22252b]">
        <CtaSection />
      </div>

      {/* ── Security & Compliance Trust Strip ── */}
      <div className="relative w-full border-t border-[#22252b]">
        <SecurityTrustStrip />
      </div>

      {/* ── Site Footer (Multi-Column Supabase-Style Layout) ── */}
      <div className="relative w-full border-t border-[#22252b]">
        <SiteFooter />
      </div>
    </MarketingRailsLayout>
  );
}
