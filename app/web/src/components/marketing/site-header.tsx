"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-button";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Storage Vaults", href: "#storage-vaults" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "https://docs.backlify.dev", external: true },
];

export function SiteHeader({ className }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        isMobileMenuOpen
          ? "bg-[#0C0D0E] backdrop-blur-md"
          : "bg-[#0a0a0a] backdrop-blur-md",
        className
      )}
      style={{
        height: "65px",
        borderBottom: "1px solid #1e1f1e",
      }}
    >
      <div
        style={{
          maxWidth: "1040px",
          height: "100%",
          margin: "0 auto",
          padding: isMobileMenuOpen ? "0 23px" : "0 23px",
        //   gap: ,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Brand Logo + Wordmark & Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "38px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              textDecoration: "none",
            }}
          >
            <Image
              src="/backlify-logo.svg"
              alt="Backlify Logo"
              width={35}
              height={35}
              style={{ width: "35px", height: "35px", objectFit: "contain" }}
              priority
            />
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#ffffff",
                fontSize: "20px",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Backlify
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex"
            style={{
              alignItems: "center",
              gap: "28px",
            }}
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                style={{
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "#ffffffcd",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94969c")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Action Group */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* GitHub Star Link */}
          <Link
            href="https://github.com/michaelomopekun/Backlify"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="hidden md:inline-flex"
            style={{
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "4px",
              color: "#8c9298",
              fontSize: "12px",
              fontWeight: 400,
              textDecoration: "none",
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8c9298")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span style={{ fontSize: "12px", color: "#8c9298" }}>1.2k</span>
          </Link>

          { !isMobileMenuOpen ? (
            <ActionButton
            variant="dark"
            size="xs"
            borderRadius="6px"
            href="/login"
          >
            Sign in
          </ActionButton>
        ) : <></>}


          {!isMobileMenuOpen ? (<ActionButton
            variant="amber"
            size="xs"
            borderRadius="6px"
            href="/signup"
          >
            Start free
          </ActionButton>) : ( <></>)}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
            style={{
              padding: "6px",
              borderRadius: "6px",
              color: "#a1a1a1",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Toggle Navigation"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                width="28"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="bg:hidden"
          style={{
            background: "#0C0D0E",
            borderBottom: "1px solid #222222",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: "6px 8px",
                borderBottom: "1px solid #161616ff",
                // borderRadius: "4px",
                fontSize: "13px",
                color: "#a1a1a1",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div
            style={{
              paddingTop: "14px",
              gap: "8px",
            //   borderTop: "1px solid #222222",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            
            {/* <span
              style={{
                fontFamily: "inherit",
                fontWeight: 400,
                color: "#a1a1a1",
                fontSize: "13px",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Get Back In
            </span> */}

            <ActionButton
                variant="dark"
                size="long"
                borderRadius="8px"
                href="/login"
            >
                Sign in
            </ActionButton>
            
            <ActionButton
                variant="amber"
                size="long"
                borderRadius="8px"
                href="/signup"
            >
                Start free
            </ActionButton>
            

          </div>
        </div>
      )}
    </header>
  );
}
