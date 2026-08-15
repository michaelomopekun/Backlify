/**
 * Cron -> human label (resolves DESIGN_SYSTEM.md §8.1).
 *
 * Scope: the presets the schedule UI can produce, plus the handful of shapes a
 * hand-written expression commonly takes. Anything outside that returns null and
 * the caller shows the raw expression in mono — a wrong-but-confident "Daily" is
 * worse than an honest `0 3 1-5 * *`.
 *
 * This is a labeller, not a cron engine. `nextRunAt` comes from the worker, so
 * we never compute fire times here.
 */

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Renders "14:30" as "2:30 PM" for use inside a label. */
function clockLabel(hour: number, minute: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = String(minute).padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export interface CronLabel {
  /** e.g. "Daily" — the headline cadence. */
  cadence: string;
  /** e.g. "at 2:00 AM" — omitted when the cadence carries no fixed time. */
  detail?: string;
}

export function describeCron(expression: string | null | undefined): CronLabel | null {
  if (!expression) return null;

  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

  // Any field we don't model precisely -> bail out to the raw expression.
  const isPlainNumber = (f: string) => /^\d+$/.test(f);
  const everyN = (f: string) => {
    const match = /^\*\/(\d+)$/.exec(f);
    return match ? Number(match[1]) : null;
  };

  if (month !== "*") return null;

  // Sub-hourly: */15 * * * *
  const minuteInterval = everyN(minute);
  if (minuteInterval && hour === "*" && dayOfMonth === "*" && dayOfWeek === "*") {
    return { cadence: `Every ${minuteInterval} minutes` };
  }

  if (!isPlainNumber(minute)) return null;
  const min = Number(minute);
  if (min > 59) return null;

  // Hourly: 0 * * * *
  if (hour === "*" && dayOfMonth === "*" && dayOfWeek === "*") {
    return {
      cadence: "Hourly",
      detail: min === 0 ? "on the hour" : `at :${String(min).padStart(2, "0")}`,
    };
  }

  // Every N hours: 0 */6 * * *
  const hourInterval = everyN(hour);
  if (hourInterval && dayOfMonth === "*" && dayOfWeek === "*") {
    return { cadence: `Every ${hourInterval} hours` };
  }

  if (!isPlainNumber(hour)) return null;
  const hr = Number(hour);
  if (hr > 23) return null;
  const time = clockLabel(hr, min);

  // Weekly: 0 2 * * 0
  if (dayOfMonth === "*" && isPlainNumber(dayOfWeek)) {
    const day = Number(dayOfWeek) % 7;
    return { cadence: `Weekly on ${DAY_NAMES[day]}`, detail: `at ${time}` };
  }

  // Monthly: 0 2 1 * *
  if (isPlainNumber(dayOfMonth) && dayOfWeek === "*") {
    const dom = Number(dayOfMonth);
    if (dom < 1 || dom > 31) return null;
    return { cadence: `Monthly on day ${dom}`, detail: `at ${time}` };
  }

  // Daily: 0 2 * * *
  if (dayOfMonth === "*" && dayOfWeek === "*") {
    return { cadence: "Daily", detail: `at ${time}` };
  }

  return null;
}

/** Flattened single-string form: "Daily at 2:00 AM", or the raw expression. */
export function cronToText(expression: string | null | undefined): string {
  if (!expression) return "—";
  const described = describeCron(expression);
  if (!described) return expression;
  return described.detail
    ? `${described.cadence} ${described.detail}`
    : described.cadence;
}

/** True when we can label it — callers use this to pick mono vs sans type. */
export function isRecognisedCron(expression: string | null | undefined): boolean {
  return describeCron(expression) !== null;
}
