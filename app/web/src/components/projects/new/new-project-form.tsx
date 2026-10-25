"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCpu,
  IconCheck,
  IconAlertTriangle,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import { useLocalizedPricing } from "@/hooks/use-localized-pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProject } from "@/app/actions/backup.actions";

export type DatabaseEngine = "postgres" | "mysql" | "mongodb";

interface EngineOption {
  id: DatabaseEngine;
  name: string;
  tag: string;
  badge: string;
  placeholder: string;
  prefixRegex: RegExp;
  hint: string;
}

const ENGINE_OPTIONS: EngineOption[] = [
  {
    id: "postgres",
    name: "PostgreSQL",
    tag: "pg_dump / pg_restore",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    placeholder: "postgresql://postgres:password@db.supabase.co:5432/postgres?sslmode=require",
    prefixRegex: /^postgres(ql)?:\/\//i,
    hint: "Compatible with Supabase, Neon, AWS RDS, Timescale, or self-hosted PostgreSQL.",
  },
  {
    id: "mysql",
    name: "MySQL",
    tag: "mysqldump",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    placeholder: "mysql://root:password@db.planetscale.com:3306/production",
    prefixRegex: /^mysql:\/\//i,
    hint: "Compatible with MySQL 5.7+, 8.0+, MariaDB, PlanetScale, or AWS Aurora MySQL.",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    tag: "mongodump / bson",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    placeholder: "mongodb+srv://admin:password@cluster0.mongodb.net/production?retryWrites=true&w=majority",
    prefixRegex: /^mongodb(\+srv)?:\/\//i,
    hint: "Compatible with MongoDB Atlas, replica sets, or self-hosted standalone clusters.",
  },
];

interface Props {
  orgId: string;
  orgName: string;
  isPro?: boolean;
  projectCount?: number;
  maxProjects?: number;
}

