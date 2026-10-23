import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { ActionButton } from "@/components/ui/action-button";

export const metadata: Metadata = {
  title: "Button & Navbar Preview — Backlify",
  description: "Exact button component design and customization preview.",
};

export default function PreviewLandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f9fafb]">
      {/* ── Top Navigation Bar using the new ActionButton component ── */}
      <SiteHeader />


    </main>
  );
}
