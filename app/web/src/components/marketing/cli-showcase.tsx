"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Terminal,
  ShieldCheck,
  Calendar,
  RotateCcw,
  Bot,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";

interface CliTab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  codeText: string;
  codeLines: Array<{
    tokens: Array<{
      text: string;
      color?: "purple" | "green" | "emerald" | "amber" | "white" | "muted";
    }>;
  }>;
}

const TABS: CliTab[] = [
  {
    id: "quickstart",
    name: "Terminal",
    icon: Terminal,
    codeText: `npm install --save-dev backlify-cli\nnpx backlify-cli login\nnpx backlify-cli init\n\nnpx backlify-cli run -- npx prisma migrate deploy\nnpx backlify-cli sync\nnpx backlify-cli restore cp_CHECKPOINT_ID --yes`,
    codeLines: [
      {
        tokens: [
          { text: "npm", color: "purple" },
          { text: " install " },
          { text: "--save-dev", color: "green" },
          { text: " backlify-cli", color: "white" },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "login", color: "green" },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "init", color: "green" },
        ],
      },
      { tokens: [] }, // empty line
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "run", color: "green" },
          { text: " -- " },
          { text: "npx prisma migrate deploy", color: "white" },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "sync", color: "green" },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "restore", color: "green" },
          { text: " cp_CHECKPOINT_ID ", color: "white" },
          { text: "--yes", color: "green" },
        ],
      },
    ],
  },
  {
    id: "migrations",
    name: "Guarded Migrations",
    icon: ShieldCheck,
    codeText: `# Automated pre-migration snapshot with instant rollback\nnpx backlify-cli run -- npx prisma migrate deploy\n\n# Drizzle Kit or direct SQL migrations\nnpx backlify-cli run -- npx drizzle-kit migrate\nnpx backlify-cli status`,
    codeLines: [
      {
        tokens: [
          {
            text: "# Automated pre-migration snapshot with rollback guard",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "run", color: "green" },
          { text: " -- " },
          { text: "npx prisma migrate deploy", color: "white" },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          {
            text: "# Drizzle Kit or direct SQL migrations",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "run", color: "green" },
          { text: " -- " },
          { text: "npx drizzle-kit migrate", color: "white" },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "status", color: "green" },
        ],
      },
    ],
  },
  {
    id: "schedules",
    name: "Automated Schedules",
    icon: Calendar,
    codeText: `# Configure automated multi-region encrypted backups\nnpx backlify-cli schedule --every daily\n\n# Inspect active retention cadence & next execution\nnpx backlify-cli schedule\n\n# Disable schedule\nnpx backlify-cli schedule --disable`,
    codeLines: [
      {
        tokens: [
          {
            text: "# Configure automated encrypted backups",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "schedule", color: "green" },
          { text: " --every ", color: "green" },
          { text: "daily", color: "white" },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          {
            text: "# Inspect active retention cadence & next execution",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "schedule", color: "green" },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "schedule", color: "green" },
          { text: " --disable", color: "green" },
        ],
      },
    ],
  },
  {
    id: "restore",
    name: "DR Drills & Restore",
    icon: RotateCcw,
    codeText: `# Automated ephemeral sandbox restore verification\nnpx backlify-cli drill --sandbox\n\n# List available point-in-time recovery checkpoints\nnpx backlify-cli list\n\n# Restore snapshot to target database\nnpx backlify-cli restore snap_20261028_1048 --yes`,
    codeLines: [
      {
        tokens: [
          {
            text: "# Ephemeral sandbox restore verification",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "drill", color: "green" },
          { text: " --sandbox", color: "green" },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          {
            text: "# List available point-in-time checkpoints",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "list", color: "green" },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          { text: "npx", color: "purple" },
          { text: " backlify-cli " },
          { text: "restore", color: "green" },
          { text: " snap_20261028_1048 ", color: "white" },
          { text: "--yes", color: "green" },
        ],
      },
    ],
  },
  {
    id: "mcp",
    name: "AI Agent MCP",
    icon: Bot,
    codeText: `# Connect Backlify MCP tools to Claude Desktop\nclaude mcp add backlify -- npx backlify-cli mcp\n\n# Connect to Cursor IDE\ncursor mcp add backlify -- npx backlify-cli mcp`,
    codeLines: [
      {
        tokens: [
          {
            text: "# Connect Backlify MCP tools to Claude Desktop",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "claude", color: "purple" },
          { text: " mcp add " },
          { text: "backlify", color: "white" },
          { text: " -- " },
          { text: "npx backlify-cli mcp", color: "green" },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          {
            text: "# Connect to Cursor IDE",
            color: "muted",
          },
        ],
      },
      {
        tokens: [
          { text: "cursor", color: "purple" },
          { text: " mcp add " },
          { text: "backlify", color: "white" },
          { text: " -- " },
          { text: "npx backlify-cli mcp", color: "green" },
        ],
      },
    ],
  },
];

