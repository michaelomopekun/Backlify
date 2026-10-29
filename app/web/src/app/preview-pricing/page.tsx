import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingRailsLayout } from "@/components/marketing/layout-rails";
import { PricingSection } from "@/components/marketing/pricing-section";
import { VeyroProCard, BacklifyProCardAdapted } from "@/components/marketing/veyro-card";

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
      <PricingSection />

      {/* ── Cards Showcase Section ── */}
      <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-4 pb-24">
        {/* Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start justify-items-center">
          {/* Card 1: 1:1 Exact Veyro Pro (As in the provided image) */}
          <div className="flex flex-col items-center w-full">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium mb-5">
              1:1 Exact Veyro Pro (From Image)
            </span>
            <VeyroProCard />
          </div>

          {/* Card 2: Backlify Adaptation in Brand Amber */}
          <div className="flex flex-col items-center w-full">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium mb-5">
              Backlify Brand Amber Adaptation
            </span>
            <BacklifyProCardAdapted />
          </div>
        </div>
      </section>
    </MarketingRailsLayout>
  );
}