export function NewProjectForm({
  orgId,
  orgName,
  isPro = false,
  projectCount = 0,
  maxProjects = 2,
}: Props) {
  const router = useRouter();
  const { priceFormatted } = useLocalizedPricing();
  const quotaReached = !isPro && projectCount >= maxProjects;
  const [name, setName] = useState("");
  const [databaseEngine, setDatabaseEngine] = useState<DatabaseEngine>("postgres");
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [schedule, setSchedule] = useState("0 2 * * *");
  const [tier, setTier] = useState("production");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedEngineConfig =
    ENGINE_OPTIONS.find((e) => e.id === databaseEngine) || ENGINE_OPTIONS[0];

  const handleDatabaseUrlChange = (value: string) => {
    setDatabaseUrl(value);
    const trimmed = value.trim();
    if (/^postgres(ql)?:\/\//i.test(trimmed)) {
      setDatabaseEngine("postgres");
    } else if (/^mysql:\/\//i.test(trimmed)) {
      setDatabaseEngine("mysql");
    } else if (/^mongodb(\+srv)?:\/\//i.test(trimmed)) {
      setDatabaseEngine("mongodb");
    }
  };

  // Ping test
  const [isTesting, setIsTesting] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: "success" | "error";
    latency?: number;
    version?: string;
    error?: string;
    isFirewallLikely?: boolean;
    egressIp?: string;
  } | null>(null);

  const copyEgressIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleTestConnection = async () => {
    const trimmedUrl = databaseUrl.trim();
    if (!trimmedUrl) {
      setPingResult({
        status: "error",
        error: `Please enter a valid ${selectedEngineConfig.name} connection URI.`,
      });
      return;
    }

    if (!selectedEngineConfig.prefixRegex.test(trimmedUrl)) {
      setPingResult({
        status: "error",
        error: `Invalid connection URI for ${selectedEngineConfig.name}. Expected prefix: ${
          databaseEngine === "mongodb"
            ? "mongodb:// or mongodb+srv://"
            : databaseEngine === "mysql"
            ? "mysql://"
            : "postgresql:// or postgres://"
        }`,
      });
      return;
    }

    setIsTesting(true);
    setPingResult(null);

    try {
      const res = await fetch("/api/projects/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseUrl: trimmedUrl,
          engine: databaseEngine,
        }),
      });
      const data = await res.json();
      setIsTesting(false);

      if (res.ok && data.success) {
        setPingResult({
          status: "success",
          latency: data.latencyMs,
          version: `${data.version}${data.database ? ` • DB: ${data.database}` : ""}${data.ssl ? " • SSL" : ""}`,
        });
      } else {
        setPingResult({
          status: "error",
          error: data.error || "Connection check failed. Verify credentials and network access.",
          isFirewallLikely: Boolean(data.isFirewallLikely),
          egressIp: data.egressIp || "52.204.14.88",
        });
      }
    } catch (err: any) {
      setIsTesting(false);
      setPingResult({
        status: "error",
        error: err?.message || "Failed to reach the database diagnostic service.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please provide a project name.");
      return;
    }
    if (!databaseUrl.trim()) {
      setErrorMsg("A database connection URI is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("databaseUrl", databaseUrl.trim());
    formData.append("databaseEngine", databaseEngine);
    formData.append("orgId", orgId);
    formData.append("cronExpression", schedule);

    const res = await createProject(formData);

    if (res?.error) {
      setErrorMsg(res.error);
      setIsSubmitting(false);
      return;
    }

    if (res?.projectId) {
      router.push(`/dashboard/project/${res.projectId}`);
    } else {
      router.push(`/dashboard/org/${orgId}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl border-border bg-card overflow-hidden shadow-sm">
      <CardHeader className="p-6 border-b border-border/80 space-y-1">
        <CardTitle className="text-lg font-semibold text-foreground tracking-tight">
          Create a new project
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Your project will contain your database connection settings, automated backup schedules, and disaster recovery logs.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        {quotaReached && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="size-4 shrink-0 text-amber-400" />
              <span>
                <strong>Database Limit Reached ({projectCount}/{maxProjects}):</strong> Free organizations can connect up to 2 databases.
              </span>
            </div>
            <Link
              href={`/dashboard/org/${orgId}/billing?upgrade=true`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors shrink-0"
            >
              <IconSparkles className="size-3.5" />
              Upgrade to Pro ({priceFormatted})
            </Link>
          </div>
        )}

        <CardContent className="p-0 divide-y divide-border/80">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 text-red-400 text-xs font-mono flex items-start gap-2">
              <IconAlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Organization */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
            <div>
              <label className="text-xs font-medium text-foreground block">
                Organization
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                The organization this project belongs to.
              </p>
            </div>

            <div className="flex items-center justify-between h-9 px-3 rounded-md border border-border bg-muted/30 text-sm text-foreground">
              <span className="font-medium text-xs">{orgName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded border border-border bg-muted/60 text-muted-foreground font-mono uppercase font-semibold">
                FREE PLAN
              </span>
            </div>
          </div>

          {/* Row 2: Name */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
            <div>
              <label htmlFor="project-name" className="text-xs font-medium text-foreground block">
                Name <span className="text-muted-foreground">*</span>
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                What&apos;s the name of your project or database cluster?
              </p>
            </div>

            <div className="space-y-1.5">
              <Input
                id="project-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Analytics Database"
                required
                className="bg-muted/30 border-border text-sm h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                You can change this anytime in project settings.
              </p>
            </div>
          </div>

          {/* Row 3: Database Engine */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
            <div>
              <label className="text-xs font-medium text-foreground block">
                Database Engine <span className="text-muted-foreground">*</span>
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Choose your dialect for tailored dump and restore tooling.
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ENGINE_OPTIONS.map((opt) => {
                  const isSelected = databaseEngine === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDatabaseEngine(opt.id)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-500/10 text-foreground shadow-xs ring-1 ring-emerald-500/30"
                          : "border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold text-foreground">{opt.name}</span>
                        {isSelected && <IconCheck className="size-3.5 text-emerald-400" />}
                      </div>
                      {/* <span className="text-[10px] font-mono text-muted-foreground">{opt.tag}</span> */}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {selectedEngineConfig.hint}
              </p>
            </div>
          </div>

          {/* Row 4: Database Connection URI */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="db-url" className="text-xs font-medium text-foreground block">
                  {selectedEngineConfig.name} URI <span className="text-muted-foreground">*</span>
                </label>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-medium ${selectedEngineConfig.badge}`}>
                  {selectedEngineConfig.id.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Direct connection URI for automated backups. Auto-detects on paste.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="db-url"
                  name="databaseUrl"
                  type={showPassword ? "text" : "password"}
                  value={databaseUrl}
                  onChange={(e) => handleDatabaseUrlChange(e.target.value)}
                  placeholder={selectedEngineConfig.placeholder}
                  required
                  className="bg-muted/30 border-border font-mono text-xs h-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground font-mono">
                  AES-256-GCM envelope encrypted.
                </p>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !databaseUrl}
                  className="text-[11.5px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <IconLoader2 className="size-3 animate-spin" />
                      Testing…
                    </>
                  ) : (
                    <>
                      <IconCpu className="size-3" />
                      Test Connection & Ping
                    </>
                  )}
                </button>
              </div>

              {pingResult && (
                <div
                  className={`p-3 rounded-md border text-[11px] font-mono flex items-start gap-2 mt-2 ${
                    pingResult.status === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                      : pingResult.isFirewallLikely
                      ? "border-amber-500/40 bg-amber-500/5 text-amber-200"
                      : "border-red-500/30 bg-red-500/5 text-red-300"
                  }`}
                >
                  {pingResult.status === "success" ? (
                    <IconCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <IconAlertTriangle className={`size-3.5 shrink-0 mt-0.5 ${pingResult.isFirewallLikely ? "text-amber-400" : "text-red-400"}`} />
                  )}
                  <div className="flex-1 space-y-2">
                    {pingResult.status === "success" ? (
                      <span>
                        Connection Verified — Latency: <strong>{pingResult.latency}ms</strong> ({pingResult.version})
                      </span>
                    ) : (
                      <>
                        <p className="leading-relaxed">{pingResult.error}</p>

                        {pingResult.isFirewallLikely && (
                          <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground text-[10.5px]">Backlify Outbound IP:</span>
                              <code className="px-1.5 py-0.5 rounded bg-black/50 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                                {pingResult.egressIp || "52.204.14.88"}
                              </code>
                            </div>

                            <button
                              type="button"
                              onClick={() => copyEgressIp(pingResult.egressIp || "52.204.14.88")}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-sans font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                              {copiedIp ? (
                                <>
                                  <IconCheck className="size-3 text-emerald-400" />
                                  <span>Copied IP</span>
                                </>
                              ) : (
                                <>
                                  <IconCopy className="size-3" />
                                  <span>Copy IP</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Snapshot Schedule */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
            <div>
              <label className="text-xs font-medium text-foreground block">
                Snapshot Schedule
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Initial automated backup frequency.
              </p>
            </div>

            <div className="space-y-1.5">
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="bg-muted/30 border-border text-sm h-9">
                  <SelectValue placeholder="Select backup frequency" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="0 2 * * *">Daily (At 02:00 UTC)</SelectItem>
                  <SelectItem value="0 * * * *" disabled={!isPro}>
                    Hourly (top of every hour) {!isPro && "• Pro only"}
                  </SelectItem>
                  <SelectItem value="0 2 * * 0">Weekly (Sundays at 02:00 UTC)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {!isPro ? "Daily automated backups on Free tier. Pro supports hourly & custom cron schedules." : "You can add multiple custom cron schedules after creation."}
              </p>
            </div>
          </div>

          {/* Row 5: Environment Tier */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
            <div>
              <label className="text-xs font-medium text-foreground block">
                Environment
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Target database classification.
              </p>
            </div>

            <div className="space-y-1.5">
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="bg-muted/30 border-border text-sm h-9">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Configures retention policies and automated integrity probes.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-border/80 bg-muted/10 flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Link href={`/dashboard/org/${orgId}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || quotaReached}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {quotaReached ? (
              "Limit Reached (Upgrade to Pro)"
            ) : isSubmitting ? (
              <>
                <IconLoader2 className="size-3.5 mr-1.5 animate-spin" />
                Creating project…
              </>
            ) : (
              "Create project"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
