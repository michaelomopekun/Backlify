import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { MarketingRailsLayout } from "@/components/marketing/layout-rails";
import { PricingSection } from "@/components/marketing/pricing-section";
import { VeyroProCard, BacklifyProCardAdapted } from "@/components/marketing/veyro-card";

export const metadata: Metadata = {
  title: "Veyro Visual Comparison — Backlify",
  description: "Exact 1:1 recreation of the Veyro Pro visual style alongside the Backlify adaptation.",
};

export default function PreviewPricingPage() {
  return (
    <MarketingRailsLayout>
      {/* ── Top Navigation Bar ── */}
      <SiteHeader containerMaxWidth="1240px" />

      {/* ── Exact Pricing Header ── */}
      <div className="w-full pt-8">
        <PricingSection />
      </div>

      {/* ── Cards Showcase Section ── */}
      <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-24">
        {/* Editorial Subtitle / Comparison Label */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c1f26] pb-6 mb-12">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8] mb-1 font-semibold">
              // DESIGN EXPERIMENT
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
              Visual Language Exploration
            </h3>
            <p className="text-xs sm:text-sm text-[#8a8f98] mt-1">
              Comparing the exact 1:1 Veyro Pro reference with the Backlify brand adaptation.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121316] border border-[#222328] text-xs text-[#8a8f98] font-mono">
            <span>Route:</span>
            <span className="text-white">/preview-pricing</span>
          </div>
        </div>

        {/* ── Side-by-Side Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center justify-items-center">
          {/* Card 1: 1:1 Exact Veyro Pro (As in the provided image) */}
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                1:1 Exact Veyro Reference
              </span>
            </div>
            <VeyroProCard />
          </div>

          {/* Card 2: Backlify Adaptation in Brand Amber */}
          <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                Backlify Brand Amber Adaptation
              </span>
            </div>
            <BacklifyProCardAdapted />
          </div>
        </div>

        {/* Design Insights Footer */}
        <div className="mt-16 p-6 rounded-2xl bg-[#0e1014] border border-[#1e222a] text-xs text-[#8a8f98] leading-relaxed max-w-3xl mx-auto">
          <div className="text-white font-medium mb-1 font-sans text-sm">Design Analysis: Does it match Backlify?</div>
          <ul className="list-disc list-inside space-y-1.5 mt-2 text-[#94a3b8]">
            <li>
              <strong className="text-white">Bottom Ambient Glow:</strong> Both variants create strong visual depth using a bottom-anchored radial gradient that illuminates the lower corners.
            </li>
            <li>
              <strong className="text-white">Tactile Pill Button:</strong> The pill button with a dual inner-bevel and matching glow provides immediate call-to-action prominence.
            </li>
            <li>
              <strong className="text-white">Color Harmony:</strong> The Left (Cyan) follows Veyro&apos;s cyberpunk palette, while the Right (Amber) harmonizes seamlessly with Backlify&apos;s brand accent (`#FFB31F` / `#F59E0B`).
            </li>
          </ul>
        </div>
      </section>
    </MarketingRailsLayout>
  );
}