export function CliShowcase({ className }: { className?: string }) {
  const [activeTabIdx, setActiveTabIdx] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const activeTab = TABS[activeTabIdx] ?? TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab.codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="cli"
      className={cn(
        "relative w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 scroll-mt-20",
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 lg:gap-12">
        {/* ── Left Column: Editorial Value Proposition ── */}
        <div className="lg:col-span-5">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[34px] font-medium tracking-tight text-[#f9fafb] leading-[1.15] mb-7">
            Use Backlify from
            <br />
            the CLI
          </h2>

          <p className="font-sans text-[12px] sm:text-[13px] leading-relaxed text-[#8a8f98] mb-8 max-w-[440px]">
            Set <span className="text-[#f9fafb]">DATABASE_URL in your local environment,</span> then link the project.
            The CLI and local MCP keep checkpoints on disk or in your S3/R2
            bucket. Only change records go to Cloud.
          </p>

          {/* Monospace feature pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTabIdx(1)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#1e2025] bg-[#0f1013] hover:border-[#2e323b] hover:bg-[#15171d] text-[#8a8f98] hover:text-[#cbd5e1] font-mono text-xs transition-colors cursor-pointer"
            >
              run_sql
            </button>
            <button
              onClick={() => setActiveTabIdx(3)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#1e2025] bg-[#0f1013] hover:border-[#2e323b] hover:bg-[#15171d] text-[#8a8f98] hover:text-[#cbd5e1] font-mono text-xs transition-colors cursor-pointer"
            >
              restore_checkpoint
            </button>
            <button
              onClick={() => setActiveTabIdx(2)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#1e2025] bg-[#0f1013] hover:border-[#2e323b] hover:bg-[#15171d] text-[#8a8f98] hover:text-[#cbd5e1] font-mono text-xs transition-colors cursor-pointer"
            >
              sync_records
            </button>
          </div>
        </div>

        {/* ── Right Column: Terminal Card ── */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="relative w-full rounded-2xl bg-[#101010ff] border border-[#1e2028] shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Top Icon Bar */}
            <div className="grid grid-cols-5 border-b border-[#1c1e26] bg-[#101012ff]/">
              {TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTabIdx === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabIdx(idx)}
                    title={tab.name}
                    className={cn(
                      "h-14 flex items-center justify-center transition-colors cursor-pointer relative",
                      idx !== 0 && "border-l border-[#1c1e26]",
                      isActive
                        ? "bg-[#13151c]/80 text-[#f9fafb]"
                        : "text-[#5a606d] hover:text-[#94a3b8] hover:bg-[#0f1016]"
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    {isActive && (
                      <span className="sr-only">Active tab: {tab.name}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Terminal Header Bar */}
            <div className="px-6 py-3.5 flex items-center justify-between">
              <span className="font-mono text-xs text-[#525866] lowercase select-none">
                terminal
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#525866] hover:text-[#cbd5e1] transition-colors cursor-pointer select-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34d399]" />
                    <span className="text-[#34d399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal Code Display */}
            <div className="px-6 pt-1 pb-8 font-mono text-[11px] sm:text-[12px] leading-relaxed select-text min-h-[260px]">
              {activeTab.codeLines.map((line, lineIdx) => {
                if (line.tokens.length === 0) {
                  return <div key={lineIdx} className="h-4" />;
                }
                return (
                  <div key={lineIdx} className="leading-6">
                    {line.tokens.map((token, tokenIdx) => {
                      let colorClass = "text-[#d1d5db]"; // default off-white
                      if (token.color === "purple") {
                        colorClass = "text-[#a78bfa]"; // npm / npx
                      } else if (token.color === "green") {
                        colorClass = "text-[#34d399]"; // verbs / flags
                      } else if (token.color === "white") {
                        colorClass = "text-[#f9fafb]";
                      } else if (token.color === "muted") {
                        colorClass = "text-[#525866]";
                      }
                      return (
                        <span key={tokenIdx} className={colorClass}>
                          {token.text}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Card Footer: Read the CLI docs link */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
              <a
                href="#docs"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232731] bg-[#11131a]/20 hover:bg-[#161922] hover:border-[#2e3340] px-3.5 py-2 text-xs font-sans text-[#cbd5e1] hover:text-[#f9fafb] transition-colors cursor-pointer"
              >
                <span>Read the CLI docs</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8a8f98]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
