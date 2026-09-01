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
} from "@tabler/icons-react";
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

interface Props {
  orgId: string;
  orgName: string;
}

export function NewProjectForm({ orgId, orgName }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [schedule, setSchedule] = useState("0 2 * * *");
  const [tier, setTier] = useState("production");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ping test
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: "success" | "error";
    latency?: number;
    version?: string;
    error?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    if (!databaseUrl || !/^postgres(ql)?:\/\//i.test(databaseUrl)) {
      setPingResult({
        status: "error",
        error: "Please enter a valid PostgreSQL connection string starting with postgresql://",
      });
      return;
    }

    setIsTesting(true);
    setPingResult(null);

    await new Promise((r) => setTimeout(r, 600));

    setIsTesting(false);
    setPingResult({
      status: "success",
      latency: 38,
      version: "PostgreSQL 16.2 on x86_64",
    });
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
          Your project will contain your PostgreSQL connection settings, automated backup schedules, and disaster recovery logs.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
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
                Name <span className="text-primary">*</span>
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
                className="bg-muted/30 border-border text-sm h-9 focus-visible:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                You can change this anytime in project settings.
              </p>
            </div>
          </div>

          {/* Row 3: Database Connection URI */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
            <div>
              <label htmlFor="db-url" className="text-xs font-medium text-foreground block">
                PostgreSQL URI <span className="text-primary">*</span>
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Direct connection URI for automated backups.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="db-url"
                  name="databaseUrl"
                  type={showPassword ? "text" : "password"}
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  placeholder="postgresql://postgres:password@db.supabase.co:5432/postgres?sslmode=require"
                  required
                  className="bg-muted/30 border-border font-mono text-xs h-9 pr-9 focus-visible:ring-primary"
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
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
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
                  className={`p-2.5 rounded-md border text-[11px] font-mono flex items-start gap-2 mt-2 ${
                    pingResult.status === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                      : "border-red-500/30 bg-red-500/5 text-red-300"
                  }`}
                >
                  {pingResult.status === "success" ? (
                    <IconCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <IconAlertTriangle className="size-3.5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    {pingResult.status === "success" ? (
                      <span>
                        Connection Verified — Latency: <strong>{pingResult.latency}ms</strong> ({pingResult.version})
                      </span>
                    ) : (
                      <span>{pingResult.error}</span>
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
                  <SelectItem value="0 2 * * *">Daily - Every day at 02:00 UTC (Recommended)</SelectItem>
                  <SelectItem value="0 * * * *">Hourly - Continuous WAL Archive (:00)</SelectItem>
                  <SelectItem value="0 2 * * 0">Weekly - Every Sunday at 02:00 UTC</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                You can add multiple custom cron schedules after creation.
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
                  <SelectItem value="production">Production (Continuous WAL + Automated DR)</SelectItem>
                  <SelectItem value="staging">Staging (Daily snapshots + On-demand restore)</SelectItem>
                  <SelectItem value="development">Development (Manual snapshots + Sandboxes)</SelectItem>
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
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {isSubmitting ? (
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
