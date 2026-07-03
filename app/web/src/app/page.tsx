"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight-new";

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
        <Spotlight />
        
        <h1 className="hero-headline relative z-10">
          Enterprise PostgreSQL backups<br/>built to vanish
        </h1>

        <p className="hero-sub relative z-10">
          Backlify handles the heavy lifting. Automated schedules, point-in-time
          recovery, and live monitoring all work quietly in the background. Five
          minutes to setup. A lifetime of peace.
        </p>

        <div className="hero-buttons relative z-10">
          <Link href="/dashboard" className="btn-primary">
            Start free
          </Link>
          <Link href="#features" className="btn-secondary">
            See features
          </Link>
        </div>

        <div className="hero-image">
          <Image
            src="/Dashboard_figma.svg"
            alt="Backlify Dashboard"
            width={700}
            height={400}
            style={{ width: '100%', height: '100%', display: 'block'}}
            priority
          />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center border-t border-white/5 relative z-10">
        
        {/* Top small subtitle: "Essential" */}
        <span className="text-xl md:text-2xl font-serif italic text-muted mb-4 block">
          Essential
        </span>

        {/* Main headline: "Three core features matter" */}
        <h2 className="text-4xl md:text-6xl tracking-tight text-white mb-6 max-w-3xl leading-tight font-medium">
          Three core features<br />matter
        </h2>

        {/* Description below title: "Scheduled backups run without intervention" */}
        <p className="text-lg md:text-xl font-serif italic text-muted mb-20 max-w-xl">
          Scheduled backups run without intervention
        </p>

        {/* 3-Column Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full max-w-5xl mb-20">
          
          {/* Column 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white/[0.01]">
            <div className="w-12 h-12 flex items-center justify-center mb-8 text-white bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              {/* Cloud Upload Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </div>
            <h3 className="text-xl text-white mb-4 tracking-wide leading-snug font-normal">
              Automated<br />scheduled backups
            </h3>
            <p className="font-serif italic text-muted text-base">
              Set it once and forget it entirely
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white/[0.01]">
            <div className="w-12 h-12 flex items-center justify-center mb-8 text-white bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              {/* Point-in-time recovery Icon (Zigzag Trend Line with Nodes) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 8-5 5-3-3-5 5" />
                <circle cx="19" cy="8" r="1.5" fill="currentColor" />
                <circle cx="14" cy="13" r="1.5" fill="currentColor" />
                <circle cx="11" cy="10" r="1.5" fill="currentColor" />
                <circle cx="6" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl text-white mb-4 tracking-wide leading-snug font-normal">
              Point-in-time<br />recovery
            </h3>
            <p className="font-serif italic text-muted text-base">
              Restore to any moment in your past
            </p>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white/[0.01]">
            <div className="w-12 h-12 flex items-center justify-center mb-8 text-white bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              {/* Real-time job monitoring Icon (Bar chart with trend line) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
                <line x1="4" y1="20" x2="4" y2="14" />
                <line x1="9" y1="20" x2="9" y2="10" />
                <line x1="14" y1="20" x2="14" y2="6" />
                <line x1="19" y1="20" x2="19" y2="12" />
              </svg>
            </div>
            <h3 className="text-xl text-white mb-4 tracking-wide leading-snug font-normal">
              Real-time job<br />monitoring
            </h3>
            <p className="font-serif italic text-muted text-base">
              Watch every backup happen as it occurs
            </p>
          </div>

        </div>

        {/* Buttons at the bottom */}
        <div className="flex items-center gap-8 justify-center">
          <Link href="#features" className="btn-secondary" style={{ padding: '0.6rem 2rem', fontSize: '0.85rem' }}>
            Learn
          </Link>
          <Link href="#features" className="text-sm font-semibold text-white hover:text-white/80 transition-all duration-200 flex items-center gap-1 group">
            Learn <span className="transition-transform group-hover:translate-x-0.5">&gt;</span>
          </Link>
        </div>

      </section>
    </>
  );
}
