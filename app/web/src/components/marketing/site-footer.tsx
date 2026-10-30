"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "#pricing" },
      { label: "Automated Backups", href: "#features" },
      { label: "Instant Restores", href: "#features" },
      { label: "Database Copies", href: "#cli", badge: "copydb" },
      { label: "Cross-DB Migration", href: "#cli", badge: "migrate" },
      { label: "Point-in-Time Recovery", href: "#features" },
      { label: "Managed Vault Storage", href: "#features" },
      { label: "BYO S3 & R2 Storage", href: "#features" },
      { label: "CLI & Local Daemon", href: "#cli" },
      { label: "Retention Policies", href: "#features" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "PostgreSQL Backups", href: "#engines" },
      { label: "MySQL & MariaDB", href: "#engines" },
      { label: "MongoDB ↔ Postgres", href: "#engines" },
      { label: "Redis Snapshots", href: "#engines" },
      { label: "SQL Server", href: "#engines" },
      { label: "Staging Clones (Prod → Dev)", href: "#features" },
      { label: "Self-Hosted & Air-Gapped", href: "#open-source" },
      { label: "Startups & Scaleups", href: "#pricing" },
      { label: "Enterprise Disaster Recovery", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://docs.backlify.dev", external: true },
      { label: "CLI Quickstart", href: "https://docs.backlify.dev/quickstart", external: true },
      { label: "System Status", href: "https://status.backlify.dev", external: true },
      { label: "Storage Providers Guide", href: "https://docs.backlify.dev/storage", external: true },
      { label: "Security Architecture", href: "/security" },
      { label: "SOC2 & HIPAA Compliance", href: "#security-trust" },
      { label: "Knowledge Base", href: "#qa" },
      { label: "FAQs", href: "#qa" },
      { label: "Brand Guidelines", href: "/brand" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "CLI Reference (dbdock)", href: "https://docs.backlify.dev/cli", external: true },
      { label: "TypeScript SDK", href: "https://docs.backlify.dev/sdk", external: true },
      { label: "Migration Engine", href: "https://docs.backlify.dev/migration", external: true },
      { label: "GitHub Repository", href: "https://github.com/michaelomopekun/Backlify", external: true },
      { label: "Changelog", href: "/changelog" },
      { label: "API Reference", href: "https://docs.backlify.dev/api", external: true },
      { label: "RSS Feed", href: "/feed.xml" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub Discussions", href: "https://github.com/michaelomopekun/Backlify/discussions", external: true },
      { label: "Discord Community", href: "https://discord.gg/backlify", external: true },
      { label: "Contributing Guide", href: "https://github.com/michaelomopekun/Backlify/blob/main/CONTRIBUTING.md", external: true },
      { label: "Open Source", href: "#open-source" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Twitter / X", href: "https://x.com/backlify", external: true },
      { label: "Report an Issue", href: "https://github.com/michaelomopekun/Backlify/issues", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers", badge: "Hiring" },
      { label: "Legal Hub", href: "/legal" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use Policy", href: "/acceptable-use" },
      { label: "Security.txt", href: "/security.txt" },
      { label: "Contact Us", href: "mailto:support@backlify.dev" },
    ],
  },
];

export interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const [email, setEmail] = React.useState("");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 600);
  };

  return (
    <footer
      id="site-footer"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-12 select-none",
        className
      )}
    >
      {/* ── Main Footer Grid ── */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-14 justify-between">
        {/* ── Left Area: Brand, Socials & Newsletter ── */}
        <div className="w-full lg:w-[280px] shrink-0">
          {/* Logo & Wordmark */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group cursor-pointer"
            aria-label="Backlify Home"
          >
            <Image
              src="/backlify-logo.svg"
              alt="Backlify Logo"
              width={30}
              height={30}
              className="w-[28px] h-[28px] object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-mono font-semibold text-white text-[18px] tracking-tight">
              backlify
            </span>
          </Link>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3.5 mt-5 text-[#8a8f98]">
            {/* X / Twitter */}
            <a
              href="https://x.com/backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on X"
              className="p-1.5 -ml-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/michaelomopekun/Backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on GitHub"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            {/* Discord */}
            <a
              href="https://discord.gg/backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on Discord"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on YouTube"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on TikTok"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] fill-current">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on Instagram"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Newsletter Box */}
          <div className="mt-8">
            <p className="text-[13px] text-[#8a8f98] leading-relaxed mb-3">
              Get product updates and engineering news from Backlify.
            </p>
            {isSubscribed ? (
              <div className="inline-flex items-center gap-2 py-2 px-3 rounded-md bg-[#FFB31F]/10 border border-[#FFB31F]/30 text-amber-300 text-xs font-medium">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>You’re subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5 max-w-[240px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  aria-label="Email address"
                  className="w-full h-[34px] px-3 text-[13px] rounded-md bg-[#111317] border border-[#22252b] text-[#ededed] placeholder-[#64748b] focus:border-amber-400/80 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-medium bg-[#FFB31F] text-[#080B14] hover:bg-[#FFAF1A] active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Right Area: 6 Navigation Columns ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 lg:gap-6 xl:gap-8 flex-1">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col">
              <h3 className="text-[13.5px] sm:text-[14px] font-medium text-[#ededed] mb-3.5 tracking-[-0.01em]">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#ededed] transition-colors duration-150 cursor-pointer"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                        {link.label}
                      </span>
                      {link.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/[0.06] text-[#8a8f98] group-hover:text-amber-300 group-hover:bg-amber-400/10 transition-colors">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Sub-Bar: Copyright & System Operational Status ── */}
      <div className="mt-14 pt-8 border-t border-[#1e2128] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-[#8a8f98]">
        <div>
          © {new Date().getFullYear()} Backlify, Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://status.backlify.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-white transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>All systems operational</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

