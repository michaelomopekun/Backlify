"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ── Floating Navbar ── */}
      <nav className={`navbar ${isMenuOpen ? "mobile-menu-open" : ""}`}>
        <div className="navbar-header">
          <div className="nav-logo">
            <Image src="/backlify-logo.svg" alt="Backlify Logo" width={24} height={24} />
          </div>
          <div className="nav-actions">
            <Link href="/dashboard" className="btn-primary nav-cta">Sign in</Link>
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="navbar-links">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="#features" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero">
        <h1 className="hero-headline">
          Enterprise PostgreSQL backups built to vanish
        </h1>

        <p className="hero-sub">
          Backlify handles the heavy lifting. Automated schedules, point-in-time
          recovery, and live monitoring all work quietly in the background. Five
          minutes to setup. A lifetime of peace.
        </p>

        <div className="hero-buttons">
          <Link href="/dashboard" className="btn-primary">
            Start free
          </Link>
          <Link href="#features" className="btn-secondary">
            See features
          </Link>
        </div>

        <div className="hero-image">
          <Image
            src="/Backlify_dashboard_cut.png"
            alt="Backlify Dashboard"
            width={1400}
            height={800}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            priority
          />
        </div>
      </section>
    </>
  );
}
