"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  project?: {
    id: string;
    name: string;
    environment?: string | null;
    databaseUrl: string;
    vaultProvider?: string | null;
    vaultBucket?: string | null;
    vaultRegion?: string | null;
    kmsKeyArn?: string | null;
    retentionCount?: number | null;
    keepWeekly?: boolean | null;
    keepMonthly?: boolean | null;
    webhookUrl?: string | null;
    notifyOnFailure?: boolean | null;
    notifyOnDrill?: boolean | null;
    notifyOnStorage?: boolean | null;
  } | null;
}

export function SettingsPageClient({ projectId, project }: ProjectSettingsProps) {
  // Active section for in-page navigation rail
  const [activeSection, setActiveSection] = useState("general");
  const [projectName, setProjectName] = useState(project?.name ?? "");
  const [environment, setEnvironment] = useState(project?.environment ?? "production");
  const [savedGeneral, setSavedGeneral] = useState(false);

  // Database Connection
  const [dbUrl, setDbUrl] = useState(project?.databaseUrl ?? "");
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
  const [vaultProvider, setVaultProvider] = useState(project?.vaultProvider ?? "s3");
  const [bucketName, setBucketName] = useState(project?.vaultBucket ?? "");
  const [vaultRegion, setVaultRegion] = useState(project?.vaultRegion ?? "");
  const [kmsKeyArn, setKmsKeyArn] = useState(project?.kmsKeyArn ?? "");
  const [savedVault, setSavedVault] = useState(false);

  // Retention
  const [retentionDays, setRetentionDays] = useState(project?.retentionCount ?? 7);
  const [keepWeekly, setKeepWeekly] = useState(project?.keepWeekly ?? true);
  const [keepMonthly, setKeepMonthly] = useState(project?.keepMonthly ?? true);
  const [savedRetention, setSavedRetention] = useState(false);

  // Notifications
  const [webhookUrl, setWebhookUrl] = useState(project?.webhookUrl ?? "");
  const [notifyOnFailure, setNotifyOnFailure] = useState(project?.notifyOnFailure ?? true);
  const [notifyOnDrill, setNotifyOnDrill] = useState(project?.notifyOnDrill ?? true);
  const [notifyOnStorage, setNotifyOnStorage] = useState(project?.notifyOnStorage ?? false);
  const [sendingTestAlert, setSendingTestAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [testAlertMessage, setTestAlertMessage] = useState<string | null>(null);
  const [testAlertError, setTestAlertError] = useState<string | null>(null);
  const [savedAlerts, setSavedAlerts] = useState(false);

  useEffect(() => {
    if (project) {
      if (project.name !== undefined) setProjectName(project.name);
      if (project.environment) setEnvironment(project.environment);
      if (project.databaseUrl !== undefined) setDbUrl(project.databaseUrl);
      if (project.vaultProvider) setVaultProvider(project.vaultProvider);
      if (project.vaultBucket !== undefined && project.vaultBucket !== null) setBucketName(project.vaultBucket);
      if (project.vaultRegion !== undefined && project.vaultRegion !== null) setVaultRegion(project.vaultRegion);
      if (project.kmsKeyArn !== undefined && project.kmsKeyArn !== null) setKmsKeyArn(project.kmsKeyArn);
      if (project.retentionCount != null) setRetentionDays(project.retentionCount);
      if (project.keepWeekly != null) setKeepWeekly(project.keepWeekly);
      if (project.keepMonthly != null) setKeepMonthly(project.keepMonthly);
      if (project.webhookUrl !== undefined && project.webhookUrl !== null) setWebhookUrl(project.webhookUrl);
      if (project.notifyOnFailure != null) setNotifyOnFailure(project.notifyOnFailure);
      if (project.notifyOnDrill != null) setNotifyOnDrill(project.notifyOnDrill);
      if (project.notifyOnStorage != null) setNotifyOnStorage(project.notifyOnStorage);
    }
  }, [project]);

  // Danger Zone
  const router = useRouter();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteProject = async () => {
    if (deleteConfirmText !== projectId || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteModalOpen(false);
        router.push("/dashboard");
      } else {
        setDeleteError(data.error || data.message || "Failed to delete project");
      }
    } catch (err) {
      setDeleteError("An unexpected error occurred while deleting the project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyDb = () => {
    if (!dbUrl) return;
    navigator.clipboard.writeText(dbUrl);
    setCopiedDb(true);
    setTimeout(() => setCopiedDb(false), 2000);
  };

  const handleSaveGeneral = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, environment }),
      });
      if (res.ok) {
        setSavedGeneral(true);
        setTimeout(() => setSavedGeneral(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDb = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseUrl: dbUrl }),
      });
      if (res.ok) {
        setSavedDb(true);
        setTimeout(() => setSavedDb(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveVault = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultProvider,
          vaultBucket: bucketName,
          vaultRegion,
          kmsKeyArn,
        }),
      });
      if (res.ok) {
        setSavedVault(true);
        setTimeout(() => setSavedVault(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRetention = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retentionCount: retentionDays,
          keepWeekly,
          keepMonthly,
        }),
      });
      if (res.ok) {
        setSavedRetention(true);
        setTimeout(() => setSavedRetention(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAlerts = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          notifyOnFailure,
          notifyOnDrill,
          notifyOnStorage,
        }),
      });
      if (res.ok) {
        setSavedAlerts(true);
        setTimeout(() => setSavedAlerts(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestPing = async () => {
    if (!dbUrl) {
      setPingResult({
        status: "error",
        error: "Database URL is empty. Please enter a valid PostgreSQL connection URI.",
      });
      return;
    }
    setTestingPing(true);
    setPingResult({ status: "idle" });
    try {
      const res = await fetch("/api/projects/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          databaseUrl: dbUrl,
        }),
      });
      const data = await res.json();
      setTestingPing(false);

      if (res.ok && data.success) {
        setPingResult({
          status: "success",
          latency: data.latencyMs,
          version: `${data.version}${data.database ? ` • Database: ${data.database}` : ""}${data.ssl ? " • SSL Active" : ""}${data.isStandby ? " • (Standby/Replica)" : ""}`,
          ssl: data.ssl,
        });
      } else {
        setPingResult({
          status: "error",
          error: data.error || "Connection check failed. Verify credentials and network access.",
        });
      }
    } catch (err: any) {
      setTestingPing(false);
      setPingResult({
        status: "error",
        error: err?.message || "Failed to reach the database connection diagnostic service.",
      });
    }
  };

  const handleSendTestAlert = async () => {
    if (!webhookUrl) {
      setTestAlertError("Enter a destination webhook URL first.");
      setTimeout(() => setTestAlertError(null), 3500);
      return;
    }
    setSendingTestAlert(true);
    setTestAlertError(null);
    setTestAlertMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/test-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      setSendingTestAlert(false);

      if (res.ok && data.success) {
        setAlertSent(true);
        setTestAlertMessage(data.message || "Test alert delivered successfully!");
        setTimeout(() => {
          setAlertSent(false);
          setTestAlertMessage(null);
        }, 4000);
      } else {
        setTestAlertError(data.error || "Failed to deliver test alert.");
        setTimeout(() => setTestAlertError(null), 5000);
      }
    } catch (err: any) {
      setSendingTestAlert(false);
      setTestAlertError(err?.message || "Network error while testing webhook.");
      setTimeout(() => setTestAlertError(null), 5000);
    }
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
            onClick={handleSaveGeneral}
            className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            {savedGeneral ? (
              <>
                <IconCheck className="size-3.5 mr-1 text-black" />
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

          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
            dbUrl
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : "text-muted-foreground bg-muted/30 border border-border"
          }`}>
            {dbUrl ? "Configured" : "Not configured"}
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
                placeholder="postgresql://user:password@host:5432/dbname"
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
                <span>Connection Verified {pingResult.latency ? `— Latency: ${pingResult.latency}ms` : ""}</span>
              </div>
              <p className="text-muted-foreground text-xs">{pingResult.version}</p>
            </div>
          )}
          {pingResult.status === "error" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-destructive font-semibold">
                <IconAlertTriangle className="size-4" />
                <span>Connection Check Failed</span>
              </div>
              <p className="text-destructive/80 text-xs">{pingResult.error}</p>
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
            <IconRefresh className={`size-3.5 mr-1.5 ${testingPing ? "animate-spin text-muted-foreground" : ""}`} />
            {testingPing ? "Probing Database…" : "Test Connection & Ping"}
          </Button>

          <Button
            size="sm"
            onClick={handleSaveDb}
            className="h-8.5 px-3.5 text-xs font-medium w-full sm:w-auto bg-white text-black hover:bg-neutral-200 transition-colors"
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
                placeholder="e.g. backlify-vault-prod"
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
                placeholder="e.g. us-east-1"
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
            onClick={handleSaveVault}
            className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            {savedVault ? "Vault Saved" : "Update Vault"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 4: Automated FIFO Retention Policy ── */}
      <Card id="retention" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <IconAdjustments className="size-4 text-muted-foreground" />
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
              <span className="text-xs text-foreground font-semibold">
                {retentionDays} Snapshots (FIFO)
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={90}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1c1c1c] rounded-lg appearance-none cursor-pointer accent-white"
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
            onClick={handleSaveRetention}
            className="h-8.5 px-3.5 text-xs font-medium self-end sm:self-auto bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            {savedRetention ? "Retention Updated" : "Save Retention Policy"}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Section 5: Webhooks & Incident Alerts ── */}
      <Card id="alerts" className="scroll-mt-8 border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <IconBell className="size-4 text-muted-foreground" />
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
          <div className="flex items-center gap-2.5 flex-wrap">
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
            {testAlertMessage && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <IconCircleCheck className="size-3" />
                {testAlertMessage}
              </span>
            )}
            {testAlertError && (
              <span className="text-[11px] text-destructive font-mono flex items-center gap-1">
                <IconAlertTriangle className="size-3" />
                {testAlertError}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleSaveAlerts}
            className="h-8.5 px-3.5 text-xs font-medium w-full sm:w-auto bg-white text-black hover:bg-neutral-200 transition-colors"
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
              className="h-8.5 px-3 border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium self-start sm:self-auto"
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
                      : "bg-[#202020] text-white font-medium border border-[#2c2c2c]"
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
            {dbUrl ? (
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <IconCircleCheck className="size-3" />
                Configured
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Storage Vault</span>
            <span className="font-mono text-foreground text-[11px] truncate max-w-[150px]">{bucketName || "—"}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Encryption</span>
            <span className="font-medium text-indigo-400">{kmsKeyArn ? "AES-256 KMS" : "Default AES-256"}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Retention Window</span>
            <span className="font-medium text-foreground">{retentionDays ? `${retentionDays} Snapshots (FIFO)` : "—"}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Incident Alerts</span>
            <span className="font-medium text-foreground">
              {webhookUrl ? "Connected" : "Inactive"}
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

            {deleteError && (
              <p className="text-xs text-destructive font-medium">{deleteError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmText !== projectId || isDeleting}
                variant="destructive"
                size="sm"
                onClick={handleDeleteProject}
                className="h-8 px-3 text-xs font-medium"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
