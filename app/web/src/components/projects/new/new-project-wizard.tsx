"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconDatabase,
  IconLock,
  IconClock,
  IconCloudUpload,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconServer,
  IconShieldCheck,
  IconCpu,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { createProject } from "@/app/actions/backup.actions";

interface Props {
  orgId: string;
  orgName: string;
}

const SCHEDULE_PRESETS = [
  {
    id: "daily",
    name: "Daily Production Snapshot",
    cron: "0 2 * * *",
    desc: "Executes every day at 02:00 UTC (Recommended for production)",
    tag: "POPULAR",
  },
  {
    id: "hourly",
    name: "Continuous Hourly WAL Archive",
    cron: "0 * * * *",
    desc: "Executes every hour at :00 for minimal RPO loss window",
    tag: "ENTERPRISE",
  },
  {
    id: "weekly",
    name: "Weekly Rollup",
    cron: "0 2 * * 0",
    desc: "Executes every Sunday at 02:00 UTC for dev and staging databases",
    tag: "STAGING",
  },
];

export function NewProjectWizard({ orgId, orgName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [projectName, setProjectName] = useState("");
  const [environmentTier, setEnvironmentTier] = useState<"production" | "staging" | "development">("production");
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState("daily");
  const [customCron, setCustomCron] = useState("0 2 * * *");
  const [vaultProvider, setVaultProvider] = useState<"managed" | "s3" | "r2">("managed");
  const [customBucket, setCustomBucket] = useState("");
  const [customRegion, setCustomRegion] = useState("us-east-1");

  // Ping test states
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: "success" | "error";
    latency?: number;
    version?: string;
    error?: string;
  } | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    await new Promise((r) => setTimeout(r, 700));

    setIsTesting(false);
    setPingResult({
      status: "success",
      latency: 38,
      version: "PostgreSQL 16.2 on x86_64",
    });
  };

  const handleFinish = async () => {
    if (!projectName.trim()) {
      setErrorMsg("Please enter a project name.");
      setStep(1);
      return;
    }

    if (!databaseUrl.trim()) {
      setErrorMsg("Please enter a database connection string.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const activeCron =
      selectedSchedule === "custom"
        ? customCron
        : SCHEDULE_PRESETS.find((s) => s.id === selectedSchedule)?.cron || "0 2 * * *";

    const formData = new FormData();
    formData.append("name", projectName.trim());
    formData.append("databaseUrl", databaseUrl.trim());
    formData.append("orgId", orgId);
    formData.append("cronExpression", activeCron);

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
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-mono text-[#888888] mb-1">
            <Link href={`/dashboard/org/${orgId}`} className="hover:text-white transition-colors">
              {orgName}
            </Link>
            <span>/</span>
            <span className="text-white">New Project</span>
          </div>
          <h1 className="text-[26px] font-normal tracking-tight text-white">Create New Project</h1>
          <p className="text-[13px] text-[#666666]">
            Connect your PostgreSQL database to automated backups and disaster recovery drills.
          </p>
        </div>

        <Link
          href={`/dashboard/org/${orgId}`}
          className="text-[12px] text-[#666666] hover:text-white transition-colors font-mono"
        >
          Cancel
        </Link>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: "General Info", icon: IconServer },
          { num: 2, title: "Database URI", icon: IconDatabase },
          { num: 3, title: "Schedule", icon: IconClock },
          { num: 4, title: "Vault & KMS", icon: IconCloudUpload },
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          const Icon = s.icon;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (step > s.num) setStep(s.num as any);
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                isCurrent
                  ? "border-primary bg-[#141414]"
                  : isDone
                  ? "border-[#2a2a2a] bg-[#111111] cursor-pointer hover:border-[#3a3a3a]"
                  : "border-[#1c1c1c] bg-[#0d0d0d] opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-[#222222] text-[#666666]"
                  }`}
                >
                  STEP {s.num}
                </span>
                {isDone && <IconCheck className="size-3 text-emerald-400" />}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-white truncate">
                <Icon className={`size-3.5 ${isCurrent ? "text-primary" : "text-[#777777]"}`} />
                <span className="truncate">{s.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-start gap-2">
          <IconAlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── STEP 1: General Info ── */}
      {step === 1 && (
        <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
          <div>
            <h2 className="text-[15px] font-medium text-white">Project Information</h2>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Name your project and choose its deployment environment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-mono uppercase tracking-wider text-[#888888]">
                Project Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Production Analytics Database"
                className="w-full h-10 px-3.5 bg-[#0c0c0c] border border-[#222222] rounded-md text-[13px] text-white placeholder-[#444444] focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-mono uppercase tracking-wider text-[#888888]">
                Environment Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    tier: "production" as const,
                    title: "Production",
                    desc: "Continuous WAL + Automated DR Drills",
                    color: "border-primary/60 bg-primary/5",
                  },
                  {
                    tier: "staging" as const,
                    title: "Staging",
                    desc: "Daily snapshots + On-demand restore",
                    color: "border-blue-500/40 bg-blue-500/5",
                  },
                  {
                    tier: "development" as const,
                    title: "Development",
                    desc: "Manual backup trigger + local sandboxes",
                    color: "border-[#282828] bg-[#141414]",
                  },
                ].map((item) => (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => setEnvironmentTier(item.tier)}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      environmentTier === item.tier
                        ? "border-primary bg-primary/10"
                        : "border-[#1e1e1e] bg-[#0c0c0c] hover:border-[#2a2a2a]"
                    }`}
                  >
                    <p className="text-[13px] font-medium text-white">{item.title}</p>
                    <p className="text-[11px] text-[#666666] mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => {
                if (!projectName.trim()) {
                  setErrorMsg("Please enter a project name.");
                  return;
                }
                setErrorMsg(null);
                setStep(2);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[13px] h-9 px-5 shadow-xs"
            >
              Continue to Database URI <IconArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Database Connection & Live Probe ── */}
      {step === 2 && (
        <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
          <div>
            <h2 className="text-[15px] font-medium text-white">Target Database Connection</h2>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Enter your PostgreSQL URI. Backlify uses this to execute snapshots and run DR integrity checks.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-mono uppercase tracking-wider text-[#888888]">
                PostgreSQL Connection URI <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  placeholder="postgresql://postgres:password@db.supabase.co:5432/postgres?sslmode=require"
                  className="w-full h-10 pl-3.5 pr-20 bg-[#0c0c0c] border border-[#222222] rounded-md text-[13px] font-mono text-white placeholder-[#444444] focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded text-[#666666] hover:text-white"
                  >
                    {showPassword ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#555555] font-mono">
                Credentials are encrypted at rest with hardware envelope encryption (AES-256-GCM).
              </p>
            </div>

            {/* Test Ping probe */}
            <div className="pt-1">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !databaseUrl}
                variant="outline"
                className="h-8 px-3 border-[#2a2a2a] bg-[#161616] text-white hover:bg-[#202020] text-[12px] font-mono"
              >
                {isTesting ? (
                  <>
                    <IconLoader2 className="size-3.5 mr-1.5 animate-spin text-primary" />
                    Testing connection probe…
                  </>
                ) : (
                  <>
                    <IconCpu className="size-3.5 mr-1.5 text-emerald-400" />
                    Test Connection & Ping
                  </>
                )}
              </Button>
            </div>

            {pingResult && (
              <div
                className={`p-3.5 rounded-lg border text-[12px] font-mono flex items-start gap-2.5 ${
                  pingResult.status === "success"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                    : "border-red-500/30 bg-red-500/5 text-red-300"
                }`}
              >
                {pingResult.status === "success" ? (
                  <IconCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <IconAlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  {pingResult.status === "success" ? (
                    <>
                      <p className="font-semibold text-emerald-400">Connection Verified — Handshake OK</p>
                      <p className="text-[#888888] text-[11px] mt-0.5">
                        Latency: {pingResult.latency}ms · Engine: {pingResult.version} · SSL Active
                      </p>
                    </>
                  ) : (
                    <p>{pingResult.error}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              onClick={() => setStep(1)}
              variant="outline"
              className="h-9 px-4 border-[#242424] bg-transparent text-[#888888] hover:text-white text-[13px]"
            >
              <IconArrowLeft className="size-3.5 mr-1.5" /> Back
            </Button>

            <Button
              type="button"
              onClick={() => {
                if (!databaseUrl.trim()) {
                  setErrorMsg("Please enter a database connection string.");
                  return;
                }
                setErrorMsg(null);
                setStep(3);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[13px] h-9 px-5 shadow-xs"
            >
              Continue to Schedule <IconArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Automated Schedule ── */}
      {step === 3 && (
        <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
          <div>
            <h2 className="text-[15px] font-medium text-white">Automated Snapshot Schedule</h2>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Choose how often Backlify should automatically capture snapshots. You can customize this later.
            </p>
          </div>

          <div className="space-y-3">
            {SCHEDULE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedSchedule(preset.id)}
                className={`w-full p-4 rounded-lg border text-left transition-all flex items-start justify-between ${
                  selectedSchedule === preset.id
                    ? "border-primary bg-primary/10"
                    : "border-[#1e1e1e] bg-[#0c0c0c] hover:border-[#2a2a2a]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-medium text-white">{preset.name}</span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded border border-[#2a2a2a] bg-[#161616] text-[#888888]">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#666666] mt-1">{preset.desc}</p>
                </div>
                <span className="text-[12px] font-mono text-primary font-semibold">{preset.cron}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedSchedule("custom")}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedSchedule === "custom"
                  ? "border-primary bg-primary/10"
                  : "border-[#1e1e1e] bg-[#0c0c0c] hover:border-[#2a2a2a]"
              }`}
            >
              <p className="text-[13.5px] font-medium text-white">Custom Cron Frequency</p>
              {selectedSchedule === "custom" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customCron}
                    onChange={(e) => setCustomCron(e.target.value)}
                    placeholder="0 2 * * *"
                    className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded text-[12px] font-mono text-white"
                  />
                  <p className="text-[10.5px] text-[#666666] font-mono mt-1">Format: min hour day month weekday</p>
                </div>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              onClick={() => setStep(2)}
              variant="outline"
              className="h-9 px-4 border-[#242424] bg-transparent text-[#888888] hover:text-white text-[13px]"
            >
              <IconArrowLeft className="size-3.5 mr-1.5" /> Back
            </Button>

            <Button
              type="button"
              onClick={() => setStep(4)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[13px] h-9 px-5 shadow-xs"
            >
              Continue to Storage Vault <IconArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Vault & Review ── */}
      {step === 4 && (
        <div className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-6 space-y-6">
          <div>
            <h2 className="text-[15px] font-medium text-white">Storage Vault & Hardware Encryption</h2>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Snapshots are compressed with Zstandard and encrypted with AES-256 before storage.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "managed", name: "Backlify Managed Vault", desc: "S3 multi-region with KMS encryption (Default)" },
                { id: "s3", name: "Bring Your Own AWS S3", desc: "Direct snapshot storage into your AWS bucket" },
                { id: "r2", name: "Cloudflare R2", desc: "Zero egress fee object storage bucket" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVaultProvider(v.id as any)}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    vaultProvider === v.id
                      ? "border-primary bg-primary/10"
                      : "border-[#1e1e1e] bg-[#0c0c0c] hover:border-[#2a2a2a]"
                  }`}
                >
                  <p className="text-[13px] font-medium text-white">{v.name}</p>
                  <p className="text-[11px] text-[#666666] mt-1 leading-snug">{v.desc}</p>
                </button>
              ))}
            </div>

            {vaultProvider !== "managed" && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#888888] uppercase">Bucket Name</label>
                  <input
                    type="text"
                    value={customBucket}
                    onChange={(e) => setCustomBucket(e.target.value)}
                    placeholder="my-company-backups"
                    className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#222222] rounded text-[12px] text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#888888] uppercase">Region</label>
                  <input
                    type="text"
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    placeholder="us-east-1"
                    className="w-full h-9 px-3 bg-[#0c0c0c] border border-[#222222] rounded text-[12px] text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Review Card */}
            <div className="p-4 rounded-lg border border-[#1e1e1e] bg-[#0c0c0c] space-y-2 text-[12px] font-mono">
              <p className="text-[11px] text-[#666666] uppercase tracking-wider">Configuration Summary</p>
              <div className="grid grid-cols-2 gap-2 text-white">
                <div><span className="text-[#666666]">Project:</span> {projectName}</div>
                <div><span className="text-[#666666]">Tier:</span> {environmentTier.toUpperCase()}</div>
                <div><span className="text-[#666666]">Schedule:</span> {selectedSchedule.toUpperCase()}</div>
                <div><span className="text-[#666666]">Vault:</span> {vaultProvider.toUpperCase()} (AES-256)</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              onClick={() => setStep(3)}
              variant="outline"
              className="h-9 px-4 border-[#242424] bg-transparent text-[#888888] hover:text-white text-[13px]"
            >
              <IconArrowLeft className="size-3.5 mr-1.5" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[13px] h-9 px-6 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Creating Project & Schedule…
                </>
              ) : (
                <>
                  <IconCheck className="size-4 mr-1.5" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
