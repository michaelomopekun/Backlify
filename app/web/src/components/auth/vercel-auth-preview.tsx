"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  IconBrandGithub,
  IconLock,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";

interface SocialProofItem {
  subject: string;
  verb: string;
  highlight: string;
  detail: string;
}

const SOCIAL_PROOF_ITEMS: SocialProofItem[] = [
  {
    subject: "PostgreSQL",
    verb: "has",
    highlight: "10x faster",
    detail: "recovery drills",
  },
  {
    subject: "Point-in-Time",
    verb: "restores in",
    highlight: "< 60 seconds",
    detail: "to any second",
  },
  {
    subject: "Automated backups",
    verb: "run with",
    highlight: "100% verified",
    detail: "data integrity",
  },
  {
    subject: "AES-256-GCM",
    verb: "secures",
    highlight: "every snapshot",
    detail: "at rest and in transit",
  },
  {
    subject: "Disaster recovery",
    verb: "drills run",
    highlight: "on autopilot",
    detail: "without downtime",
  },
];

function RotatingSocialProof({ className = "mt-8" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SOCIAL_PROOF_ITEMS.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = SOCIAL_PROOF_ITEMS[index];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`h-7 relative flex items-center justify-center overflow-hidden cursor-default select-none ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 whitespace-nowrap"
        >
          <span className="font-bold text-white tracking-tight">
            {current.subject}
          </span>
          <span className="text-neutral-500">{current.verb}</span>
          <span className="font-semibold text-neutral-200">
            {current.highlight}
          </span>
          <span className="text-neutral-500">{current.detail}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface VercelAuthPreviewProps {
  initialMode?: "login" | "signup";
}

export function VercelAuthPreview({ initialMode = "login" }: VercelAuthPreviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [samlDomain, setSamlDomain] = useState("");
  const [showSamlInput, setShowSamlInput] = useState(false);
  const [isEmailInputVisible, setIsEmailInputVisible] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync mode if initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Check for error query params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "CredentialsSignin") {
        setAuthError("Please enter a valid work email address.");
      } else if (error === "OAuthAccountNotLinked") {
        setAuthError("This email is already associated with another account.");
      } else {
        setAuthError("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setAuthError(null);
      setLoadingProvider(provider);
      await signIn(provider, { redirectTo: "/dashboard" });
    } catch (err) {
      console.error(`Sign-in error with ${provider}:`, err);
      setAuthError("Unable to initiate sign-in. Please try again.");
      setLoadingProvider(null);
    }
  };

  const handleEmailSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    try {
      setAuthError(null);
      setLoadingProvider("email");
      await signIn("credentials", {
        email: email.trim(),
        redirectTo: "/dashboard",
      });
    } catch (err) {
      console.error("Credentials sign-in error:", err);
      setAuthError("Failed to sign in. Please check your email and try again.");
      setLoadingProvider(null);
    }
  };

  const toggleMode = (targetMode: "login" | "signup") => {
    setMode(targetMode);
    setShowSamlInput(false);
    setIsEmailInputVisible(false);
    setAuthError(null);
    router.push(targetMode === "login" ? "/login" : "/signup");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-neutral-200 flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* Fixed Top Bar: Backlify Logo on Left, Auth Toggle Button on Right */}
      <header className="fixed top-0 left-0 w-full px-6 sm:px-8 py-5 flex items-center justify-between z-30 pointer-events-none">
        {/* Left: Backlify Logo (Fixed and enlarged, with wordmark on signup) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 cursor-pointer pointer-events-auto"
        >
          <Image
            src="/backlify-logo.svg"
            alt="Backlify"
            width={38}
            height={38}
            className="object-contain"
            priority
          />
          {mode === "signup" && (
            <span className="text-[17px] font-mono font-semibold tracking-tight text-white select-none">
              Backlify
            </span>
          )}
        </Link>

        {/* Right: Sign Up / Log In Toggle Button (Fixed) */}
        <button
          type="button"
          onClick={() => toggleMode(mode === "login" ? "signup" : "login")}
          className="pointer-events-auto px-4 py-1.5 rounded-md border border-[#262626] hover:border-[#404040] bg-[#111111] hover:bg-[#161616] text-xs font-medium text-neutral-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {mode === "login" ? "Sign Up" : "Log In"}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-6 pt-24 pb-12 z-10">
        {authError && (
          <div className="mb-4 flex items-center gap-2 px-3.5 py-2 rounded-md bg-red-950/40 border border-red-800/60 text-red-200 text-xs max-w-[370px] w-full animate-in fade-in">
            <IconAlertCircle className="size-4 shrink-0 text-red-400" />
            <span>{authError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "login" ? (
            /* ============================================================ */
            /* LOGIN VIEW (Option A: Email, Google, GitHub, SAML SSO)      */
            /* ============================================================ */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-[370px] flex flex-col items-center"
            >
              <h1 className="text-[26px] font-bold tracking-tight text-white mb-6 text-center">
                Log in to Backlify
              </h1>

              {/* Email Address Form */}
              <form onSubmit={handleEmailSignIn} className="w-full">
                <div className="w-full mb-3">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loadingProvider !== null}
                    className="w-full h-10 px-3.5 rounded-md bg-[#111111] border border-[#262626] text-sm text-white placeholder:text-[#666] focus:border-[#404040] focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Continue with Email Button */}
                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="w-full h-10 rounded-md bg-[#ededed] hover:bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm mb-4 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loadingProvider === "email" ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin text-black" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Continue with Email</span>
                  )}
                </button>
              </form>

              {/* Stacked OAuth Buttons (Clean Option A Lineup) */}
              <div className="w-full flex flex-col gap-2.5 pt-1">
                {/* 1. Google with flat 'Last Used' badge */}
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={loadingProvider !== null}
                    className="w-full h-11 px-4 rounded-md bg-[#111111] hover:bg-[#161616] border border-[#262626] hover:border-[#383838] text-sm text-neutral-200 font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loadingProvider === "google" ? (
                      <IconLoader2 className="size-4 animate-spin text-neutral-200" />
                    ) : (
                      <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#0070f3] text-white text-[10px] font-semibold tracking-wide uppercase">
                    Last Used
                  </span>
                </div>

                {/* 2. GitHub */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("github")}
                  disabled={loadingProvider !== null}
                  className="w-full h-11 px-4 rounded-md bg-[#111111] hover:bg-[#161616] border border-[#262626] hover:border-[#383838] text-sm text-neutral-200 font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loadingProvider === "github" ? (
                    <IconLoader2 className="size-4 animate-spin text-white" />
                  ) : (
                    <IconBrandGithub className="size-4 text-white" />
                  )}
                  <span>Continue with GitHub</span>
                </button>

                {/* 3. SAML SSO (Enterprise Single Sign-On) */}
                <div className="w-full flex flex-col">
                  <button
                    type="button"
                    onClick={() => setShowSamlInput(!showSamlInput)}
                    className="w-full h-11 px-4 rounded-md bg-[#111111] hover:bg-[#161616] border border-[#262626] hover:border-[#383838] text-sm text-neutral-200 font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    <IconLock className="size-4 text-neutral-400" />
                    <span>Continue with SAML SSO</span>
                    {showSamlInput ? (
                      <IconChevronUp className="size-3.5 ml-auto text-neutral-400" />
                    ) : (
                      <IconChevronDown className="size-3.5 ml-auto text-neutral-400" />
                    )}
                  </button>

                  {showSamlInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 pt-2"
                    >
                      <input
                        type="text"
                        placeholder="Company domain (e.g. acme.com)"
                        value={samlDomain}
                        onChange={(e) => setSamlDomain(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-md bg-[#111111] border border-[#262626] text-xs text-white placeholder:text-[#666] focus:border-[#404040] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (samlDomain.trim()) {
                            setEmail(`user@${samlDomain.trim()}`);
                            setShowSamlInput(false);
                          }
                        }}
                        className="w-full h-9 rounded-md bg-[#1a1a1a] hover:bg-[#222222] border border-[#333] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Authenticate with SSO Identity Provider</span>
                        <IconArrowRight className="size-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Switch to Sign Up */}
              <div className="mt-8 text-xs text-neutral-400 text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("signup")}
                  className="text-[#0070f3] hover:underline font-medium ml-1 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>

              {/* Social Proof Below Login Card */}
              <RotatingSocialProof className="mt-6" />
            </motion.div>
          ) : (
            /* ============================================================ */
            /* SIGNUP VIEW (Option A: Clean Card Structure)                */
            /* ============================================================ */
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full flex flex-col items-center"
            >
              {/* Centered Dark Card Box */}
              <div className="w-full max-w-[430px] rounded-2xl bg-[#111111] border border-[#262626] p-8 sm:p-9 flex flex-col items-center text-center shadow-xl">
                <h1 className="text-[24px] font-bold tracking-tight text-white mb-7 leading-snug">
                  Your first backup <br className="hidden sm:inline" />
                  is just a sign-up away.
                </h1>

                {/* Stacked Options */}
                <div className="w-full flex flex-col gap-2.5">
                  {/* Google with 'Last Used' */}
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn("google")}
                      disabled={loadingProvider !== null}
                      className="w-full h-11 px-4 rounded-md bg-[#161616] hover:bg-[#1d1d1d] border border-[#2a2a2a] hover:border-[#383838] text-sm text-neutral-200 font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {loadingProvider === "google" ? (
                        <IconLoader2 className="size-4 animate-spin text-neutral-200" />
                      ) : (
                        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>Continue with Google</span>
                    </button>

                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#0070f3] text-white text-[10px] font-semibold tracking-wide uppercase">
                      Last Used
                    </span>
                  </div>

                  {/* GitHub */}
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("github")}
                    disabled={loadingProvider !== null}
                    className="w-full h-11 px-4 rounded-md bg-[#161616] hover:bg-[#1d1d1d] border border-[#2a2a2a] hover:border-[#383838] text-sm text-neutral-200 font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loadingProvider === "github" ? (
                      <IconLoader2 className="size-4 animate-spin text-white" />
                    ) : (
                      <IconBrandGithub className="size-4 text-white" />
                    )}
                    <span>Continue with GitHub</span>
                  </button>

                  {/* SAML SSO */}
                  <button
                    type="button"
                    onClick={() => setShowSamlInput(!showSamlInput)}
                    className="w-full h-11 px-4 rounded-md bg-[#161616] hover:bg-[#1d1d1d] border border-[#2a2a2a] hover:border-[#383838] text-sm text-neutral-200 font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    <IconLock className="size-4 text-neutral-400" />
                    <span>Continue with SAML SSO</span>
                  </button>

                  {showSamlInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Company domain (e.g. acme.com)"
                        value={samlDomain}
                        onChange={(e) => setSamlDomain(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-md bg-[#0a0a0a] border border-[#2a2a2a] text-xs text-white placeholder:text-[#666] focus:border-[#404040] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (samlDomain.trim()) {
                            setEmail(`user@${samlDomain.trim()}`);
                            setShowSamlInput(false);
                            setIsEmailInputVisible(true);
                          }
                        }}
                        className="w-full h-9 rounded-md bg-[#1a1a1a] hover:bg-[#222222] border border-[#333] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Authenticate with SSO</span>
                        <IconArrowRight className="size-3.5" />
                      </button>
                    </motion.div>
                  )}

                  {/* Continue with Email expandable */}
                  <div className="mt-3">
                    {!isEmailInputVisible ? (
                      <button
                        type="button"
                        onClick={() => setIsEmailInputVisible(true)}
                        className="text-xs text-[#0070f3] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Continue with Email</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        onSubmit={handleEmailSignIn}
                        className="flex flex-col gap-2 pt-1"
                      >
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loadingProvider !== null}
                          className="w-full h-10 px-3.5 rounded-md bg-[#161616] border border-[#2a2a2a] text-xs text-white placeholder:text-[#666] focus:border-[#404040] focus:outline-none disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={loadingProvider !== null}
                          className="w-full h-9 rounded-md bg-[#ededed] hover:bg-white text-black text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loadingProvider === "email" ? (
                            <>
                              <IconLoader2 className="size-3.5 animate-spin text-black" />
                              <span>Signing Up...</span>
                            </>
                          ) : (
                            <span>Create Account with Email</span>
                          )}
                        </button>
                      </motion.form>
                    )}
                  </div>
                </div>

                {/* Terms Disclaimer */}
                <p className="text-[11px] text-neutral-500 mt-6 leading-relaxed max-w-[280px]">
                  By joining, you agree to our{" "}
                  <span className="text-neutral-400 hover:underline cursor-pointer">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-neutral-400 hover:underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>

              {/* Rotating Social Proof Below Card */}
              <RotatingSocialProof className="mt-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full py-5 flex items-center justify-center gap-4 text-[11px] text-neutral-500 z-10">
        <span className="hover:text-neutral-300 cursor-pointer transition-colors">Terms</span>
        <span className="hover:text-neutral-300 cursor-pointer transition-colors">Privacy Policy</span>
      </footer>
    </div>
  );
}
