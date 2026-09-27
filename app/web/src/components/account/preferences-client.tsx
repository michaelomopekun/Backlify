"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  IconCheck,
  IconBrandGithub,
  IconMail,
  IconClock,
  IconAlertCircle,
  IconDeviceDesktop,
  IconLoader2,
} from "@tabler/icons-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export function AccountPreferencesClient({ user }: { user: UserProfile }) {
  const router = useRouter();

  // Split name into first and last name (Option 1)
  const nameParts = (user.name || "").trim().split(/\s+/);
  const initialFirst = nameParts[0] || "";
  const initialLast = nameParts.slice(1).join(" ") || "";
  const initialUser = (user.name || user.email.split("@")[0] || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  const [initialFirstState, setInitialFirstState] = useState(initialFirst);
  const [initialLastState, setInitialLastState] = useState(initialLast);

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [username, setUsername] = useState(initialUser);

  // Timezone preference (UTC vs Local)
  const [timezonePref, setTimezonePref] = useState<"utc" | "local">("utc");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    firstName.trim() !== initialFirstState.trim() ||
    lastName.trim() !== initialLastState.trim();

  useEffect(() => {
    // Read stored timezone preference if available
    const savedTz = localStorage.getItem("backlify_tz_pref");
    if (savedTz === "local" || savedTz === "utc") {
      setTimezonePref(savedTz);
    }
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedName || username || "User" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setInitialFirstState(firstName.trim());
      setInitialLastState(lastName.trim());
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || "An error occurred while saving your profile");
    } finally {
      setSaving(false);
    }
  };

  const handleTimezoneChange = (pref: "utc" | "local") => {
    setTimezonePref(pref);
    localStorage.setItem("backlify_tz_pref", pref);
    document.cookie = `backlify_tz_pref=${pref}; path=/; max-age=31536000`;
  };

  // Determine connected provider
  const isGithub = user.image?.includes("githubusercontent.com");

  return (
    <div className="w-full max-w-4xl space-y-10 sm:space-y-12 pb-24 font-sans">
      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground font-sans">
          Preferences
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account profile, connections, and dashboard experience.
        </p>
      </div>

      {/* ── Section 1: Profile Information ── */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground font-sans">Profile information</h2>

        <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-xs font-medium text-foreground">
                  First name
                </Label>
                <Input
                  id="first-name"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9.5 bg-[#080808] border-input text-xs sm:text-sm text-foreground"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-xs font-medium text-foreground">
                  Last name
                </Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9.5 bg-[#080808] border-input text-xs sm:text-sm text-foreground"
                />
              </div>
            </div>

            {/* Primary Email */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label htmlFor="primary-email" className="text-xs font-medium text-foreground">
                  Primary email
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Used for account notifications and security alerts
                </p>
              </div>
              <Input
                id="primary-email"
                type="email"
                disabled
                value={user.email}
                className="h-9.5 bg-[#080808]/60 border-input text-xs sm:text-sm text-muted-foreground font-mono cursor-not-allowed opacity-80"
              />
            </div>

            {/* Username / Display Name */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label htmlFor="username" className="text-xs font-medium text-foreground">
                  Username
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Display name used across the dashboard and team audit logs
                </p>
              </div>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9.5 bg-[#080808] border-input text-xs sm:text-sm text-foreground"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <IconAlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/20 border-t border-border/50 flex items-center justify-end">
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={saving || (!hasChanges && !saved)}
              className="h-8.5 px-4 text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <IconLoader2 className="size-3.5 mr-1.5 animate-spin text-black" />
                  Saving...
                </>
              ) : saved ? (
                <span className="flex items-center gap-1.5">
                  <IconCheck className="size-3.5 text-black" />
                  Saved
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ── Section 2: Sign-in Methods ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground font-sans">Sign-in methods</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage the authentication providers linked to your Backlify account.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-9 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-foreground shrink-0">
              {isGithub ? (
                <IconBrandGithub className="size-5" />
              ) : (
                <IconMail className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {isGithub ? "GitHub" : "Email & Passwordless"}
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {user.email}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Connected
          </span>
        </div>
      </div>

      {/* ── Section 3: Dashboard & Timestamp Experience ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground font-sans">Dashboard experience</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how timestamps and snapshot schedules are presented across your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTimezoneChange("utc")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              timezonePref === "utc"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <IconClock className="size-4 text-primary" />
                UTC (Coordinated Universal Time)
              </span>
              {timezonePref === "utc" && <IconCheck className="size-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standard for database backups, WAL archives, and 24h timeline rails. Eliminates confusion with daylight savings.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleTimezoneChange("local")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              timezonePref === "local"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <IconDeviceDesktop className="size-4 text-emerald-400" />
                Local Browser Time
              </span>
              {timezonePref === "local" && <IconCheck className="size-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Converts all snapshot timestamps and restore drill logs to your computer's local time zone.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
