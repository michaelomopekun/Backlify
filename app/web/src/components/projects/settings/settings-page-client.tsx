"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  IconBolt,
  IconAdjustments,
  IconCircleCheck,
} from "@tabler/icons-react";

interface ProjectSettingsProps {
  projectId: string;
}

export function SettingsPageClient({ projectId }: ProjectSettingsProps) {
  // General
  const [projectName, setProjectName] = useState("roadRescue's Project");
  const [environment, setEnvironment] = useState("production");
  const [savedGeneral, setSavedGeneral] = useState(false);

  // Database Connection
  const [dbUrl, setDbUrl] = useState(
    "postgresql://postgres.user:supersecretpass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copiedDb, setCopiedDb] = useState(false);
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

  return (
    <div className="space-y-10 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-white">
            Project Settings
          </h1>
          <p className="text-[13px] text-[#555555] mt-1 font-mono">
            Database credentials, storage vaults, encryption keys & retention policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#222222] bg-[#111111] text-[11px] font-mono text-[#888888]">
            <span>ID:</span>
            <span className="text-white font-medium">{projectId}</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: General Configuration ── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
        <div>
          <h2 className="text-[15px] font-medium text-white">General Information</h2>
          <p className="text-[12px] text-[#666666] font-mono mt-0.5">
            Basic project metadata and environment tagging
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#aaaaaa]">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#aaaaaa]">Environment Tier</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="production">Production (Continuous WAL + Automated Drills)</option>
              <option value="staging">Staging (Snapshot Only)</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1a1a1a]">
          <Button
            onClick={() => {
              setSavedGeneral(true);
              setTimeout(() => setSavedGeneral(false), 2000);
            }}
            className="h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-semibold"
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
        </div>
      </div>

      {/* ── Section 2: Database Connection & Live Probe ── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[15px] font-medium text-white flex items-center gap-2">
              <IconDatabase className="size-4 text-emerald-400" />
              <span>Target Database Connection</span>
            </h2>
            <p className="text-[12px] text-[#666666] font-mono mt-0.5">
              Encrypted PostgreSQL connection URI used by backup workers and DR drills
            </p>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            SSL Enabled
          </span>
        </div>

        <div className="space-y-3">
          <label className="text-[12px] font-medium text-[#aaaaaa]">PostgreSQL Connection URI</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              className="w-full h-10 pl-3.5 pr-24 bg-[#0c0c0c] border border-[#262626] rounded-md text-[12.5px] font-mono text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-[#666666] hover:text-white transition-colors"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyDb}
                className="p-1.5 text-[#666666] hover:text-white transition-colors"
                title="Copy URI"
              >
                {copiedDb ? <IconCheck className="size-4 text-emerald-400" /> : <IconCopy className="size-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] font-mono text-[#555555]">
            Credentials are encrypted at rest using envelope encryption (AES-256-GCM).
          </p>
        </div>

        {/* Live Probe Result */}
        {pingResult.status === "success" && (
          <div className="rounded-md border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1.5 text-[12px] font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <IconCircleCheck className="size-4" />
              <span>Connection Verified — Latency: {pingResult.latency}ms</span>
            </div>
            <p className="text-[#888888] text-[11px]">{pingResult.version}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
          <Button
            type="button"
            onClick={handleTestPing}
            disabled={testingPing}
            variant="outline"
            className="h-8.5 px-3.5 border-[#262626] bg-[#161616] text-white hover:bg-[#202020] text-[12px] font-medium"
          >
            <IconRefresh className={`size-3.5 mr-1.5 ${testingPing ? "animate-spin text-primary" : ""}`} />
            {testingPing ? "Probing Database…" : "Test Connection & Ping"}
          </Button>

          <Button className="h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-semibold">
            Save Connection
          </Button>
        </div>
      </div>

      {/* ── Section 3: Storage Vault & KMS Encryption ── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
        <div>
          <h2 className="text-[15px] font-medium text-white flex items-center gap-2">
            <IconShieldLock className="size-4 text-indigo-400" />
            <span>Storage Vault & KMS Encryption</span>
          </h2>
          <p className="text-[12px] text-[#666666] font-mono mt-0.5">
            S3-compatible immutable backup vault with Customer-Managed Keys (CMK)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#aaaaaa]">Provider</label>
            <select
              value={vaultProvider}
              onChange={(e) => setVaultProvider(e.target.value)}
              className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[12.5px] text-white focus:outline-none"
            >
              <option value="s3">Amazon S3</option>
              <option value="r2">Cloudflare R2</option>
              <option value="minio">Self-Hosted MinIO</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#aaaaaa]">Bucket Name</label>
            <input
              type="text"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[12.5px] font-mono text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#aaaaaa]">Region</label>
            <input
              type="text"
              value={vaultRegion}
              onChange={(e) => setVaultRegion(e.target.value)}
              className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[12.5px] font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#aaaaaa] flex items-center justify-between">
            <span>AWS KMS Key ARN (Optional for BYOK)</span>
            <span className="text-[11px] font-mono text-[#555555]">AES-256 Hardware Encrypted</span>
          </label>
          <div className="relative">
            <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#555555]" />
            <input
              type="text"
              value={kmsKeyArn}
              onChange={(e) => setKmsKeyArn(e.target.value)}
              placeholder="arn:aws:kms:region:account-id:key/key-id"
              className="w-full h-9 pl-9 pr-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[12px] font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1a1a1a]">
          <Button
            onClick={() => {
              setSavedVault(true);
              setTimeout(() => setSavedVault(false), 2000);
            }}
            className="h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-semibold"
          >
            {savedVault ? "Vault Saved" : "Update Vault"}
          </Button>
        </div>
      </div>

      {/* ── Section 4: Automated FIFO Retention Policy ── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
        <div>
          <h2 className="text-[15px] font-medium text-white flex items-center gap-2">
            <IconAdjustments className="size-4 text-amber-400" />
            <span>Automated Snapshot Retention (FIFO)</span>
          </h2>
          <p className="text-[12px] text-[#666666] font-mono mt-0.5">
            Automatically purge snapshots exceeding your retention threshold after successful verification
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#aaaaaa]">Snapshot Retention Window</span>
            <span className="text-[14px] font-mono text-primary font-bold">
              {retentionDays} Days ({retentionDays * 2} verified snapshots)
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={90}
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="w-full h-2 bg-[#1c1c1c] rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-md border border-[#222222] bg-[#0d0d0d] cursor-pointer hover:border-[#333333] transition-colors">
              <input
                type="checkbox"
                checked={keepWeekly}
                onChange={(e) => setKeepWeekly(e.target.checked)}
                className="mt-0.5 rounded accent-primary"
              />
              <div>
                <span className="text-[12.5px] font-medium text-white block">Keep Weekly Rollups</span>
                <span className="text-[11px] text-[#666666] font-mono">
                  Preserve 1 snapshot per week for 12 weeks
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-md border border-[#222222] bg-[#0d0d0d] cursor-pointer hover:border-[#333333] transition-colors">
              <input
                type="checkbox"
                checked={keepMonthly}
                onChange={(e) => setKeepMonthly(e.target.checked)}
                className="mt-0.5 rounded accent-primary"
              />
              <div>
                <span className="text-[12.5px] font-medium text-white block">Keep Monthly Archives</span>
                <span className="text-[11px] text-[#666666] font-mono">
                  Preserve 1 snapshot per month for 1 year
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1a1a1a]">
          <Button
            onClick={() => {
              setSavedRetention(true);
              setTimeout(() => setSavedRetention(false), 2000);
            }}
            className="h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-semibold"
          >
            {savedRetention ? "Retention Updated" : "Save Retention Policy"}
          </Button>
        </div>
      </div>

      {/* ── Section 5: Webhooks & Incident Alerts ── */}
      <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
        <div>
          <h2 className="text-[15px] font-medium text-white flex items-center gap-2">
            <IconBell className="size-4 text-amber-400" />
            <span>Incident Alerts & Webhooks</span>
          </h2>
          <p className="text-[12px] text-[#666666] font-mono mt-0.5">
            Deliver real-time notifications to Discord, Slack, or custom endpoints
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-[12px] font-medium text-[#aaaaaa]">Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#262626] rounded-md text-[12.5px] font-mono text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 text-[12px] text-[#cccccc] cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnFailure}
              onChange={(e) => setNotifyOnFailure(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Backup Failures</span>
          </label>

          <label className="flex items-center gap-2.5 text-[12px] text-[#cccccc] cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnDrill}
              onChange={(e) => setNotifyOnDrill(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>DR Drill Integrity Drift</span>
          </label>

          <label className="flex items-center gap-2.5 text-[12px] text-[#cccccc] cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnStorage}
              onChange={(e) => setNotifyOnStorage(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Storage Quota Warnings</span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
          <Button
            type="button"
            onClick={handleSendTestAlert}
            disabled={sendingTestAlert}
            variant="outline"
            className="h-8.5 px-3.5 border-[#262626] bg-[#161616] text-white hover:bg-[#202020] text-[12px] font-medium"
          >
            {sendingTestAlert ? "Dispatching…" : alertSent ? "Test Alert Delivered!" : "Send Test Alert"}
          </Button>

          <Button className="h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-[12px] font-semibold">
            Save Alerts
          </Button>
        </div>
      </div>

      {/* ── Section 6: Danger Zone ── */}
      <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-6 space-y-5">
        <div>
          <h2 className="text-[15px] font-medium text-red-400 flex items-center gap-2">
            <IconAlertTriangle className="size-4" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-[12px] text-[#888888] font-mono mt-0.5">
            Irreversible actions that will affect snapshots and automated disaster recovery
          </p>
        </div>

        <div className="divide-y divide-red-900/20">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[13px] font-medium text-white block">Pause All Automated Backups</span>
              <span className="text-[11px] text-[#777777] font-mono">
                Suspends active cron schedules and continuous WAL replication
              </span>
            </div>
            <Button
              variant="outline"
              className="h-8 px-3 border-amber-800/40 text-amber-400 hover:bg-amber-950/20 text-[12px] self-start sm:self-auto"
            >
              Pause Schedules
            </Button>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[13px] font-medium text-red-400 block">Delete Project</span>
              <span className="text-[11px] text-[#777777] font-mono">
                Permanently delete this project configuration, database bindings, and schedules
              </span>
            </div>
            <Button
              onClick={() => setDeleteModalOpen(true)}
              variant="destructive"
              className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold self-start sm:self-auto"
            >
              <IconTrash className="size-3.5 mr-1" />
              Delete Project
            </Button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-xl border border-red-800/40 bg-[#121212] p-6 space-y-4 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-[16px] font-semibold text-red-400 flex items-center gap-2">
                <IconAlertTriangle className="size-4" />
                Confirm Project Deletion
              </h3>
              <p className="text-[12px] text-[#aaaaaa]">
                This action is destructive and irreversible. Type{" "}
                <span className="text-white font-mono font-bold">{projectId}</span> below to confirm.
              </p>
            </div>

            <input
              type="text"
              placeholder={projectId}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full h-9 px-3 bg-[#0a0a0a] border border-[#333333] rounded-md text-[13px] font-mono text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
                className="h-8 px-3 text-[12px] border-[#333333] text-white"
              >
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmText !== projectId}
                variant="destructive"
                className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold"
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
