import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroLeft } from "@/components/marketing/hero-left";
import { HeroRight } from "@/components/marketing/hero-right";

export const metadata: Metadata = {
  title: "Landing Hero Preview — Backlify",
  description: "Exact Supabase-proportioned Hero left column preview.",
};

export default function PreviewLandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f9fafb]">
      {/* ── Top Navigation Bar ── */}
      <SiteHeader />

      {/* ── Hero Section (Left + Interactive Right) ── */}
      <HeroLeft rightContent={<HeroRight />} />
    </main>
  );
}
