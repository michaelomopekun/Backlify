"use client";

import { useState } from "react";
import Link from "next/link";
import { WaitlistForm } from "@/components/ui/waitlist-form";
import { getWaitlistCount } from "@/app/actions/waitlist.actions";
import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight-new";

const TESTIMONIALS = [
  {
    logo: (
      <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 6l5 16h5L5 6H0zm9 0l5 16h5l-5-16H9zm9 0l5 16h5l-5-16h-5z" fill="currentColor"/>
        <text x="36" y="21" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="bold" letterSpacing="-0.5">Webflow</text>
      </svg>
    ),
    quote: `"We went from manual backups and constant worry to complete automation in an afternoon. Backlify just works."`,
    name: "Sarah Chen",
    title: "CTO, Verve Labs",
    avatar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
    )
  },
  {
    logo: (
      <svg width="110" height="28" viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 14L14 2l12 12M6 10v12h16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="36" y="21" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="bold" letterSpacing="-0.5">FinCorp</text>
      </svg>
    ),
    quote: `"We migrated 4TB of PostgreSQL databases to Backlify. The point-in-time recovery feature alone has saved us countless hours of engineering time."`,
    name: "Elena Rodriguez",
    title: "Lead DBA, FinCorp",
    avatar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="24" y2="13"></line><line x1="24" y1="8" x2="19" y2="13"></line></svg>
    )
  },
  {
    logo: (
      <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
        <path d="M14 8v12M8 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <text x="32" y="21" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="bold" letterSpacing="-0.5">HealthSync</text>
      </svg>
    ),
    quote: `"When dealing with HIPAA-compliant healthcare data, you can't take chances. Backlify gave us the enterprise-grade reliability we needed."`,
    name: "David Wallace",
    title: "VP Engineering, HealthSync",
    avatar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    )
  }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href) return;
    
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMenuOpen(false);
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // We removed window.history.pushState so the URL stays clean without the #
      }
    } else if (href === "/") {
      e.preventDefault();
      setIsMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  return (
    <>
      {/* ── Floating Navbar ── */}
      <nav className={`navbar ${isMenuOpen ? "mobile-menu-open" : ""}`}>
        <div className="navbar-header">
          <div className="nav-logo">
            <Image src="/backlify-logo.svg" alt="Backlify Logo" width={24} height={24} />
          </div>
          <div className="nav-actions">
            <Link href="#waitlist" className="btn-primary nav-cta" onClick={handleScroll}>Join Waitlist</Link>
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
          <Link href="/" onClick={handleScroll}>Home</Link>
          <Link href="#features" onClick={handleScroll}>Features</Link>
          <Link href="#how-it-works" onClick={handleScroll}>How it works</Link>
          <Link href="#benefits" onClick={handleScroll}>Benefits</Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero">
        <Spotlight />
        
        <h1 className="hero-headline relative z-10">
          Automated PostgreSQL<br/>backups that just work.
        </h1>

        <p className="hero-sub relative z-10">
          Backlify automatically backs up your PostgreSQL databases, stores them securely, and lets you restore them whenever disaster strikes. 
          <br/>A lifetime of peace.
        </p>

        <div className="hero-buttons relative z-10">
          <Link href="#waitlist" className="btn-primary" onClick={handleScroll}>
            Join Waitlist
          </Link>
          <Link href="#features" className="btn-secondary" onClick={handleScroll}>
            See features
          </Link>
        </div>

        <div className="hero-image">
          <Image
            src="/figma_Dashboard_90.svg"
            alt="Backlify Dashboard"
            width={700}
            height={400}
            style={{ width: '100%', height: '100%', display: 'block'}}
            priority
          />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="features">
        
        {/* Top small subtitle: "Essential" */}
        <span className="features-subtitle">
          Essential
        </span>

        {/* Main headline: "Three core features matter" */}
        <h2 className="features-headline">
          Three core features<br />matter
        </h2>

        {/* Description below title: "Scheduled backups run without intervention" */}
        <p className="features-desc">
          Scheduled backups run without intervention
        </p>

        {/* 3-Column Features Grid */}
        <div className="features-grid">
          
          {/* Column 1 */}
          <div className="feature-card">
            <img src="./backup_icon.svg" alt="automated backup" className="feature-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />

            <h3 className="feature-title">
              Automated<br />scheduled backups
            </h3>
            <p className="feature-desc">
              Set it once and forget it entirely
            </p>
          </div>

          {/* Column 2 */}
          <div className="feature-card">
            <img src="./trend_icon.svg" alt="Point in time recovery" className="feature-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />

            <h3 className="feature-title">
              Point-in-time<br />recovery
            </h3>
            <p className="feature-desc">
              Restore to any moment in your past
            </p>
          </div>

          {/* Column 3 */}
          <div className="feature-card">
            <img src="./real-time_trend_icon.svg" alt="Real-time job monitoring" className="feature-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />

            <h3 className="feature-title">
              Real-time job<br />monitoring
            </h3>
            <p className="feature-desc">
              Watch every backup happen as it occurs
            </p>
          </div>

        </div>

        {/* Buttons at the bottom */}
        <div className="features-buttons">
          <Link href="#features" className="btn-secondary" style={{ padding: '0.65rem 2.2rem', fontSize: '0.85rem' }}>
            Learn
          </Link>
          {/* <Link href="#features" className="features-link">
            Learn <span>&gt;</span>
          </Link> */}
        </div>

      </section>

      {/* ── How It Works (Stacked Cards) Section ── */}
      <section id="how-it-works" className="how-it-works">
        
        {/* Step 1 */}
        <div id="step-1" className="how-card">
          <div className="how-card-header">
            <span className="how-card-num">1</span>
            <span className="how-card-step">Connect database</span>
          </div>
          
          <div className="how-card-content">
            <div className="how-card-left">
              <span className="how-card-tag">Quick start</span>
              <h2 className="how-card-title">Link your PostgreSQL instance</h2>
              <p className="how-card-desc">
                Backlify reads your connection string and validates access immediately. No complex configuration required.
              </p>
              <div className="how-card-actions">
                <Link href="/waitlist" className="btn-secondary" style={{ padding: '0.65rem 2.2rem', fontSize: '0.85rem' }}>
                  Start
                </Link>
                <Link href="#step-2" className="how-card-next">
                  Next <span>&gt;</span>
                </Link>
              </div>
            </div>
            
            <div className="how-card-right">
              <div className="ui-mockup">
                <div className="db-input-group">
                  <span className="db-label">Connection String</span>
                  <input 
                    type="text" 
                    readOnly 
                    className="db-input" 
                    value="postgresql://postgres:••••••••••••@db.backlify.dev:5432/production" 
                  />
                </div>
                <div className="db-input-group">
                  <span className="db-label">Database Name</span>
                  <input 
                    type="text" 
                    readOnly 
                    className="db-input" 
                    value="production" 
                  />
                </div>
                <div className="db-status">
                  <div className="status-dot"></div>
                  <span>Connected & validated successfully</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div id="step-2" className="how-card">
          <div className="how-card-header">
            <span className="how-card-num">2</span>
            <span className="how-card-step">Configure schedule</span>
          </div>
          
          <div className="how-card-content">
            <div className="how-card-left">
              <span className="how-card-tag">Set it up</span>
              <h2 className="how-card-title">Choose backup frequency and retention</h2>
              <p className="how-card-desc">
                Pick daily, weekly, or custom intervals. Backlify handles the rest automatically from that moment forward.
              </p>
              <div className="how-card-actions">
                <Link href="/waitlist" className="btn-secondary" style={{ padding: '0.65rem 2.2rem', fontSize: '0.85rem' }}>
                  Configure
                </Link>
                <Link href="#step-3" className="how-card-next">
                  Next <span>&gt;</span>
                </Link>
              </div>
            </div>
            
            <div className="how-card-right">
              <div className="ui-mockup">
                <span className="scheduler-title">Backup Schedule</span>
                <div className="scheduler-options">
                  <div className="scheduler-btn">Hourly</div>
                  <div className="scheduler-btn active">Daily</div>
                  <div className="scheduler-btn">Weekly</div>
                </div>
                <div className="scheduler-slider" style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <span>Retention Limit</span>
                    <span>30 days</span>
                  </div>
                  <div className="slider-track">
                    <div className="slider-fill"></div>
                    <div className="slider-thumb"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div id="step-3" className="how-card">
          <div className="how-card-header">
            <span className="how-card-num">3</span>
            <span className="how-card-step">Monitor and restore</span>
          </div>
          
          <div className="how-card-content">
            <div className="how-card-left">
              <span className="how-card-tag">Done</span>
              <h2 className="how-card-title">Watch backups run in real time</h2>
              <p className="how-card-desc">
                Your dashboard shows every job, every timestamp, every status. Restore any backup with one click whenever you need it.
              </p>
              <div className="how-card-actions">
                <Link href="/waitlist" className="btn-secondary" style={{ padding: '0.65rem 2.2rem', fontSize: '0.85rem' }}>
                  Monitor
                </Link>
                <Link href="#step-1" className="how-card-next">
                  Done <span>&gt;</span>
                </Link>
              </div>
            </div>
            
            <div className="how-card-right">
              <div className="ui-mockup">
                <div className="monitor-title">
                  <span>backup_prod_db</span>
                  <span className="monitor-badge running">
                    <span className="status-dot blue" style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}></span>
                    Running
                  </span>
                </div>
                <div className="monitor-logs">
                  <div className="log-line">
                    <span className="log-time">[22:35:10]</span>
                    <span>Initializing PostgreSQL dump...</span>
                  </div>
                  <div className="log-line">
                    <span className="log-time">[22:35:12]</span>
                    <span>Exporting schema definitions...</span>
                  </div>
                  <div className="log-line">
                    <span className="log-time">[22:35:15]</span>
                    <span>Streaming 4.2 GB payload to S3 target...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── Benefits Section ── */}
      <section id="benefits" className="benefits">
        <span className="features-subtitle">Why</span>
        <h2 className="features-headline">The backbone of modern<br/>data protection</h2>
        <p className="features-desc">
          Your data stays encrypted at rest and in transit. Backlify never touches your credentials or sensitive information.
        </p>

        <div className="benefits-grid">
          {/* Left Column */}
          <div className="benefits-col">
            <div className="benefit-item">
              <img src="./security_icon.svg" alt="security benefit" className="benefit-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />
              <h3 className="benefit-title">Security by default</h3>
              <p className="benefit-desc">Your data stays encrypted at rest and in transit. Backlify never touches your credentials or sensitive information.</p>
            </div>
            <div className="benefit-item">
              <img src="./backup_icon.svg" alt="reliability benefit" className="benefit-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />
              <h3 className="benefit-title">Built for reliability</h3>
              <p className="benefit-desc">Redundant storage and automated verification ensure your backups are always there when you need them most.</p>
            </div>
          </div>

          {/* Center Graphic */}
          <div className="benefits-center">
            <Image src="/backlify-logo.svg" alt="Backlify Architecture" width={240} height={240} />
          </div>

          {/* Right Column */}
          <div className="benefits-col">
            <div className="benefit-item">
              <img src="./disappears_icon.svg" alt="Disappears into stack benefit" className="benefit-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />
              <h3 className="benefit-title">Disappears into your stack</h3>
              <p className="benefit-desc">No agents to manage, no infrastructure to maintain. Backlify works quietly in the background without friction.</p>
            </div>
            <div className="benefit-item">
              <img src="./security_icon.svg" alt="Encryption benefit" className="benefit-icon" style={{ marginBottom: '2.5rem', width: '48px', height: '48px' }} />
              <h3 className="benefit-title">Encryption always on</h3>
              <p className="benefit-desc">Every backup encrypted before it leaves your database. Backlify never sees raw data.</p>
            </div>
          </div>
        </div>

        <div className="features-buttons" style={{ marginTop: '5rem' }}>
          <Link href="#features" className="btn-secondary" style={{ padding: '0.65rem 2.2rem' }}>
            Learn
          </Link>
          {/* <Link href="#features" className="features-link">
            Learn <span>&gt;</span>
          </Link> */}
        </div>
      </section>

      {/* ── Testimonial Section ── */}
      {/* <section className="testimonial">
        <div className="testimonial-carousel">
          <div className="testimonial-slide" key={activeTestimonial}>
            <div className="testimonial-logo">
              {TESTIMONIALS[activeTestimonial].logo}
            </div>
            
            <blockquote className="testimonial-quote">
              {TESTIMONIALS[activeTestimonial].quote}
            </blockquote>
            
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                {TESTIMONIALS[activeTestimonial].avatar}
              </div>
              <div className="testimonial-author-info">
                <div className="testimonial-name">{TESTIMONIALS[activeTestimonial].name}</div>
                <div className="testimonial-title">{TESTIMONIALS[activeTestimonial].title}</div>
              </div>
            </div>
          </div>

          <div className="testimonial-controls">
            <button onClick={prevTestimonial} className="carousel-btn" aria-label="Previous testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button onClick={nextTestimonial} className="carousel-btn" aria-label="Next testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </section> */}

      {/* ── Pricing Section ── */}
      <section id="pricing" className="pricing">
        {/* <span className="pricing-subtitle">Simple</span>
        <h2 className="pricing-headline">Clear pricing</h2>
        <p className="pricing-desc">
          Pick the plan that fits your team. Scale up whenever you need more.
        </p> */}

        <div className="pricing-grid">
          {/* Basic Plan */}
          {/* <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Basic plan</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pricing-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </div>
            <div className="pricing-price">
              <span className="price-amount">$19</span>
            </div>
            <div className="pricing-period">per month</div>
            
            <hr className="pricing-divider" />
            
            <div className="pricing-features-title">Includes</div>
            <ul className="pricing-features-list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Daily automated backups</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>30 day retention</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>One database</span>
              </li>
            </ul>
            
            <button className="pricing-btn">Get started</button>
          </div> */}

          {/* Business Plan */}
          {/* <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Business plan</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pricing-icon"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="M3 9l2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path><path d="M12 3v6"></path></svg>
            </div>
            <div className="pricing-price">
              <span className="price-amount">$29</span>
            </div>
            <div className="pricing-period">per month</div>
            
            <hr className="pricing-divider" />
            
            <div className="pricing-features-title">Includes</div>
            <ul className="pricing-features-list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Hourly automated backups</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>90 day retention</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Five databases</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Priority support</span>
              </li>
            </ul>
            
            <button className="pricing-btn">Get started</button>
          </div> */}

          {/* Enterprise Plan */}
          {/* <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Enterprise plan</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pricing-icon"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <div className="pricing-price">
              <span className="price-amount">$49</span>
            </div>
            <div className="pricing-period">per month</div>
            
            <hr className="pricing-divider" />
            
            <div className="pricing-features-title">Includes</div>
            <ul className="pricing-features-list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Custom backup intervals</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Unlimited retention</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Unlimited databases</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>24/7 dedicated support</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Custom integrations</span>
              </li>
            </ul>
            
            <button className="pricing-btn">Get started</button>
          </div>  */}
        </div>
      </section>

      {/* ── Waitlist Section ── */}
      <section id="waitlist" className="waitlist">
        <h2 className="waitlist-headline">Join Our Waitlist</h2>
        <p className="waitlist-subtitle">
          Be the first to experience Backlify. Join the waitlist today for early access and updates.
        </p>

        <WaitlistForm />
      </section>
    </>
  );
}
