"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useLocalizedPricing } from "@/hooks/use-localized-pricing";

export interface QaItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category?: "record" | "restores" | "limits";
}

function buildDefaultQaItems(pricePerMonth: string): QaItem[] {
  return [
    {
      id: "storage-locations",
      category: "record",
      question: "Where are my database checkpoints and backup snapshots stored?",
      answer: (
        <span>
          Local checkpoints created via the CLI live on your local machine or Docker volume. For automated cloud backups, snapshots are securely streamed into isolated, high-durability storage networks (AES-256 encrypted at rest). You can also connect your own AWS S3, Cloudflare R2, or MinIO buckets using <strong>BYO Storage Vaults</strong>.
        </span>
      ),
    },
    {
      id: "zero-knowledge-encryption",
      category: "record",
      question: "How does client-side encryption work? Can Backlify see my data?",
      answer: (
        <span>
          Never. Backlify uses a zero-knowledge architecture. When client-side encryption is enabled, snapshots are encrypted with your private passphrase or KMS key before transmission. Your database dumps, schema structures, and table contents remain strictly unreadable to anyone without your master key.
        </span>
      ),
    },
    {
      id: "recovery-drills",
      category: "restores",
      question: "How do automated disaster recovery drills work?",
      answer: (
        <span>
          Rather than waiting for an emergency outage to discover corrupt dumps, Backlify periodically spins up an isolated, ephemeral sandbox database in the background to replay and test your snapshot. It verifies table checksums, indexes, and transaction consistency, delivering an automated audit report confirming your recovery readiness.
        </span>
      ),
    },
    {
      id: "local-staging-restore",
      category: "restores",
      question: "Can I restore a production checkpoint directly to staging or local dev?",
      answer: (
        <span>
          Yes. Using the CLI, you can pull any verified point-in-time recovery checkpoint directly into a local container or staging environment in seconds with{" "}
          <code className="px-1.5 py-0.5 rounded bg-[#181a20] text-amber-300 font-mono text-[13px] border border-[#2b2d38]">
            npx dbdock restore &lt;id&gt; --sandbox
          </code>
          . Automated sanitization rules can also be applied to mask sensitive production data automatically.
        </span>
      ),
    },
    {
      id: "cloud-limits-checkpoints",
      category: "limits",
      question: "Are local checkpoints and BYO storage buckets counted toward Cloud limits?",
      answer: (
        <span>
          No. Local checkpoints and snapshots streamed into your own customer-bucket storage (AWS S3, Cloudflare R2, Wasabi, or MinIO) are completely outside Cloud backup limits. You can create unlimited local backups and run automated schedules without paying for extra storage.
        </span>
      ),
    },
    {
      id: "plan-limits-exceeded",
      category: "limits",
      question: "What happens if my database exceeds 50 MB on the Starter plan?",
      answer: (
        <span>
          Backups will never fail silently or corrupt existing archives. You will receive an alert before approaching limits. You can either upgrade to Pro ({pricePerMonth}/month) for 50 GB cloud storage and hourly schedules, or switch your project to a BYO storage vault to keep backing up freely.
        </span>
      ),
    },
    {
      id: "supported-engines",
      category: "record",
      question: "Which database engines and cloud platforms are supported?",
      answer: (
        <span>
          Backlify natively supports PostgreSQL, Supabase, Neon, AWS RDS, TimescaleDB, CockroachDB, and Dockerized database instances. Connections are validated over TLS with automated health monitoring and failover detection.
        </span>
      ),
    },
  ];
}

export interface QaSectionProps {
  headline?: string;
  subheadline?: string;
  supportEmail?: string;
  items?: QaItem[];
  className?: string;
}

export function QaSection({
  headline = "Questions",
  subheadline = "on the record, restores,\nand limits",
  supportEmail = "support@dbdock.xyz",
  items,
  className,
}: QaSectionProps) {
  const localizedPricing = useLocalizedPricing();

  // Dynamic monthly price string based on user location (e.g. "₦2,000" or "$3")
  const pricePerMonth = localizedPricing.currency === "NGN" ? "₦2,000" : "$3";

  const resolvedItems = React.useMemo(() => {
    return items ?? buildDefaultQaItems(pricePerMonth);
  }, [items, pricePerMonth]);

  // Allow multiple items to be expanded or track active open items
  const [openIds, setOpenIds] = React.useState<Record<string, boolean>>({
    "storage-locations": true, // First item open by default for immediate engagement
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="faq"
      className={cn(
        "relative w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 py-20 lg:py-28 select-none",
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* ── Left Column: Section Header & Support Contact Link ── */}
        <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
          {/* Eyebrow Label: "Questions" */}
          <span className="font-sans text-2xl sm:text-[26px] lg:text-[28px] font-normal text-[#8a8f98] mb-1 tracking-normal">
            {headline}
          </span>

          {/* Main Headline: "on the record, restores, and limits" */}
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[38px] font-medium text-[#f9fafb] tracking-[-0.03em] leading-[1.14] whitespace-pre-line mb-6">
            {subheadline}
          </h2>

          {/* Subtext with Support Email */}
          <p className="font-sans text-[14px] sm:text-[15px] text-[#8a8f98] font-normal leading-relaxed">
            Can&apos;t find what you need? Write to{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#ededed] underline underline-offset-4 decoration-[#8a8f98]/60 hover:text-white hover:decoration-amber-400 transition-colors cursor-pointer"
            >
              {supportEmail}
            </a>
            .
          </p>
        </div>

        {/* ── Right Column: Interactive Accordion List ── */}
        <div className="lg:col-span-7 flex flex-col w-full border-t border-[#22252b]">
          {resolvedItems.map((item) => {
            const isOpen = Boolean(openIds[item.id]);

            return (
              <div
                key={item.id}
                className="border-b border-[#22252b] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group cursor-pointer"
                >
                  <span
                    className={cn(
                      "font-sans text-[15.5px] sm:text-[16.5px] font-medium tracking-[-0.01em] transition-colors duration-150",
                      isOpen ? "text-white" : "text-[#d1d5db] group-hover:text-white"
                    )}
                  >
                    {item.question}
                  </span>

                  {/* Sleek Plus/Minus Toggle (NO GLOW) with Amber Accent when Open */}
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200",
                      isOpen
                        ? "bg-[#1b1c22] border-[#383a45] text-amber-400 rotate-45"
                        : "bg-[#121316] border-[#22242a] text-[#8a8f98] group-hover:text-white group-hover:border-[#32343e]"
                    )}
                    aria-hidden="true"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Collapsible Answer Body */}
                <div
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0 pb-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="font-sans text-[14.5px] text-[#8a8f98] leading-[1.68] pr-4 sm:pr-8">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
