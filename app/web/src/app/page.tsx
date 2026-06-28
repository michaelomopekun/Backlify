import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* ── Floating Navbar ── */}
      <nav className="navbar">
        <div className="nav-logo">
          <Image src="/backlify-logo.svg" alt="Backlify Logo" width={24} height={24} />
        </div>
        
        <div className="navbar-links">
          <Link href="/">Home</Link>
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
        </div>
        
        <Link href="/dashboard" className="btn-primary nav-cta">Sign in</Link>
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
          {/* Replace with a real product screenshot */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2a3040" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
