"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, Mail } from "lucide-react";

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
      { label: "Core Features", href: "#features" },
      { label: "Supported Engines", href: "#engines" },
      { label: "Developer CLI", href: "#cli", badge: "v1.0" },
      { label: "Pricing & Plans", href: "#pricing" },
      { label: "Security & Trust", href: "#security-trust" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Cloud Dashboard", href: "/dashboard" },
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/signup" },
      { label: "Connect Database", href: "/dashboard/project/new" },
      { label: "Organizations", href: "/dashboard/org/new" },
    ],
  },
  {
    title: "Open Source",
    links: [
      {
        label: "GitHub Repository",
        href: "https://github.com/michaelomopekun/Backlify",
        external: true,
      },
      {
        label: "NPM Package (CLI)",
        href: "https://www.npmjs.com/package/backlify-cli",
        external: true,
      },
      {
        label: "Report an Issue",
        href: "https://github.com/michaelomopekun/Backlify/issues",
        external: true,
      },
      {
        label: "Discussions",
        href: "https://github.com/michaelomopekun/Backlify/discussions",
        external: true,
      },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Questions & FAQ", href: "#qa" },
      {
        label: "Contact Support",
        href: "mailto:support@dbdock.xyz",
        external: true,
      },
      {
        label: "Security Reporting",
        href: "mailto:support@dbdock.xyz",
        external: true,
      },
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
    }, 500);
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
        {/* ── Left Area: Brand, Verified Links & Updates ── */}
        <div className="w-full lg:w-[300px] shrink-0">
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

          {/* Verified External Dev Icons Row */}
          <div className="flex items-center gap-2 mt-5 text-[#8a8f98]">
            {/* GitHub */}
            <a
              href="https://github.com/michaelomopekun/Backlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify on GitHub"
              title="GitHub Repository"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            {/* NPM */}
            <a
              href="https://www.npmjs.com/package/backlify-cli"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Backlify CLI on NPM"
              title="npm package: backlify-cli"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                <path d="M0 0v24h24V0H0zm19.461 19.461H4.539V4.539h14.922v14.922zM7.385 7.385v9.231h4.615v-6.923h2.308v6.923h2.308V7.385H7.385z" />
              </svg>
            </a>

            {/* Email Support */}
            <a
              href="mailto:support@dbdock.xyz"
              aria-label="Email Support"
              title="support@dbdock.xyz"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <Mail className="w-[17px] h-[17px]" />
            </a>
          </div>

          {/* Newsletter Box */}
          <div className="mt-7">
            <p className="text-[13px] text-[#8a8f98] leading-relaxed mb-3">
              Get product updates and engineering dispatches from Backlify.
            </p>
            {isSubscribed ? (
              <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-md bg-[#FFB31F]/10 border border-[#FFB31F]/30 text-amber-300 text-xs font-medium">
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

        {/* ── Right Area: Currently Available Columns ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10 flex-1">
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

      {/* ── Bottom Sub-Bar: Copyright ── */}
      <div className="mt-14 pt-8 border-t border-[#1e2128] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-[#8a8f98]">
        <div>
          © {new Date().getFullYear()} Backlify. All rights reserved.
        </div>
        <div className="text-[12px] text-[#64748b]">
          Database backups, recovery drills, and guarded migrations.
        </div>
      </div>
    </footer>
  );
}
