"use client";

import { useMemo, useState, useTransition } from "react";
import { IconPlus, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cronToText, isRecognisedCron } from "@/lib/cron";
import { createSchedule } from "@/app/actions/schedule.actions";

/**
 * Add a schedule to a project.
 *
 * Cadence is a choice between three named options and "Custom", because that's
 * how people think about it — "every night" long before "0 2 * * *". Custom is
 * there for the rest, and it echoes back what the expression means as you type
 * so a typo is visible before it's saved.
 *
 * The timezone matters enough to be explicit: "2 AM" is a different hour to a
 * server in UTC than to the person reading it, so the field defaults to the
 * browser's zone rather than silently assuming UTC.
 */

const CADENCES = [
  { value: "daily", label: "Daily", detail: "2:00 AM" },
  { value: "hourly", label: "Hourly", detail: "on the hour" },
  { value: "weekly", label: "Weekly", detail: "Sunday, 2:00 AM" },
  { value: "custom", label: "Custom", detail: "cron" },
] as const;

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function timezoneOptions(current: string) {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  const all = new Set<string>(["UTC", current, ...supported]);
  return [...all].filter(Boolean);
}

export function ScheduleForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [cadence, setCadence] =
    useState<(typeof CADENCES)[number]["value"]>("daily");
  const [custom, setCustom] = useState("0 2 * * *");
  const [timezone, setTimezone] = useState(browserTimezone);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const zones = useMemo(() => timezoneOptions(timezone), [timezone]);
  // Only echo a reading back when the labeller actually recognises the shape —
  // a confident "Daily" for an expression we guessed at is worse than silence.
  const customReading = isRecognisedCron(custom) ? cronToText(custom) : null;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("cronExpression", cadence === "custom" ? custom.trim() : cadence);
    formData.set("timezone", timezone);

    startTransition(async () => {
      const result = await createSchedule(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setError(null);
    });
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <IconPlus className="size-3.5" aria-hidden />
        Add schedule
      </Button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">Add a schedule</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          <IconX className="size-4" aria-hidden />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-muted-foreground">
          How often
        </legend>
        <div className="flex flex-wrap gap-2">
          {CADENCES.map((option) => {
            const checked = cadence === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-baseline gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                  "has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  checked
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                )}
              >
                <input
                  type="radio"
                  name="cadence"
                  value={option.value}
                  checked={checked}
                  onChange={() => setCadence(option.value)}
                  className="sr-only"
                />
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.detail}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {cadence === "custom" && (
        <div className="mt-4 space-y-1.5">
          <label
            htmlFor="customCron"
            className="block text-xs font-medium text-muted-foreground"
          >
            Cron expression
          </label>
          <input
            id="customCron"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            placeholder="0 2 * * *"
            className="h-9 w-full max-w-xs rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          <p className="text-xs text-muted-foreground">
            {customReading ?? "Five fields: minute hour day month weekday."}
          </p>
        </div>
      )}

      <div className="mt-4 space-y-1.5">
        <label
          htmlFor="timezone"
          className="block text-xs font-medium text-muted-foreground"
        >
          Timezone
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Adding…" : "Add schedule"}
        </Button>
      </div>
    </form>
  );
}
