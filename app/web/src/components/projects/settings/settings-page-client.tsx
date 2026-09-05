"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  IconDatabase,
  IconKey,
  IconShieldLock,
  IconTrash,
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconBell,
  IconAlertTriangle,
  IconAdjustments,
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconExternalLink,
  IconServer,
  IconSettings,
} from "@tabler/icons-react";

interface ProjectSettingsProps {
  projectId: string;
}

export function SettingsPageClient({ projectId }: ProjectSettingsProps) {
  // Active section for in-page navigation rail
  const [activeSection, setActiveSection] = useState("general");
  const [projectName, setProjectName] = useState("roadRescue's Project");
  const [environment, setEnvironment] = useState("production");
  const [savedGeneral, setSavedGeneral] = useState(false);

  // Database Connection
  const [dbUrl, setDbUrl] = useState(
    "postgresql://postgres.user:supersecretpass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copiedDb, setCopiedDb] = useState(false);
  const [savedDb, setSavedDb] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: "idle" | "success" | "error";
    latency?: number;
    version?: string;
    ssl?: boolean;
    error?: string;
  }>({ status: "idle" });

  // Storage & KMS
  const [vaultProvider, setVaultProvider] = useState("s3");
  const [bucketName, setBucketName] = useState("backlify-vault-prod-us-east-1");
  const [vaultRegion, setVaultRegion] = useState("us-east-1");
  const [kmsKeyArn, setKmsKeyArn] = useState(
    "arn:aws:kms:us-east-1:847192847192:key/mrk-847291038472910"
  );
  const [savedVault, setSavedVault] = useState(false);

  // Retention
  const [retentionDays, setRetentionDays] = useState(14);
  const [keepWeekly, setKeepWeekly] = useState(true);
  const [keepMonthly, setKeepMonthly] = useState(true);
  const [savedRetention, setSavedRetention] = useState(false);

  // Notifications
  const [webhookUrl, setWebhookUrl] = useState("https://discord.com/api/webhooks/118274/abc-xyz");
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [notifyOnDrill, setNotifyOnDrill] = useState(true);
  const [notifyOnStorage, setNotifyOnStorage] = useState(false);
  const [sendingTestAlert, setSendingTestAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [savedAlerts, setSavedAlerts] = useState(false);

  // Danger Zone
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleCopyDb = () => {
    navigator.clipboard.writeText(dbUrl);
    setCopiedDb(true);
    setTimeout(() => setCopiedDb(false), 2000);
  };

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult({ status: "idle" });
    await new Promise((r) => setTimeout(r, 1200));
    setTestingPing(false);
    setPingResult({
      status: "success",
      latency: 42,
      version: "PostgreSQL 16.2 (Debian 16.2-1.pgdg120+1) on x86_64",
      ssl: true,
    });
  };

  const handleSendTestAlert = async () => {
    setSendingTestAlert(true);
    await new Promise((r) => setTimeout(r, 900));
    setSendingTestAlert(false);
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const [downloadingConfig, setDownloadingConfig] = useState(false);

  useEffect(() => {
    const sectionIds = ["general", "database", "storage", "retention", "alerts", "danger-zone"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExportConfig = () => {
    setDownloadingConfig(true);
    const configData = {
      projectId,
      projectName,
      environment,
      databaseUrl: dbUrl,
      storageVault: {
        provider: vaultProvider,
        bucket: bucketName,
        region: vaultRegion,
        kmsKeyArn: kmsKeyArn || null,
      },
      retentionPolicy: {
        days: retentionDays,
        keepWeekly,
        keepMonthly,
      },
      notifications: {
        webhookUrl: webhookUrl || null,
        notifyOnFailure,
        notifyOnDrill,
        notifyOnStorage,
      },
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backlify-${projectId}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingConfig(false), 1200);
  };

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Project Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
            Database credentials, storage vaults, encryption keys & retention policies
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground shadow-xs">
            <span>ID:</span>
            <code className="text-foreground font-mono font-medium">{projectId}</code>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Settings Forms & Widescreen Companion Rail ── */}
      <div className="flex flex-col xl:flex-row items-start gap-8 2xl:gap-12">
        {/* Left / Main Column: Settings Forms */}
        <div className="flex-1 min-w-0 w-full space-y-12 sm:space-y-16 pb-28 sm:pb-24">
          {/* ── Section 1: General Configuration ── */}
          <Card id="general" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground">General Information</CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Basic project metadata and environment tagging
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-xs font-medium text-muted-foreground">
                Project Name
              </Label>
              <Input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-9 bg-[#080808] border-input text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="env-tier" className="text-xs font-medium text-muted-foreground">
                Environment Tier
              </Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="env-tier" className="h-9 bg-[#080808]">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production (Continuous WAL + Automated Drills)</SelectItem>
                  <SelectItem value="staging">Staging (Snapshot Only)</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
          <span>Please use 64 characters at maximum for project names.</span>
          <Button
            size="sm"
            onClick={() => {
              setSavedGeneral(true);
              setTimeout(() => setSavedGeneral(false), 2000);
            }}
            className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto"
          >
            {savedGeneral ? (
              <>
                <IconCheck className="size-3.5 mr-1 text-primary-foreground" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 2: Database Connection & Live Probe ── */}
      <Card id="database" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <IconDatabase className="size-4 text-emerald-400" />
              <span>Target Database Connection</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Encrypted PostgreSQL connection URI used by backup workers and DR drills
            </CardDescription>
          </div>

          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
            SSL Enabled
          </span>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="db-uri" className="text-xs font-medium text-muted-foreground">
              PostgreSQL Connection URI
            </Label>
            <div className="relative">
              <Input
                id="db-uri"
                type={showPassword ? "text" : "password"}
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="h-9 pl-3.5 pr-20 bg-[#080808] border-input text-xs font-mono text-foreground"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyDb}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                  title="Copy URI"
                >
                  {copiedDb ? <IconCheck className="size-3.5 text-emerald-400" /> : <IconCopy className="size-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Credentials are encrypted at rest using envelope encryption (AES-256-GCM).
            </p>
          </div>

          {/* Live Probe Result */}
          {pingResult.status === "success" && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-950/20 p-3 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <IconCircleCheck className="size-4" />
                <span>Connection Verified — Latency: {pingResult.latency}ms</span>
              </div>
              <p className="text-muted-foreground text-xs">{pingResult.version}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
          <Button
            type="button"
            onClick={handleTestPing}
            disabled={testingPing}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs border-border bg-card hover:bg-muted font-medium w-full sm:w-auto"
          >
            <IconRefresh className={`size-3.5 mr-1.5 ${testingPing ? "animate-spin text-primary" : ""}`} />
            {testingPing ? "Probing Database…" : "Test Connection & Ping"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSavedDb(true);
              setTimeout(() => setSavedDb(false), 2000);
            }}
            className="h-8.5 px-3.5 text-xs font-medium w-full sm:w-auto"
          >
            {savedDb ? "Connection Saved" : "Save Connection"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 3: Storage Vault & KMS Encryption ── */}
      <Card id="storage" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <IconShieldLock className="size-4 text-indigo-400" />
            <span>Storage Vault & KMS Encryption</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            S3-compatible immutable backup vault with Customer-Managed Keys (CMK)
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vault-provider" className="text-xs font-medium text-muted-foreground">
                Provider
              </Label>
              <Select value={vaultProvider} onValueChange={setVaultProvider}>
                <SelectTrigger id="vault-provider" className="h-9 bg-[#080808]">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s3">Amazon S3</SelectItem>
                  <SelectItem value="r2">Cloudflare R2</SelectItem>
                  <SelectItem value="minio">Self-Hosted MinIO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bucket-name" className="text-xs font-medium text-muted-foreground">
                Bucket Name
              </Label>
              <Input
                id="bucket-name"
                type="text"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                className="h-9 bg-[#080808] border-input text-xs font-mono text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vault-region" className="text-xs font-medium text-muted-foreground">
                Region
              </Label>
              <Input
                id="vault-region"
                type="text"
                value={vaultRegion}
                onChange={(e) => setVaultRegion(e.target.value)}
                className="h-9 bg-[#080808] border-input text-xs font-mono text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="kms-arn" className="text-xs font-medium text-muted-foreground">
                AWS KMS Key ARN (Optional for BYOK)
              </Label>
              <span className="text-xs text-muted-foreground">AES-256 Hardware Encrypted</span>
            </div>
            <div className="relative">
              <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                id="kms-arn"
                type="text"
                value={kmsKeyArn}
                onChange={(e) => setKmsKeyArn(e.target.value)}
                placeholder="arn:aws:kms:region:account-id:key/key-id"
                className="h-9 pl-9 bg-[#080808] border-input text-xs font-mono text-foreground"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
          <span>Ensure the IAM role has PutObject and GetObject permissions on this bucket.</span>
          <Button
            size="sm"
            onClick={() => {
              setSavedVault(true);
              setTimeout(() => setSavedVault(false), 2000);
            }}
            className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto"
          >
            {savedVault ? "Vault Saved" : "Update Vault"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 4: Automated FIFO Retention Policy ── */}
      <Card id="retention" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <IconAdjustments className="size-4 text-amber-400" />
            <span>Automated Snapshot Retention (FIFO)</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Automatically purge snapshots exceeding your retention threshold after successful verification
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Snapshot Retention Window</Label>
              <span className="text-xs text-primary font-bold">
                {retentionDays} Days ({retentionDays * 2} verified snapshots)
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={90}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1c1c1c] rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-[#080808]">
              <div className="space-y-0.5 pr-3">
                <Label className="text-xs font-medium text-foreground block cursor-pointer">
                  Keep Weekly Rollups
                </Label>
                <p className="text-xs text-muted-foreground">
                  Preserve 1 snapshot per week for 12 weeks
                </p>
              </div>
              <Switch checked={keepWeekly} onCheckedChange={setKeepWeekly} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-[#080808]">
              <div className="space-y-0.5 pr-3">
                <Label className="text-xs font-medium text-foreground block cursor-pointer">
                  Keep Monthly Archives
                </Label>
                <p className="text-xs text-muted-foreground">
                  Preserve 1 snapshot per month for 1 year
                </p>
              </div>
              <Switch checked={keepMonthly} onCheckedChange={setKeepMonthly} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
          <span>Old snapshots are deleted only after the newest snapshot is verified.</span>
          <Button
            size="sm"
            onClick={() => {
              setSavedRetention(true);
              setTimeout(() => setSavedRetention(false), 2000);
            }}
            className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto"
          >
            {savedRetention ? "Retention Updated" : "Save Retention Policy"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 5: Webhooks & Incident Alerts ── */}
      <Card id="alerts" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <IconBell className="size-4 text-amber-400" />
            <span>Incident Alerts & Webhooks</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Deliver real-time notifications to Discord, Slack, or custom endpoints
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-xs font-medium text-muted-foreground">
              Webhook URL
            </Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="h-9 bg-[#080808] border-input text-xs font-mono text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-[#080808]">
              <Label className="text-xs font-medium text-foreground cursor-pointer">
                Backup Failures
              </Label>
              <Switch checked={notifyOnFailure} onCheckedChange={setNotifyOnFailure} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-[#080808]">
              <Label className="text-xs font-medium text-foreground cursor-pointer">
                DR Drill Drift
              </Label>
              <Switch checked={notifyOnDrill} onCheckedChange={setNotifyOnDrill} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-[#080808]">
              <Label className="text-xs font-medium text-foreground cursor-pointer">
                Storage Warnings
              </Label>
              <Switch checked={notifyOnStorage} onCheckedChange={setNotifyOnStorage} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground font-normal">
          <Button
            type="button"
            onClick={handleSendTestAlert}
            disabled={sendingTestAlert}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs border-border bg-card hover:bg-muted font-medium w-full sm:w-auto"
          >
            {sendingTestAlert ? "Dispatching…" : alertSent ? "Test Alert Delivered!" : "Send Test Alert"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSavedAlerts(true);
              setTimeout(() => setSavedAlerts(false), 2000);
            }}
            className="h-8.5 px-3.5 text-xs font-medium w-full sm:w-auto"
          >
            {savedAlerts ? "Alerts Saved" : "Save Alerts"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 6: Danger Zone ── */}
      <Card id="danger-zone" className="scroll-mt-8 border-destructive/30 bg-destructive/5 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-destructive/15">
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <IconAlertTriangle className="size-4" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription className="text-xs text-destructive/80 font-normal">
            Irreversible actions that will affect snapshots and automated disaster recovery
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 divide-y divide-destructive/15">
          <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-foreground block">Pause All Automated Backups</span>
              <span className="text-xs text-muted-foreground">
                Suspends active cron schedules and continuous WAL replication
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 px-3 border-amber-800/40 text-amber-400 hover:bg-amber-950/20 text-xs self-start sm:self-auto"
            >
              Pause Schedules
            </Button>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-destructive block">Delete Project</span>
              <span className="text-xs text-muted-foreground">
                Permanently delete this project configuration, database bindings, and schedules
              </span>
            </div>
            <Button
              onClick={() => setDeleteModalOpen(true)}
              variant="destructive"
              size="sm"
              className="h-8.5 px-3 text-xs font-medium self-start sm:self-auto"
            >
              <IconTrash className="size-3.5 mr-1" />
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* ── Right Column: Sticky Companion Rail (Visible on xl: and 2xl: displays) ── */}
    <div className="hidden xl:flex flex-col w-80 2xl:w-88 shrink-0 sticky top-6 space-y-5 self-start">
      {/* Quick Navigation: On this page */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-xs">
        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block px-1">
          On this page
        </span>
        <nav className="space-y-1">
          {[
            { id: "general", label: "General Information", icon: IconSettings },
            { id: "database", label: "Target Database", icon: IconDatabase },
            { id: "storage", label: "Storage Vault & KMS", icon: IconShieldLock },
            { id: "retention", label: "Snapshot Retention", icon: IconClock },
            { id: "alerts", label: "Alerts & Webhooks", icon: IconBell },
            { id: "danger-zone", label: "Danger Zone", icon: IconAlertTriangle, danger: true },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-xs cursor-pointer ${
                  isActive
                    ? item.danger
                      ? "bg-destructive/15 text-destructive font-medium border border-destructive/30"
                      : "bg-primary/10 text-primary font-medium border border-primary/25"
                    : item.danger
                    ? "text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Live Configuration Snapshot */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-xs text-xs">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
            Configuration State
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        <div className="space-y-2.5 divide-y divide-border/30 pt-1">
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">Environment</span>
            <span className="font-medium text-foreground capitalize">{environment}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Target DB</span>
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <IconCircleCheck className="size-3" />
              SSL Enabled
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Storage Vault</span>
            <span className="font-mono text-foreground text-[11px] truncate max-w-[150px]">{bucketName}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Encryption</span>
            <span className="font-medium text-indigo-400">AES-256 KMS</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Retention Window</span>
            <span className="font-medium text-foreground">{retentionDays} Days (FIFO)</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Incident Alerts</span>
            <span className="font-medium text-amber-400">
              {webhookUrl ? "Discord Connected" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Disaster Recovery SLA Card */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
          <IconShieldLock className="size-4" />
          <span>Security & DR Assurances</span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Continuous WAL archiving guarantees sub-60s RPO with automated disaster recovery restore drills.
        </p>
      </div>

      {/* Quick Export Button */}
      <div className="space-y-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportConfig}
          disabled={downloadingConfig}
          className="w-full h-8.5 text-xs font-medium border-border/80 bg-card hover:bg-muted justify-center gap-1.5 cursor-pointer"
        >
          <IconDownload className="size-3.5" />
          {downloadingConfig ? "Exporting JSON…" : "Export Config (.json)"}
        </Button>
      </div>
    </div>
  </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-xl border border-destructive/40 bg-card p-6 space-y-4 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-destructive flex items-center gap-2">
                <IconAlertTriangle className="size-4" />
                Confirm Project Deletion
              </h3>
              <p className="text-xs text-muted-foreground">
                This action is destructive and irreversible. Type{" "}
                <span className="text-foreground font-mono font-bold">{projectId}</span> below to confirm.
              </p>
            </div>

            <Input
              type="text"
              placeholder={projectId}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="h-9 font-mono text-xs bg-[#080808]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmText !== projectId}
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs font-medium"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
